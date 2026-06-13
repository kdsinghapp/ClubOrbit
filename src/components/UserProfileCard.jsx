import React from "react";
import { Link } from "react-router-dom";

const UserProfileCard = ({
  profile,
  loading,
  error,
  authUser,
  showDetails = true,
  className = "",
}) => {
  const getUserDisplayName = () => {
    if (profile?.body?.result?.user?.displayName) {
      return profile.body.result.user.displayName.trim();
    }
    if (authUser?.displayName) return authUser.displayName;
    if (authUser?.email) return authUser.email.split("@")[0];
    return "User";
  };

  const getUserProfilePic = () => {
    const u = profile?.body?.result?.user;
    const ue = profile?.body?.result?.userEntity;

    // API possible paths — sabse common pehle
    return (
      u?.profilePicUrl ||                    // direct string URL
      u?.profilePic?.url ||                  // object with url key
      u?.profilePic?.thumbnailURL ||         // object with thumbnailURL
      u?.profilePic?.fullURL ||              // object with fullURL
      (typeof u?.profilePic === "string" ? u?.profilePic : null) || // profilePic as plain string
      ue?.profilePicUrl ||                   // userEntity level
      authUser?.photoURL ||                  // Firebase Google photo
      "/assets/img/profiles/avatar-05.jpg"  // fallback
    );
  };

  const getUserMemberships = () => {
    return profile?.body?.result?.userEntity?.memberships || [];
  };

  const getUserActivities = () => {
    return profile?.body?.result?.user?.activities || [];
  };

  if (!authUser) return null;

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-body d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-3" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card border-danger ${className}`}>
        <div className="card-body text-danger">
          <i className="fa fa-exclamation-triangle me-2"></i>
          Error loading profile: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a2332]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden ${className}`}>
      {/* Profile Header Section */}
      <div className="relative h-24 bg-gradient-to-br from-[#38bdf8]/20 to-cyan-500/10">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332] to-transparent"></div>
      </div>

      <div className="px-6 pb-8 -mt-12 relative">
        {/* Avatar Container */}
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#38bdf8] to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-2 border-[#1a2332] shadow-2xl">
              <img
                src={getUserProfilePic()}
                alt={getUserDisplayName()}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = "/assets/img/profiles/avatar-05.jpg";
                }}
              />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          <h5 className="text-xl font-black text-white tracking-tight mb-1">{getUserDisplayName()}</h5>
          <p className="text-gray-500 text-xs font-medium truncate">{authUser?.email}</p>
        </div>

        {showDetails && (
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0d1b2a]/50 border border-white/5 rounded-2xl p-3 text-center">
                <div className="text-[#38bdf8] font-black text-lg leading-none mb-1">
                  {getUserMemberships().length}
                </div>
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Clubs</div>
              </div>
              <div className="bg-[#0d1b2a]/50 border border-white/5 rounded-2xl p-3 text-center">
                <div className="text-cyan-500 font-black text-lg leading-none mb-1">
                  {getUserActivities().length}
                </div>
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Activities</div>
              </div>
            </div>

            {/* Activities Tags */}
            {getUserActivities().length > 0 && (
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <i className="bi bi-star-fill text-[#38bdf8]"></i> Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {getUserActivities().slice(0, 4).map((activity, index) => (
                    <span key={index} className="px-3 py-1.5 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[9px] font-black uppercase tracking-widest text-[#38bdf8]">
                      {activity.name || activity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Club Memberships Section */}
            {getUserMemberships().length > 0 && (
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="bi bi-shield-check text-cyan-500"></i> Recent Clubs
                </p>
                <div className="space-y-3">
                  {getUserMemberships()
                    .slice(0, 3)
                    .map((membership, index) => {
                      const isGroup = membership.club?.clubType === "group";
                      const clubId = membership.club?.uid || membership.clubUid;
                      const targetRoute = isGroup ? `/groups/${clubId}` : `/clubs/${clubId}`;

                      return (
                        <Link
                          key={index}
                          to={targetRoute}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group/club cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                            <img
                              src={membership.club?.profilePicUrl || "/assets/img/club-placeholder.png"}
                              alt={membership.club?.name || "Club"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate group-hover/club:text-[#38bdf8] transition-colors">
                              {membership.club?.name || "Unknown Club"}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest">
                              {membership.club?.shortAddress || "Location"}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Footer Date */}
            <div className="pt-4 text-center">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                Member Since {new Date().getFullYear()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;