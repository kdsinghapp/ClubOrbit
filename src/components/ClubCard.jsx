import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Avatar({ src, name, size = 48 }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img src={src} alt={name} width={size} height={size}
        className="rounded-circle" style={{ objectFit: 'cover', flexShrink: 0 }}
        onError={() => setErr(true)} />
    );
  }
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
      style={{ width: size, height: size, background: '#3667B2', fontSize: size * 0.36, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

const ClubCard = ({ club }) => {
  const navigate = useNavigate();

  if (!club) return null;

  // API response fields from /clubMembership
  const {
    uid,
    name,
    formattedAddress,
    shortAddress,
    profilePicUrl,
    memberCount,
    isPrivate,
    type,
    about,
    viewCount,
    activities = [],
    distance,
  } = club;

  const address = shortAddress || formattedAddress || 'No address';
  const distanceKm = distance ? (distance / 1000).toFixed(1) : null;

  return (
    <div
      onClick={() => navigate(`/clubs/${uid}`)}
      className="group relative flex flex-col h-full bg-[#111c30] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer hover:border-sky-500/25 hover:shadow-lg transition-all duration-300"
    >
      {/* Glow Border Overlay on Hover */}
      <div className="absolute inset-0 border border-sky-500/0 group-hover:border-sky-500/20 rounded-2xl transition-colors duration-300 pointer-events-none z-10"></div>

      {/* Cover picture */}
      <div className="relative h-[140px] w-full overflow-hidden bg-gradient-to-r from-slate-900 to-sky-950">
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={e => e.target.style.display = 'none'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
            <i className="bi bi-building text-3xl opacity-30"></i>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isPrivate ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
            {isPrivate ? 'Private' : 'Public'}
          </span>
          {type && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-capitalize">
              {type}
            </span>
          )}
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 flex flex-col flex-1 gap-3 relative z-10">
        <div>
          <h3 className="text-[14px] font-bold text-white tracking-tight leading-snug group-hover:text-sky-400 transition-colors duration-300 line-clamp-1">
            {name || 'Unnamed Club'}
          </h3>
          
          {/* Address */}
          <div className="text-white/40 text-[11px] mt-1.5 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500/10 group-hover:border-sky-500/25 transition-colors duration-300">
              <i className="bi bi-geo-alt text-[10px] text-sky-400"></i>
            </div>
            <span className="leading-snug line-clamp-1">{address}</span>
          </div>
        </div>

        {/* About */}
        {about && (
          <p className="text-white/50 text-[11px] leading-relaxed line-clamp-2">
            {about}
          </p>
        )}

        {/* Activities */}
        {activities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activities.slice(0, 3).map((a, i) => (
              <span key={i} className="text-[9px] font-semibold text-white/50 bg-white/[0.03] border border-white/[0.08] px-2 py-0.5 rounded-md hover:bg-sky-500/10 hover:border-sky-500/35 hover:text-sky-300 transition-all duration-200 cursor-default text-capitalize">
                {a.name || a}
              </span>
            ))}
            {activities.length > 3 && (
              <span className="text-[9px] font-semibold text-white/30 bg-white/[0.01] border border-white/[0.06] px-2 py-0.5 rounded-md cursor-default">
                +{activities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-white/50 text-[11px] min-w-0">
            <i className="bi bi-people-fill text-sky-400/80 flex-shrink-0"></i>
            <span className="truncate">
              <strong className="text-white/80 font-bold">{memberCount ?? 0}</strong> {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-white/40 text-[10px] flex-shrink-0">
            {viewCount > 0 && (
              <span className="flex items-center gap-1">
                <i className="bi bi-eye text-sky-400/50"></i>
                <span>{viewCount}</span>
              </span>
            )}
            {distanceKm && (
              <span className="flex items-center gap-1">
                <i className="bi bi-signpost text-sky-400/50"></i>
                <span>{distanceKm} km</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClubCard;