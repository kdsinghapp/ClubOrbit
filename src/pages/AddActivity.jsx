import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { useAuthContext } from "../context/AuthContext";
import { activityService } from "../services/activityService";

export default function AddActivity() {
  const { user: authUser } = useAuthContext();
  const { profile, loading: profileLoading, updateProfile, refreshProfile } = useProfile(authUser?.uid);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const debounceTimer = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize selected activities from user profile once loaded
  useEffect(() => {
    if (profile?.body?.result?.user?.activities) {
      setSelectedActivities(profile.body.result.user.activities);
    }
  }, [profile]);

  // Handle clicking outside suggestions to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search suggestions on query change (debounced at 200ms)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await activityService.searchActivities(searchQuery.trim());
        // Results are list of ActivitySelect objects (with 'name' property)
        setSuggestions(results || []);
      } catch (err) {
        console.error("Failed to fetch activity suggestions", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  // Add activity to selection (prevent duplicates, keep alphabetically sorted)
  const handleAddActivity = (name) => {
    const cleanName = name.trim().toLowerCase();
    if (!cleanName) return;

    if (selectedActivities.some((act) => act.toLowerCase() === cleanName)) {
      setMessage({ type: "warning", text: `"${name}" is already in your list.` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      setSearchQuery("");
      setShowSuggestions(false);
      return;
    }

    const updated = [...selectedActivities, name.trim()];
    updated.sort((a, b) => a.localeCompare(b));
    setSelectedActivities(updated);
    setSearchQuery("");
    setShowSuggestions(false);
    setMessage({ type: "success", text: `Added "${name}"` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Remove activity from selection
  const handleRemoveActivity = (nameToRemove) => {
    const updated = selectedActivities.filter((act) => act !== nameToRemove);
    setSelectedActivities(updated);
    setMessage({ type: "info", text: `Removed "${nameToRemove}"` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Submit and save selected activities to profile
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const existingUser = profile?.body?.result?.user || {};

      // Crucial: merge existing profile values to avoid wiping them out
      const updatedForm = {
        displayName: existingUser.displayName || "",
        bio: existingUser.bio || "",
        firstName: existingUser.firstName || "",
        lastName: existingUser.lastName || "",
        gender: existingUser.gender || "",
        email: existingUser.email || authUser?.email || "",
        permissions: existingUser.permissions || ["age", "gender", "fullName"],
        activities: selectedActivities,
      };

      await updateProfile(updatedForm);
      setMessage({ type: "success", text: "Activities updated successfully!" });
      refreshProfile();

      // Delay navigation slightly so user sees success state
      setTimeout(() => {
        navigate("/user-profile");
      }, 1500);
    } catch (err) {
      console.error("Error saving activities", err);
      setMessage({ type: "danger", text: err.message || "Failed to save activities. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      {/* Breadcrumb / Top Bar */}
      <div className="bg-[#0d1b2a]/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link to="/" className="text-gray-500 hover:text-white transition shrink-0">
              <i className="bi bi-house-door"></i>
            </Link>
            <i className="bi bi-chevron-right text-gray-700 text-[10px]"></i>
            <Link to="/user-profile" className="text-gray-500 hover:text-white transition text-xs font-black uppercase tracking-widest">
              Profile
            </Link>
            <i className="bi bi-chevron-right text-gray-700 text-[10px]"></i>
            <span className="text-[#38bdf8] text-xs font-black uppercase tracking-widest truncate">
              Add Activities
            </span>
          </div>

          <Link
            to="/user-profile"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a2332] border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition hover:border-gray-700"
          >
            <i className="bi bi-arrow-left"></i> <span className="hidden sm:inline">Back to Profile</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <span className="text-[#38bdf8] text-[10px] font-black uppercase tracking-[0.35em] block mb-2">Active Interests</span>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">Add Custom & standard Activities</h1>
        </div>

        {/* Status / Alert Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-300 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              message.type === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                message.type === "danger" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                  "bg-blue-500/10 border-blue-500/20 text-blue-400"
            }`}>
            <i className={`bi ${message.type === "success" ? "bi-check-circle-fill" :
                message.type === "warning" ? "bi-exclamation-triangle-fill" :
                  message.type === "danger" ? "bi-exclamation-octagon-fill" :
                    "bi-info-circle-fill"
              }`}></i>
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-[#1a2332] rounded-[30px] p-8 border border-gray-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#38bdf8]/5 blur-[80px] pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 flex items-center justify-center border border-[#38bdf8]/20">
                <i className="bi bi-search text-[#38bdf8] text-lg"></i>
              </div>
              <h2 className="text-md font-black text-white uppercase tracking-widest">Search & Select</h2>
            </div>

            <div className="space-y-6 relative" ref={dropdownRef}>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 px-1">
                  Search sport or activity
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-[#0d1b2a] border border-gray-800 rounded-2xl pl-12 pr-6 py-4.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#38bdf8]/50 focus:ring-4 focus:ring-[#38bdf8]/5 transition shadow-inner font-medium text-sm"
                    placeholder="Type to search (e.g. Football, Basketball, Cycling...)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="bi bi-search text-base"></i>
                    )}
                  </div>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (searchQuery.trim().length >= 2 || suggestions.length > 0) && (
                  <div className="absolute left-0 right-0 mt-2 bg-[#0d1b2a] border border-gray-850 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in duration-150">

                    {/* Add custom query option */}
                    {searchQuery.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleAddActivity(searchQuery)}
                        className="w-full text-left px-6 py-3.5 bg-[#38bdf8]/5 hover:bg-[#38bdf8]/15 border-b border-gray-800 text-[#38bdf8] text-xs font-black uppercase tracking-wider flex items-center gap-3 transition"
                      >
                        <i className="bi bi-plus-circle-fill"></i>
                        <span>Add Custom Activity: "{searchQuery}"</span>
                      </button>
                    )}

                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddActivity(suggestion.name)}
                          className="w-full text-left px-6 py-3.5 hover:bg-white/5 border-b border-gray-850/30 text-gray-300 text-sm font-semibold flex items-center justify-between transition group"
                        >
                          <span className="group-hover:text-white transition">{suggestion.name}</span>
                          <i className="bi bi-plus text-gray-500 group-hover:text-[#38bdf8] transition text-lg"></i>
                        </button>
                      ))
                    ) : (
                      searchQuery.trim().length >= 2 && !isSearching && (
                        <div className="px-6 py-4 text-gray-500 text-sm italic">
                          No matching standard activities found. Use "Add Custom" above!
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Selected Activities Section */}
              <div className="pt-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-1">
                  Active Interests ({selectedActivities.length})
                </label>

                {profileLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading profile activities...</span>
                  </div>
                ) : selectedActivities.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {selectedActivities.map((act, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0d1b2a] border border-[#38bdf8]/20 hover:border-[#38bdf8]/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#38bdf8] shadow-md shadow-[#38bdf8]/2 transition-all hover:scale-105 group"
                      >
                        <span>{act}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveActivity(act)}
                          className="text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Remove Activity"
                        >
                          <i className="bi bi-x-lg text-[10px]"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0d1b2a]/40 rounded-2xl p-6 text-center border border-dashed border-gray-800">
                    <p className="text-gray-500 text-sm">No activities selected yet. Search above to add some!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Save Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSave}
              disabled={saving || profileLoading}
              className={`px-14 py-4.5 bg-[#38bdf8] text-[#0d1b2a] rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#38bdf8]/20 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[#38bdf8]/35 transition-all flex items-center gap-3 ${(saving || profileLoading) ? "opacity-75 cursor-not-allowed" : ""
                }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0d1b2a] border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg text-sm"></i>
                  <span>Save Activities</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
