import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { placeService } from '../services/Placeservice';
import { useAuthContext } from '../context/AuthContext';

const CreateClub = () => {
  const [searchParams] = useSearchParams();
  const masterClubUidParam = searchParams.get('masterClubUid') || '';
  const masterClubNameParam = searchParams.get('masterClubName') || '';

  const [mode, setMode] = useState(masterClubUidParam ? 'group' : 'club');
  const [placeQuery, setPlaceQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: '',
    placeId: '',
    formattedAddress: '',
    clubType: 'club',
    isPrivate: false,
  });
  const [existingClub, setExistingClub] = useState(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    placeId: '',
    formattedAddress: '',
    about: '',
    isPrivate: false,
    masterClubUid: masterClubUidParam,
    activities: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // --- Google Maps States & Refs ---
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const clubMapRef = useRef(null);
  const groupMapRef = useRef(null);
  const [clubMapInstance, setClubMapInstance] = useState(null);
  const [groupMapInstance, setGroupMapInstance] = useState(null);
  const [clubMarkerInstance, setClubMarkerInstance] = useState(null);
  const [groupMarkerInstance, setGroupMarkerInstance] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Google Maps SDK Loader Effect
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const scriptId = "google-maps-sdk-script";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapsLoaded(true);
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          setMapsLoaded(true);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Reset maps state when selectedPlace is cleared
  useEffect(() => {
    if (!selectedPlace) {
      setClubMapInstance(null);
      setClubMarkerInstance(null);
      setGroupMapInstance(null);
      setGroupMarkerInstance(null);
    }
  }, [selectedPlace]);

  // Club mode Map initialization & update
  useEffect(() => {
    if (!mapsLoaded || !selectedPlace || !clubMapRef.current || mode !== 'club') return;

    const lat = selectedPlace.geometry?.location?.lat;
    const lng = selectedPlace.geometry?.location?.lng;
    const pos = {
      lat: typeof lat === 'function' ? lat() : lat,
      lng: typeof lng === 'function' ? lng() : lng
    };

    if (!pos.lat || !pos.lng) return;

    let map = clubMapInstance;
    let marker = clubMarkerInstance;

    if (!map) {
      map = new window.google.maps.Map(clubMapRef.current, {
        center: pos,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0d1624" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0d1624" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#7a8a9a" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#070d14" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#172436" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0d1624" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b7c96" }] },
        ],
      });
      setClubMapInstance(map);

      marker = new window.google.maps.Marker({
        position: pos,
        map: map,
        title: selectedPlace.name || "Selected Location",
      });
      setClubMarkerInstance(marker);
    } else {
      map.setCenter(pos);
      if (marker) {
        marker.setPosition(pos);
        marker.setTitle(selectedPlace.name || "Selected Location");
      }
    }
  }, [mapsLoaded, selectedPlace, clubMapRef.current, mode]);

  // Group mode Map initialization & update
  useEffect(() => {
    if (!mapsLoaded || !selectedPlace || !groupMapRef.current || mode !== 'group') return;

    const lat = selectedPlace.geometry?.location?.lat;
    const lng = selectedPlace.geometry?.location?.lng;
    const pos = {
      lat: typeof lat === 'function' ? lat() : lat,
      lng: typeof lng === 'function' ? lng() : lng
    };

    if (!pos.lat || !pos.lng) return;

    let map = groupMapInstance;
    let marker = groupMarkerInstance;

    if (!map) {
      map = new window.google.maps.Map(groupMapRef.current, {
        center: pos,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0d1624" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0d1624" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#7a8a9a" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#070d14" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#172436" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0d1624" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b7c96" }] },
        ],
      });
      setGroupMapInstance(map);

      marker = new window.google.maps.Marker({
        position: pos,
        map: map,
        title: selectedPlace.name || "Selected Location",
      });
      setGroupMarkerInstance(marker);
    } else {
      map.setCenter(pos);
      if (marker) {
        marker.setPosition(pos);
        marker.setTitle(selectedPlace.name || "Selected Location");
      }
    }
  }, [mapsLoaded, selectedPlace, groupMapRef.current, mode]);

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setSuccess(null);
    setExistingClub(null);
    clearPlace();
  };

  const doSearch = async (query) => {
    if (!query || query.trim().length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    try {
      setSearchLoading(true);
      const results = await placeService.searchPlaces(query.trim());
      setSuggestions(results);
      setShowDropdown(true);
    } catch (e) {
      console.error('Search error:', e);
      setSuggestions([]);
    } finally { setSearchLoading(false); }
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setPlaceQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSelect = async (pred) => {
    setShowDropdown(false);
    setSuggestions([]);
    setPlaceQuery(pred.description);
    setPlaceLoading(true);
    try {
      const details = await placeService.getPlaceDetails(pred.place_id);
      if (details) {
        setSelectedPlace(details);
        const addr = details.formatted_address || pred.description;
        const name = details.name || '';
        if (mode === 'club') {
          setClubForm(prev => ({ ...prev, placeId: pred.place_id, formattedAddress: addr, name: prev.name || name }));
          try {
            const existingDTO = await clubService.getClubByPlaceId(pred.place_id, user?.uid || '');
            const existingClub = existingDTO?.club || existingDTO?.clubEntity;
            if (existingClub && existingClub.uid) {
              navigate(`/clubs/${existingClub.uid}`);
              return;
            } else { setExistingClub(null); }
          } catch (e) { console.error('Error searching existing club:', e); setExistingClub(null); }
        } else {
          setGroupForm(prev => ({ ...prev, placeId: pred.place_id, formattedAddress: addr, name: prev.name || name }));
          setExistingClub(null);
        }
      } else {
        const fallback = { placeId: pred.place_id, formattedAddress: pred.description };
        if (mode === 'club') setClubForm(prev => ({ ...prev, ...fallback }));
        else setGroupForm(prev => ({ ...prev, ...fallback }));
        setExistingClub(null);
      }
    } catch {
      const fallback = { placeId: pred.place_id, formattedAddress: pred.description };
      if (mode === 'club') setClubForm(prev => ({ ...prev, ...fallback }));
      else setGroupForm(prev => ({ ...prev, ...fallback }));
      setExistingClub(null);
    } finally { setPlaceLoading(false); }
  };

  const clearPlace = () => {
    setSelectedPlace(null);
    setPlaceQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setExistingClub(null);
    if (mode === 'club') setClubForm(prev => ({ ...prev, placeId: '', formattedAddress: '' }));
    else setGroupForm(prev => ({ ...prev, placeId: '', formattedAddress: '' }));
  };

  const handleClubChange = (e) => {
    const { name, value } = e.target;
    setClubForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGroupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroupForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const clearProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    if (profileInputRef.current) profileInputRef.current.value = '';
  };

  const clearCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setError('Please sign in to continue'); return; }

    if (mode === 'club') {
      if (!clubForm.name.trim()) { setError('Club name is required'); return; }
      if (!clubForm.placeId.trim()) { setError('Please select a location from suggestions'); return; }
      if (!clubForm.formattedAddress) { setError('Address is required'); return; }
      try {
        setLoading(true); setError(null); setSuccess(null);
        if (existingClub) {
          await clubService.joinClub(existingClub.uid, user.uid);
          setSuccess(`Joined "${existingClub.name || clubForm.name}" successfully!`);
          setTimeout(() => navigate(`/clubs/${existingClub.uid}`), 1200);
          return;
        }
        const result = await clubService.createClub({
          userUid: user.uid, adminUid: null, name: clubForm.name,
          placeId: clubForm.placeId, formattedAddress: clubForm.formattedAddress,
          clubType: clubForm.clubType, isPrivate: false,
          photos: selectedPlace?.photos || [],
          lat: selectedPlace?.geometry?.location?.lat || null,
          lng: selectedPlace?.geometry?.location?.lng || null,
        });
        const newClub = result?.club || result;
        const clubId = newClub?.uid || newClub?.id;
        setSuccess(`Club "${newClub?.name || clubForm.name}" created!`);
        setTimeout(() => navigate(clubId ? `/clubs/${clubId}` : '/clubs'), 1200);
      } catch (err) {
        setError(err.response?.data?.body?.error || err.message || 'Failed to perform action.');
      } finally { setLoading(false); }
    } else {
      if (!groupForm.name.trim()) { setError('Group name is required'); return; }
      if (!groupForm.masterClubUid) { setError('A parent club must be selected'); return; }
      try {
        setLoading(true); setError(null); setSuccess(null);
        const result = await clubService.createGroup({
          userUid: user.uid, adminUid: user.uid, name: groupForm.name,
          placeId: groupForm.placeId, formattedAddress: groupForm.formattedAddress,
          about: groupForm.about, isPrivate: groupForm.isPrivate,
          masterClubUid: groupForm.masterClubUid, activities: groupForm.activities,
          profileImage: profileImage || null, coverImage: coverImage || null,
          lat: selectedPlace?.geometry?.location?.lat || null,
          lng: selectedPlace?.geometry?.location?.lng || null,
        });
        const newGroup = result?.club || result;
        const groupId = newGroup?.uid || newGroup?.id;
        setSuccess(`Group "${newGroup?.name || groupForm.name}" created!`);
        setTimeout(() => navigate(groupId ? `/groups/${groupId}` : '/clubs'), 1200);
      } catch (err) {
        setError(err.response?.data?.body?.error || err.message || 'Failed to create group.');
      } finally { setLoading(false); }
    }
  };

  const GKEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const photoUrl = (ref) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${GKEY}`;

  // ── Shared input classes ──
  const inputCls = "w-full bg-[#0d1624]/65 border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-white/20 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-all duration-200 hover:border-white/15 disabled:opacity-50 disabled:cursor-not-allowed";
  const labelCls = "block text-[10px] font-bold text-white/45 uppercase tracking-widest mb-2";

  return (
    <>
      <div id="global-loader">
        <div className="loader-img">
          <img alt="Global" className="img-fluid" src="/assets/img/logo.png" style={{ width: '120px' }} />
        </div>
      </div>

      <div className="main-wrapper min-h-screen bg-gradient-to-b from-[#080d19] via-[#0b1224] to-[#0f1930] relative">

        {/* ── Nav ── */}
        <div className="bg-[#0b101c] border-b border-white/[0.04] relative z-30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-around py-2.5 text-white/35">
              <Link to="/activity" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
                <i className="bi bi-activity text-base"></i>
                <span className="text-[9px] font-semibold uppercase tracking-wider">Activity</span>
              </Link>
              <Link to="/search" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
                <i className="bi bi-search text-base"></i>
                <span className="text-[9px] font-semibold uppercase tracking-wider">Search</span>
              </Link>
              <Link to="/places" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
                <i className="bi bi-geo-alt text-base"></i>
                <span className="text-[9px] font-semibold uppercase tracking-wider">Places</span>
              </Link>
              <Link to="/event" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
                <i className="bi bi-calendar-event text-base"></i>
                <span className="text-[9px] font-semibold uppercase tracking-wider">Events</span>
              </Link>
              <Link to="/user-profile" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
                <i className="bi bi-person text-base"></i>
                <span className="text-[9px] font-semibold uppercase tracking-wider">Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Page Content ── */}
        <div className="relative z-10 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            {/* Back link */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/clubs" className="flex items-center gap-2 text-white/45 hover:text-sky-400 text-xs font-semibold uppercase tracking-wider transition-colors">
                <i className="bi bi-arrow-left text-sm"></i>
                <span>Back to Clubs</span>
              </Link>
            </div>

            {/* Auth warning */}
            {!user && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 mb-6">
                <i className="bi bi-exclamation-triangle-fill text-amber-400 text-base mt-0.5"></i>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">Authentication Required</h4>
                  <p className="text-amber-300/80 text-[11px] leading-relaxed">
                    Please <a href="/login" className="text-amber-400 font-bold hover:text-amber-300 transition underline decoration-dotted underline-offset-2">sign in</a> to create a club or group.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Panel: Form (7 columns) */}
                <div className="lg:col-span-7 bg-[#111c30] border border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/15 flex-shrink-0">
                        <i className={`bi ${mode === 'club' ? 'bi-building' : 'bi-people-fill'} text-sky-400 text-lg`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-extrabold text-sky-400 uppercase tracking-[0.2em] leading-none mb-1">Registration</p>
                        <h2 className="text-[18px] font-black text-white tracking-tight leading-tight">
                          {mode === 'club' ? 'Add Club' : 'Create a Group'}
                        </h2>
                      </div>
                    </div>

                    {/* Mode toggle — only show when not forced into group mode */}
                    {/* {!masterClubUidParam && (
                      <div className="flex items-center bg-white/[0.05] border border-white/[0.08] rounded-xl p-0.5 gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => switchMode('club')}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 ${mode === 'club' ? 'bg-sky-500 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                        >
                          Club
                        </button>
                        <button
                          type="button"
                          onClick={() => switchMode('group')}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 ${mode === 'group' ? 'bg-sky-500 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                        >
                          Group
                        </button>
                      </div>
                    )} */}
                  </div>

                  {/* Form fields container */}
                  <div className="space-y-5">
                    {/* Parent club banner */}
                    {mode === 'group' && masterClubUidParam && (
                      <div className="bg-sky-500/8 border border-sky-500/15 rounded-2xl p-4 flex items-start gap-3">
                        <i className="bi bi-info-circle-fill text-sky-400 text-base flex-shrink-0 mt-0.5"></i>
                        <div className="flex-1">
                          <p className="text-sky-300/80 text-xs font-medium leading-relaxed">
                            Creating group under: <span className="text-white font-bold">{masterClubNameParam || masterClubUidParam}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Parent club UID input (group, no param) */}
                    {mode === 'group' && !masterClubUidParam && (
                      <div>
                        <label className={labelCls}>Parent Club UID <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <i className="bi bi-key text-white/25 text-sm absolute left-4 top-3.5"></i>
                          <input
                            type="text" name="masterClubUid"
                            value={groupForm.masterClubUid}
                            onChange={handleGroupChange}
                            className={`${inputCls} pl-10`}
                            placeholder="Paste the parent club UID"
                            disabled={!user || loading}
                          />
                        </div>
                        <p className="text-[10px] text-white/25 mt-1.5 leading-relaxed">The UID of the club this group belongs to.</p>
                      </div>
                    )}

                    {/* Location input (club mode) */}
                    {mode === 'club' && (
                      <div>
                        <label className={labelCls}>Location <span className="text-red-400">*</span></label>
                        <div className="relative" ref={wrapperRef}>
                          <div className={`flex items-center bg-[#0d1624]/65 border rounded-xl px-4 py-3 transition-all duration-200 ${showDropdown ? 'border-sky-500/50 ring-1 ring-sky-500/30' : 'border-white/[0.08]'} hover:border-white/15 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/30`}>
                            <i className="bi bi-search text-white/25 text-sm mr-3 flex-shrink-0"></i>
                            <input
                              type="text"
                              className="w-full bg-transparent outline-none text-[13px] text-white placeholder:text-white/20 disabled:opacity-50"
                              placeholder="Search for a club location..."
                              value={placeQuery}
                              onChange={handleQueryChange}
                              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                              disabled={!user || loading}
                              autoComplete="off"
                            />
                            {placeLoading && (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-400 border-t-transparent flex-shrink-0 ml-2"></div>
                            )}
                            {placeQuery && !placeLoading && (
                              <button type="button" className="text-white/35 hover:text-white/60 transition ml-2 flex-shrink-0" onClick={clearPlace}>
                                <i className="bi bi-x-circle-fill text-sm"></i>
                              </button>
                            )}
                          </div>

                          {/* Suggestions Dropdown */}
                          {showDropdown && suggestions.length > 0 && (
                            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[100] bg-[#121c31]/95 border border-white/[0.08] backdrop-blur-md rounded-2xl shadow-2xl max-h-64 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                              {suggestions.map((pred) => (
                                <div
                                  key={pred.place_id}
                                  onClick={() => handleSelect(pred)}
                                  className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors duration-150 flex items-start gap-3 border-b border-white/[0.04] last:border-0"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <i className="bi bi-geo-alt-fill text-sky-400 text-xs"></i>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-white truncate">
                                      {pred.structured_formatting?.main_text || pred.description}
                                    </p>
                                    <p className="text-[10px] text-white/35 truncate mt-0.5">
                                      {pred.structured_formatting?.secondary_text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Group Mode Form Inputs */}
                    {mode === 'group' && (
                      <>
                        {/* Group Name */}
                        <div>
                          <label className={labelCls}>Group Name <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <i className="bi bi-tag text-white/25 text-sm absolute left-4 top-3.5"></i>
                            <input
                              type="text" name="name"
                              value={groupForm.name}
                              onChange={handleGroupChange}
                              disabled={!user || loading}
                              className={`${inputCls} pl-10`}
                              placeholder="Enter group name"
                            />
                          </div>
                        </div>

                        {/* About */}
                        <div>
                          <label className={labelCls}>About <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span></label>
                          <div className="relative">
                            <i className="bi bi-card-text text-white/25 text-sm absolute left-4 top-3.5"></i>
                            <textarea
                              name="about"
                              value={groupForm.about}
                              onChange={handleGroupChange}
                              disabled={!user || loading}
                              className={`${inputCls} pl-10 min-h-[100px] resize-none`}
                              placeholder="Describe what this group is about..."
                            />
                          </div>
                        </div>

                        {/* Location search for group */}
                        <div>
                          <label className={labelCls}>Location <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span></label>
                          <div className="relative" ref={wrapperRef}>
                            <div className={`flex items-center bg-[#0d1624]/65 border rounded-xl px-4 py-3 transition-all duration-200 ${showDropdown ? 'border-sky-500/50 ring-1 ring-sky-500/30' : 'border-white/[0.08]'} hover:border-white/15 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/30`}>
                              <i className="bi bi-search text-white/25 text-sm mr-3 flex-shrink-0"></i>
                              <input
                                type="text"
                                className="w-full bg-transparent outline-none text-[13px] text-white placeholder:text-white/20 disabled:opacity-50"
                                placeholder="Search for a group location..."
                                value={placeQuery}
                                onChange={handleQueryChange}
                                onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                                disabled={!user || loading}
                                autoComplete="off"
                              />
                              {placeLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-400 border-t-transparent flex-shrink-0 ml-2"></div>}
                              {placeQuery && !placeLoading && (
                                <button type="button" className="text-white/35 hover:text-white/60 transition ml-2 flex-shrink-0" onClick={clearPlace}>
                                  <i className="bi bi-x-circle-fill text-sm"></i>
                                </button>
                              )}
                            </div>
                            {showDropdown && suggestions.length > 0 && (
                              <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[100] bg-[#121c31]/95 border border-white/[0.08] backdrop-blur-md rounded-2xl shadow-2xl max-h-64 overflow-y-auto py-1.5">
                                {suggestions.map((pred) => (
                                  <div
                                    key={pred.place_id}
                                    onClick={() => handleSelect(pred)}
                                    className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors duration-150 flex items-start gap-3 border-b border-white/[0.04] last:border-0"
                                  >
                                    <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <i className="bi bi-geo-alt-fill text-sky-400 text-xs"></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[13px] font-semibold text-white truncate">{pred.structured_formatting?.main_text || pred.description}</p>
                                      <p className="text-[10px] text-white/35 truncate mt-0.5">{pred.structured_formatting?.secondary_text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Privacy Toggle container */}
                        <div 
                          onClick={() => !loading && handleGroupChange({ target: { name: 'isPrivate', type: 'checkbox', checked: !groupForm.isPrivate } })}
                          className={`flex items-center justify-between border rounded-2xl px-4 py-3.5 cursor-pointer select-none transition-all duration-200 ${groupForm.isPrivate ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30' : 'bg-[#0d1624]/40 border-white/[0.08] hover:border-white/15'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${groupForm.isPrivate ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-white/40'}`}>
                              <i className={`bi ${groupForm.isPrivate ? 'bi-shield-lock-fill' : 'bi-unlock-fill'} text-sm`}></i>
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-white">Private Group</p>
                              <p className="text-[10px] text-white/35 mt-0.5">Only members can view the group's feeds and activities.</p>
                            </div>
                          </div>
                          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ${groupForm.isPrivate ? 'bg-amber-500' : 'bg-white/[0.08]'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${groupForm.isPrivate ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                          <label className={labelCls}>
                            Cover Image <span className="text-white/15 font-normal normal-case tracking-normal">optional</span>
                          </label>
                          {coverImagePreview ? (
                            <div className="relative rounded-xl overflow-hidden h-36 border border-white/[0.08] group/cover">
                              <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover group-hover/cover:scale-102 transition duration-500" />
                              <button
                                type="button"
                                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition backdrop-blur-sm shadow-lg border border-white/10"
                                onClick={clearCoverImage}
                              >
                                <i className="bi bi-trash text-xs"></i>
                              </button>
                            </div>
                          ) : (
                            <div
                              className="border border-dashed border-white/[0.08] rounded-xl p-6 flex flex-col items-center justify-center bg-[#0d1624]/40 hover:bg-[#0d1624]/75 hover:border-sky-500/40 transition cursor-pointer text-center group"
                              onClick={() => !loading && coverInputRef.current?.click()}
                            >
                              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                                <i className="bi bi-cloud-arrow-up text-sky-400 text-lg"></i>
                              </div>
                              <p className="text-[12px] text-white/50 font-medium">Click to upload cover image</p>
                              <p className="text-[10px] text-white/20 mt-1 uppercase tracking-wider">JPG, PNG, WEBP · Max 5 MB</p>
                            </div>
                          )}
                          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={!user || loading} onChange={handleCoverImageChange} />
                        </div>

                        {/* Profile Image Upload */}
                        <div>
                          <label className={labelCls}>
                            Profile Image <span className="text-white/15 font-normal normal-case tracking-normal">optional</span>
                          </label>
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-16 h-16 rounded-2xl border ${profileImagePreview ? 'border-sky-500/50' : 'border-dashed border-white/[0.08]'} flex items-center justify-center overflow-hidden bg-[#0d1624]/40 hover:bg-[#0d1624]/75 hover:border-sky-500/40 transition cursor-pointer relative group/profile`}
                              onClick={() => !loading && profileInputRef.current?.click()}
                            >
                              {profileImagePreview ? (
                                <>
                                  <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/profile:opacity-100 flex items-center justify-center transition-opacity">
                                    <i className="bi bi-camera text-white text-sm"></i>
                                  </div>
                                </>
                              ) : (
                                <i className="bi bi-person-fill text-white/15 text-2xl"></i>
                              )}
                            </div>
                            <div>
                              {profileImagePreview ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-sky-400 font-medium truncate max-w-[150px]">{profileImage?.name}</span>
                                  <button
                                    type="button"
                                    className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                                    onClick={clearProfileImage}
                                  >
                                    <i className="bi bi-trash text-[10px]"></i>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-[12px] text-white/40 mb-1.5">Upload group icon</p>
                                  <button
                                    type="button"
                                    className="px-3.5 py-1.5 rounded-lg border border-white/[0.08] text-white/45 text-[11px] font-medium hover:text-white hover:border-white/15 transition bg-[#0d1624]/30"
                                    onClick={() => profileInputRef.current?.click()}
                                  >
                                    Choose file
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <input ref={profileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={!user || loading} onChange={handleProfileImageChange} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Status messages */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
                      <i className="bi bi-exclamation-circle-fill text-red-400 text-base mt-0.5 flex-shrink-0"></i>
                      <div className="flex-1">
                        <h4 className="text-[12px] font-semibold text-red-400 uppercase tracking-wider mb-0.5">Error Occurred</h4>
                        <p className="text-red-300/80 text-[11px] leading-relaxed">{error}</p>
                      </div>
                    </div>
                  )}
                  {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
                      <i className="bi bi-check-circle-fill text-emerald-400 text-base mt-0.5 flex-shrink-0"></i>
                      <div className="flex-1">
                        <h4 className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">Success</h4>
                        <p className="text-emerald-300/80 text-[11px] leading-relaxed">{success}</p>
                      </div>
                    </div>
                  )}

                  {/* Form Submission Button */}
                  <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                    <button
                      type="submit"
                      disabled={!user || loading || (mode === 'club' ? !clubForm.placeId : false)}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-[13px] font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-98"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Saving…</span>
                        </>
                      ) : (
                        <>
                          <i className={`bi ${existingClub ? 'bi-person-plus-fill' : 'bi-plus-lg'} text-sm`}></i>
                          <span>{existingClub ? 'Become a Member' : `Add ${mode === 'club' ? 'Club' : 'Group'}`}</span>
                        </>
                      )}
                    </button>
                    <Link
                      to="/clubs"
                      className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-semibold hover:text-white hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200 flex items-center justify-center"
                    >
                      Cancel
                    </Link>
                  </div>

                </div>

                {/* Right Panel: Interactive Live Preview (5 columns) */}
                <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
                  
                  {/* Mode-specific preview card */}
                  {mode === 'club' ? (
                    
                    /* Club Preview Container */
                    <div className="bg-[#111c30] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl space-y-4">
                      {selectedPlace ? (
                        <>
                          {/* Banner / Photos */}
                          <div className="relative h-44 bg-gradient-to-r from-slate-900 to-sky-950 overflow-hidden">
                            {selectedPlace.photos?.[0] ? (
                              <img
                                src={photoUrl(selectedPlace.photos[0].photo_reference)}
                                alt={selectedPlace.name}
                                className="w-full h-full object-cover"
                                onError={e => e.target.style.display = 'none'}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                                <i className="bi bi-building text-4xl mb-1"></i>
                                <span className="text-[10px] uppercase tracking-widest font-semibold">No Image Available</span>
                              </div>
                            )}
                            
                            {/* Status Overlay Badge */}
                            <div className="absolute top-3 right-3">
                              {existingClub ? (
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                  Already Member
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                                  ✓ Available
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Place details */}
                          <div className="px-6 pb-2 space-y-3">
                            <div>
                              <h3 className="text-[16px] font-black text-white tracking-tight leading-snug">{selectedPlace.name}</h3>
                              <p className="text-[11px] text-white/45 mt-1 leading-relaxed">{selectedPlace.formatted_address}</p>
                            </div>

                            {selectedPlace.website && (
                              <div className="flex items-center gap-2 text-[11px]">
                                <i className="bi bi-globe text-sky-400 text-sm"></i>
                                <a href={selectedPlace.website} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline truncate">
                                  {selectedPlace.website}
                                </a>
                              </div>
                            )}

                            {/* Extra photo thumbnails if any */}
                            {selectedPlace.photos && selectedPlace.photos.length > 1 && (
                              <div className="flex gap-2 pt-1">
                                {selectedPlace.photos.slice(1, 4).map((photo, index) => (
                                  <img
                                    key={photo.photo_reference}
                                    src={photoUrl(photo.photo_reference)}
                                    alt="Thumbnail"
                                    className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10 hover:ring-sky-500/40 transition duration-150"
                                    onError={e => e.target.style.display = 'none'}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Map display */}
                          <div className="px-6 pb-6">
                            <div
                              ref={clubMapRef}
                              className="w-full h-48 rounded-xl overflow-hidden border border-white/[0.08] shadow-inner"
                              style={{ minHeight: '180px' }}
                            />
                          </div>
                        </>
                      ) : (
                        /* Placeholder state */
                        <div className="border border-dashed border-white/[0.08] rounded-3xl p-10 text-center flex flex-col items-center justify-center bg-white/[0.01]">
                          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 text-sky-400/75 animate-bounce">
                            <i className="bi bi-geo-alt-fill text-2xl"></i>
                          </div>
                          <h3 className="text-[14px] font-bold text-white tracking-tight">Location Preview</h3>
                          <p className="text-[11px] text-white/35 mt-2 max-w-xs leading-relaxed">
                            Search for a location using the input on the left to load the map and street details here.
                          </p>
                        </div>
                      )}
                    </div>

                  ) : (
                    
                    /* Group Live Preview Container */
                    <div className="bg-[#111c30] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl relative">
                      
                      {/* Card Banner */}
                      <div className="relative h-40 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 overflow-hidden">
                        {coverImagePreview ? (
                          <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white/25">
                            <i className="bi bi-image text-3xl mb-1.5"></i>
                            <span className="text-[9px] uppercase tracking-widest font-extrabold">No Cover Image</span>
                          </div>
                        )}
                        
                        {/* Privacy Badge overlay */}
                        <div className="absolute top-3 right-3">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${groupForm.isPrivate ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border-sky-500/30'}`}>
                            {groupForm.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                      </div>

                      {/* Card Profile Image Overlay */}
                      <div className="px-6 -mt-8 relative z-10 flex items-end justify-between">
                        <div className="w-20 h-20 rounded-2xl border-4 border-[#111c30] bg-[#0d1624] overflow-hidden shadow-lg flex-shrink-0">
                          {profileImagePreview ? (
                            <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/15">
                              <i className="bi bi-people-fill text-2xl"></i>
                            </div>
                          )}
                        </div>
                        
                        {/* Parent Club Badge if present */}
                        {groupForm.masterClubUid && (
                          <span className="text-[9px] font-bold text-white/40 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-lg max-w-[180px] truncate mb-1">
                            Parent: {masterClubNameParam || groupForm.masterClubUid}
                          </span>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-[16px] font-black text-white tracking-tight leading-snug">
                            {groupForm.name || "My New Group"}
                          </h3>
                          <p className="text-[11px] text-white/45 mt-1.5 leading-relaxed line-clamp-3">
                            {groupForm.about || "Describe your group details in the form to see them here..."}
                          </p>
                        </div>

                        {/* Location & Map Preview inside Card */}
                        {selectedPlace ? (
                          <div className="space-y-3 pt-3.5 border-t border-white/[0.05]">
                            <div className="flex items-start gap-2 text-[11px] text-white/50">
                              <i className="bi bi-geo-alt-fill text-sky-400 mt-0.5 flex-shrink-0"></i>
                              <span className="leading-snug">{selectedPlace.formatted_address}</span>
                            </div>
                            
                            <div
                              ref={groupMapRef}
                              className="w-full h-36 rounded-xl overflow-hidden border border-white/[0.08] shadow-inner"
                              style={{ minHeight: '140px' }}
                            />
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-white/[0.05] flex items-center justify-center gap-2 py-5 text-[11px] text-white/20 border-dashed border border-white/[0.06] rounded-xl bg-white/[0.01]">
                            <i className="bi bi-geo-alt"></i>
                            <span>No location selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </form>

          </div>
        </div>

      </div>
    </>
  );
};

export default CreateClub;