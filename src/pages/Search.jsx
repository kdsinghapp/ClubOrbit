import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { activityService } from "../services/activityService";
import { placeService } from "../services/Placeservice";

// Helper to calculate distance between two coordinates in km
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Formatter for event date range
function formatDateRange(startStr, endStr) {
  if (!startStr) return "";
  const start = new Date(startStr);
  const end = new Date(endStr);
  const datePart = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart}, ${startTime} - ${endTime}`;
}

export default function Search() {
  const { user: authUser } = useAuthContext();
  const { profile, loading: profileLoading } = useProfile(authUser?.uid);
  const navigate = useNavigate();

  // Maps and locations
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10000); // meters
  const infoWindowRef = useRef(null);
  const [shouldAutoCenter, setShouldAutoCenter] = useState(true);

  // Search query & results
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [activitySuggestions, setActivitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Location Search query & results
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loadingLocationSuggestions, setLoadingLocationSuggestions] = useState(false);

  // Nearby Objects & Markers
  const [nearbyObjects, setNearbyObjects] = useState([]);
  const [loadingObjects, setLoadingObjects] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const cardRefs = useRef({});
  const searchContainerRef = useRef(null);
  const isMapMovedByCardClick = useRef(false);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Geolocation Initialization
  useEffect(() => {
    const getInitialLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(loc);
            setMapCenter(loc);
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Default center: Bhopal, India (matches screenshots and database clubs)
            const fallback = { lat: 23.2599, lng: 77.4126 };
            setUserLocation(fallback);
            setMapCenter(fallback);
          },
          { timeout: 10000 }
        );
      } else {
        const fallback = { lat: 23.2599, lng: 77.4126 };
        setUserLocation(fallback);
        setMapCenter(fallback);
      }
    };
    getInitialLocation();
  }, []);

  // 1b. User Location Marker & Auto-centering Effect
  useEffect(() => {
    if (!mapInstance || !window.google || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    const marker = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstance,
      title: "My Location",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: "#38bdf8",
        fillOpacity: 1,
        scale: 7,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      zIndex: 9999,
    });

    userMarkerRef.current = marker;

    // Pan map to current user location
    mapInstance.panTo(userLocation);

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [mapInstance, userLocation]);

  // 2. Google Maps API Script Loader
  useEffect(() => {
    if (!mapCenter) return;

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const scriptId = "google-maps-sdk-script";
    let script = document.getElementById(scriptId);

    const initMap = () => {
      if (!mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 13,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          {
            elementType: "geometry",
            stylers: [{ color: "#0f1923" }],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#0f1923" }],
          },
          {
            elementType: "labels.text.fill",
            stylers: [{ color: "#7a8a9a" }],
          },
          // Sleek dark custom styling matching site aesthetics
        ],
      });

      setMapInstance(map);

      // Handle map boundaries for radius calculation
      map.addListener("idle", () => {
        const center = map.getCenter();
        const bounds = map.getBounds();

        setMapCenter({ lat: center.lat(), lng: center.lng() });

        if (bounds) {
          const ne = bounds.getNorthEast();
          // Calculate distance from center to NE corner
          const distKm = getDistanceKm(center.lat(), center.lng(), ne.lat(), ne.lng());
          setSearchRadius(distKm * 1000); // meters
        }
      });
    };

    if (!window.google || !window.google.maps) {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initMap();
        };
        document.head.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval);
            initMap();
          }
        }, 100);
      }
    } else {
      initMap();
    }
  }, [mapCenter === null]);

  // 3. Autocomplete suggestion logic
  const handleQueryChange = async (val) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setActivitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const list = await activityService.searchActivities(val);
      setActivitySuggestions(list || []);
      setShowSuggestions(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectActivity = (activityName) => {
    setSearchQuery(activityName);
    setActiveSearchTerm(activityName);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearchTerm("");
    setActivitySuggestions([]);
    setShowSuggestions(false);
  };

  const handleLocationSearch = async (val) => {
    setLocationQuery(val);
    if (val.trim().length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    setLoadingLocationSuggestions(true);
    try {
      const list = await placeService.searchPlaces(val);
      setLocationSuggestions(list || []);
      setShowLocationSuggestions(true);
    } catch (e) {
      console.error("Location search error:", e);
    } finally {
      setLoadingLocationSuggestions(false);
    }
  };

  const handleSelectLocation = async (place) => {
    setLocationQuery(place.description);
    setShowLocationSuggestions(false);
    try {
      const details = await placeService.getPlaceDetails(place.place_id);
      if (details && details.geometry?.location) {
        const lat = details.geometry.location.lat;
        const lng = details.geometry.location.lng;
        const newLoc = { lat, lng };
        setUserLocation(newLoc);
        setMapCenter(newLoc);
        setShouldAutoCenter(true);
        if (mapInstance) {
          mapInstance.panTo(newLoc);
          mapInstance.setZoom(13);
        }
      }
    } catch (err) {
      console.error("Error setting searched location:", err);
    }
  };

  const handleClearLocation = () => {
    setLocationQuery("");
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  // 4. Fetch Nearby Objects (Clubs, Groups, Events)
  useEffect(() => {
    if (!mapCenter || !userLocation) return;

    let active = true;
    const loadObjects = async () => {
      setLoadingObjects(true);
      try {
        const data = await placeService.getNearbyObjects({
          filter: "all",
          myLatitude: userLocation.lat,
          myLongitude: userLocation.lng,
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          radius: searchRadius,
          activityUid: activeSearchTerm || null,
        });

        if (active) {
          setNearbyObjects(data || []);
        }
      } catch (err) {
        console.error("Error fetching nearby objects:", err);
      } finally {
        if (active) setLoadingObjects(false);
      }
    };

    // Debounce a bit to avoid excessive API requests while panning
    const timeout = setTimeout(loadObjects, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [mapCenter, searchRadius, activeSearchTerm, userLocation]);

  // Reset auto-center when active search term or user location changes
  useEffect(() => {
    setShouldAutoCenter(true);
  }, [activeSearchTerm, userLocation]);

  // Auto-center map on the first result
  useEffect(() => {
    if (nearbyObjects.length > 0 && mapInstance && shouldAutoCenter) {
      const firstObj = nearbyObjects[0];
      setSelectedId(firstObj.uid);
      mapInstance.panTo({ lat: firstObj.latitude, lng: firstObj.longitude });
      mapInstance.panBy(0, 130);
      setShouldAutoCenter(false);

      // Scroll first card into view
      setTimeout(() => {
        const cardNode = cardRefs.current[firstObj.uid];
        if (cardNode) {
          cardNode.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
        }
      }, 100);
    }
  }, [nearbyObjects, mapInstance, shouldAutoCenter]);

  // 5. Update Map Markers & InfoWindow
  useEffect(() => {
    if (!mapInstance || !window.google) return;

    // Initialize InfoWindow if needed
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        disableAutoPan: true,
      });
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Add markers for nearby objects
    const newMarkers = nearbyObjects.map((obj) => {
      const isSelected = selectedId === obj.uid;

      // Premium marker pin styling/options
      const marker = new window.google.maps.Marker({
        position: { lat: obj.latitude, lng: obj.longitude },
        map: mapInstance,
        title: obj.name,
        icon: isSelected
          ? {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new window.google.maps.Size(42, 42),
          }
          : {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(36, 36),
          },
        zIndex: isSelected ? 999 : 1,
      });

      marker.addListener("click", () => {
        setSelectedId(obj.uid);
        isMapMovedByCardClick.current = true;
        mapInstance.panTo({ lat: obj.latitude, lng: obj.longitude });
        mapInstance.panBy(0, 130);

        // Scroll to card
        const cardNode = cardRefs.current[obj.uid];
        if (cardNode) {
          cardNode.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
        }
      });

      // Show InfoWindow on selected marker
      if (isSelected && infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="color: #0f1923; padding: 4px 8px; font-family: sans-serif; min-width: 120px;">
            <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; margin-bottom: 2px;">${obj.name}</div>
            <div style="font-size: 10px; color: #38bdf8; font-weight: 800; text-transform: uppercase;">${getCardTypeLabel(obj.type)}</div>
          </div>
        `);
        infoWindowRef.current.open(mapInstance, marker);
      }

      return marker;
    });

    markersRef.current = newMarkers;
  }, [nearbyObjects, selectedId, mapInstance]);

  // Handle auto-focus / centering of the map when a card is selected
  const handleCardClick = (obj) => {
    setSelectedId(obj.uid);
    if (mapInstance) {
      isMapMovedByCardClick.current = true;
      mapInstance.panTo({ lat: obj.latitude, lng: obj.longitude });
      mapInstance.panBy(0, 130);
    }
  };

  const handlePrevCard = () => {
    if (nearbyObjects.length === 0) return;
    const currentIndex = nearbyObjects.findIndex((obj) => obj.uid === selectedId);
    const prevIndex = currentIndex <= 0 ? nearbyObjects.length - 1 : currentIndex - 1;
    const prevObj = nearbyObjects[prevIndex];
    setSelectedId(prevObj.uid);

    if (mapInstance) {
      isMapMovedByCardClick.current = true;
      mapInstance.panTo({ lat: prevObj.latitude, lng: prevObj.longitude });
      mapInstance.panBy(0, 130);
    }

    const cardNode = cardRefs.current[prevObj.uid];
    if (cardNode) {
      cardNode.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleNextCard = () => {
    if (nearbyObjects.length === 0) return;
    const currentIndex = nearbyObjects.findIndex((obj) => obj.uid === selectedId);
    const nextIndex = currentIndex === -1 || currentIndex === nearbyObjects.length - 1 ? 0 : currentIndex + 1;
    const nextObj = nearbyObjects[nextIndex];
    setSelectedId(nextObj.uid);

    if (mapInstance) {
      isMapMovedByCardClick.current = true;
      mapInstance.panTo({ lat: nextObj.latitude, lng: nextObj.longitude });
      mapInstance.panBy(0, 130);
    }

    const cardNode = cardRefs.current[nextObj.uid];
    if (cardNode) {
      cardNode.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const getCardTypeLabel = (type) => {
    switch (type) {
      case "club":
        return "Club";
      case "group":
        return "Group";
      case "groupEvent":
        return "Group Event";
      case "clubEvent":
        return "Club Event";
      default:
        return "Info";
    }
  };

  const handleRecenter = () => {
    if (mapInstance && userLocation) {
      mapInstance.panTo(userLocation);
      mapInstance.setZoom(13);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0d1b2a] text-white flex flex-col overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Loader */}
      {profileLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgb(12,19,38)] z-50">
          <img src="/assets/img/logo.png" alt="logo" className="w-24 animate-pulse" />
        </div>
      )}

      {/* Navigation Sub-Menu (matching top menu in Activity / Places / Event) */}
      <div className="bg-[#0d1b2a] border-b border-gray-800 relative z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-2.5 text-gray-400">
            <Link to="/activity" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-activity text-lg mb-0.5"></i>
              <span className="text-xs">Activity</span>
            </Link>
            <Link to="/search" className="flex flex-col items-center text-white transition font-bold">
              <i className="bi bi-search text-lg mb-0.5 text-[#38bdf8]"></i>
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
            <Link to="/user-profile" className="flex flex-col items-center hover:text-white transition">
              <i className="bi bi-person text-lg mb-0.5"></i>
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Map Content View */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {/* Floating Autocomplete Search Box */}
        <div
          ref={searchContainerRef}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[92%] sm:w-[90%] max-w-[500px] z-20"
        >
          <div className="relative group">
            {/* Subtle glow border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#38bdf8] to-blue-600 rounded-[22px] blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>

            <div className="relative flex flex-row items-center bg-[#1a2332]/95 backdrop-blur-md border border-gray-850 rounded-[22px] px-3 py-1.5 sm:px-5 sm:py-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)] focus-within:border-[#38bdf8]/50 transition-all duration-300 gap-2 sm:gap-3">
              {/* Activity Input */}
              <div className="flex items-center flex-1 min-w-0">
                <i className="bi bi-search text-[#38bdf8] text-base mr-1.5 shrink-0"></i>
                <input
                  type="text"
                  placeholder="Activities..."
                  value={searchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => {
                    setShowSuggestions(searchQuery.length >= 2);
                    setShowLocationSuggestions(false);
                  }}
                  className="w-full bg-transparent outline-none text-white text-xs sm:text-sm font-bold placeholder:text-gray-500 tracking-wide truncate"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="p-0.5 hover:bg-white/10 rounded-full transition mr-0.5"
                  >
                    <i className="bi bi-x-lg text-gray-400 hover:text-white text-[9px] sm:text-xs"></i>
                  </button>
                )}
              </div>

              {/* Separator line */}
              <div className="w-[1px] h-6 bg-gray-850 shrink-0"></div>

              {/* Location Input */}
              <div className="flex items-center flex-1 min-w-0">
                <i className="bi bi-geo-alt text-[#fbc02d] text-base mr-1.5 shrink-0"></i>
                <input
                  type="text"
                  placeholder="Location..."
                  value={locationQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onFocus={() => {
                    setShowLocationSuggestions(locationQuery.length >= 2);
                    setShowSuggestions(false);
                  }}
                  className="w-full bg-transparent outline-none text-white text-xs sm:text-sm font-bold placeholder:text-gray-500 tracking-wide truncate"
                />
                {locationQuery && (
                  <button
                    onClick={handleClearLocation}
                    className="p-0.5 hover:bg-white/10 rounded-full transition"
                  >
                    <i className="bi bi-x-lg text-gray-400 hover:text-white text-[9px] sm:text-xs"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions drop-down menu (Activities) */}
            {showSuggestions && activitySuggestions.length > 0 && (
              <div className="absolute w-full mt-3 bg-[#1a2332]/98 backdrop-blur-3xl border border-white/10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] max-h-[300px] overflow-y-auto z-30 py-2">
                <div className="px-5 py-2 flex items-center justify-between border-b border-white/5 mb-1">
                  <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-[0.2em]">Suggested Activities</span>
                </div>
                {activitySuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectActivity(item.name)}
                    className="px-5 py-3 hover:bg-white/[0.04] cursor-pointer transition flex items-center justify-between group"
                  >
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-[#38bdf8]">
                      {item.name}
                    </span>
                    <i className="bi bi-arrow-right-short text-gray-500 group-hover:text-[#38bdf8] text-xl"></i>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions drop-down menu (Locations) */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute w-full mt-3 bg-[#1a2332]/98 backdrop-blur-3xl border border-white/10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] max-h-[300px] overflow-y-auto z-30 py-2">
                <div className="px-5 py-2 flex items-center justify-between border-b border-white/5 mb-1">
                  <span className="text-[10px] font-bold text-[#fbc02d] uppercase tracking-[0.2em]">Suggested Locations</span>
                </div>
                {locationSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLocation(item)}
                    className="px-5 py-3 hover:bg-white/[0.04] cursor-pointer transition flex items-center justify-between group"
                  >
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-[#fbc02d] truncate mr-2">
                      {item.description}
                    </span>
                    <i className="bi bi-arrow-right-short text-gray-500 group-hover:text-[#fbc02d] text-xl flex-shrink-0"></i>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* The Google Map Element */}
        <div className="w-full h-full flex-1 min-h-0 relative">
          <div ref={mapRef} className="w-full h-full absolute inset-0"></div>

          {/* Recenter / My Location Button */}
          {mapInstance && userLocation && (
            <button
              onClick={handleRecenter}
              title="Recenter to my location"
              className="absolute top-24 right-4 z-20 bg-[#1a2332]/95 hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 border border-gray-800/80"
            >
              <i className="bi bi-crosshair text-xl"></i>
            </button>
          )}

          {/* Loading status */}
          {!mapInstance && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1b2a] text-gray-400 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#38bdf8] border-t-transparent mr-3"></div>
              <span>Loading Google Maps...</span>
            </div>
          )}
        </div>

        {/* Nearby Cards Strip Overlay at the Bottom */}
        {nearbyObjects.length > 0 && (
          <div className="absolute bottom-6 left-0 right-0 z-10 w-full px-4 select-none pointer-events-auto">
            {/* Navigation Arrow buttons overlay */}
            {nearbyObjects.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={handlePrevCard}
                  className="hidden sm:flex absolute left-6 bottom-[140px] z-20 bg-[#1a2332]/95 hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white rounded-full w-10 h-10 items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-gray-800/80 transition-all duration-300 pointer-events-auto"
                >
                  <i className="bi bi-chevron-left text-lg"></i>
                </button>
                {/* Right Arrow */}
                <button
                  onClick={handleNextCard}
                  className="hidden sm:flex absolute right-6 bottom-[140px] z-20 bg-[#1a2332]/95 hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white rounded-full w-10 h-10 items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-gray-800/80 transition-all duration-300 pointer-events-auto"
                >
                  <i className="bi bi-chevron-right text-lg"></i>
                </button>
              </>
            )}

            <div className="max-w-6xl mx-auto flex gap-4 pb-2 px-2 snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar">
              {nearbyObjects.map((obj) => {
                const isSelected = selectedId === obj.uid;

                // Activity Tag String
                let activityTag = "";
                if (obj.activities && obj.activities.length > 0) {
                  activityTag = obj.activities[0].name;
                  if (obj.activities.length > 1) {
                    activityTag += ` +${obj.activities.length - 1} more`;
                  }
                }

                // Member/Event Status mappings
                let statusLabel = "";
                let statusColor = "bg-purple-600";

                const isClubOrGroup = obj.type === "club" || obj.type === "group";

                if (obj.memberType === "admin") {
                  statusLabel = "Admin";
                  statusColor = "bg-blue-600";
                } else if (obj.memberType === "member") {
                  statusLabel = "Joined";
                  statusColor = "bg-green-600";
                } else if (obj.eventUserStatusType === "going") {
                  statusLabel = "Going";
                  statusColor = "bg-green-600";
                } else if (obj.eventUserStatusType === "waitlisted") {
                  statusLabel = "Waitlisted";
                  statusColor = "bg-orange-500";
                } else if (!isClubOrGroup) {
                  const spotsLeft = obj.maxUsers - (obj.userCount || 0);
                  statusLabel = `${spotsLeft}/${obj.maxUsers} spots`;
                  statusColor = spotsLeft <= 2 ? "bg-red-500 animate-pulse" : "bg-purple-600";
                } else {
                  statusLabel = "Join Now";
                  statusColor = "bg-purple-600";
                }

                // Nav routes
                const targetLink =
                  obj.type === "group"
                    ? `/groups/${obj.uid}`
                    : isClubOrGroup
                      ? `/clubs/${obj.uid}`
                      : `/event-series/${obj.uid}`;

                // Uniform card value calculations
                const descriptionText = obj.text || "Join our community to connect with other players, participate in local events, and enjoy activities together.";

                const distanceVal = obj.distance !== undefined && obj.distance !== null
                  ? obj.distance
                  : (userLocation ? getDistanceKm(userLocation.lat, userLocation.lng, obj.latitude, obj.longitude) : 0);

                const relationsList = obj.relations && obj.relations.length > 0
                  ? obj.relations
                  : [
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                  ];
                const userCountVal = obj.relations && obj.relations.length > 0 ? (obj.userCount || 0) : 15;

                return (
                  <div
                    key={obj.uid}
                    ref={(el) => (cardRefs.current[obj.uid] = el)}
                    onClick={() => handleCardClick(obj)}
                    className={`snap-center flex-shrink-0 w-[250px] sm:w-[270px] h-[295px] flex flex-col bg-white text-[#0f1923] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border-[3px] cursor-pointer hover:scale-[1.02] ${isSelected ? "border-[#38bdf8] scale-[1.01]" : "border-transparent"
                      }`}
                  >
                    {/* Header Image Cover */}
                    <div className="relative h-24 bg-gray-100 shrink-0 overflow-hidden">
                      <img
                        src={obj.primaryImage || "/assets/img/placeholder-club.jpg"}
                        alt={obj.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/assets/img/placeholder-club.jpg";
                        }}
                      />

                      {/* Card Type Badge overlay */}
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {getCardTypeLabel(obj.type)}
                      </span>

                      {/* Activity Tag overlay */}
                      {activityTag && (
                        <span className="absolute bottom-3 left-3 bg-[#fbc02d] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded italic">
                          {activityTag}
                        </span>
                      )}

                      {/* SubImage / Parent Image overlay */}
                      {obj.subImage && (
                        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md">
                          <img
                            src={obj.subImage}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Card Description / Content Details */}
                    <div className="flex-1 p-3 flex flex-col justify-between min-h-0">
                      <div>
                        {/* Title */}
                        <div className="flex items-center gap-1.5 mb-1.5 h-5">
                          {isClubOrGroup ? (
                            <i className="bi bi-building text-[#fbc02d] text-sm"></i>
                          ) : (
                            <i className="bi bi-calendar-check text-[#fbc02d] text-sm"></i>
                          )}
                          <Link
                            to={targetLink}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-bold uppercase truncate flex-1 leading-tight text-[#0f1923] hover:text-[#38bdf8] transition-colors"
                          >
                            {obj.name}
                          </Link>
                        </div>

                        {/* Avatars registered members stack */}
                        <div className="flex items-center gap-1.5 h-6 mb-2">
                          <div className="flex -space-x-2.5 overflow-hidden">
                            {relationsList.slice(0, 4).map((url, i) => (
                              <img
                                key={i}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                src={url}
                                alt="Participant"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold">
                            {userCountVal > 4 ? `+${userCountVal - 4} more` : "Joined"}
                          </span>
                        </div>

                        {/* Description Text wrapper with fixed height */}
                        <div className="h-9 mb-1.5 overflow-hidden">
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-medium">
                            <i className="bi bi-info-circle text-[#fbc02d] mr-1.5 text-sm align-middle"></i>
                            <span className="align-middle">{descriptionText}</span>
                          </p>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div>
                        {/* Event Start/End Range if applicable (fixed height wrapper for alignment) */}
                        <div className="h-4 mb-1.5">
                          {obj.startDateTime ? (
                            <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                              <i className="bi bi-clock"></i>
                              {formatDateRange(obj.startDateTime, obj.endDateTime)}
                            </p>
                          ) : (
                            <div className="h-4"></div>
                          )}
                        </div>

                        {/* Badges / Distance details with top divider line */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={targetLink}
                              onClick={(e) => e.stopPropagation()}
                              className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white rounded-full shadow-sm hover:opacity-90 transition whitespace-nowrap ${statusColor}`}
                            >
                              {statusLabel}
                            </Link>

                            <Link
                              to={targetLink}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm transition whitespace-nowrap"
                            >
                              Details
                            </Link>
                          </div>

                          <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 whitespace-nowrap">
                            <i className="bi bi-geo-alt-fill text-[#fbc02d]"></i>
                            {distanceVal ? `${distanceVal.toFixed(1)} km` : "Calculating..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty placeholder search states */}
        {nearbyObjects.length === 0 && !loadingObjects && activeSearchTerm && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-[#1a2332]/95 backdrop-blur border border-white/5 px-6 py-4 rounded-2xl shadow-xl text-center z-10 w-[90%] max-w-[350px]">
            <i className="bi bi-geo-alt text-2xl text-[#fbc02d] mb-1 block"></i>
            <p className="text-sm text-gray-300">No objects found matches "{activeSearchTerm}" in this area.</p>
          </div>
        )}
      </div>
    </div>
  );
}
