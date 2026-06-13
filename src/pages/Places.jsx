import React, { useState, useEffect, useRef } from "react";
import { useProfile } from "../hooks/useProfile";
import { useAuthContext } from "../context/AuthContext";
import { placeService } from "../services/Placeservice";
import { clubService } from "../services/clubService";
import { Link } from "react-router-dom";
// Helper to calculate distance between two coordinates
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


export default function Places() {
  const { user: authUser } = useAuthContext();
  const { profile, loading, error } = useProfile(authUser?.uid);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [nearbyObjects, setNearbyObjects] = useState([]);
  const [userClubs, setUserClubs] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingUserClubs, setLoadingUserClubs] = useState(false);
  const [loadingUserEvents, setLoadingUserEvents] = useState(false);
  const [loadingNearbyEvents, setLoadingNearbyEvents] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const searchRef = useRef(null);


  const isUserLoggedIn = () => {
    return authUser !== null;
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user location and fetch nearby objects
  useEffect(() => {
    const getInitialLocation = () => {
      if (navigator.geolocation) {
        setLoadingNearby(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            fetchNearby(location.lat, location.lng);
            fetchNearbyEvents(location.lat, location.lng);
            if (authUser?.uid) {
              fetchUserClubs(authUser.uid, location.lat, location.lng);
              fetchUserEvents(authUser.uid);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setLoadingNearby(false);
            setLoadingNearbyEvents(false);
            if (authUser?.uid) {
              fetchUserClubs(authUser.uid);
              fetchUserEvents(authUser.uid);
            }
          },
          { timeout: 10000 }
        );
      } else if (authUser?.uid) {
        fetchUserClubs(authUser.uid);
        fetchUserEvents(authUser.uid);
      }
    };

    if (authUser) {
      getInitialLocation();
    }
  }, [authUser]);

  const fetchUserClubs = async (uid, lat = null, lng = null) => {
    setLoadingUserClubs(true);
    try {
      const clubs = await clubService.getUserClubs(uid, 1, lat, lng);
      // If location is available and club has coordinates, compute distance
      const clubsWithDistance = (lat != null && lng != null) ? clubs.map((club) => {
        const clubLat = club.lat ?? club.location?.lat;
        const clubLng = club.lng ?? club.location?.lng;
        if (clubLat != null && clubLng != null) {
          return { ...club, distance: getDistanceKm(lat, lng, clubLat, clubLng) };
        }
        return club;
      }) : clubs;
      setUserClubs(clubsWithDistance);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    } finally {
      setLoadingUserClubs(false);
    }
  };
  const fetchNearbyEvents = async (lat, lng) => {
    setLoadingNearbyEvents(true);
    try {
      const { eventService } = await import('../services/eventService');
      const events = await eventService.getEventSeriesEntities(1, null, { lat, lng });
      setNearbyEvents(events);
    } catch (error) {
      console.error('Error fetching nearby events:', error);
    } finally {
      setLoadingNearbyEvents(false);
    }
  };

  const fetchUserEvents = async (uid) => {
    setLoadingUserEvents(true);
    try {
      // Import eventService dynamically to avoid circular dependencies if any
      const { eventService } = await import('../services/eventService');
      const events = await eventService.getEventSeriesSummaries(uid, "hasRegistered");
      setUserEvents(events);
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoadingUserEvents(false);
    }
  };

  const fetchNearby = async (lat, lng) => {
    setLoadingNearby(true);
    try {
      console.log('Fetching nearby objects for:', { lat, lng });
      const objects = await placeService.getNearbyObjects({
        myLatitude: lat,
        myLongitude: lng,
        filter: 'all'
      });
      console.log('Nearby objects received:', objects);
      setNearbyObjects(objects || []);
    } catch (error) {
      console.error('Error fetching nearby objects:', error);
    } finally {
      setLoadingNearby(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoadingSearch(true);
    try {
      const results = await placeService.searchPlaces(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handlePlaceSelect = async (place) => {
    setSelectedPlace(place);
    setShowResults(false);
    try {
      const details = await placeService.getPlaceDetails(place.place_id);
      if (details) {
        setSelectedPlace({
          ...place,
          details: {
            name: details.name,
            formattedAddress: details.formatted_address,
            lat: details.geometry?.location?.lat,
            lng: details.geometry?.location?.lng,
            photos: details.photos || [],
            placeId: details.place_id
          }
        });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const handleSaveClub = async () => {
    if (!selectedPlace?.details || !authUser) return;

    try {
      const clubData = {
        name: selectedPlace.details.name,
        placeId: selectedPlace.details.placeId,
        formattedAddress: selectedPlace.details.formattedAddress,
        clubType: 'club',
        isPrivate: false,
        lat: selectedPlace.details.lat,
        lng: selectedPlace.details.lng,
        profilePicUrl: selectedPlace.details.photos.length > 0
          ? placeService.getPlacePhotoURL(selectedPlace.details.photos[0].photo_reference, 400)
          : null,
        coverPicUrl: selectedPlace.details.photos.length > 1
          ? placeService.getPlacePhotoURL(selectedPlace.details.photos[1].photo_reference, 800)
          : null
      };

      const result = await clubService.saveOrJoinClub(clubData, authUser.uid);
      alert(result.message);
      setSelectedPlace(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error saving club:', error);
      alert('Error saving club: ' + (error.response?.data?.body?.error || error.message));
    }
  };
  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgb(12,19,38)] z-50">
          <img src="/assets/img/logo.png" alt="logo" className="w-24 animate-pulse" />
        </div>
      )}

      {/* Top Menu */}
      <div className="bg-[#0d1b2a] border-b border-gray-800 relative z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-around py-2.5 text-gray-400">
            <Link to="/activity" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-activity text-lg mb-0.5"></i>
              <span className="text-xs">Activity</span>
            </Link>

            <Link to="/search" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-search text-lg mb-0.5"></i>
              <span className="text-xs">Search</span>
            </Link>

            <Link to="/places" className="flex flex-col items-center text-white transition font-bold">
              <i className="bi bi-geo-alt text-lg mb-0.5 text-[#38bdf8]"></i>
              <span className="text-xs">Places</span>
            </Link>

            <Link to="/event" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-calendar-event text-lg mb-0.5"></i>
              <span className="text-xs">Events</span>
            </Link>

            <Link to="/user-profile" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-person text-lg mb-0.5"></i>
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">

        {/* Integrated Search Box - Requested Style */}
        <div className="w-full pb-6">
          <div className="relative group" ref={searchRef}>
            {/* Subtle glow effect on focus */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#38bdf8] to-blue-600 rounded-[30px] blur opacity-0 group-focus-within:opacity-10 transition duration-1000"></div>

            <div className="relative flex items-center bg-[#1a2332] border-2 border-gray-800/80 rounded-[22px] px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-[#38bdf8]/50 transition-all duration-500">
              {/* Magnifying Glass Icon matching the refined style */}
              <div className="relative flex items-center justify-center mr-6">
                <div className="absolute w-10 h-10 bg-[#38bdf8]/10 rounded-full blur-md opacity-50"></div>
                <i className="bi bi-search text-[#38bdf8] text-2xl relative font-bold"></i>
              </div>

              <input
                type="text"
                placeholder="Search Places"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="w-full bg-transparent outline-none text-white text-xl font-bold placeholder:text-gray-600 tracking-tight"
              />

              {loadingSearch && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#38bdf8] border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Premium Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute w-full mt-6 bg-[#1a2332]/98 backdrop-blur-3xl border border-white/10 rounded-[35px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] max-h-[450px] overflow-y-auto z-50 py-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="px-8 py-4 flex items-center justify-between border-b border-white/5 mb-3">
                  <span className="text-xs font-black text-[#38bdf8] uppercase tracking-[0.3em]">Nearby Locations</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse"></span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{searchResults.length} matches</span>
                  </div>
                </div>

                {searchResults.map((place, index) => (
                  <div
                    key={index}
                    onClick={() => handlePlaceSelect(place)}
                    className="px-8 py-5 hover:bg-white/[0.03] cursor-pointer transition-all duration-300 group/item flex items-center gap-5 border-b border-white/5 last:border-0"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#0d1b2a] flex items-center justify-center border border-white/5 group-hover/item:border-[#38bdf8]/40 group-hover/item:scale-105 transition-all duration-300 shadow-xl">
                      <i className="bi bi-building-fill text-gray-600 group-hover/item:text-[#38bdf8] text-xl transition-colors"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-white group-hover/item:text-[#38bdf8] transition-colors truncate mb-1">
                        {place.description}
                      </p>
                      <p className="text-sm text-gray-500 group-hover/item:text-gray-400 transition-colors truncate">
                        {place.structured_formatting?.secondary_text}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 group-hover/item:bg-[#38bdf8] transition-all transform translate-x-4 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100">
                      <i className="bi bi-arrow-right text-[#0d1b2a] font-bold"></i>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {selectedPlace && (
          <div className="bg-[#1a2332] rounded-2xl p-6 shadow-lg space-y-4">

            <div className="flex flex-col md:flex-row gap-4">

              {/* Left */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold">
                  {selectedPlace.details?.name || selectedPlace.description}
                </h4>

                <p className="text-gray-400 text-sm mt-1">
                  {selectedPlace.details?.formattedAddress || "Loading address..."}
                </p>
                {selectedPlace.details && (
                  <>
                    {/* <p className="text-xs text-gray-500 mt-2">
      Coordinates: {selectedPlace.details.lat.toFixed(5)} {selectedPlace.details.lng.toFixed(5)}
    </p> */}
                    {userLocation && (
                      <p className="text-xs text-gray-500 mt-1">
                        Distance: {getDistanceKm(userLocation.lat, userLocation.lng, selectedPlace.details.lat, selectedPlace.details.lng).toFixed(2)} km
                      </p>
                    )}
                  </>
                )}


              </div>

              {/* Image */}
              {selectedPlace.details?.photos?.length > 0 && (
                <img
                  src={placeService.getPlacePhotoURL(selectedPlace.details.photos[0].photo_reference, 300)}
                  alt="place"
                  className="w-full md:w-40 h-28 object-cover rounded-xl"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveClub}
                disabled={!selectedPlace.details || !isUserLoggedIn()}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-full text-sm disabled:opacity-50"
              >
                Save Club
              </button>

              <button
                onClick={() => {
                  setSelectedPlace(null);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm"
              >
                Clear
              </button>
            </div>

            {!isUserLoggedIn() && (
              <div className="text-yellow-400 text-sm">
                Please <a href="/login" className="underline">login</a> to save clubs.
              </div>
            )}
          </div>
        )}

        {/* My Memberships (Clubs & Groups Joined) */}
        {userClubs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black text-[#38bdf8] uppercase tracking-[0.3em] opacity-80">My Memberships</h3>
              <Link to="/clubs" className="text-[#fbc02d] text-xs font-bold uppercase hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userClubs.map((membership) => {
                const club = membership.clubEntity || membership;
                const isAdmin = club.adminUid === authUser?.uid || membership.role === 'admin';
                return (
                  <div key={club.uid} className="bg-[#1a2332] rounded-3xl p-4 border border-gray-800 hover:border-gray-600 transition shadow-xl relative overflow-hidden group">
                    {/* Role Badge */}
                    <div className="absolute top-0 right-0">
                      <div className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl ${isAdmin ? 'bg-[#fbc02d] text-[#0d1b2a]' : 'bg-blue-600 text-white'}`}>
                        {isAdmin ? 'Admin' : 'Member'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link to={`/clubs/${club.uid}`} className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 block shadow-lg">
                        <img
                          src={club.profilePicUrl || '/assets/img/placeholder-club.jpg'}
                          alt={club.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/clubs/${club.uid}`} className="block">
                          <h4 className="text-base font-bold text-white truncate">{club.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 truncate">
                            <i className="bi bi-geo-alt-fill text-[#fbc02d] mr-1"></i>
                            {club.formattedAddress || 'Address not available'}{club.distance ? ` • ${club.distance.toFixed(2)} km` : ''}
                          </p>
                        </Link>

                        {/* Action Buttons for each Joined Club */}
                        <div className="flex items-center gap-3 mt-3">
                          <Link
                            to={`/clubs/${club.uid}#sub-groups`}
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#0d1b2a] rounded-full border border-gray-700 hover:border-[#fbc02d] transition"
                          >
                            <i className="bi bi-diagram-3 text-[#fbc02d] text-xs"></i>
                            <span className="text-[10px] font-bold text-gray-300">Groups</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {userEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black text-[#38bdf8] uppercase tracking-[0.3em] opacity-80">Registered Events</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userEvents.map((event) => (
                <Link key={event.uid} to={`/event-series/${event.uid}`} className="block">
                  <div className="bg-[#1a2332] rounded-2xl p-4 border border-gray-800 hover:border-gray-600 transition shadow-xl flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={event.eventPicUrl || '/assets/img/placeholder-event.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate text-sm">{event.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{event.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded uppercase">Event</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}


        {/* Nearby Clubs Section */}
        <div className="space-y-6">
          {/* Clubs Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-[#fbc02d] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
              Nearby Discovery
            </h3>
            <Link to="/clubs" className="bg-[#fbc02d] rounded-full p-1 text-[#0d1b2a]">
              <i className="bi bi-chevron-right text-xs font-bold"></i>
            </Link>
          </div>

          {loadingNearby ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#fbc02d] mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Searching for clubs near you...</p>
            </div>
          ) : nearbyObjects.filter(o => o.type === 'CLUB' || o.type === 'club').length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {nearbyObjects.filter(o => o.type === 'CLUB' || o.type === 'club').map((obj) => (
                <Link key={obj.uid} to={`/clubs/${obj.uid}`} className="block">
                  <div className="bg-[#1a2332] rounded-3xl p-4 border border-gray-800 hover:border-gray-600 transition shadow-xl flex items-center gap-4 relative">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                      <img
                        src={obj.profilePicUrl || '/assets/img/placeholder-club.jpg'}
                        alt={obj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className="text-lg font-bold text-white truncate">{obj.name}</h4>

                      {/* Address */}
                      <div className="flex items-start gap-2 mt-2">
                        <i className="bi bi-geo-alt-fill text-[#fbc02d] mt-1 shrink-0"></i>
                        <p className="text-xs text-gray-400 leading-snug line-clamp-2">
                          {obj.formattedAddress || obj.address || 'Address not available'}
                        </p>
                      </div>

                      {/* Distance */}
                      <div className="flex items-center gap-2 mt-2">
                        <i className="bi bi-bezier2 text-[#fbc02d] shrink-0"></i>
                        <p className="text-xs font-bold text-gray-400">
                          {obj.distance ? `${obj.distance.toLocaleString()} km` : 'Calculating...'}
                        </p>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <span className="bg-[#fbc02d] rounded-full p-1 text-[#0d1b2a] flex items-center justify-center w-5 h-5">
                        <i className="bi bi-chevron-right text-[10px] font-bold"></i>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#1a2332] rounded-2xl p-10 text-center border border-gray-800">
              <i className="bi bi-geo text-4xl text-gray-600 mb-3 block"></i>
              <p className="text-gray-400">
                {!userLocation
                  ? "Please enable location access to see nearby clubs."
                  : "No nearby clubs found in your area."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}