import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { clubService } from "../services/clubService";
import { activityService } from "../services/activityService";

// ── Avatar helper ─────────────────────────────────────────────────────────────

function Avatar({ src, name, size = 40 }) {
  const [err, setErr] = useState(false);

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-xl object-cover shrink-0"
        style={{ width: size, height: size }}
        onError={() => setErr(true)}
      />
    );
  }

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-md"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #38bdf8, #1e3a5f)",
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const GroupDetail = () => {
  const { groupId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchPosts();
    }
  }, [groupId, user]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clubService.getClubById(groupId, user?.uid || "");
      setData(result);
    } catch (err) {
      setError("Failed to load group details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const result = await activityService.getPosts(groupId);
      setPosts(result);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Derived data
  const group = data?.clubEntity || data?.club || {};
  const club = data?.hostClub || {};
  const analytics = data?.analytics || {};
  const memberships = data?.memberships || data?.clubEntity?.memberships || [];

  const isAdmin = user && (group.adminUid === user.uid || club.adminUid === user.uid);
  const isMember = memberships.some((m) => m.uid === user?.uid) || isAdmin;

  const coverPic = club.coverPicUrl || club.profilePicUrl || null;
  const aboutText = group.about || club.about || "";
  const aboutShort = aboutText.length > 200 ? aboutText.slice(0, 200) + "..." : aboutText;

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleJoin = async () => {
    if (!user) return alert("Please login first.");
    try {
      setLoading(true);
      await clubService.joinClub(groupId, user.uid);
      await fetchGroup();
      triggerToast("Joined group successfully!");
    } catch (err) {
      alert("Failed to join group: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return alert("Please login first.");
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      setLoading(true);
      await clubService.leaveClub(groupId, user.uid);
      await fetchGroup();
      triggerToast("Left group successfully!");
    } catch (err) {
      alert("Failed to leave group: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    const parentClubUid = club.uid || "";
    const parentClubName = club.name || "";

    navigate(
      `/add-event` +
      `?groupId=${groupId}` +
      `&groupName=${encodeURIComponent(group.name || "")}` +
      `&clubId=${parentClubUid}` +
      `&clubName=${encodeURIComponent(parentClubName)}`
    );
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = group.name || "Club Orbit Group";
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Check out ${shareTitle} on Club Orbit!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      triggerToast("Link copied to clipboard!");
    }
  };

  const handlePostSubmit = async () => {
    if (!user) {
      alert("Please login to post.");
      return;
    }
    if (!postText.trim() && postImages.length === 0) return;

    try {
      setIsPosting(true);
      const postData = {
        uid: null,
        refUid: groupId,
        type: "clubPost",
        text: postText,
        userUid: user.uid,
        gallery: postImages.map((file, index) => ({
          uid: null,
          id: "general",
          index: index,
          context: "galleryImage"
        })),
        timestamp: new Date().toISOString(),
      };

      await activityService.addPost(postData, postImages);
      setPostText("");
      setPostImages([]);
      fetchPosts(); // Refresh feed
      // alert("Post created successfully!");
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setPostImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080d19] via-[#0b1224] to-[#0f1930] text-white relative">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#080d19] z-50">
          <img src="/assets/img/logo.png" alt="logo" className="w-20 animate-pulse" />
        </div>
      )}

      {/* Top Bar / Breadcrumb */}
      <div className="bg-[#0b101c] border-b border-white/[0.04] sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link to="/" className="text-white/45 hover:text-white transition shrink-0">
              <i className="bi bi-house-door text-base"></i>
            </Link>
            <i className="bi bi-chevron-right text-white/20 text-[10px]"></i>
            <Link to="/clubs" className="text-white/45 hover:text-white transition text-xs font-extrabold uppercase tracking-wider shrink-0">
              Clubs
            </Link>
            <i className="bi bi-chevron-right text-white/20 text-[10px]"></i>
            <span className="text-sky-400 text-xs font-black uppercase tracking-wider truncate">
              {group.name || "Group Detail"}
            </span>
          </div>

          <Link
            to="/clubs"
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider hover:text-white transition duration-200 active:scale-95"
          >
            <i className="bi bi-arrow-left"></i> <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error States */}
        {error && !loading && (
          <div className="flex items-center gap-3.5 bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl mb-8 animate-in fade-in duration-300">
            <i className="bi bi-exclamation-octagon-fill text-lg flex-shrink-0"></i>
            <span className="text-[13px] font-semibold leading-relaxed">{error}</span>
            <button className="ml-auto text-[11px] px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition duration-200" onClick={fetchGroup}>Retry</button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">

              {/* Hero Card */}
              <div className="bg-[#111c30] rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl relative">
                <div className="h-64 relative overflow-hidden group">
                  {coverPic ? (
                    <img
                      src={coverPic}
                      alt={group.name}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0b101c] to-[#131f35] flex items-center justify-center">
                      <i className="bi bi-people text-sky-500/20 text-8xl"></i>
                    </div>
                  )}
                  {/* Overlay Gradient (Clean dark fade instead of heavy color block) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                  {/* Badges */}
                  <div className="absolute bottom-6 left-8 right-8 z-10">
                    <div className="flex gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${group.isPrivate ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        {group.isPrivate ? 'Private' : 'Public'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-sky-500/10 border border-sky-500/20 text-sky-400">
                        Group
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none">{group.name}</h1>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 border-t border-white/[0.06]">
                  <div className="p-5 text-center border-r border-white/[0.04]">
                    <div className="text-xl font-black text-white">{analytics.memberCount ?? memberships.length}</div>
                    <div className="text-[9px] font-black text-white/35 uppercase tracking-wider mt-1">Members</div>
                  </div>
                  <div className="p-5 text-center border-r border-white/[0.04]">
                    <div className="text-xl font-black text-white">{analytics.pastEventCount ?? 0}</div>
                    <div className="text-[9px] font-black text-white/35 uppercase tracking-wider mt-1">Past Events</div>
                  </div>
                  <div className="p-5 text-center">
                    <div className="text-xl font-black text-sky-400">{analytics.futureEventCount ?? 0}</div>
                    <div className="text-[9px] font-black text-white/35 uppercase tracking-wider mt-1">Upcoming</div>
                  </div>
                </div>

                {/* Action Grid */}
                {!isMember ? (
                  <div className="p-4 bg-[#0b101c]/30 border-t border-white/[0.04]">
                    <button
                      onClick={handleJoin}
                      className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-500/10 hover:from-sky-400 hover:to-blue-500 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="bi bi-person-plus-fill text-sm"></i> Join Group
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-[#0b101c]/20 border-t border-white/[0.04] grid grid-cols-4 gap-2">
                    <button onClick={handleAddEvent} className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/[0.02] transition group/act duration-200">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-1.5 group-hover/act:bg-sky-500 group-hover/act:text-[#0b101c] group-hover/act:shadow-lg group-hover/act:shadow-sky-500/20 transition-all duration-300">
                        <i className="bi bi-calendar-plus text-lg text-sky-400 group-hover/act:text-white"></i>
                      </div>
                      <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-white transition">Add Event</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/[0.02] transition group/act duration-200">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-1.5 group-hover/act:bg-purple-500 group-hover/act:text-[#0b101c] group-hover/act:shadow-lg group-hover/act:shadow-purple-500/20 transition-all duration-300">
                        <i className="bi bi-chat-fill text-lg text-purple-400 group-hover/act:text-white"></i>
                      </div>
                      <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-white transition">Chat</span>
                    </button>

                    <button onClick={handleShare} className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/[0.02] transition group/act duration-200">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-1.5 group-hover/act:bg-emerald-500 group-hover/act:text-[#0b101c] group-hover/act:shadow-lg group-hover/act:shadow-emerald-500/20 transition-all duration-300">
                        <i className="bi bi-share-fill text-lg text-emerald-400 group-hover/act:text-white"></i>
                      </div>
                      <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-white transition">Share</span>
                    </button>

                    <button onClick={() => setShowMoreModal(true)} className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/[0.02] transition group/act duration-200">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-1.5 group-hover/act:bg-white group-hover/act:text-[#0b101c] group-hover/act:shadow-lg group-hover/act:shadow-white/10 transition-all duration-300">
                        <i className="bi bi-three-dots text-lg text-white/60 group-hover/act:text-white"></i>
                      </div>
                      <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-white transition">More</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Post Something / Membership Security Panel */}
              {!isMember ? (
                <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl text-center relative overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <i className="bi bi-shield-lock-fill text-amber-500 text-2xl"></i>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Wall Postings Locked</h3>
                  <p className="text-[10px] text-white/40 max-w-xs mx-auto mb-6 leading-relaxed font-bold uppercase tracking-wider">
                    You must join this group to post updates, ask questions, or share photos on the wall.
                  </p>
                  <button
                    onClick={handleJoin}
                    className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-wider shadow-lg shadow-sky-500/10 hover:from-sky-400 hover:to-blue-500 hover:scale-105 transition-all"
                  >
                    Join Group to Participate
                  </button>
                </div>
              ) : (
                /* Post Something */
                <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar src={user?.profilePicUrl} name={user?.displayName} size={44} />
                    <div className="flex-1">
                      <h2 className="text-sm font-black text-white uppercase tracking-wider">Share with the group</h2>
                      <p className="text-[10px] text-white/35 font-bold uppercase mt-0.5 tracking-wider">Updates, photos, or questions</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 transition min-h-[120px] shadow-inner text-sm leading-relaxed"
                      placeholder="What's happening in the group?"
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      disabled={isPosting}
                    ></textarea>

                    {postImages.length > 0 && (
                      <div className="flex flex-wrap gap-3 py-2">
                        {postImages.map((file, idx) => (
                          <div key={idx} className="relative group/img shadow-2xl">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Selected"
                              className="w-20 h-20 object-cover rounded-xl border border-white/[0.06]"
                            />
                            <button
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-lg opacity-90 hover:opacity-100 transition"
                              onClick={() => setPostImages(postImages.filter((_, i) => i !== idx))}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b101c] border border-white/[0.04] text-white/60 hover:text-white hover:border-white/10 transition duration-300"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPosting}
                      >
                        <i className="bi bi-camera-fill text-purple-400"></i>
                        <span className="text-[10px] font-black uppercase tracking-wider">Add Media</span>
                      </button>
                      <input
                        type="file" multiple accept="image/*" className="hidden"
                        ref={fileInputRef} onChange={handleImageChange}
                      />

                      <button
                        onClick={handlePostSubmit}
                        disabled={isPosting || (!postText.trim() && postImages.length === 0)}
                        className="px-8 py-2.5 bg-sky-500 text-[#0b101c] rounded-xl font-black uppercase text-[10px] tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                      >
                        {isPosting ? (
                          <div className="w-4 h-4 border-2 border-[#0b101c] border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                          "Post Now"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Feed */}
              <div className="space-y-6">
                {loadingPosts && (
                  <div className="flex flex-col items-center py-12 gap-3 opacity-50">
                    <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Updating Feed...</p>
                  </div>
                )}

                {!loadingPosts && posts.length === 0 && (
                  <div className="text-center py-12 bg-[#111c30]/50 rounded-3xl border border-white/[0.04]">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <i className="bi bi-chat-dots text-white/20 text-2xl"></i>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">No posts yet. Start the conversation!</p>
                  </div>
                )}

                {!loadingPosts && posts.map((post) => (
                  <div key={post.uid} className="bg-[#111c30] rounded-2xl p-6 border border-white/[0.06] shadow-xl group/post relative overflow-hidden transition-all hover:border-white/10 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={post.user?.profilePicUrl} name={post.user?.displayName} size={40} />
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">{post.user?.displayName}</h4>
                          <p className="text-[9px] text-white/35 font-bold uppercase tracking-widest">{new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <button className="text-white/30 hover:text-white transition-colors duration-200">
                        <i className="bi bi-three-dots"></i>
                      </button>
                    </div>

                    {post.text && (
                      <p className="text-sm text-white/80 leading-relaxed mb-4 whitespace-pre-wrap font-medium">{post.text}</p>
                    )}

                    {post.galleryCollageUrl && (
                      <div className="rounded-xl overflow-hidden mb-4 border border-white/[0.06] shadow-inner">
                        <img src={post.galleryCollageUrl} alt="Post media" className="w-full h-auto object-cover max-h-[400px]" />
                      </div>
                    )}

                    <div className="flex items-center gap-6 pt-4 border-t border-white/[0.04]">
                      <button className="flex items-center gap-2 text-[11px] font-black text-white/35 hover:text-red-400 uppercase tracking-widest transition-colors duration-200">
                        <i className="bi bi-heart"></i> {post.countLikes || 0}
                      </button>
                      <button className="flex items-center gap-2 text-[11px] font-black text-white/35 hover:text-purple-400 uppercase tracking-widest transition-colors duration-200">
                        <i className="bi bi-chat-right"></i> {post.countComments || 0}
                      </button>
                      <div className="ml-auto flex items-center gap-2 text-[11px] font-black text-white/20 uppercase tracking-widest">
                        <i className="bi bi-eye"></i> {post.countViews || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">

              {/* About Section */}
              <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <i className="bi bi-info-circle text-amber-500 text-sm"></i>
                  </div>
                  <h2 className="text-xs font-black text-white uppercase tracking-wider">About Group</h2>
                </div>

                {aboutText ? (
                  <div className="space-y-4">
                    <p className={`text-xs text-white/60 leading-relaxed ${!showFullAbout && 'line-clamp-6'}`}>
                      {aboutText}
                    </p>
                    {aboutText.length > 200 && (
                      <button
                        className="text-[10px] font-black text-amber-500 uppercase tracking-wider hover:underline transition"
                        onClick={() => setShowFullAbout((v) => !v)}
                      >
                        {showFullAbout ? "Show Less" : "Read Full Story"}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-white/30 italic">No description provided for this group.</p>
                )}
              </div>

              {/* Location Card */}
              <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <i className="bi bi-geo-alt text-sky-400 text-sm"></i>
                  </div>
                  <h2 className="text-xs font-black text-white uppercase tracking-wider">Location</h2>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-white/80 font-bold leading-relaxed uppercase tracking-wider">
                      {group.formattedAddress || club.formattedAddress || "Global Presence"}
                    </p>
                    <button className="mt-4 flex items-center gap-2 text-[10px] font-black text-sky-400 uppercase tracking-wider hover:underline transition">
                      <i className="bi bi-map"></i> View on Map
                    </button>
                  </div>
                </div>
              </div>

              {/* Host Club Card */}
              {club.name && (
                <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <i className="bi bi-building text-purple-400 text-sm"></i>
                    </div>
                    <h2 className="text-xs font-black text-white uppercase tracking-wider">Host Club</h2>
                  </div>

                  <Link to={`/clubs/${club.uid}`} className="flex items-center gap-4 group/club">
                    <Avatar src={club.profilePicUrl} name={club.name} size={50} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white group-hover/club:text-sky-400 transition-colors truncate uppercase tracking-wider">{club.name}</h4>
                      <p className="text-[10px] text-white/35 font-bold uppercase tracking-wider truncate mt-0.5">{club.formattedAddress || "Club HQ"}</p>
                    </div>
                    <i className="bi bi-chevron-right text-white/25 group-hover/club:text-sky-400 transition-all duration-200 group-hover/club:translate-x-0.5"></i>
                  </Link>
                </div>
              )}

              {/* Admins Card */}
              <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <i className="bi bi-shield-check text-sky-400 text-sm"></i>
                  </div>
                  <h2 className="text-xs font-black text-white uppercase tracking-wider">Group Admins</h2>
                </div>

                <div className="space-y-4">
                  {memberships
                    .filter((m) => m.uid === group.adminUid || m.uid === club.adminUid)
                    .map((admin) => (
                      <Link key={admin.uid} to={`/user-profile/${admin.uid}`} className="flex items-center gap-4 group/admin">
                        <Avatar src={admin.profilePicUrl} name={admin.displayName} size={44} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-white group-hover/admin:text-sky-400 transition truncate uppercase tracking-wider">{admin.displayName}</h4>
                          <p className="text-[9px] text-sky-400 font-black uppercase tracking-wider mt-0.5">Administrator</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Members Grid Card */}
              <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                      <i className="bi bi-people-fill text-sky-400 text-sm"></i>
                    </div>
                    <h2 className="text-xs font-black text-white uppercase tracking-wider">Group Members</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-[9px] font-black uppercase tracking-wider border border-sky-500/20">
                    {memberships.length} Active
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {memberships.map((member) => (
                    <Link
                      key={member.uid}
                      to={`/user-profile/${member.uid}`}
                      className="group/mem relative cursor-pointer"
                      title={member.displayName}
                    >
                      <div className="rounded-xl overflow-hidden ring-2 ring-white/[0.04] group-hover/mem:ring-sky-500 transition-all duration-200">
                        <Avatar src={member.profilePicUrl} name={member.displayName} size={42} />
                      </div>
                    </Link>
                  ))}
                  {memberships.length === 0 && (
                    <p className="text-xs text-white/30 italic uppercase tracking-wider">No members in this group yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      {!loading && !error && data && isMember && (
        <button
          onClick={handleAddEvent}
          className="lg:hidden fixed bottom-8 right-8 w-14 h-14 rounded-full bg-sky-500 text-[#0b101c] flex items-center justify-center shadow-[0_15px_30px_rgba(56,189,248,0.3)] z-50 hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <i className="bi bi-calendar-plus text-xl"></i>
        </button>
      )}

      {/* More Options Modal */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in" onClick={() => setShowMoreModal(false)}>
          <div className="bg-[#111c30] w-full max-w-sm rounded-3xl border border-white/[0.06] p-8 shadow-2xl relative animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowMoreModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition duration-200"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <div className="text-left mb-6">
              <p className="text-sky-400 text-[9px] font-black uppercase tracking-wider mb-1">Group Options</p>
              <h4 className="text-white text-base font-black uppercase tracking-wider">More Actions</h4>
            </div>

            <div className="space-y-4">
              {isAdmin && (
                <Link
                  to={`/groups/${groupId}/edit`}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0b101c]/40 border border-white/[0.04] hover:border-sky-500/20 text-left transition-all duration-300 group/btn shadow-lg"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
                      <i className="bi bi-pencil-square text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">Edit Settings</p>
                      <p className="text-[9px] text-white/35 font-bold uppercase tracking-wider mt-0.5">Manage details & rules</p>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-white/20 group-hover/btn:text-sky-400 group-hover/btn:translate-x-0.5 transition-all text-xs"></i>
                </Link>
              )}

              <button
                onClick={() => {
                  setShowMoreModal(false);
                  setShowQRModal(true);
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0b101c]/40 border border-white/[0.04] hover:border-sky-500/20 text-left transition-all duration-300 group/btn shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
                    <i className="bi bi-qr-code text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">Group QR Code</p>
                    <p className="text-[9px] text-white/35 font-bold uppercase tracking-wider mt-0.5">Scan & share connection</p>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-white/20 group-hover/btn:text-sky-400 group-hover/btn:translate-x-0.5 transition-all text-xs"></i>
              </button>

              <button
                onClick={() => {
                  setShowMoreModal(false);
                  triggerToast("PDF export will be available soon.");
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0b101c]/40 border border-white/[0.04] hover:border-sky-500/20 text-left transition-all duration-300 group/btn shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
                    <i className="bi bi-file-pdf text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">Export as PDF</p>
                    <p className="text-[9px] text-white/35 font-bold uppercase tracking-wider mt-0.5">Download group sheet</p>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-white/20 group-hover/btn:text-sky-400 group-hover/btn:translate-x-0.5 transition-all text-xs"></i>
              </button>

              <button
                onClick={() => {
                  setShowMoreModal(false);
                  handleLeave();
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0b101c]/40 border border-white/[0.04] hover:border-red-500/20 text-left transition-all duration-300 group/btn shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                    <i className="bi bi-box-arrow-right text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs font-black text-red-400 uppercase tracking-wider">Leave Group</p>
                    <p className="text-[9px] text-red-400/50 font-bold uppercase tracking-wider mt-0.5">Exit this community</p>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-white/20 group-hover/btn:text-red-400 group-hover/btn:translate-x-0.5 transition-all text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in" onClick={() => setShowQRModal(false)}>
          <div className="bg-[#111c30] w-full max-w-sm rounded-3xl border border-white/[0.06] p-8 shadow-2xl relative text-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition duration-200"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <p className="text-sky-400 text-[9px] font-black uppercase tracking-wider mb-1">SCAN AND CONNECT</p>
            <h4 className="text-white text-base font-black uppercase tracking-wider mb-6">Group QR Code</h4>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6 border border-white/10">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                alt="Group QR Code"
                className="w-[180px] h-[180px] rounded-lg"
              />
            </div>

            <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">{group.name}</p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Share this code with others to invite them to this group</p>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#111c30] border border-sky-500/25 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest text-sky-400 shadow-2xl animate-bounce shadow-sky-500/10">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default GroupDetail;