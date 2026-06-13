import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { eventService } from "../../services/eventService";
import { activityService } from "../../services/activityService";

// ── Avatar helper ─────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 40 }) {
  const [err, setErr] = useState(false);

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-xl shrink-0"
        style={{
          width: size,
          height: size,
          objectFit: "cover",
          aspectRatio: "1/1"
        }}
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
      className="rounded-xl flex items-center justify-center font-black text-white shrink-0"
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

// ── Icons ─────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTimeRange(start, end) {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateStr = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateStr}, ${startTime} - ${endTime}`;
}

function getFrequencyLabel(schedule) {
  if (!schedule?.isRecurring) return "One-time event";
  const { frequencyType, occurFrequency, eventWeekdays } = schedule;
  const day = eventWeekdays?.[0] || "";
  if (frequencyType === "WEEKS" && occurFrequency === 1) {
    return `Occurs every week ${day ? `on ${day}` : ""}`;
  }
  return `Occurs every ${occurFrequency} ${frequencyType?.toLowerCase()}`;
}

// ── Event Date Card ───────────────────────────────────────────────────────────
function EventDateCard({ eventDate, onClick, onEditClick, showEditIcon = false, isActive = false }) {
  const isCancelled = eventDate.status === "cancelled";

  return (
    <div
      className={`flex items-center justify-between p-4 bg-[#111c30] border rounded-2xl transition duration-300 cursor-pointer group ${
        isActive
          ? "border-sky-500 shadow-lg shadow-sky-500/5"
          : isCancelled
            ? "border-red-900/30 opacity-60 hover:opacity-80 hover:border-red-500/30"
            : "border-white/[0.06] hover:border-white/10"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          isActive
            ? "bg-sky-500/20 text-sky-400"
            : isCancelled
              ? "bg-red-500/10 text-red-400"
              : "bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20"
        }`}>
          <i className={isCancelled ? "bi bi-calendar-x" : "bi bi-clock-history"}></i>
        </div>
        <span className={`text-xs font-bold transition-colors ${
          isActive
            ? "text-sky-400"
            : isCancelled
              ? "text-red-400/80 line-through"
              : "text-white/60 group-hover:text-white"
        }`}>
          {formatTimeRange(eventDate.startDateTime, eventDate.endDateTime)}
          {isCancelled && (
            <span className="ml-2 text-[9px] font-black uppercase tracking-widest no-underline bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 text-red-400">
              Cancelled
            </span>
          )}
        </span>
      </div>
      {showEditIcon && onEditClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditClick();
          }}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-sky-400 transition-colors"
          title="Edit Date"
        >
          <EditIcon />
        </button>
      )}
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post }) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) {
      return;
    }
    navigate(`/post/${post.uid}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-[#111c30] border border-white/[0.06] rounded-2xl p-5 mb-4 shadow-xl cursor-pointer hover:border-white/10 transition-colors group"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={post.user?.profilePicUrl} name={post.user?.displayName} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white leading-tight uppercase tracking-wider">{post.user?.displayName}</span>
            <span className="text-[8px] font-extrabold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">Event Post</span>
          </div>
          <span className="text-[9px] text-white/35 font-extrabold uppercase tracking-wider mt-1 block">
            {new Date(post.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Image */}
      {post.galleryCollageUrl && (
        <div className="rounded-xl overflow-hidden mb-4 border border-white/[0.06]">
          <img
            src={post.galleryCollageUrl}
            alt="Post"
            className="w-full h-auto max-h-[400px] object-cover block group-hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      )}

      {/* Text */}
      <p className="text-sm text-white/85 leading-relaxed font-semibold mb-4">{post.text}</p>

      {/* Engagement */}
      <div className="flex items-center gap-5 pt-4 border-t border-white/[0.04]">
        <span className="flex items-center gap-2 text-[10px] font-extrabold text-white/45 uppercase tracking-wider hover:text-sky-400 transition-colors cursor-pointer">
          <HeartIcon filled={false} /> {post.countLikes || 0}
        </span>
        <span className="flex items-center gap-2 text-[10px] font-extrabold text-white/45 uppercase tracking-wider hover:text-amber-500 transition-colors cursor-pointer">
          <ChatIcon /> {post.countComments || 0}
        </span>
        <span className="flex items-center gap-2 text-[10px] font-extrabold text-white/45 uppercase tracking-wider ml-auto">
          <i className="bi bi-eye text-sm"></i> {post.countViews || 0}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const EventSeries = () => {
  const { eventSeriesId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventDateUid = searchParams.get("eventDateUid");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [editingOccurrence, setEditingOccurrence] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [postText, setPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postImages, setPostImages] = useState([]);
  const fileInputRef = useRef(null);

  const [showQRModal, setShowQRModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [adminEventStatus, setAdminEventStatus] = useState("");
  const [adminPostingsClosed, setAdminPostingsClosed] = useState(false);

  const formatForInput = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const pad = (num) => String(num).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleEditClick = (occurrence) => {
    setEditingOccurrence(occurrence);
    setEditStart(formatForInput(occurrence.startDateTime));
    setEditEnd(formatForInput(occurrence.endDateTime));
    setEditStatus(occurrence.status || "active");
  };

  const handleSaveOccurrence = async () => {
    if (!editingOccurrence) return;
    try {
      setLoading(true);
      const startIso = new Date(editStart).toISOString();
      const endIso = new Date(editEnd).toISOString();

      const result = await eventService.updateEventDate({
        uid: editingOccurrence.uid,
        eventSeriesUid: eventSeriesId,
        status: editStatus,
        startDateTime: startIso,
        endDateTime: endIso,
      });

      // Update state directly using the returned EventSeriesDTO to refresh the timeline instantly
      if (result) {
        setData(result);
        setLikeCount(result?.eventSeriesEntity?.countLikes || 0);
      } else {
        await fetchEventSeries();
      }
      setEditingOccurrence(null);
    } catch (err) {
      alert("Failed to update occurrence date: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventSeriesId) fetchEventSeries();
  }, [eventSeriesId, user, eventDateUid]);

  const fetchEventSeries = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await eventService.getEventSeriesByUid(eventSeriesId, user?.uid || "", eventDateUid);
      setData(result);
      setLikeCount(result?.eventSeriesEntity?.countLikes || 0);
      setIsLiked(result?.eventSeriesEntity?.likes?.some(l => l === user?.uid || l.uid === user?.uid || l.userUid === user?.uid) || false);
    } catch (err) {
      setError("Failed to load event series details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (uid) => {
    navigate(`/event-series/${eventSeriesId}?eventDateUid=${uid}`);
  };

  const handleClearDate = () => {
    navigate(`/event-series/${eventSeriesId}`);
  };

  const getMostRecentPost = () => {
    const allPosts = [];
    if (data?.nextEventDate?.posts) {
      allPosts.push(...data.nextEventDate.posts);
    }
    data?.previousEventDates?.forEach(ed => {
      if (ed.posts) {
        allPosts.push(...ed.posts);
      }
    });
    data?.futureEventDates?.forEach(ed => {
      if (ed.posts) {
        allPosts.push(...ed.posts);
      }
    });
    if (allPosts.length === 0) return null;
    allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return allPosts[0];
  };

  // Derived data
  const eventSeries = data?.eventSeries || {};
  const eventSeriesEntity = data?.eventSeriesEntity || {};
  const adminProfile = data?.adminProfile || {};
  const club = eventSeriesEntity?.club || {};
  const hostClub = club?.hostClub || {};
  const registrations = eventSeriesEntity?.registrations || [];
  const futureEventDates = data?.futureEventDates || [];
  const previousEventDates = data?.previousEventDates || [];
  const nextEventDate = data?.nextEventDate || null;
  const goingCount = data?.goingCount || 0;
  const isAdmin = user?.uid === eventSeries?.adminUid;
  const eventBanner = eventSeriesEntity.eventPicFullUrl || eventSeries.eventPic?.fullSizeURL || eventSeries.eventPic?.scrollSizeURL || null;

  const isSingleDate = useMemo(() => {
    if (!data) return false;
    const schedule = data.eventSeries?.eventSchedule;
    if (schedule && !schedule.isRecurring) return true;

    const futureCount = data.futureEventDates?.length || 0;
    const prevCount = data.previousEventDates?.length || 0;
    const hasNext = !!data.nextEventDate;
    const totalOccurrences = futureCount + prevCount + (hasNext ? 1 : 0);
    return totalOccurrences <= 1;
  }, [data]);

  const handleLike = async () => {
    if (!user) return alert("Login first");
    try {
      if (isLiked) {
        await eventService.addEventLike({ postUid: eventSeriesId, userUid: user.uid, like: false });
        setLikeCount((p) => Math.max(0, p - 1));
      } else {
        await eventService.addEventLike({ postUid: eventSeriesId, userUid: user.uid, like: true });
        setLikeCount((p) => p + 1);
      }
      setIsLiked(!isLiked);
    } catch (e) {
      console.error("Failed to toggle event favorite:", e);
    }
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = eventSeries.title || "Club Orbit Event";
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
      triggerToast("Event link copied to clipboard!");
    }
  };

  const handlePrintPDF = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${eventSeries.title || "Event Ticket"} - Club Orbit</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #fafafa;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              color: #333;
            }
            .ticket {
              width: 600px;
              border: 2px solid #ddd;
              border-radius: 16px;
              background: #fff;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #0d1b2a, #1e3a5f);
              color: #fff;
              padding: 24px;
              text-align: center;
              border-bottom: 3px dashed #ddd;
            }
            .header h1 {
              margin: 0;
              font-size: 20px;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .header p {
              margin: 4px 0 0;
              font-size: 11px;
              color: #38bdf8;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .content {
              padding: 24px;
              display: flex;
              gap: 20px;
            }
            .details {
              flex: 1;
            }
            .details h2 {
              margin: 0 0 16px;
              font-size: 22px;
              color: #111;
              text-transform: uppercase;
            }
            .field {
              margin-bottom: 12px;
            }
            .label {
              font-size: 9px;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .value {
              font-size: 13px;
              color: #222;
              font-weight: 600;
              margin-top: 2px;
            }
            .qr-stub {
              width: 150px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border-left: 2px dashed #eee;
              padding-left: 20px;
            }
            .qr-stub img {
              width: 120px;
              height: 120px;
            }
            .footer {
              background: #f9f9f9;
              padding: 12px;
              text-align: center;
              font-size: 10px;
              color: #999;
              border-top: 1px solid #eee;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>Club Orbit Access Ticket</h1>
              <p>Verified Attendee RSVP</p>
            </div>
            <div class="content">
              <div class="details">
                <h2>${eventSeries.title || "Event Title"}</h2>
                
                <div class="field">
                  <div class="label">Date & Time</div>
                  <div class="value">${nextEventDate ? formatTimeRange(nextEventDate.startDateTime, nextEventDate.endDateTime) : "N/A"}</div>
                </div>
                
                <div class="field">
                  <div class="label">Venue & Location</div>
                  <div class="value">${club.formattedAddress || hostClub?.formattedAddress || "No address available"}</div>
                </div>

                <div class="field">
                  <div class="label">Organized By</div>
                  <div class="value">${adminProfile.displayName || "Local Club Organizer"}</div>
                </div>
              </div>
              <div class="qr-stub">
                <img src="${qrUrl}" alt="QR Code" />
                <div class="label" style="margin-top: 8px;">Scan to Verify</div>
              </div>
            </div>
            <div class="footer">
              Thank you for being a part of Club Orbit
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const openAdminControls = () => {
    setAdminEventStatus(eventSeries.eventStatus || "activeOpenRegistration");
    setAdminPostingsClosed(eventSeries.postingsClosed || false);
    setShowAdminModal(true);
  };

  const handleRegister = async (status) => {
    if (!user) return alert("Please login first.");
    try {
      setLoading(true);
      await eventService.updateEventRegistration(eventSeriesId, user.uid, status);
      await fetchEventSeries();
      triggerToast(status === "going" ? "Registered successfully!" : "Opted out successfully!");
    } catch (err) {
      alert("Failed to update registration: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdminControls = async (newStatus, newPostingsClosed) => {
    try {
      setLoading(true);
      const request = {
        eventSeriesUid: eventSeriesId,
        eventStatus: newStatus,
        postingsClosed: newPostingsClosed,
      };
      await eventService.setEventStatus(request);
      setShowAdminModal(false);
      await fetchEventSeries();
      triggerToast("Event controls updated successfully!");
    } catch (err) {
      alert("Failed to save event controls: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!user) {
      alert("Please login to post.");
      return;
    }
    if (!postText.trim() && postImages.length === 0) return;
    if (!nextEventDate?.uid) return;

    try {
      setIsPosting(true);
      const postData = {
        uid: null,
        refUid: nextEventDate.uid,
        type: "eventDatePost",
        text: postText.trim(),
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
      await fetchEventSeries();
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post: " + (err.message || err));
    } finally {
      setIsPosting(false);
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

      {/* Back to Event Series (only shown when viewing a single occurrence) */}
      {eventDateUid && (
        <div className="bg-[#0b101c] border-b border-white/[0.04]">
          <div className="max-w-4xl mx-auto px-4 h-12 flex items-center">
            <button
              onClick={handleClearDate}
              className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-sky-400 hover:text-white transition-all duration-200 active:scale-95"
            >
              <i className="bi bi-arrow-left text-sm"></i> Back to Event Series
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">

        {/* Status Messages */}
        {error && !loading && (
          <div className="flex items-center gap-3.5 bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl mb-8 animate-in fade-in duration-300">
            <i className="bi bi-exclamation-octagon-fill text-lg flex-shrink-0"></i>
            <span className="text-[13px] font-semibold leading-relaxed">{error}</span>
            <button className="ml-auto text-[11px] px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition duration-200" onClick={fetchEventSeries}>Retry</button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">

              {/* Hero Card */}
              <div className="bg-[#111c30] rounded-3xl border border-white/[0.06] shadow-2xl overflow-hidden relative group">
                <div className="relative h-[240px] bg-gradient-to-br from-[#0b101c] to-[#131f35]">
                  {eventBanner ? (
                    <img src={eventBanner} alt={eventSeries.title} className="w-full h-full object-cover opacity-90 transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/5">
                      <i className="bi bi-calendar-event text-[120px]"></i>
                    </div>
                  )}
                  {/* Bottom fade for overlay contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-6 left-8 right-8 z-10">
                    <span className="px-3 py-1 rounded-full bg-slate-950/80 text-sky-400 border border-sky-500/20 text-[9px] font-extrabold uppercase tracking-wider">
                      Event Series
                    </span>
                    <h1 className="text-2xl font-black text-white tracking-tight leading-none uppercase mt-3">{eventSeries.title}</h1>
                  </div>
                </div>
              </div>

              {/* Action Widgets */}
              <div className="flex items-center justify-around py-4.5 bg-[#0b101c]/20 border-y border-white/[0.06] relative z-20">
                <button className="flex flex-col items-center gap-1.5 group/act transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover/act:bg-sky-500 group-hover/act:border-sky-500 group-hover/act:shadow-lg group-hover/act:shadow-sky-500/20 transition-all duration-200">
                    <i className="bi bi-chat-fill text-sky-400 text-base group-hover/act:text-white transition-colors duration-200"></i>
                  </div>
                  <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-sky-400 transition-colors duration-200">Chat</span>
                </button>

                <button className="flex flex-col items-center gap-1.5 group/act transition-all duration-200" onClick={() => setShowPDFModal(true)}>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover/act:bg-amber-500 group-hover/act:border-amber-500 group-hover/act:shadow-lg group-hover/act:shadow-amber-500/20 transition-all duration-200">
                    <i className="bi bi-file-pdf text-amber-400 text-base group-hover/act:text-[#0b101c] transition-colors duration-200"></i>
                  </div>
                  <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-amber-400 transition-colors duration-200">PDF</span>
                </button>

                <button className="flex flex-col items-center gap-1.5 group/act transition-all duration-200" onClick={() => setShowQRModal(true)}>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover/act:bg-purple-500 group-hover/act:border-purple-500 group-hover/act:shadow-lg group-hover/act:shadow-purple-500/20 transition-all duration-200">
                    <i className="bi bi-qr-code text-purple-400 text-base group-hover/act:text-white transition-colors duration-200"></i>
                  </div>
                  <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-purple-400 transition-colors duration-200">QR Code</span>
                </button>

                <button className="flex flex-col items-center gap-1.5 group/act transition-all duration-200" onClick={handleShare}>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/act:bg-white group-hover/act:border-white group-hover/act:shadow-lg group-hover/act:shadow-white/10 transition-all duration-200">
                    <i className="bi bi-share-fill text-white/60 text-base group-hover/act:text-[#0b101c] transition-colors duration-200"></i>
                  </div>
                  <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider group-hover/act:text-white transition-colors duration-200">Share</span>
                </button>

                <button className="flex flex-col items-center gap-1.5 group/act transition-all duration-200" onClick={handleLike}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 active:scale-95 ${
                    isLiked
                      ? "bg-amber-500 border-amber-500 text-[#0b101c] shadow-md shadow-amber-500/10"
                      : "bg-white/5 border-white/10 text-amber-400 hover:border-amber-500/30 hover:bg-[#fbc02d]/10"
                  }`}>
                    <HeartIcon filled={isLiked} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${isLiked ? "text-amber-500" : "text-white/45 group-hover/act:text-amber-500"}`}>{likeCount}</span>
                </button>
              </div>

              {/* Sub Sections */}
              <div className="space-y-6">
                {/* Admin Controls */}
                {isAdmin && !eventDateUid && !isSingleDate && (
                  <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4 group/adm cursor-pointer transition-all duration-200 hover:bg-amber-500/[0.08]" onClick={openAdminControls}>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                      <i className="bi bi-shield-lock-fill text-lg"></i>
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider mb-0.5">Administrator</p>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Master Controls Panel</p>
                    </div>
                    <i className="bi bi-chevron-right ms-auto text-white/20 group-hover/adm:text-amber-500 group-hover/adm:translate-x-1 transition-all"></i>
                  </div>
                )}

                {/* Organizer Info & Recurrence Details in a unified layout */}
                <div className="bg-[#111c30] rounded-3xl border border-white/[0.06] p-6 space-y-6">
                  {/* Admin Profile */}
                  <Link
                    to={`/user-profile/${adminProfile.uid || eventSeries.adminUid}`}
                    className="flex items-center gap-4 hover:bg-white/[0.02] p-2 rounded-xl transition duration-200 group"
                  >
                    <Avatar src={adminProfile.profilePicUrl} name={adminProfile.displayName} size={48} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold text-white/35 uppercase tracking-wider mb-1">Organized By</p>
                      <p className="text-sm font-bold text-white truncate uppercase tracking-wider group-hover:text-sky-400 transition-colors duration-200">{adminProfile.displayName} {isAdmin && "(YOU)"}</p>
                    </div>
                    <i className="bi bi-chevron-right ms-auto text-white/20 group-hover:text-sky-400 group-hover:translate-x-1 transition-all"></i>
                  </Link>

                  {/* Recurrence */}
                  {eventSeries.eventSchedule && (
                    <div className="flex items-start gap-4 pt-6 border-t border-white/[0.04]">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                        <i className="bi bi-arrow-repeat text-xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider mb-2">{getFrequencyLabel(eventSeries.eventSchedule)}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] text-white/35 font-extrabold uppercase tracking-wider mb-1">Days</p>
                            <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{eventSeries.eventSchedule.eventWeekdays?.join(", ")}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-white/35 font-extrabold uppercase tracking-wider mb-1">Time</p>
                            <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
                              {new Date(eventSeries.eventSchedule.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(eventSeries.eventSchedule.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Map */}
                <div className="bg-[#111c30] rounded-3xl border border-white/[0.06] p-6">
                  <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-wider mb-4">Location & Directions</h3>
                  <div className="flex items-start gap-4 mb-4 bg-[#0b101c]/40 p-4.5 rounded-2xl border border-white/[0.04]">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <i className="bi bi-geo-alt-fill text-lg"></i>
                    </div>
                    <p className="text-xs font-bold text-white/80 leading-relaxed uppercase tracking-wider">{club.formattedAddress || hostClub?.formattedAddress || "No address available"}</p>
                  </div>
                  <div className="rounded-2xl overflow-hidden h-[200px] border border-white/[0.06] grayscale opacity-70 contrast-125">
                    <iframe
                      width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(club.formattedAddress || "")}`}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>

              {/* Members Section */}
              <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-wider">Confirmed Members</h3>
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-[9px] font-extrabold uppercase tracking-wider border border-sky-500/20">
                    {goingCount} / {eventSeries.maxPeople || "∞"} Attending
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {registrations.map((reg, i) => (
                    <Link
                      key={i}
                      to={`/user-profile/${reg.userUid || reg.userEntity?.uid || reg.userId}`}
                      className="group/mem relative cursor-pointer"
                    >
                      <div className="rounded-xl overflow-hidden ring-2 ring-white/[0.04] group-hover/mem:ring-sky-500 transition-all duration-200">
                        <Avatar src={reg.userEntity?.profilePicUrl} name={reg.userEntity?.displayName} size={40} />
                      </div>
                    </Link>
                  ))}
                  {registrations.length === 0 && <p className="text-white/30 text-xs italic uppercase tracking-wider">No members registered yet.</p>}
                </div>
              </div>

              {/* Timeline Section (Events & Posts) */}
              <div className="space-y-8 pt-4">
                {eventDateUid && nextEventDate ? (
                  // Active Event Date View
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pl-2">
                      <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Selected Occurrence</h3>
                      <button
                        onClick={handleClearDate}
                        className="text-[10px] font-extrabold text-[#38bdf8] hover:text-[#38bdf8]/85 uppercase tracking-wider flex items-center gap-1 transition-colors duration-200"
                      >
                        <i className="bi bi-arrow-left"></i> View Full Series
                      </button>
                    </div>
                    <EventDateCard
                      eventDate={nextEventDate}
                      showEditIcon={isAdmin}
                      onEditClick={isAdmin ? () => handleEditClick(nextEventDate) : undefined}
                      onClick={() => { }}
                      isActive={true}
                    />

                    {/* Post Input (only if user is logged in) */}
                    {user && (
                      <div className="bg-[#111c30] border border-white/[0.06] rounded-3xl p-4.5 space-y-3 shadow-xl">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            className="flex-1 bg-[#0b101c] border border-white/[0.04] rounded-xl px-4 text-xs font-semibold text-white placeholder:text-white/25 outline-none focus:border-[#38bdf8]/50 transition-all"
                            placeholder="POST SOMETHING TO THIS DATE..."
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            disabled={isPosting}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handlePostSubmit();
                              }
                            }}
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isPosting}
                            className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white flex items-center justify-center transition-all"
                          >
                            <i className="bi bi-camera-fill text-sky-400"></i>
                          </button>
                          <button
                            onClick={handlePostSubmit}
                            disabled={isPosting || (!postText.trim() && postImages.length === 0)}
                            className="w-10 h-10 shrink-0 rounded-xl bg-sky-500 text-[#0b101c] flex items-center justify-center shadow-lg shadow-sky-500/20 hover:scale-105 transition-transform disabled:opacity-50"
                          >
                            {isPosting ? (
                              <div className="w-4 h-4 border-2 border-[#0b101c] border-t-[#0b101c] animate-spin rounded-full"></div>
                            ) : (
                              <i className="bi bi-send-fill text-sm"></i>
                            )}
                          </button>
                        </div>

                        {/* Image Preview List */}
                        {postImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {postImages.map((file, idx) => (
                              <div key={idx} className="relative group/img">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt="Selected"
                                  className="w-14 h-14 object-cover rounded-xl border border-white/[0.06]"
                                />
                                <button
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-lg opacity-90 hover:opacity-100 transition"
                                  onClick={() => setPostImages(postImages.filter((_, i) => i !== idx))}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => {
                            if (e.target.files) {
                              setPostImages(Array.from(e.target.files));
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Next Event Posts */}
                    <div className="space-y-4">
                      {nextEventDate.posts && nextEventDate.posts.length > 0 ? (
                        nextEventDate.posts.map((post) => (
                          <PostCard key={post.uid} post={post} />
                        ))
                      ) : (
                        <p className="text-white/30 text-xs italic uppercase tracking-wider pl-2">No posts for this date yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Series Level View
                  <div className="space-y-6">
                    {nextEventDate && (
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-wider pl-2">Upcoming Occurence</h3>
                        <EventDateCard
                          eventDate={nextEventDate}
                          showEditIcon={isAdmin}
                          onEditClick={isAdmin ? () => handleEditClick(nextEventDate) : undefined}
                          onClick={() => handleDateClick(nextEventDate.uid)}
                          isActive={false}
                        />

                        {/* Admin Post Input (Only visible to admin at Series Level) */}
                        {isAdmin && user && (
                          <div className="bg-[#111c30] border border-white/[0.06] rounded-3xl p-4.5 space-y-3 shadow-xl">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                className="flex-1 bg-[#0b101c] border border-white/[0.04] rounded-xl px-4 text-xs font-semibold text-white placeholder:text-white/25 outline-none focus:border-[#38bdf8]/50 transition-all"
                                placeholder="POST AN ANNOUNCEMENT TO THIS SERIES (ADMIN ONLY)..."
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                disabled={isPosting}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handlePostSubmit();
                                  }
                                }}
                              />
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isPosting}
                                className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white flex items-center justify-center transition-all"
                              >
                                <i className="bi bi-camera-fill text-sky-400"></i>
                              </button>
                              <button
                                onClick={handlePostSubmit}
                                disabled={isPosting || (!postText.trim() && postImages.length === 0)}
                                className="w-10 h-10 shrink-0 rounded-xl bg-sky-500 text-[#0b101c] flex items-center justify-center shadow-lg shadow-[#38bdf8]/20 hover:scale-105 transition-transform disabled:opacity-50"
                              >
                                {isPosting ? (
                                  <div className="w-4 h-4 border-2 border-[#0b101c] border-t-[#0b101c] animate-spin rounded-full"></div>
                                ) : (
                                  <i className="bi bi-send-fill text-sm"></i>
                                )}
                              </button>
                            </div>

                            {/* Image Preview List */}
                            {postImages.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {postImages.map((file, idx) => (
                                  <div key={idx} className="relative group/img">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt="Selected"
                                      className="w-14 h-14 object-cover rounded-xl border border-white/[0.06]"
                                    />
                                    <button
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-lg opacity-90 hover:opacity-100 transition"
                                      onClick={() => setPostImages(postImages.filter((_, i) => i !== idx))}
                                    >
                                      <i className="bi bi-x"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={(e) => {
                                if (e.target.files) {
                                  setPostImages(Array.from(e.target.files));
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Most Recent Post Section */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-white/35 uppercase tracking-wider pl-2">Most Recent Post</h3>
                      {(() => {
                        const recentPost = getMostRecentPost();
                        return recentPost ? (
                          <PostCard post={recentPost} />
                        ) : (
                          <p className="text-white/30 text-xs italic uppercase tracking-wider pl-2">No posts in this series yet.</p>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Event History */}
                {(futureEventDates.length > 0 || previousEventDates.length > 0) && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/35 uppercase tracking-wider pl-2">Event Timeline</h3>

                    {/* Future list */}
                    {futureEventDates.slice(0, 3).map((ed) => (
                      <EventDateCard
                        key={ed.uid}
                        eventDate={ed}
                        showEditIcon={isAdmin}
                        onEditClick={isAdmin ? () => handleEditClick(ed) : undefined}
                        onClick={() => handleDateClick(ed.uid)}
                        isActive={eventDateUid === ed.uid}
                      />
                    ))}

                    {/* Previous list */}
                    {previousEventDates.map((ed) => (
                      <div key={ed.uid} className="space-y-4">
                        <EventDateCard
                          eventDate={ed}
                          showEditIcon={isAdmin}
                          onEditClick={isAdmin ? () => handleEditClick(ed) : undefined}
                          onClick={() => handleDateClick(ed.uid)}
                          isActive={eventDateUid === ed.uid}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Club Widget */}
              {club.name && (
                <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] shadow-xl relative group/club overflow-hidden">
                  <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-wider mb-5">Hosting Club</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar src={club.profilePicUrl} name={club.name} size={48} />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-white truncate uppercase tracking-wider">{club.name}</p>
                      <p className="text-[9px] text-white/35 mt-1 uppercase font-extrabold truncate tracking-wider">{hostClub?.name || "Local Hub"}</p>
                    </div>
                  </div>
                  <Link to={`/clubs/${club.uid}`} className="block w-full py-3 bg-[#0b101c]/40 border border-sky-500/20 text-sky-400 hover:text-sky-300 text-center rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:bg-sky-500/10 transition-all text-center">
                    Visit Club House
                  </Link>
                </div>
              )}

              {/* Registration Widget */}
              {!eventDateUid && !isSingleDate && (
                <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] shadow-xl text-center">
                  <h3 className="text-[10px] font-black text-white/35 uppercase tracking-wider mb-5">Event Access</h3>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mx-auto mb-5">
                    <i className="bi bi-ticket-perforated text-amber-500 text-2xl"></i>
                  </div>
                  <h4 className="text-base font-black text-white mb-2 uppercase tracking-wider">Reserve Your Spot</h4>
                  <p className="text-[10px] text-white/40 mb-6 font-bold uppercase tracking-wider leading-relaxed">Join this series to receive updates and exclusive content from the organizer.</p>
                  <div className="grid grid-cols-1 gap-3">
                    {data?.eventUserStatus === "going" ? (
                      <button
                        onClick={() => handleRegister("notGoing")}
                        className="py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-emerald-600/10 hover:scale-102 active:scale-98 transition-all"
                      >
                        YOU ARE GOING
                      </button>
                    ) : data?.eventUserStatus === "waitlisted" ? (
                      <button
                        onClick={() => handleRegister("notGoing")}
                        className="py-3 bg-amber-600 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-amber-600/10 hover:scale-102 active:scale-98 transition-all"
                      >
                        WAITLISTED
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister("going")}
                        className="py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-sky-500/10 hover:from-sky-400 hover:to-blue-500 hover:scale-102 active:scale-98 transition-all"
                      >
                        GOING
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Info Widget */}
              <div className="bg-[#111c30] rounded-3xl p-6 border border-white/[0.06] shadow-xl">
                <h3 className="text-[10px] font-black text-white/35 uppercase tracking-wider mb-6">Discovery Info</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between">
                    <span className="text-[10px] text-white/35 font-extrabold uppercase tracking-wider">Activities</span>
                    <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">
                      {eventSeriesEntity.activities?.[0]?.name || "N/A"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-[10px] text-white/35 font-extrabold uppercase tracking-wider">Privacy</span>
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Public</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-[10px] text-white/35 font-extrabold uppercase tracking-wider">Capacity</span>
                    <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">{eventSeries.maxPeople || "Unlimited"}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Occurrence Edit Modal */}
      {editingOccurrence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-[#111c30] w-full max-w-md rounded-3xl border border-white/[0.06] p-8 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sky-400 text-[9px] font-extrabold uppercase tracking-wider mb-1">occurrence manager</p>
                <h4 className="text-white text-lg font-black tracking-tight leading-none uppercase">Edit Event Date</h4>
              </div>
              <button
                onClick={() => setEditingOccurrence(null)}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-extrabold text-white/40 uppercase tracking-wider mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  className="w-full bg-[#0b101c] border border-white/[0.04] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-sky-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-white/40 uppercase tracking-wider mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  className="w-full bg-[#0b101c] border border-white/[0.04] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-sky-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-white/40 uppercase tracking-wider mb-2">Occurrence Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditStatus("active")}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                      editStatus === "active"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10"
                        : "bg-[#0b101c] border-white/[0.04] text-white/40 hover:border-white/10"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus("cancelled")}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                      editStatus === "cancelled"
                        ? "bg-red-500/10 border-red-500 text-red-400 shadow-md shadow-red-500/10"
                        : "bg-[#0b101c] border-white/[0.04] text-white/40 hover:border-white/10"
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.04]">
                <button
                  onClick={() => setEditingOccurrence(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white/50 rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOccurrence}
                  className="flex-1 py-3 bg-sky-500 text-[#0b101c] rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Save Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in" onClick={() => setShowQRModal(false)}>
          <div className="bg-[#111c30] w-full max-w-sm rounded-3xl border border-white/[0.06] p-8 shadow-2xl relative text-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <p className="text-sky-400 text-[9px] font-extrabold uppercase tracking-wider mb-1">SCAN AND DISCOVER</p>
            <h4 className="text-white text-base font-black uppercase tracking-wider mb-6">Event QR Code</h4>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6 border border-white/10">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                alt="Event QR Code"
                className="w-[180px] h-[180px]"
              />
            </div>

            <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 leading-relaxed">{eventSeries.title}</p>
            <p className="text-[10px] text-white/35 font-extrabold uppercase tracking-wider">Share this code with friends to invite them</p>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPDFModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in" onClick={() => setShowPDFModal(false)}>
          <div className="bg-[#111c30] w-full max-w-xl rounded-3xl border border-white/[0.06] p-8 shadow-2xl relative animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPDFModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <div className="text-center mb-6">
              <p className="text-sky-400 text-[9px] font-extrabold uppercase tracking-wider mb-1">EVENT FLYER & RSVP TICKET</p>
              <h4 className="text-white text-base font-black uppercase tracking-wider">Flyer Preview</h4>
            </div>

            {/* VIP Ticket Stub Preview Graphic */}
            <div className="border border-dashed border-white/10 rounded-2xl bg-[#0b101c] overflow-hidden mb-6 shadow-inner">
              <div className="bg-gradient-to-r from-blue-900 to-sky-700 p-4 text-center border-b border-dashed border-white/10">
                <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">CLUB ORBIT VIP ACCESS</span>
              </div>
              <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 space-y-4 text-left w-full">
                  <div>
                    <span className="text-[8px] font-extrabold text-sky-400 uppercase tracking-wider block mb-1">EVENT SERIES</span>
                    <h5 className="text-white text-lg font-black uppercase tracking-wider leading-none">{eventSeries.title}</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[8px] font-extrabold text-white/35 uppercase tracking-wider block">Date & Time</span>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{nextEventDate ? formatTimeRange(nextEventDate.startDateTime, nextEventDate.endDateTime).split(',')[1] : "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold text-white/35 uppercase tracking-wider block">Venue</span>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider truncate block">{club.name || "Hub"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] font-extrabold text-white/35 uppercase tracking-wider block">Address</span>
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wider leading-relaxed block">{club.formattedAddress || hostClub?.formattedAddress || "Address N/A"}</span>
                  </div>
                </div>
                <div className="w-[120px] h-[120px] bg-white p-2 rounded-2xl shrink-0 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`}
                    alt="RSVP QR"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPDFModal(false)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white/50 rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintPDF}
                className="flex-1 py-3 bg-[#fbc02d] text-[#0b101c] rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-lg shadow-[#fbc02d]/20 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Administrator Master Controls Panel Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in" onClick={() => setShowAdminModal(false)}>
          <div className="bg-[#111c30] w-full max-w-md rounded-3xl border border-white/[0.06] p-8 shadow-2xl relative animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="space-y-6">
              {/* REGISTRATION SWITCH */}
              <div className="flex items-center justify-between p-4 bg-[#0b101c] rounded-2xl border border-white/[0.06]">
                <div className="flex-1 text-left">
                  <span className="text-[10px] font-extrabold text-white/35 uppercase tracking-wider block mb-1">Registration Settings</span>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${adminEventStatus === 'completed' ? 'text-white/30' : adminEventStatus === 'activeOpenRegistration' ? 'text-emerald-400' : 'text-red-400'}`}>
                    Registration {adminEventStatus === 'activeOpenRegistration' ? 'is OPEN' : 'is CLOSED'}
                  </span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminEventStatus === "activeOpenRegistration"}
                    disabled={adminEventStatus === "completed"}
                    onChange={(e) => setAdminEventStatus(e.target.checked ? "activeOpenRegistration" : "activeClosedRegistration")}
                    className="sr-only peer"
                    id="reg-toggle"
                  />
                  <label htmlFor="reg-toggle" className="w-11 h-6 bg-white/10 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></label>
                </div>
              </div>

              {/* POSTING SWITCH */}
              <div className="flex items-center justify-between p-4 bg-[#0b101c] rounded-2xl border border-white/[0.06]">
                <div className="flex-1 text-left">
                  <span className="text-[10px] font-extrabold text-white/35 uppercase tracking-wider block mb-1">Event Wall Postings</span>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${adminPostingsClosed ? 'text-red-400' : 'text-emerald-400'}`}>
                    Postings {adminPostingsClosed ? 'are CLOSED' : 'are OPEN'}
                  </span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!adminPostingsClosed}
                    onChange={(e) => setAdminPostingsClosed(!e.target.checked)}
                    className="sr-only peer"
                    id="post-toggle"
                  />
                  <label htmlFor="post-toggle" className="w-11 h-6 bg-white/10 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></label>
                </div>
              </div>

              {/* CANCEL EVENT BUTTON */}
              {adminEventStatus !== "completed" && (
                <div className="p-4 bg-[#0b101c] rounded-2xl border border-white/[0.06] text-center">
                  <p className="text-[9px] font-extrabold text-white/35 uppercase tracking-wider mb-3">Event Lifecycle Action</p>
                  <button
                    onClick={() => setAdminEventStatus(adminEventStatus === 'cancelled' ? 'activeOpenRegistration' : 'cancelled')}
                    className={`w-full py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-lg transition ${adminEventStatus === 'cancelled' ? 'bg-emerald-500 text-[#0b101c] shadow-emerald-500/10' : 'bg-red-500 text-white shadow-red-500/10'}`}
                  >
                    {adminEventStatus === 'cancelled' ? 'Activate Event Series' : 'Cancel Event Series'}
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/[0.04]">
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white/50 rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveAdminControls(adminEventStatus, adminPostingsClosed)}
                  className="flex-1 py-3 bg-sky-500 text-[#0b101c] rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Save Settings
                </button>
              </div>
            </div>
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

export default EventSeries;