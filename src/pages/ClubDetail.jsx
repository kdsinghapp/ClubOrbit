import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { useAuthContext } from '../context/AuthContext';

function Avatar({ src, name, size = 40 }) {
  const [err, setErr] = useState(false);

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-xl object-cover shrink-0 aspect-square"
        style={{ width: size, height: size }}
        onError={() => setErr(true)}
      />
    );
  }

  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 aspect-square rounded-xl text-white font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}

const ClubDetail = () => {
  const { clubId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [showFullAbout, setShowFullAbout] = useState(false);

  useEffect(() => { if (clubId) fetchClub(); }, [clubId, user]);

  const fetchClub = async () => {
    try {
      setLoading(true); setError(null);
      const result = await clubService.getClubById(clubId, user?.uid || '');
      setData(result);
    } catch {
      setError('Failed to load club details. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!loading && location.hash === '#sub-groups') {
      const element = document.getElementById('sub-groups');
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [loading, location.hash]);

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      setJoining(true); setActionMsg(null);
      await clubService.joinClub(clubId, user.uid);
      setActionMsg({ type: 'success', text: 'You joined the club!' });
      fetchClub();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.message || 'Failed to join.' });
    } finally { setJoining(false); }
  };

  const handleLeave = async () => {
    if (!user) return;
    try {
      setLeaving(true); setActionMsg(null);
      await clubService.leaveClub(clubId, user.uid);
      setActionMsg({ type: 'warning', text: 'You left the club.' });
      fetchClub();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.message || 'Failed to leave.' });
    } finally { setLeaving(false); }
  };

  /* ── Derived data ── */
  const club = data?.club || {};
  const clubEntity = data?.clubEntity || {};
  const analytics = data?.analytics || {};
  const memberships = data?.memberships || clubEntity?.memberships || [];
  const activities = data?.activities || club?.activities || clubEntity?.activities || [];
  const adminProfile = data?.adminProfile || clubEntity?.adminProfile || null;
  const hostClub = data?.hostClub || null;
  const groups = data?.groups || clubEntity?.groups || [];
  const eventSeries = data?.eventSeries || [];

  /* ── Club name — check all possible fields ── */
  const clubName =
    club.name || club.title || club.displayName ||
    clubEntity.name || clubEntity.title || clubEntity.displayName ||
    'Club';

  const clubAddress =
    club.formattedAddress || club.address ||
    clubEntity.formattedAddress || clubEntity.address || '';

  const isMember = user && memberships.some(m => m.uid === user.uid);
  const isAdmin = user && (
    club.adminUid === user.uid ||
    clubEntity.adminUid === user.uid ||
    adminProfile?.uid === user.uid
  );
  const isGroup = club.clubType === 'group' || clubEntity?.type === 'group';

  const profilePicUrl =
    club.profilePic?.thumbnailURL ||
    club.profilePicUrl ||
    clubEntity?.profilePicUrl ||
    null;

  const coverPicUrl = club.coverPicUrl || clubEntity?.coverPicUrl || null;
  const distanceKm = club.distance ? (club.distance / 1000).toFixed(1) : null;
  const clubLat = club.lat || club.location?.lat || clubEntity.lat;
  const clubLng = club.lng || club.location?.lng || clubEntity.lng;

  const aboutText = club.about || clubEntity.about || '';
  const aboutShort = aboutText.length > 300 ? aboutText.slice(0, 300) + '…' : aboutText;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080d19] via-[#0b1224] to-[#0f1930] text-white relative">

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#080d19] z-50">
          <img src="/assets/img/logo.png" alt="logo" className="w-20 animate-pulse" />
        </div>
      )}

      {/* Top Menu */}
      <div className="bg-[#0b101c] border-b border-white/[0.04] relative z-30 shadow-md">
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

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Back Navigation */}
        <div className="flex justify-end mb-8">
          <Link
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111c30] border border-white/[0.06] text-white/60 text-[11px] font-bold uppercase tracking-wider hover:text-white hover:border-white/10 active:scale-95 transition-all duration-200"
            to="/clubs"
          >
            <i className="bi bi-arrow-left text-sm"></i> View Clubs
          </Link>
        </div>

        {/* Status Messages */}
        {actionMsg && (
          <div className={`flex items-center gap-3.5 p-4 rounded-2xl mb-6 border animate-in fade-in duration-300 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : actionMsg.type === 'danger'
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <i className="bi bi-info-circle-fill text-lg flex-shrink-0"></i>
            <span className="text-[13px] font-semibold leading-relaxed">{actionMsg.text}</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-3.5 bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl mb-8 animate-in fade-in duration-300">
            <i className="bi bi-exclamation-octagon-fill text-lg flex-shrink-0"></i>
            <span className="text-[13px] font-semibold leading-relaxed">{error}</span>
            <button
              className="ml-auto text-[11px] px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition duration-200"
              onClick={fetchClub}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Left Column ── */}
            <div className="lg:col-span-8 space-y-6">

              {/* Hero Card */}
              <div className="bg-[#111c30] rounded-3xl border border-white/[0.06] shadow-2xl overflow-hidden relative group">

                {/* Cover Image — clean fixed height */}
                <div className="relative h-[220px] bg-gradient-to-br from-[#0b101c] to-[#131f35] overflow-hidden">
                  {coverPicUrl ? (
                    <img
                      src={coverPicUrl}
                      alt={clubName}
                      className="w-full h-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/5">
                      <i className={`bi ${isGroup ? 'bi-people-fill' : 'bi-building'} text-[120px]`}></i>
                    </div>
                  )}

                  {/* Subtle black fade overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Badges — top right */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      club.isPrivate
                        ? 'bg-slate-950/80 text-slate-300 border border-white/10'
                        : 'bg-[#064e3b]/80 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {club.isPrivate ? 'Private' : 'Public'}
                    </span>
                    {(club.clubType || clubEntity.clubType) && (
                      <span className="px-3 py-1 rounded-full bg-slate-950/80 text-sky-400 border border-sky-500/20 text-[9px] font-extrabold uppercase tracking-wider">
                        {club.clubType || clubEntity.clubType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile pic — negative margin pulls it over the cover seam */}
                <div className="px-8 relative z-20">
                  <div className="-mt-12 w-fit p-1 bg-[#111c30] rounded-2xl border border-white/[0.06] shadow-2xl">
                    <div className="rounded-xl overflow-hidden">
                      <Avatar src={profilePicUrl} name={clubName} size={88} />
                    </div>
                  </div>
                </div>

                {/* Club Name & Address */}
                <div className="px-8 pt-4 pb-6 border-b border-white/[0.06]">
                  <h1 className="text-3xl font-black text-white tracking-tight leading-tight mb-2.5">
                    {clubName}
                  </h1>
                  {clubAddress && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/50">
                      <span className="flex items-center gap-1.5">
                        <i className="bi bi-geo-alt-fill text-amber-500"></i>
                        {clubAddress}
                      </span>
                      {distanceKm && (
                        <>
                          <span className="text-white/10 hidden sm:inline">•</span>
                          <span className="text-sky-400 font-extrabold">{distanceKm} km away</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats Grid — always BELOW header text */}
                <div className="grid grid-cols-3 divide-x divide-white/[0.04] border-b border-white/[0.06] bg-[#0b101c]/40">
                  {[
                    { value: analytics.memberCount ?? memberships.length, label: 'Members' },
                    { value: analytics.pastEventCount ?? 0, label: 'Past Events' },
                    { value: analytics.futureEventCount ?? 0, label: 'Upcoming' },
                  ].map((stat, i) => (
                    <div key={i} className="py-4.5 text-center">
                      <div className="text-xl font-black text-white tracking-tight">{stat.value}</div>
                      <div className="text-[9px] font-extrabold text-white/35 uppercase tracking-widest mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-around py-4.5 bg-[#0b101c]/20">
                  <Link
                    to={`/clubs/create?masterClubUid=${clubId}&masterClubName=${encodeURIComponent(clubName)}`}
                    className="flex flex-col items-center gap-1.5 group/act transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover/act:bg-sky-500 group-hover/act:border-sky-500 group-hover/act:shadow-lg group-hover/act:shadow-sky-500/20 transition-all duration-200">
                      <i className="bi bi-people-fill text-sky-400 text-base group-hover/act:text-white transition-colors duration-200"></i>
                    </div>
                    <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-sky-400 transition-colors duration-200">Add Group</span>
                  </Link>

                  <button className="flex flex-col items-center gap-1.5 group/act transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover/act:bg-amber-500 group-hover/act:border-amber-500 group-hover/act:shadow-lg group-hover/act:shadow-amber-500/20 transition-all duration-200">
                      <i className="bi bi-chat-fill text-amber-400 text-base group-hover/act:text-[#0b101c] transition-colors duration-200"></i>
                    </div>
                    <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-amber-400 transition-colors duration-200">Chat</span>
                  </button>

                  <button className="flex flex-col items-center gap-1.5 group/act transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/act:bg-white group-hover/act:border-white group-hover/act:shadow-lg group-hover/act:shadow-white/10 transition-all duration-200">
                      <i className="bi bi-share-fill text-white/60 text-base group-hover/act:text-[#0b101c] transition-colors duration-200"></i>
                    </div>
                    <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-white transition-colors duration-200">Share</span>
                  </button>

                  <div className="relative group/more">
                    <button className="flex flex-col items-center gap-1.5 transition-all duration-200">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/more:bg-white group-hover/more:border-white transition-all duration-200">
                        <i className="bi bi-three-dots text-white/60 text-base group-hover/more:text-[#0b101c] transition-colors duration-200"></i>
                      </div>
                      <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/more:text-white transition-colors duration-200">More</span>
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-44 bg-[#111c30] border border-white/[0.06] rounded-2xl shadow-2xl p-1.5 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-200 z-50">
                      {isAdmin && (
                        <Link
                          to={`/clubs/${clubId}/edit`}
                          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white/80 hover:bg-sky-500 hover:text-white transition-all duration-200"
                        >
                          <i className="bi bi-pencil text-sm"></i> Edit Details
                        </Link>
                      )}
                      {!isMember && !isAdmin && (
                        <button
                          onClick={handleJoin}
                          disabled={joining}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white/80 hover:bg-sky-500 hover:text-white transition-all duration-200 text-left"
                        >
                          <i className="bi bi-person-plus text-sm"></i> Join Club
                        </button>
                      )}
                      {isMember && !isAdmin && (
                        <button
                          onClick={handleLeave}
                          disabled={leaving}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 text-left"
                        >
                          <i className="bi bi-box-arrow-left text-sm"></i> Leave Club
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* About */}
                <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] md:col-span-2">
                  <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mb-5">
                    About the {isGroup ? 'Group' : 'Club'}
                  </h3>
                  <div className="space-y-5">
                    {(clubLat && clubLng) && (
                      <div className="rounded-2xl overflow-hidden h-[180px] border border-white/[0.06]">
                        <iframe
                          title="map"
                          className="w-full h-full grayscale opacity-70 contrast-125 border-none"
                          src={`https://www.google.com/maps?q=${clubLat},${clubLng}&z=15&output=embed`}
                        />
                      </div>
                    )}
                    <div>
                      {aboutText ? (
                        <>
                          <p className="text-white/70 text-[13px] leading-relaxed whitespace-pre-line">
                            {showFullAbout ? aboutText : aboutShort}
                          </p>
                          {aboutText.length > 300 && (
                            <button
                              onClick={() => setShowFullAbout(!showFullAbout)}
                              className="text-sky-400 hover:text-sky-300 text-xs font-extrabold uppercase tracking-wider mt-2.5"
                            >
                              {showFullAbout ? 'Show Less' : 'Read More'}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-white/30 text-xs italic">No description provided.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06]">
                  <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <i className="bi bi-trophy text-amber-500"></i> Activities
                  </h3>
                  {activities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activities.map((a, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-[#0b101c] border border-white/[0.04] text-[9px] font-extrabold uppercase tracking-wider text-white/50 hover:border-amber-500/30 hover:text-amber-400 transition duration-200"
                        >
                          {a.name || a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs italic">No activities listed.</p>
                  )}
                </div>

                {/* Members */}
                <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06]">
                  <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mb-5 flex items-center justify-between">
                    <span>Members ({analytics.memberCount ?? memberships.length})</span>
                    <i className="bi bi-people-fill text-sky-400"></i>
                  </h3>
                  {memberships.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {memberships.slice(0, 12).map(m => (
                        <div key={m.uid} className="group/mem relative cursor-pointer">
                          <div className="rounded-xl overflow-hidden ring-2 ring-white/[0.04] group-hover/mem:ring-sky-500 transition-all duration-200">
                            <Avatar src={m.profilePicUrl} name={m.displayName} size={36} />
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-950/90 border border-white/[0.06] rounded-lg text-[9px] font-bold text-white opacity-0 invisible group-hover/mem:opacity-100 group-hover/mem:visible transition-all duration-200 whitespace-nowrap z-10">
                            {m.displayName}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs italic">Be the first to join!</p>
                  )}
                </div>

                {/* Sub-Groups */}
                {groups.length > 0 && (
                  <div id="sub-groups" className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] md:col-span-2">
                    <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <i className="bi bi-diagram-3"></i> Groups
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {groups.map(group => (
                        <Link
                          key={group.uid}
                          to={`/groups/${group.uid}`}
                          className="bg-[#0b101c]/40 border border-white/[0.04] rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/40 hover:bg-[#0b101c]/80 transition duration-300 group/sub"
                        >
                          <div className="rounded-xl overflow-hidden shrink-0 border border-white/[0.06] group-hover/sub:border-purple-500/20 transition-all duration-300">
                            <Avatar src={group.profilePicUrl} name={group.name} size={44} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-extrabold text-white text-sm truncate group-hover/sub:text-purple-400 transition-colors duration-200">{group.name}</div>
                            <div className="flex items-center gap-3 mt-1 text-[9px] font-extrabold text-white/45 uppercase tracking-wider">
                              <span>{group.memberCount || 0} Members</span>
                              <span className={`px-2 py-0.5 rounded-full ${group.isPrivate ? 'bg-white/5 text-white/30' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {group.isPrivate ? 'Private' : 'Public'}
                              </span>
                            </div>
                          </div>
                          <i className="bi bi-chevron-right text-white/20 group-hover/sub:text-purple-400 group-hover/sub:translate-x-1 transition-all duration-300"></i>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {eventSeries.length > 0 && (
                  <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] md:col-span-2">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <i className="bi bi-calendar-event"></i> Upcoming Events
                    </h3>
                    <div className="space-y-4">
                      {eventSeries.map(ev => (
                        <Link
                          to={`/event-series/${ev.eventSeriesUid}`}
                          key={ev.eventSeriesUid}
                          className="block bg-[#0b101c]/40 border border-white/[0.04] rounded-2xl p-5 hover:border-amber-500/40 hover:bg-[#0b101c]/80 transition duration-300 group/evt"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              {ev.eventSeriesPicUrl ? (
                                <img
                                  src={ev.eventSeriesPicUrl}
                                  alt={ev.eventTitle}
                                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/[0.06]"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-[#111c30] border border-white/[0.06] flex items-center justify-center text-white/20 shrink-0">
                                  <i className="bi bi-image text-xl"></i>
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="font-bold text-white mb-1 truncate group-hover/evt:text-amber-500 transition-colors duration-200">{ev.eventTitle}</h4>
                                <p className="text-white/40 text-[11px] line-clamp-1">{ev.clubAddress || 'No location specified'}</p>
                              </div>
                            </div>
                            {ev.startDateTime && (
                              <div className="flex items-center gap-3.5 shrink-0">
                                <div className="text-left sm:text-right">
                                  <div className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider">Next Occurrence</div>
                                  <div className="text-xs font-extrabold text-white/80 mt-0.5">
                                    {new Date(ev.startDateTime).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover/evt:bg-amber-500 group-hover/evt:text-[#0b101c] group-hover/evt:border-amber-500 transition-all duration-300">
                                  <i className="bi bi-arrow-right"></i>
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className="lg:col-span-4 space-y-6">

              {/* Join / Member / Admin Card */}
              <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl text-center relative overflow-hidden">
                {isAdmin ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
                      <i className="bi bi-shield-fill-check text-amber-500 text-2xl"></i>
                    </div>
                    <p className="text-amber-500 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Administrator</p>
                    <h3 className="text-lg font-black text-white mb-6">Master Control</h3>
                    <Link
                      to={`/clubs/${clubId}/edit`}
                      className="block w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-[#0b101c] rounded-xl font-extrabold uppercase text-[11px] tracking-wider hover:from-amber-400 hover:to-yellow-500 transition-all duration-200 active:scale-95 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 text-center"
                    >
                      Manage Club
                    </Link>
                  </>
                ) : isMember ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
                      <i className="bi bi-check-circle-fill text-emerald-500 text-2xl"></i>
                    </div>
                    <p className="text-emerald-500 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Verified Member</p>
                    <h3 className="text-lg font-black text-white mb-6">Welcome Back</h3>
                    <button
                      onClick={handleLeave}
                      disabled={leaving}
                      className="w-full py-3.5 bg-[#0b101c]/40 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl font-extrabold uppercase text-[11px] tracking-wider hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 active:scale-95"
                    >
                      {leaving ? 'Processing...' : 'Leave Club'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto mb-5 border border-sky-500/20">
                      <i className={`bi ${isGroup ? 'bi-people' : 'bi-building'} text-sky-400 text-2xl`}></i>
                    </div>
                    <p className="text-sky-400 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Guest Access</p>
                    <h3 className="text-lg font-black text-white mb-6">Join Community</h3>
                    <button
                      onClick={handleJoin}
                      disabled={joining}
                      className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-extrabold uppercase text-[11px] tracking-wider hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 transition-all duration-200 active:scale-95"
                    >
                      {joining ? 'Joining...' : 'Become a Member'}
                    </button>
                  </>
                )}
              </div>

              {/* Admin Profile */}
              {adminProfile && (
                <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] shadow-xl">
                  <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-5">Admin Profile</h3>
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl overflow-hidden border border-white/[0.06] shrink-0">
                      <Avatar src={adminProfile.profilePicUrl} name={adminProfile.displayName} size={50} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-white text-sm truncate">{adminProfile.displayName}</div>
                      <div className="text-xs text-white/40 truncate mt-1">{adminProfile.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Parent Club */}
              {hostClub && (
                <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] shadow-xl relative overflow-hidden">
                  <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-5">Parent Club</h3>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                      <i className="bi bi-building text-purple-400 text-lg"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-white text-sm truncate">{hostClub.name}</div>
                      <p className="text-[10px] text-white/45 mt-1 line-clamp-2 leading-relaxed">{hostClub.formattedAddress}</p>
                    </div>
                  </div>
                  <Link
                    to={`/clubs/${hostClub.uid}`}
                    className="block w-full py-3 bg-[#0b101c]/40 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 hover:text-purple-300 text-center rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:bg-purple-500/10 transition-all duration-200 active:scale-95"
                  >
                    View Parent Club
                  </Link>
                </div>
              )}

              {/* Quick Details */}
              <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] shadow-xl">
                <h3 className="text-[10px] font-black text-white/35 uppercase tracking-[0.2em] mb-6">Quick Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <i className="bi bi-tag text-sky-400 text-sm"></i>
                      </div>
                      <span className="text-xs text-white/60 font-bold">Category</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-[9px] font-extrabold uppercase tracking-wider border border-sky-500/20">
                      {club.clubType || clubEntity.clubType || 'Club'}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <i className="bi bi-lock text-amber-500 text-sm"></i>
                      </div>
                      <span className="text-xs text-white/60 font-bold">Privacy</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                      club.isPrivate
                        ? 'bg-white/5 text-white/30 border-white/10'
                        : 'bg-[#064e3b]/80 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {club.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </li>
                  {club.phoneNumber && (
                    <li className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                          <i className="bi bi-telephone text-purple-400 text-sm"></i>
                        </div>
                        <span className="text-xs text-white/60 font-bold">Phone</span>
                      </div>
                      <span className="text-xs font-bold text-white/80">{club.phoneNumber}</span>
                    </li>
                  )}
                  {distanceKm && (
                    <li className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                          <i className="bi bi-signpost text-amber-500 text-sm"></i>
                        </div>
                        <span className="text-xs text-white/60 font-bold">Distance</span>
                      </div>
                      <span className="text-xs font-extrabold text-sky-400">{distanceKm} km</span>
                    </li>
                  )}
                </ul>

                {club.website && (
                  <div className="mt-8 pt-6 border-t border-white/[0.06]">
                    <a
                      href={club.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-blue-600/10 to-sky-600/10 border border-blue-500/20 hover:border-blue-500/40 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      <i className="bi bi-globe text-sky-400"></i>
                      <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Official Website</span>
                    </a>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetail;