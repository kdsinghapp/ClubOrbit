// d:\Ankit\club-orbit-react\src\pages\Activity.jsx
import { useEffect, useState, useMemo } from "react";
import { activityService } from "../services/activityService";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

// ── Icons ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const UsersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(timestamp) {
  if (!timestamp) return "";
  const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getShortAddress(address) {
  if (!address) return "";
  const parts = address.split(",");
  return parts.length > 2 ? parts.slice(0, 2).join(",") : address;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDateRange(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const datePart = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart}, ${startTime} – ${endTime}`;
}

function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = "lg", showStatus, isAdmin, isRegistered }) {
  const [error, setError] = useState(false);

  const dim = size === "lg" ? "w-[42px] h-[42px] text-[15px]"
    : size === "md" ? "w-[34px] h-[34px] text-[12px]"
      : size === "sm" ? "w-[26px] h-[26px] text-[9px]"
        : "w-[36px] h-[36px] text-[13px]";

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative inline-block flex-shrink-0">
      {src && !error ? (
        <div className={`${dim} rounded-xl overflow-hidden ring-1 ring-white/10`}>
          <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setError(true)} />
        </div>
      ) : (
        <div className={`${dim} rounded-xl flex items-center justify-center bg-gradient-to-br from-[#38bdf8] to-[#7c3aed] text-white font-bold ring-1 ring-white/10`}>
          {initials}
        </div>
      )}
      {showStatus && (isAdmin || isRegistered) && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${size === "lg" ? "w-3 h-3 border-2" : "w-2.5 h-2.5 border"} ${isAdmin ? "bg-emerald-500" : "bg-red-400"} rounded-full border-[#111c2d]`} />
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  const colorMap = {
    yellow: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    cyan: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    purple: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  };
  return (
    <span className={`text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full border ${colorMap[color] || colorMap.cyan}`}>
      {label}
    </span>
  );
}

// ── Engagement Bar ────────────────────────────────────────────────────────────
function EngagementBar({ likeCount, isLiked, onLike, commentCount, onCommentToggle, viewCount }) {
  return (
    <div className="flex items-center gap-4 pt-2 mt-2 border-t border-white/5">
      <button
        onClick={onLike}
        className={`flex items-center gap-1.5 text-[12px] font-semibold tracking-wider transition-all ${isLiked ? "text-sky-400" : "text-white/30 hover:text-sky-400"
          }`}
      >
        <HeartIcon filled={isLiked} />
        <span>{likeCount}</span>
      </button>

      {onCommentToggle ? (
        <button
          onClick={onCommentToggle}
          className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wider text-white/30 hover:text-amber-400 transition-all"
        >
          <ChatIcon />
          <span>{commentCount}</span>
        </button>
      ) : (
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-white/20">
          <ChatIcon />
          <span>{commentCount}</span>
        </span>
      )}

      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-white/20">
        <EyeIcon />
        <span>{viewCount}</span>
      </span>
    </div>
  );
}

// ── Card Footer Info ──────────────────────────────────────────────────────────
function CardFooterInfo({ club, eventDate, distance }) {
  return (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
      {club?.profilePicUrl && (
        <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-white/10 flex-shrink-0">
          <img src={club.profilePicUrl} alt={club.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-widest truncate">{club?.name || "Unknown Club"}</span>
          {club?.shortAddress && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-[10px] text-white/30 flex items-center gap-1 font-medium">
                <MapPinIcon />
                {club.shortAddress}
              </span>
            </>
          )}
          {distance && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-[10px] text-amber-400 font-semibold">{distance.toFixed(1)} km</span>
            </>
          )}
        </div>
        {eventDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/30 mt-1 font-medium">
            <ClockIcon />
            <span>{formatDateRange(eventDate.startDateTime, eventDate.endDateTime)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Club Post Card ───────────────────────────────────────────────────────────
function ClubPostCard({ item }) {
  const post = item.postEntity;
  if (!post || post.type !== "clubPost") return null;

  const navigate = useNavigate();
  const user = post.user || {};
  const club = post.club || {};

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.countLikes || 0);
  const commentCount = post.countComments || 0;

  const handleLike = async () => {
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    if (isLiked) {
      await activityService.unlikePost(post.uid, u.uid);
      setLikeCount((p) => p - 1);
    } else {
      await activityService.likePost(post.uid, u.uid);
      setLikeCount((p) => p + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest("input")) return;
    navigate(`/post/${post.uid}`, { state: { item } });
  };

  const toggleComments = () => navigate(`/post/${post.uid}`, { state: { item } });

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-[#131f2e] hover:border-sky-500/20 transition-all duration-300 rounded-2xl p-3 mb-2.5 group"
    >
      <div className="flex gap-2.5 items-start mb-2">
        <Avatar src={user.profilePicUrl} name={user.displayName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-white leading-tight">{user.displayName}</p>
            <Badge label="Club Post" color="yellow" />
          </div>
          <p className="text-[10px] text-white/25 font-medium mt-0.5 uppercase tracking-wider">{timeAgo(post.timestamp)}</p>
        </div>
      </div>

      {post.text && (
        <p className="text-[13px] text-white/60 leading-snug mb-2 font-normal">{post.text}</p>
      )}

      {post.galleryCollageUrl && (
        <div className="rounded-xl overflow-hidden mb-2 ring-1 ring-white/5">
          <img
            src={post.galleryCollageUrl}
            className="w-full max-h-[420px] object-cover group-hover:scale-[1.01] transition-transform duration-700"
            alt="Post"
          />
        </div>
      )}

      <CardFooterInfo club={club} distance={club?.distance} />
      <EngagementBar
        likeCount={likeCount}
        isLiked={isLiked}
        onLike={handleLike}
        commentCount={commentCount}
        onCommentToggle={toggleComments}
        viewCount={post.countViews || 0}
      />
    </div>
  );
}

// ── Event Post Card ───────────────────────────────────────────────────────────
function EventPostCard({ item }) {
  const post = item.postEntity;
  if (!post || post.type !== "eventDatePost") return null;

  const navigate = useNavigate();
  const user = post.user || {};
  const eventDate = post.eventDate || {};
  const eventSeries = eventDate.eventSeries || {};
  const club = eventSeries.club || {};

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.countLikes || 0);
  const commentCount = post.countComments || 0;

  const handleLike = async () => {
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    if (isLiked) {
      await activityService.unlikePost(post.uid, u.uid);
      setLikeCount((p) => p - 1);
    } else {
      await activityService.likePost(post.uid, u.uid);
      setLikeCount((p) => p + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest("input")) return;
    navigate(`/post/${post.uid}`, { state: { item } });
  };

  const toggleComments = () => navigate(`/post/${post.uid}`, { state: { item } });

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-[#131f2e] hover:border-sky-500/20 transition-all duration-300 rounded-2xl overflow-hidden mb-2.5 group"
    >
      {post.galleryCollageUrl && (
        <div className="relative overflow-hidden h-44 sm:h-56">
          <img
            src={post.galleryCollageUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt="Post"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131f2e] via-transparent" />
        </div>
      )}

      <div className="px-3 pt-2.5 pb-3">
        <div className="flex gap-2.5 items-start mb-2">
          <Avatar src={user.profilePicUrl} name={user.displayName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13px] font-semibold text-white leading-tight">{user.displayName}</p>
              <Badge label="Event Post" color="cyan" />
            </div>
            <p className="text-[10px] text-white/25 font-medium mt-0.5 uppercase tracking-wider">{timeAgo(post.timestamp)}</p>
          </div>
        </div>

        {post.text && (
          <p className="text-[13px] text-white/60 leading-snug mb-2">{post.text}</p>
        )}

        <CardFooterInfo club={club} eventDate={eventDate} distance={club?.distance} />
        <EngagementBar
          likeCount={likeCount}
          isLiked={isLiked}
          onLike={handleLike}
          commentCount={commentCount}
          onCommentToggle={toggleComments}
          viewCount={post.countViews || 0}
        />
      </div>
    </div>
  );
}

// ── Event Series Card ─────────────────────────────────────────────────────────
function EventSeriesCard({ item }) {
  const event = item.eventSeriesEntity;
  if (!event) return null;

  const admin = event.administrator?.userEntity || {};
  const club = event.club || {};

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(event.countLikes || 0);

  const handleLike = async () => {
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    try {
      if (isLiked) {
        await activityService.unlikeEvent(event.uid, u.uid);
        setLikeCount((p) => p - 1);
      } else {
        await activityService.likeEvent(event.uid, u.uid);
        setLikeCount((p) => p + 1);
      }
      setIsLiked(!isLiked);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Link to={`/event-series/${event.uid}`} className="block mb-2.5">
      <div className="bg-[#131f2e] hover:border-violet-500/20 rounded-2xl overflow-hidden group transition-all duration-300">
        {event.eventPicFullUrl && (
          <div className="relative overflow-hidden h-44 sm:h-56">
            <img
              src={event.eventPicFullUrl}
              alt="event"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131f2e] via-transparent opacity-90" />
          </div>
        )}

        <div className="px-3 pt-2.5 pb-3">
          <div className="mb-1.5">
            <Badge label="Event Series" color="purple" />
          </div>
          <h3 className="text-[14px] font-semibold text-white leading-snug mb-0.5 tracking-tight">{event.title}</h3>
          {event.description && (
            <p className="text-[12px] text-white/40 leading-snug mb-2 line-clamp-2">{event.description}</p>
          )}

          <div className="flex items-center gap-2.5 mb-2">
            <Avatar src={admin.profilePicUrl} name={admin.displayName} size="md" showStatus isAdmin />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white leading-tight">{admin.displayName}</p>
              <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest mt-0.5">Admin</p>
            </div>
          </div>

          <CardFooterInfo club={club} distance={club?.distance} />

          <div className="flex flex-wrap gap-1.5 mt-2">
            {event.maxPeople && (
              <span className="flex items-center gap-1.5 bg-white/5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-lg text-white/40">
                <UsersIcon /> Max {event.maxPeople}
              </span>
            )}
            {event.registrationCount !== undefined && (
              <span className="flex items-center gap-1.5 bg-sky-400/5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-lg text-sky-400">
                <CheckIcon /> {event.registrationCount} registered
              </span>
            )}
          </div>

          <EngagementBar
            likeCount={likeCount}
            isLiked={isLiked}
            onLike={handleLike}
            commentCount={event.countComments || 0}
            viewCount={event.countViews || 0}
          />
        </div>
      </div>
    </Link>
  );
}

// ── Calendar Day Event Avatar Stack ───────────────────────────────────────────
function DayEventAvatars({ events, isSelected }) {
  const displayEvents = events.slice(0, 4);
  const remaining = events.length - 4;

  if (events.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-0.5 mt-1 w-full max-w-[28px] sm:max-w-[38px] mx-auto">
      {displayEvents.map((evt, idx) => {
        const eventSeries = evt.eventSeries || evt;
        const club = eventSeries.club || evt.club;
        const imageUrl = eventSeries.eventPicUrl || club?.profilePicUrl;

        return (
          <div key={idx} className="relative">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-md overflow-hidden ring-1 ${isSelected ? 'ring-white/40' : 'ring-white/10'}`}>
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-500 to-violet-600" />
              )}
            </div>
          </div>
        );
      })}
      {remaining > 0 && (
        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-md flex items-center justify-center text-[6px] font-bold ${isSelected ? 'bg-white text-[#0d1b2a]' : 'bg-white/10 text-white/50'}`}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

// ── Full-Screen Calendar Component ────────────────────────────────────────────
function FullScreenCalendar({ feedItems, onDateSelect, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const allEvents = useMemo(() => {
    const events = [];
    feedItems.forEach(item => {
      if (item.type === "postEntity" && item.postEntity?.eventDate) {
        const { eventDate, eventSeries } = item.postEntity;
        events.push({
          ...eventSeries,
          startDateTime: eventDate.startDateTime,
          endDateTime: eventDate.endDateTime,
          source: "post",
          postEntity: item.postEntity,
          eventDate: eventDate
        });
      } else if (item.type === "eventSeriesEntity" && item.eventSeriesEntity?.eventDates) {
        item.eventSeriesEntity.eventDates.forEach(date => {
          events.push({
            ...item.eventSeriesEntity,
            _key: `${item.eventSeriesEntity.uid}-${date.uid}`,
            startDateTime: date.startDateTime,
            endDateTime: date.endDateTime,
            eventDateUid: date.uid,
            source: "eventSeries"
          });
        });
      }
    });
    return events;
  }, [feedItems]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ type: 'empty', key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateEvents = allEvents.filter(e => isSameDay(e.startDateTime, date));
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      days.push({ type: 'day', key: `day-${day}`, day, date, events: dateEvents, isToday, isSelected });
    }

    return { days, dayNames, monthYear: currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, [currentMonth, allEvents, selectedDate]);

  return (
    <div className="bg-[#131f2e] rounded-2xl p-4 sm:p-8 w-full mb-8">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">{calendarDays.monthYear}</h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
        {calendarDays.dayNames.map(name => (
          <div key={name} className="text-center text-[9px] sm:text-[10px] font-semibold text-white/25 uppercase tracking-widest">
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.days.map((dayCell) => {
          if (dayCell.type === 'empty') return <div key={dayCell.key} className="h-14 sm:h-20" />;
          const { day, date, events, isToday, isSelected } = dayCell;
          const hasEvents = events.length > 0;

          return (
            <button
              key={dayCell.key}
              onClick={() => onDateSelect(date, events)}
              className={`
                rounded-xl p-1 sm:p-2 flex flex-col items-center justify-start h-14 sm:h-20 transition-all duration-200
                ${isSelected
                  ? 'bg-sky-500 text-[#0d1b2a] scale-105 shadow-lg shadow-sky-500/20'
                  : isToday
                    ? 'bg-sky-500/10 border border-sky-500/40 text-sky-400'
                    : hasEvents
                      ? 'bg-white/5  hover:border-sky-500/20 text-white hover:bg-white/8'
                      : 'hover:bg-white/5 border border-transparent text-white/30 hover:text-white/50'
                }
              `}
            >
              <span className={`text-[11px] sm:text-sm font-semibold ${isSelected ? 'text-[#0d1b2a]' : isToday ? 'text-sky-400' : ''}`}>
                {day}
              </span>
              {hasEvents && <DayEventAvatars events={events} isSelected={isSelected} />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-sky-500 bg-sky-500/10"></div>
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">Registered</span>
        </div>
      </div>
    </div>
  );
}

// ── Slide-in Event Panel ──────────────────────────────────────────────────────
function EventSidePanel({ isOpen, onClose, selectedDate, events }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#0d1624] border-l border-white/[0.06] z-[9999] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
                <CalendarIcon />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-white">
                  {selectedDate ? formatDate(selectedDate) : "Schedule"}
                </h3>
                <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all flex items-center justify-center"
            >
              <XIcon />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                <i className="bi bi-calendar-x text-5xl mb-4"></i>
                <p className="text-sm font-semibold uppercase tracking-widest">No events</p>
              </div>
            ) : (
              events.map((event, idx) => {
                const eventSeries = event.eventSeries || event;
                const club = eventSeries.club || event.club;

                return (
                  <Link key={event._key || `${event.uid}-${idx}`} to={`/event-series/${eventSeries.uid}`} className="block group">
                    <div className="bg-[#131f2e]  rounded-2xl p-4 hover:border-sky-500/20 transition-all duration-300">
                      {eventSeries.eventPicUrl && (
                        <div className="relative mb-4 h-40 rounded-xl overflow-hidden ring-1 ring-white/5">
                          <img src={eventSeries.eventPicUrl} alt={eventSeries.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <h4 className="text-[13px] font-semibold text-white mb-2 group-hover:text-sky-400 transition-colors leading-snug">{eventSeries.title || event.title || "Unnamed Event"}</h4>
                      <div className="flex items-center gap-2 text-white/30 text-[11px] font-medium mb-3 bg-white/5 px-3 py-2 rounded-lg">
                        <ClockIcon />
                        <span>{formatDateRange(event.startDateTime, event.endDateTime)}</span>
                      </div>
                      <CardFooterInfo club={club} distance={club?.distance} />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Activity() {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("feed");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await activityService.getActivityFeed();
        setFeedItems(res);
      } catch (error) {
        console.error("Failed to load activity feed:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDateSelect = (date, events) => {
    setSelectedDate(date);
    setSelectedDateEvents(events);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => setIsPanelOpen(false);

  const filtered = feedItems.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const p = item.postEntity || item.eventSeriesEntity;
    if (!p) return false;
    return (
      (p.text || p.title || "").toLowerCase().includes(q) ||
      (p.user?.displayName || p.administrator?.userEntity?.displayName || "").toLowerCase().includes(q) ||
      (p.club?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0d1624] text-white">

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0d1624] z-50">
          <img src="/assets/img/logo.png" alt="logo" className="w-16 animate-pulse opacity-70" />
        </div>
      )}

      {/* Navigation */}
      <div className="bg-[#0d1624] border-b border-white/[0.06] relative z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-3 text-white/40">
            <Link to="/activity" className="flex flex-col items-center text-sky-400 transition">
              <i className="bi bi-activity text-lg mb-0.5"></i>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Activity</span>
            </Link>
            <Link to="/search" className="flex flex-col items-center hover:text-white/70 transition">
              <i className="bi bi-search text-lg mb-0.5"></i>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Search</span>
            </Link>
            <Link to="/places" className="flex flex-col items-center hover:text-white/70 transition">
              <i className="bi bi-geo-alt text-lg mb-0.5"></i>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Places</span>
            </Link>
            <Link to="/event" className="flex flex-col items-center hover:text-white/70 transition">
              <i className="bi bi-calendar-event text-lg mb-0.5"></i>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Events</span>
            </Link>
            <Link to="/user-profile" className="flex flex-col items-center hover:text-white/70 transition">
              <i className="bi bi-person text-lg mb-0.5"></i>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Profile</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-3">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold text-white">Activity Feed</h3>
          </div>

          <div className="flex items-center bg-white/[0.05]  p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode("feed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ${viewMode === "feed"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
                }`}
            >
              <ListIcon />
              Feed
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ${viewMode === "calendar"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
                }`}
            >
              <CalendarIcon />
              Calendar
            </button>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="flex gap-3 mb-3">
          <Link to="/clubs/create" className="flex-1 group">
            <div className="bg-[#131f2e]  hover:border-sky-500/25 rounded-xl px-3 py-2.5 flex items-center justify-between transition-all duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <i className="bi bi-people-fill text-sm"></i>
                </div>
                <span className="text-white/80 text-[12px] font-medium">Add Club</span>
              </div>
              <i className="bi bi-plus text-sky-400 text-base"></i>
            </div>
          </Link>

          <Link to="/add-activity" className="flex-1 group">
            <div className="bg-amber-400 rounded-xl px-3 py-2.5 flex items-center justify-between hover:bg-amber-300 transition-all duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <i className="bi bi-lightning-charge-fill text-sm"></i>
                </div>
                <span className="text-[#1a1000] text-[12px] font-semibold">Add Activity</span>
              </div>
              <i className="bi bi-plus text-[#1a1000] text-base"></i>
            </div>
          </Link>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative mb-3 group">
          <div className="flex items-center bg-[#131f2e] group-focus-within:border-sky-500/30 rounded-xl px-4 py-2.5 transition-all duration-200">
            <i className="bi bi-search text-white/25 mr-3 text-sm group-focus-within:text-sky-400 transition-colors"></i>
            <input
              type="text"
              placeholder="Search activity..."
              className="w-full bg-transparent outline-none text-[13px] text-white placeholder:text-white/25 font-normal"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Feed View ── */}
        {viewMode === "feed" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!loading && filtered.length === 0 && (
              <div className="bg-[#131f2e] rounded-2xl p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-journal-x text-white/30 text-xl"></i>
                </div>
                <h2 className="text-[14px] font-semibold text-white/50 mb-1">Nothing here yet</h2>
                <p className="text-[12px] text-white/25 max-w-xs mx-auto leading-relaxed">
                  No matching activities found. Try a different search.
                </p>
              </div>
            )}

            {!loading &&
              filtered.map((item, i) => {
                if (item.type === "postEntity") {
                  const post = item.postEntity;
                  return post.type === "clubPost" ? (
                    <ClubPostCard key={`club-post-${i}`} item={item} />
                  ) : (
                    <EventPostCard key={`event-post-${i}`} item={item} />
                  );
                }
                if (item.type === "eventSeriesEntity") {
                  return <EventSeriesCard key={`event-series-${i}`} item={item} />;
                }
                return null;
              })}
          </div>
        )}

        {/* ── Calendar View ── */}
        {viewMode === "calendar" && (
          <div className="animate-in fade-in duration-300">
            <FullScreenCalendar
              feedItems={feedItems}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
        )}
      </div>

      <EventSidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        selectedDate={selectedDate}
        events={selectedDateEvents}
      />
    </div>
  );
}