import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventService } from "../../services/eventService";
import { auth } from "../../firebase";

// ── Date helpers ──────────────────────────────────────────────────────────────

const toDateKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const isSameDay = (a, b) => toDateKey(a) === toDateKey(b);

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const fmtDateFull = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "short", day: "2-digit", month: "short", year: "2-digit",
  });

const fmtDateShort = (d) =>
  new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

// ── Calendar ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function MiniCalendar({ eventDotMap, selectedDay, onSelectDay }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  // Monday-based weekday (0=Mon … 6=Sun)
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 8px", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "0 4px" }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>‹</button>
        <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>›</button>
      </div>

      {/* Weekday labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#64748b", fontWeight: 700, padding: "2px 0" }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const key = toDateKey(date);
          const dots = eventDotMap[key] || [];
          const isToday = isSameDay(date, today);
          const isSelected = selectedDay && isSameDay(date, selectedDay);
          const hasDot = dots.length > 0;
          const adminDot = dots.some(e => e.role === "ADMINISTERS");

          return (
            <div key={key} onClick={() => onSelectDay(date)}
              style={{
                textAlign: "center", cursor: "pointer", borderRadius: 6,
                padding: "4px 2px",
                background: isSelected ? "#3b82f6" : isToday ? "rgba(59,130,246,0.18)" : "transparent",
                transition: "background 0.15s",
                position: "relative",
              }}>
              <span style={{ fontSize: 12, fontWeight: isToday || isSelected ? 700 : 400, color: isSelected ? "#fff" : isToday ? "#60a5fa" : "#cbd5e1" }}>
                {date.getDate()}
              </span>
              {hasDot && (
                <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 1 }}>
                  {dots.slice(0, 3).map((dot, di) => (
                    <div key={di} style={{ width: 5, height: 5, borderRadius: "50%", background: adminDot ? "#f87171" : "#4ade80" }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ item, onClick }) {
  const series = item.eventSeries || item;
  const entity = item.eventSeriesEntity || item;
  const nextDate = entity.eventDates?.[0];

  const uid = series.uid || entity.uid || item.uid;
  const title = series.title || entity.title || entity.eventSeriesTitle || "Untitled Event";
  const clubName = entity.club?.name || entity.clubName || "";
  const clubPic = entity.club?.profilePicThumbnailUrl || entity.clubPicUrl || null;
  const eventPic = entity.eventPicThumbnailUrl || entity.eventPicUrl || entity.eventSeriesPicUrl || null;
  const startDT = nextDate?.startDateTime || entity.startDateTime || series.eventSchedule?.startDate;
  const endDT = nextDate?.endDateTime || entity.endDateTime || series.eventSchedule?.endDate;
  const role = item.role || entity.role || null;
  const isAdmin = role === "ADMINISTERS";

  return (
    <div onClick={() => onClick && onClick(uid)} style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: 12, cursor: "pointer",
      transition: "background 0.15s, transform 0.15s",
      marginBottom: 8,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Event image + Club badge */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {eventPic ? (
          <img src={eventPic} alt={title} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10 }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: 10, background: "linear-gradient(135deg,#1e3a5f,#2d6a9f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-calendar-event" style={{ fontSize: "1.4rem", color: "#60a5fa" }}></i>
          </div>
        )}
        {clubPic && (
          <img src={clubPic} alt={clubName} style={{ position: "absolute", bottom: -6, right: -6, width: 26, height: 26, borderRadius: "50%", border: "2px solid #0d1b2a", objectFit: "cover" }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          {isAdmin && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.15)", borderRadius: 4, padding: "1px 5px", textTransform: "uppercase", letterSpacing: 0.5 }}>Organiser</span>
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#fbbf24", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {clubName && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{clubName}</div>}
        {startDT && (
          <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.4 }}>
            {fmtDateFull(startDT)}<br />
            {fmtTime(startDT)}{endDT ? ` – ${fmtTime(endDT)}` : ""}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div style={{ color: "#3b82f6", flexShrink: 0 }}>
        <i className="bi bi-chevron-right" style={{ fontSize: 16 }}></i>
      </div>
    </div>
  );
}

// ── Summary Card (for Organised / Attendance / Previous tabs) ─────────────────

function SummaryCard({ item, onClick }) {
  const uid = item.eventSeriesUid || item.uid;
  const title = item.eventTitle || item.title || "Untitled";
  const clubPic = item.clubPicUrl || null;
  const eventPic = item.eventSeriesPicUrl || item.eventPicUrl || null;
  const startDT = item.startDateTime;
  const endDT = item.endDateTime;
  const role = item.userRole || item.role;
  const isAdmin = role === "ADMINISTERS" || role === "administers";
  const registered = item.registrationCount ?? 0;
  const maxPeople = item.maxPeople ?? 0;

  return (
    <div onClick={() => onClick && onClick(uid)} style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: 12, cursor: "pointer",
      transition: "background 0.15s", marginBottom: 8,
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        {eventPic ? (
          <img src={eventPic} alt={title} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10 }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: 10, background: "linear-gradient(135deg,#1e3a5f,#2d6a9f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-calendar-event" style={{ fontSize: "1.4rem", color: "#60a5fa" }}></i>
          </div>
        )}
        {clubPic && (
          <img src={clubPic} alt="" style={{ position: "absolute", bottom: -6, right: -6, width: 26, height: 26, borderRadius: "50%", border: "2px solid #0d1b2a", objectFit: "cover" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isAdmin && (
          <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.15)", borderRadius: 4, padding: "1px 5px", textTransform: "uppercase", letterSpacing: 0.5, display: "inline-block", marginBottom: 3 }}>Organiser</span>
        )}
        <div style={{ fontWeight: 700, fontSize: 14, color: "#fbbf24", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {startDT && (
          <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>
            {fmtDateFull(startDT)}<br />
            {fmtTime(startDT)}{endDT ? ` – ${fmtTime(endDT)}` : ""}
          </div>
        )}
        {maxPeople > 0 && (
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
            <i className="bi bi-people" style={{ marginRight: 3 }}></i>{registered}/{maxPeople}
          </div>
        )}
      </div>
      <div style={{ color: "#3b82f6", flexShrink: 0 }}>
        <i className="bi bi-chevron-right" style={{ fontSize: 16 }}></i>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div style={{ display: "flex", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 12, marginBottom: 8, opacity: 0.4 }}>
      <div style={{ width: 72, height: 72, borderRadius: 10, background: "#1e2d3d", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, background: "#1e2d3d", borderRadius: 4, width: "60%", marginBottom: 8 }} />
        <div style={{ height: 11, background: "#1e2d3d", borderRadius: 4, width: "40%", marginBottom: 6 }} />
        <div style={{ height: 11, background: "#1e2d3d", borderRadius: 4, width: "75%" }} />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ message, showCreate }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
      <i className="bi bi-calendar-x" style={{ fontSize: "2.5rem", color: "#334155" }}></i>
      <p style={{ marginTop: 12, fontSize: 14 }}>{message}</p>
      {showCreate && (
        <Link to="/add-event" className="btn btn-primary btn-sm mt-2" style={{ fontSize: 13 }}>
          <i className="bi bi-plus-lg me-1"></i> Event banayein
        </Link>
      )}
    </div>
  );
}

// ── Tab: Calendar ──────────────────────────────────────────────────────────────

function CalendarTab({ navigate }) {
  const [loading, setLoading] = useState(true);
  const [calEvents, setCalEvents] = useState({}); // key: "YYYY-MM-DD" → array of items
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [weekEvents, setWeekEvents] = useState([]);
  const [error, setError] = useState(null);

  const loadRange = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    try {
      setLoading(true);
      const data = await eventService.getEventRange(from.toISOString(), to.toISOString(), user.uid);
      const items = Array.isArray(data) ? data : (data?.eventSummaryItems || []);
      // Build map
      const map = {};
      items.forEach(item => {
        const start = item.startDateTime?.dateTime || item.startDateTime;
        if (!start) return;
        const key = toDateKey(start);
        if (!map[key]) map[key] = [];
        map[key].push(item);
      });
      setCalEvents(map);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Calendar data load nahi hua.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRange(); }, [loadRange]);

  // Whenever selectedDay changes, compute the week's events
  useEffect(() => {
    const dayOfWeek = (selectedDay.getDay() + 6) % 7; // Mon=0
    const weekStart = new Date(selectedDay);
    weekStart.setDate(selectedDay.getDate() - dayOfWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const results = [];
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      const key = toDateKey(d);
      if (calEvents[key]) results.push(...calEvents[key]);
    }
    setWeekEvents(results);
  }, [selectedDay, calEvents]);

  const handleSelect = (date) => setSelectedDay(date);

  return (
    <div>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <div style={{ width: 24, height: 24, border: "2px solid #3b82f6", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <>
          <MiniCalendar eventDotMap={calEvents} selectedDay={selectedDay} onSelectDay={handleSelect} />
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              Week of {fmtDateShort(selectedDay)}
            </div>
            {error && <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>}
            {weekEvents.length === 0 && !error && (
              <EmptyState message="Is hafte koi event nahi hai." showCreate />
            )}
            {weekEvents.map((item, i) => (
              <EventCard key={item.eventSeriesUid || item.uid || i} item={{
                eventSeries: { uid: item.eventSeriesUid, title: item.eventSeriesTitle },
                eventSeriesEntity: {
                  eventDates: [{ startDateTime: item.startDateTime?.dateTime || item.startDateTime, endDateTime: item.endDateTime?.dateTime || item.endDateTime }],
                  eventPicThumbnailUrl: item.eventSeriesPicUrl,
                  clubName: item.clubName,
                  clubPicUrl: item.clubPicUrl,
                },
                role: item.role,
              }} onClick={(uid) => uid && navigate(`/event-series/${uid}`)} />
            ))}
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Generic list tab ──────────────────────────────────────────────────────────

function ListTab({ role, direction, navigate, emptyMessage }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (pageNum = 1, append = false) => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);

      let data;
      if (role) {
        // Use summaries API for organised / attendance
        data = await eventService.getEventSeriesSummaries(user.uid, role, pageNum);
      } else {
        // Use entities for Previous (direction = after = past events)
        data = await eventService.getEventSeriesEntities(pageNum, null, null, direction);
      }

      const results = Array.isArray(data) ? data : [];
      if (append) setItems(prev => [...prev, ...results]);
      else setItems(results);
      setHasMore(results.length >= 10);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Data load nahi hua.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [role, direction]);

  useEffect(() => { load(1); }, [load]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, true);
  };

  return (
    <div>
      {error && (
        <div style={{ color: "#f87171", fontSize: 13, padding: "8px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={() => load(1)} style={{ background: "none", border: "1px solid #f87171", color: "#f87171", borderRadius: 6, padding: "2px 10px", cursor: "pointer", fontSize: 12 }}>Retry</button>
        </div>
      )}
      {loading && !error && <>{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</>}
      {!loading && !error && items.length === 0 && <EmptyState message={emptyMessage} showCreate={role === "administers"} />}
      {!loading && items.map((item, i) => {
        // Try to detect if it's a summary or entity format
        const isSummary = item.eventSeriesUid !== undefined && !item.eventSeries;
        return isSummary
          ? <SummaryCard key={item.eventSeriesUid || i} item={item} onClick={(uid) => uid && navigate(`/event-series/${uid}`)} />
          : <EventCard key={item.eventSeries?.uid || item.uid || i} item={item} onClick={(uid) => uid && navigate(`/event-series/${uid}`)} />;
      })}
      {!loading && hasMore && items.length > 0 && (
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <button onClick={loadMore} disabled={loadingMore}
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid #3b82f6", color: "#60a5fa", borderRadius: 8, padding: "8px 24px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {loadingMore ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "calendar", label: "Calendar", icon: "bi-calendar3" },
  { key: "organised", label: "Organised", icon: "bi-person-workspace" },
  { key: "attendance", label: "Attendance", icon: "bi-check2-circle" },
  { key: "previous", label: "Previous", icon: "bi-clock-history" },
];

export default function Event() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ev-tab-btn { background: none; border: none; cursor: pointer; transition: all 0.2s; }
        .ev-tab-btn:hover { opacity: 0.9; }
      `}</style>

      <div className="main-wrapper" style={{ background: "#0d1b2a", minHeight: "100vh" }}>
        {pageLoading && (
          <div style={{ position: "fixed", inset: 0, background: "rgb(12,19,38)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <img src="/assets/img/logo.png" alt="logo" style={{ width: 96, animation: "pulse 1.5s infinite" }} />
          </div>
        )}

        {/* Bottom Nav */}
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
              <Link to="/event" className="flex flex-col items-center text-white transition font-bold">
                <i className="bi bi-calendar-event text-lg mb-0.5 text-[#38bdf8]"></i>
                <span className="text-xs">Events</span>
              </Link>
              <Link to="/user-profile" className="flex flex-col items-center hover:text-white transition">
                <i className="bi bi-person text-lg mb-0.5"></i>
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 80px" }}>

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Events</h2>
            <Link to="/add-event" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#3b82f6", color: "#fff", borderRadius: 8,
              padding: "6px 14px", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              <i className="bi bi-plus-lg"></i> Create
            </Link>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} className="ev-tab-btn" onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 20, whiteSpace: "nowrap",
                    fontWeight: 700, fontSize: 13,
                    background: active ? "#3b82f6" : "rgba(255,255,255,0.07)",
                    color: active ? "#fff" : "#94a3b8",
                    border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                  }}>
                  <i className={`bi ${tab.icon}`} style={{ fontSize: 13 }}></i>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === "calendar" && <CalendarTab navigate={navigate} />}
          {activeTab === "organised" && (
            <ListTab role="administers" direction={null} navigate={navigate} emptyMessage="Aapne abhi tak koi event organize nahi kiya." />
          )}
          {activeTab === "attendance" && (
            <ListTab role="hasRegistered" direction={null} navigate={navigate} emptyMessage="Aap kisi event mein registered nahi hain." />
          )}
          {activeTab === "previous" && (
            <ListTab role={null} direction="after" navigate={navigate} emptyMessage="Koi previous event nahi mila." />
          )}
        </div>
      </div>
    </>
  );
}