import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { eventService } from "../../services/eventService";

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const ACTIVITY_OPTIONS = [
  "Badminton",
  "Basketball",
  "Cricket",
  "Cycling",
  "Football",
  "Golf",
  "Hockey",
  "Rugby",
  "Swimming",
  "Tennis",
  "Volleyball",
  "Yoga",
];

const initialForm = {
  title: "",
  description: "",
  clubId: "",
  maxPeople: "",
  isRecurring: true,
  frequencyType: "WEEKS",
  occurFrequency: 1,
  occurrences: 1,
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  durationHrs: 2,
  durationMins: 0,
  daysOfWeek: [],
  activities: [],
};

export default function AddEvent() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const clubIdParam = searchParams.get("clubId") || "";
  const clubNameParam = searchParams.get("clubName") || "";
  const groupIdParam = searchParams.get("groupId") || "";
  const groupNameParam = searchParams.get("groupName") || "";
  const resolvedClubId = groupIdParam ? groupIdParam : clubIdParam;

  // Determine back URL and context label
  const backUrl = groupIdParam
    ? `/groups/${groupIdParam}`
    : clubIdParam
      ? `/clubs/${clubIdParam}`
      : "/event";
  const contextName = groupIdParam
    ? groupNameParam || "Group"
    : clubIdParam
      ? clubNameParam || "Club"
      : null;

  const [form, setForm] = useState({ ...initialForm, clubId: groupIdParam ? groupIdParam : clubIdParam });
  const [activityInput, setActivityInput] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const imageInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleDay = (dayValue) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayValue)
        ? prev.daysOfWeek.filter((d) => d !== dayValue)
        : [...prev.daysOfWeek, dayValue],
    }));
  };

  const addActivity = (activity) => {
    const trimmed = activity.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (form.activities.map((a) => a.toLowerCase()).includes(lower)) return;
    setForm((prev) => ({ ...prev, activities: [...prev.activities, trimmed] }));
  };

  const removeActivity = (activity) => {
    setForm((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a !== activity),
    }));
  };

  const handleActivityInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addActivity(activityInput);
      setActivityInput("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEventImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setEventImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const buildIso = (date, time) => {
    if (!date || !time) return null;
    return new Date(`${date}T${time}`).toISOString();
  };

  const buildEndIso = (date, startTime, endTime) => {
    if (!date || !endTime) return null;
    const end = new Date(`${date}T${endTime}`);
    const start = new Date(`${date}T${startTime}`);
    if (end <= start) end.setDate(end.getDate() + 1);
    return end.toISOString();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim()) return setError("Event title is required.");
    if (!form.startDate) return setError("Start date (FROM) is required.");
    if (!form.startTime) return setError("Start time is required.");
    if (!form.isRecurring && !form.endDate) return setError("End date (TO) is required.");
    if (!form.isRecurring && !form.endTime) return setError("End time (TO) is required.");
    if (form.isRecurring && form.daysOfWeek.length === 0 && form.frequencyType === "WEEKS")
      return setError("Please select at least one day of the week.");

    const adminUid = user?.uid || "";
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const computeEndIso = () => {
      if (form.isRecurring) {
        if (!form.startDate || !form.startTime) return null;
        const start = new Date(`${form.startDate}T${form.startTime}`);
        start.setHours(start.getHours() + Number(form.durationHrs || 0));
        start.setMinutes(start.getMinutes() + Number(form.durationMins || 0));
        return start.toISOString();
      } else {
        if (!form.endDate || !form.endTime) return null;
        return new Date(`${form.endDate}T${form.endTime}`).toISOString();
      }
    };

    const eventSchedule = {
      startDate: buildIso(form.startDate, form.startTime),
      endDate: computeEndIso(),
      isRecurring: form.isRecurring,
      frequencyType: form.frequencyType,
      occurFrequency: Number(form.occurFrequency) || 1,
      numberOfOccurrences: Number(form.occurrences) || 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      ...(form.isRecurring && form.frequencyType === "WEEKS" && form.daysOfWeek.length > 0 && {
        eventWeekdays: form.daysOfWeek.map((d) => dayNames[d])
      }),
    };

    const payload = {
      uid: null,
      title: form.title.trim(),
      description: form.description.trim() || " ",
      adminUid: adminUid,
      lastUpdatedUserUid: adminUid,
      ...(resolvedClubId && { clubId: resolvedClubId }),
      ...(form.clubId.trim() && !resolvedClubId && { clubId: form.clubId.trim() }),
      ...(groupIdParam && { groupId: groupIdParam }),
      ...(groupIdParam && clubIdParam && { masterClubUid: clubIdParam }),
      ...(form.maxPeople && { maxPeople: Number(form.maxPeople) }),
      activities: form.activities.length > 0 ? form.activities : null,
      eventPic: null,
      timestamp: null,
      eventStatus: null,
      postingsClosed: null,
      eventSchedule,
    };

    try {
      setLoading(true);
      console.log("=== FINAL PAYLOAD ===", JSON.stringify(payload, null, 2));
      await eventService.createEvent(payload, eventImage);
      setSuccess("Event created successfully!");
      setTimeout(() => navigate(backUrl), 1500);
    } catch (err) {
      console.log("=== ERROR RESPONSE ===", JSON.stringify(err?.response?.data, null, 2));
      setError(
        err?.response?.data?.body?.error ||
        err?.response?.data?.body?.trace ||
        err?.message ||
        "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
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

      {/* Breadcrumb / Top Bar */}
      <div className="bg-[#0b101c] border-b border-white/[0.04] sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link to="/" className="text-white/45 hover:text-white transition shrink-0">
              <i className="bi bi-house-door text-base"></i>
            </Link>
            <i className="bi bi-chevron-right text-white/20 text-[10px]"></i>
            {contextName && (
              <>
                <Link to={backUrl} className="text-white/45 hover:text-white transition truncate max-w-[100px] sm:max-w-none text-xs font-extrabold uppercase tracking-wider">
                  {contextName}
                </Link>
                <i className="bi bi-chevron-right text-white/20 text-[10px]"></i>
              </>
            )}
            <Link to="/event" className="text-white/45 hover:text-white transition text-xs font-extrabold uppercase tracking-wider">
              Events
            </Link>
            <i className="bi bi-chevron-right text-white/20 text-[10px]"></i>
            <span className="text-sky-400 text-xs font-black uppercase tracking-wider truncate">
              Add Event
            </span>
          </div>

          <Link
            to={backUrl}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider hover:text-white transition duration-200 active:scale-95"
          >
            <i className="bi bi-arrow-left"></i> <span className="hidden sm:inline">Cancel</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none mb-3">Create New Event</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Status Messages */}
              {error && (
                <div className="flex items-center gap-3.5 bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl mb-8 animate-in fade-in duration-300">
                  <i className="bi bi-exclamation-octagon-fill text-lg flex-shrink-0"></i>
                  <span className="text-[13px] font-semibold leading-relaxed">{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-2xl mb-8 animate-in fade-in duration-300">
                  <i className="bi bi-check-circle-fill text-lg flex-shrink-0"></i>
                  <span className="text-[13px] font-semibold leading-relaxed">{success}</span>
                </div>
              )}

              {/* ── Basic Info Card ── */}
              <div className="bg-[#111c30] rounded-3xl p-6 sm:p-8 border border-white/[0.06] shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <i className="bi bi-info-circle text-sky-400 text-sm"></i>
                  </div>
                  <h2 className="text-xs font-black text-white uppercase tracking-wider">Event Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-black text-white/35 uppercase tracking-wider mb-2 px-1">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 transition shadow-inner text-sm"
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Weekly Tennis Tournament"
                      maxLength={120}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-white/35 uppercase tracking-wider mb-2 px-1">
                      Description
                    </label>
                    <textarea
                      className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 transition shadow-inner min-h-[120px] text-sm leading-relaxed"
                      name="description"
                      rows={4}
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Tell participants what this event is about…"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] font-black text-white/35 uppercase tracking-wider mb-2 px-1">
                        Max Participants <span className="text-white/20 lowercase">(optional)</span>
                      </label>
                      <div className="relative">
                        <i className="bi bi-people absolute left-5 top-1/2 -translate-y-1/2 text-white/25"></i>
                        <input
                          className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl pl-12 pr-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 transition text-sm"
                          type="number"
                          name="maxPeople"
                          value={form.maxPeople}
                          onChange={handleChange}
                          placeholder="e.g. 20"
                          min={1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Event Image Card ── */}
              <div className="bg-[#111c30] rounded-3xl p-6 sm:p-8 border border-white/[0.06] shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <i className="bi bi-image text-purple-400 text-sm"></i>
                  </div>
                  <h2 className="text-xs font-black text-white uppercase tracking-wider">Cover Image</h2>
                </div>

                {imagePreview ? (
                  <div className="relative group/img rounded-2xl overflow-hidden border border-white/[0.06] aspect-video sm:aspect-[21/9]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover transition duration-500 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                      <button
                        type="button"
                        className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition duration-200"
                        onClick={removeImage}
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-white/[0.04] rounded-2xl flex flex-col items-center justify-center py-12 px-6 group cursor-pointer hover:border-sky-500/30 hover:bg-sky-500/[0.02] transition-all duration-300"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-300">
                      <i className="bi bi-cloud-arrow-up text-white/35 text-3xl group-hover:text-sky-400 transition-colors"></i>
                    </div>
                    <span className="text-xs font-black text-white/60 uppercase tracking-wider mb-1 group-hover:text-white transition">Upload Image</span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">PNG, JPG or WebP up to 5MB</span>
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* ── Activities Card ── */}
              <div className="bg-[#111c30] rounded-3xl p-6 sm:p-8 border border-white/[0.06] shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <i className="bi bi-tags text-amber-500 text-sm"></i>
                  </div>
                  <h2 className="text-xs font-black text-white uppercase tracking-wider">Activities</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <select
                      className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500/50 transition appearance-none cursor-pointer text-sm font-bold uppercase tracking-wider"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) addActivity(e.target.value);
                      }}
                    >
                      <option value="" className="bg-[#0b101c]">Choose Activity Type…</option>
                      {ACTIVITY_OPTIONS.map((a) => (
                        <option key={a} value={a} className="bg-[#0b101c]">{a}</option>
                      ))}
                    </select>
                    <i className="bi bi-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-white/35 text-xs pointer-events-none"></i>
                  </div>
                  <div className="relative flex-[1.5]">
                    <input
                      type="text"
                      className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition text-sm"
                      placeholder="Or type custom tag + Enter"
                      value={activityInput}
                      onChange={(e) => setActivityInput(e.target.value)}
                      onKeyDown={handleActivityInputKeyDown}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 uppercase tracking-wider hidden sm:block">
                      Press Enter
                    </div>
                  </div>
                </div>

                {form.activities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {form.activities.map((a) => (
                      <div
                        key={a}
                        className="group flex items-center gap-2 px-4 py-2 bg-[#0b101c] border border-white/[0.04] rounded-xl text-[10px] font-black uppercase tracking-wider text-white/60 hover:border-amber-500/30 hover:text-white transition duration-200 cursor-default"
                      >
                        {a}
                        <button
                          type="button"
                          onClick={() => removeActivity(a)}
                          className="hover:text-red-500 transition duration-200"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-5 text-center border border-dashed border-white/[0.04] rounded-2xl">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-wider">No activities tagged yet</span>
                  </div>
                )}
              </div>

              {/* ── Schedule Card ── */}
              <div className="bg-[#111c30] rounded-3xl p-6 sm:p-8 border border-white/[0.06] shadow-xl overflow-hidden relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#f5a623]/10 flex items-center justify-center border border-[#f5a623]/20">
                      <i className="bi bi-calendar-check text-[#f5a623] text-sm"></i>
                    </div>
                    <h2 className="text-xs font-black text-white uppercase tracking-wider">Schedule</h2>
                  </div>

                  {/* Recurring Toggle */}
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, isRecurring: !prev.isRecurring, daysOfWeek: [] }))}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black uppercase text-[9px] tracking-wider transition-all border duration-200 active:scale-95 ${form.isRecurring
                      ? 'bg-[#f5a623] text-[#0b101c] border-[#f5a623] shadow-lg shadow-[#f5a623]/10'
                      : 'bg-[#0b101c] text-white/45 border-white/[0.04] hover:border-white/10 hover:text-white'
                      }`}
                  >
                    <i className={`bi ${form.isRecurring ? 'bi-arrow-repeat' : 'bi-calendar'}`}></i>
                    {form.isRecurring ? 'Recurring Event' : 'Single Event'}
                  </button>
                </div>

                <div className="space-y-8">

                  {form.isRecurring && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-[#0b101c]/40 rounded-2xl border border-white/[0.04]">
                      <div>
                        <label className="block text-[9px] font-black text-white/35 uppercase tracking-wider mb-3">
                          Repeat Every
                        </label>
                        <div className="relative">
                          <input
                            className="w-full bg-[#0b101c] border border-white/[0.04] rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#f5a623]/50 transition text-sm"
                            type="number"
                            name="occurFrequency"
                            value={form.occurFrequency}
                            onChange={handleChange}
                            min={1} max={52}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 uppercase tracking-wider pointer-events-none">
                            {form.frequencyType === "WEEKS" ? "Weeks" : "Months"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-white/35 uppercase tracking-wider mb-3">
                          Total Events
                        </label>
                        <div className="relative">
                          <input
                            className="w-full bg-[#0b101c] border border-white/[0.04] rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#f5a623]/50 transition text-sm"
                            type="number"
                            name="occurrences"
                            value={form.occurrences}
                            onChange={handleChange}
                            min={1}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-white/35 uppercase tracking-wider mb-3">
                          Frequency
                        </label>
                        <div className="relative">
                          <select
                            className="w-full bg-[#0b101c] border border-white/[0.04] rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#f5a623]/50 transition appearance-none cursor-pointer text-sm"
                            name="frequencyType"
                            value={form.frequencyType}
                            onChange={(e) => setForm(prev => ({ ...prev, frequencyType: e.target.value, daysOfWeek: [] }))}
                          >
                            <option value="WEEKS">Weekly</option>
                            <option value="MONTHS">Monthly</option>
                          </select>
                          <i className="bi bi-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-white/35 text-xs pointer-events-none"></i>
                        </div>
                      </div>

                      {form.frequencyType === "WEEKS" && (
                        <div className="col-span-1 sm:col-span-3 pt-2">
                          <label className="block text-[9px] font-black text-white/35 uppercase tracking-wider mb-4">
                            Select Days
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((d) => (
                              <button
                                key={d.value}
                                type="button"
                                onClick={() => toggleDay(d.value)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border duration-200 active:scale-95 ${form.daysOfWeek.includes(d.value)
                                  ? 'bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 shadow-md shadow-[#f5a623]/5'
                                  : 'bg-[#0b101c] text-white/40 border border-white/[0.04] hover:border-white/10 hover:text-white'
                                  }`}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                    {/* Start Part */}
                    <div className="space-y-4">
                      <label className="block text-[9px] font-black text-[#f5a623] uppercase tracking-wider">
                        Start Date & Time
                      </label>
                      <div className="flex flex-col gap-4">
                        <div className="relative group">
                          <i className="bi bi-calendar3 absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#f5a623] transition"></i>
                          <input
                            className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-[#f5a623]/50 transition [color-scheme:dark] text-sm font-semibold"
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="relative group">
                          <i className="bi bi-clock absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#f5a623] transition"></i>
                          <input
                            className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-[#f5a623]/50 transition [color-scheme:dark] text-sm font-semibold"
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* End Part (Logic differs for recurring) */}
                    <div className="space-y-4">
                      <label className="block text-[9px] font-black text-[#f5a623] uppercase tracking-wider">
                        {form.isRecurring ? "Duration" : "End Date & Time"}
                      </label>

                      {form.isRecurring ? (
                        <div className="flex gap-4">
                          <div className="flex-1 relative group">
                            <select
                              className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#f5a623]/50 transition appearance-none text-sm font-bold"
                              name="durationHrs"
                              value={form.durationHrs}
                              onChange={handleChange}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i} className="bg-[#0b101c]">{i} hrs</option>
                              ))}
                            </select>
                            <i className="bi bi-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-white/35 text-xs pointer-events-none"></i>
                          </div>
                          <div className="flex-1 relative group">
                            <select
                              className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#f5a623]/50 transition appearance-none text-sm font-bold"
                              name="durationMins"
                              value={form.durationMins}
                              onChange={handleChange}
                            >
                              {[0, 15, 30, 45].map(m => (
                                <option key={m} value={m} className="bg-[#0b101c]">{m} min</option>
                              ))}
                            </select>
                            <i className="bi bi-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-white/35 text-xs pointer-events-none"></i>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="relative group">
                            <i className="bi bi-calendar3 absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#f5a623] transition"></i>
                            <input
                              className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-[#f5a623]/50 transition [color-scheme:dark] text-sm font-semibold"
                              type="date"
                              name="endDate"
                              value={form.endDate}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="relative group">
                            <i className="bi bi-clock absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#f5a623] transition"></i>
                            <input
                              className="w-full bg-[#0b101c] border border-white/[0.04] rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-[#f5a623]/50 transition [color-scheme:dark] text-sm font-semibold"
                              type="time"
                              name="endTime"
                              value={form.endTime}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 pb-12">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-lg shadow-sky-500/10 hover:from-sky-400 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-plus text-base"></i>
                      Create Event
                    </>
                  )}
                </button>
                <Link
                  to={backUrl}
                  className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/10 text-white/50 rounded-xl font-black uppercase text-xs tracking-wider hover:text-white hover:border-white/20 transition-all text-center duration-200 active:scale-95"
                >
                  Discard Changes
                </Link>
              </div>
            </form>
          </div>

          {/* Sidebar / Tips */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111c30] rounded-3xl p-8 border border-white/[0.06] shadow-xl relative overflow-hidden sticky top-24">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                <i className="bi bi-lightbulb-fill text-amber-500 text-xl"></i>
              </div>

              <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-wider mb-6">Expert Tips</h3>

              <ul className="space-y-6">
                {[
                  { icon: 'bi-cursor-text', title: 'Catchy Title', desc: 'Use clear, action-oriented names that tell members exactly what to expect.' },
                  { icon: 'bi-image', title: 'High Quality Media', desc: 'Events with custom cover photos get 3x more engagement than those without.' },
                  { icon: 'bi-tag', title: 'Strategic Tagging', desc: 'Add at least 2 relevant activities so your event shows up in member filters.' },
                  { icon: 'bi-arrow-repeat', title: 'Recurrence', desc: 'Use recurring events for weekly practices or monthly meetups.' },
                ].map((tip, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/35">
                      <i className={`bi ${tip.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-1">{tip.title}</h4>
                      <p className="text-white/40 text-xs leading-relaxed">{tip.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-8 border-t border-white/[0.04]">
                <div className="p-4 bg-[#0b101c]/40 rounded-xl border border-white/[0.04]">
                  <p className="text-[10px] text-white/35 leading-relaxed italic">
                    "Great communities are built one event at a time. Make yours memorable."
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}