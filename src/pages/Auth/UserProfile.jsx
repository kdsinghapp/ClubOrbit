import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { useAuthContext } from "../../context/AuthContext";
import UserProfileCard from "../../components/UserProfileCard";

export default function UserProfile() {
  const { uid } = useParams();
  const { user: authUser } = useAuthContext();
  const targetUid = uid || authUser?.uid;
  const { profile, loading, error, updateProfile, refreshProfile } = useProfile(targetUid);
  const isOwnProfile = !uid || uid === authUser?.uid;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);

  // ─── data helpers ──────────────────────────────────────────────────────────
  const getUserDisplayName = () =>
    profile?.body?.result?.user?.displayName?.trim() ||
    authUser?.displayName ||
    authUser?.email?.split("@")[0] ||
    "User";

  const getUserMemberships = () => profile?.body?.result?.userEntity?.memberships || [];
  const getUserActivities = () => profile?.body?.result?.user?.activities || [];
  const getUserGender = () => profile?.body?.result?.user?.gender || "Not specified";
  const getUserBio = () => profile?.body?.result?.user?.bio || "No bio available";
  const isUserLoggedIn = () => authUser !== null;

  // ─── edit handlers ─────────────────────────────────────────────────────────
  const handleEditProfile = () => {
    setEditForm({
      displayName: profile?.body?.result?.user?.displayName || "",
      bio: profile?.body?.result?.user?.bio || "",
      firstName: profile?.body?.result?.user?.firstName || "",
      lastName: profile?.body?.result?.user?.lastName || "",
      gender: profile?.body?.result?.user?.gender || "",
    });
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Preserve existing activities when updating profile
      const existingActivities = getUserActivities();
      const updatedForm = { ...editForm, activities: existingActivities };
      await updateProfile(updatedForm, profileImageFile);
      setIsEditing(false);
      setProfileImageFile(null);
      alert("Profile updated successfully!");
      refreshProfile();
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
    setProfileImageFile(null);
  };

  // ─── shared input style ────────────────────────────────────────────────────
  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 transition-all placeholder-gray-500";
  const inputStyle = { background: "#0d1b2a" };
  const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

  // ─── Not logged in check ───────────────────────────────────────────────────
  if (!isUserLoggedIn()) {
    return (
      <div className="main-wrapper">
        {/* ── Header ── */}
        <header className="header header-sticky">
          <div className="container-fluid">
          </div>
        </header>

        {/* ── Not logged in message ── */}
        <section className="profile-section" style={{ background: "#0d1b2a", minHeight: "80vh" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="text-center py-5">
                  <i className="bi bi-person-lock text-orange-400" style={{ fontSize: "3rem" }}></i>
                  <h4 className="text-white mt-3">Please Login</h4>
                  <p className="text-gray-400">You need to be logged in to view your profile.</p>
                  <Link to="/login" className="btn btn-orange-500">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1b2a]">

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgb(12,19,38)] z-50">
          <img src="/assets/img/logo.png" alt="logo" className="w-24 animate-pulse" />
        </div>
      )}

      {/* Top Menu */}
      <div className="bg-[#0d1b2a] border-b border-gray-800 relative z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-2.5 text-gray-400">
            <Link to="/activity" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-activity text-lg mb-0.5"></i>
              <span className="text-xs">Activity</span>
            </Link>

            <Link to="/search" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-search text-lg mb-0.5"></i>
              <span className="text-xs">Search</span>
            </Link>

            <Link to="/places" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-geo-alt text-lg mb-0.5"></i>
              <span className="text-xs">Places</span>
            </Link>

            <Link to="/event" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-calendar-event text-lg mb-0.5"></i>
              <span className="text-xs">Events</span>
            </Link>

            <Link to="/user-profile" className="flex flex-col items-center text-white transition font-bold">
              <i className="bi bi-person text-lg mb-0.5 text-[#38bdf8]"></i>
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Profile Card */}
        <div>
          <UserProfileCard profile={profile} authUser={authUser} />
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a2332]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">

            {/* Section Header with Gradient Background */}
            <div className="bg-gradient-to-r from-[#38bdf8]/10 to-transparent p-8 border-b border-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[#38bdf8] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Account Settings</p>
                  <h4 className="text-white text-2xl font-black tracking-tight leading-none">Profile Information</h4>
                </div>

                {isOwnProfile && (!isEditing ? (
                  <button
                    onClick={handleEditProfile}
                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#0d1b2a] bg-[#38bdf8] hover:bg-[#0ea5e9] shadow-lg shadow-[#38bdf8]/20 transition-all hover:scale-105 active:scale-95"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#0d1b2a] bg-[#38bdf8] hover:bg-[#0ea5e9] shadow-lg shadow-[#38bdf8]/20 transition-all hover:scale-105 active:scale-95"
                    >
                      Save Changes
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <i className="bi bi-exclamation-octagon text-red-500"></i>
                  <p className="text-red-400 text-sm font-bold">{error}</p>
                </div>
              )}

              {/* Profile Content */}
              {!loading && !error && (
                <div className="animate-in fade-in duration-700">
                  {isEditing ? (
                    <div className="space-y-6">

                      {/* Full Name Group */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className={labelCls}>First Name</label>
                          <div className="relative group">
                            <i className="bi bi-person absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#38bdf8] transition-colors"></i>
                            <input
                              className={`${inputCls} pl-11 border border-white/5 bg-white/5 focus:bg-white/10 focus:border-[#38bdf8]/50`}
                              style={inputStyle}
                              value={editForm.firstName || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, firstName: e.target.value })
                              }
                              placeholder="First Name"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={labelCls}>Last Name</label>
                          <div className="relative group">
                            <i className="bi bi-person absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#38bdf8] transition-colors"></i>
                            <input
                              className={`${inputCls} pl-11 border border-white/5 bg-white/5 focus:bg-white/10 focus:border-[#38bdf8]/50`}
                              style={inputStyle}
                              value={editForm.lastName || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, lastName: e.target.value })
                              }
                              placeholder="Last Name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Display Name */}
                      <div className="space-y-2">
                        <label className={labelCls}>Display Name</label>
                        <div className="relative group">
                          <i className="bi bi-at absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#38bdf8] transition-colors"></i>
                          <input
                            className={`${inputCls} pl-11 border border-white/5 bg-white/5 focus:bg-white/10 focus:border-[#38bdf8]/50`}
                            style={inputStyle}
                            value={editForm.displayName || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, displayName: e.target.value })
                            }
                            placeholder="Public Display Name"
                          />
                        </div>
                      </div>

                      {/* Biography */}
                      <div className="space-y-2">
                        <label className={labelCls}>Bio</label>
                        <textarea
                          rows="4"
                          className={`${inputCls} border border-white/5 bg-white/5 focus:bg-white/10 focus:border-[#38bdf8]/50 resize-none`}
                          style={inputStyle}
                          value={editForm.bio || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, bio: e.target.value })
                          }
                          placeholder="Share a bit about yourself..."
                        />
                      </div>

                      {/* Gender & Image Picker */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className={labelCls}>Gender</label>
                          <select
                            className={`${inputCls} border border-white/5 bg-white/5 focus:bg-white/10 focus:border-[#38bdf8]/50`}
                            style={inputStyle}
                            value={editForm.gender || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, gender: e.target.value })
                            }
                          >
                            <option value="" className="bg-[#1a2332]">Select Gender</option>
                            <option value="male" className="bg-[#1a2332]">Male</option>
                            <option value="female" className="bg-[#1a2332]">Female</option>
                            <option value="other" className="bg-[#1a2332]">Other</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className={labelCls}>Profile Image</label>
                          <div className="relative">
                            <input
                              type="file"
                              onChange={handleImageChange}
                              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-[#38bdf8]/10 file:text-[#38bdf8] hover:file:bg-[#38bdf8]/20 transition-all cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 text-white">

                      {/* Info Rows */}
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Full Name</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 flex items-center justify-center border border-[#38bdf8]/20 text-[#38bdf8]">
                              <i className="bi bi-person-badge"></i>
                            </div>
                            <p className="text-lg font-bold">
                              {profile?.body?.result?.user?.firstName || "N/A"}{" "}
                              {profile?.body?.result?.user?.lastName || ""}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Display Name</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-500">
                              <i className="bi bi-at"></i>
                            </div>
                            <p className="text-lg font-bold">{getUserDisplayName()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Email Address</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-500">
                              <i className="bi bi-envelope"></i>
                            </div>
                            <p className="text-lg font-bold truncate max-w-full">{authUser?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Gender</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 text-pink-500">
                              <i className="bi bi-gender-ambiguous"></i>
                            </div>
                            <p className="text-lg font-bold capitalize">{getUserGender()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Bio Section Card */}
                      <div className="bg-[#0d1b2a]/50 rounded-[1.5rem] p-6 border border-white/5 relative group">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                          <i className="bi bi-chat-left-quote text-[#38bdf8]"></i> Biography
                        </p>
                        <p className="text-gray-300 leading-relaxed font-medium">
                          {getUserBio() || "No bio available."}
                        </p>
                      </div>

                      {/* Activities List */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <i className="bi bi-trophy text-[#38bdf8]"></i> Active Interests
                          </p>
                          {isOwnProfile && (
                            <Link
                              to="/add-activity"
                              className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8] hover:text-[#38bdf8]/80 hover:underline transition-all flex items-center gap-1.5"
                            >
                              <i className="bi bi-pencil-square"></i> Manage
                            </Link>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {getUserActivities().length ? (
                            getUserActivities().map((a, i) => (
                              <span
                                key={i}
                                className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#0d1b2a] transition-all cursor-default shadow-sm"
                              >
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm italic">No activities specified.</span>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}