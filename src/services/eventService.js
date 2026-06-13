import { playerApiClient } from "./apiClient";
import { auth } from "../firebase";
import { API_BASE_URL } from "../config/api";

// ── Auth token ────────────────────────────────────────────────────────────────

const getToken = async () => {
  try {
    if (auth.currentUser) return await auth.currentUser.getIdToken();
  } catch { }
  return localStorage.getItem("authToken");
};

const fetchMultipart = async (method, path, bodyData, files = {}) => {
  const formData = new FormData();

  formData.append(
    "body",
    new Blob([JSON.stringify(bodyData)], { type: "application/json" })
  );

  Object.entries(files).forEach(([fieldName, file]) => {
    if (file && file.size > 0) {
      formData.append(fieldName, file);
    }
  });

  const token = await getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(
      data?.body?.error || data?.body?.message || "Request failed"
    );
    err.response = { data, status: response.status };
    throw err;
  }

  return data?.body?.result || data;
};

// ── Event service ─────────────────────────────────────────────────────────────

export const eventService = {

  createEvent: async (eventData, eventImage = null) => {
    return fetchMultipart("POST", "/eventSeries", eventData, {
      ...(eventImage ? { eventImage } : {}),
    });
  },

  updateEvent: async (eventData, eventImage = null) => {
    return fetchMultipart("PUT", "/eventSeries", eventData, {
      ...(eventImage ? { eventImage } : {}),
    });
  },


  getEventSeriesByUid: async (eventSeriesUid, userUid, eventDateUid = null) => {
    let url = `/eventSeries?eventSeriesUid=${eventSeriesUid}&userUid=${userUid}`;
    if (eventDateUid) url += `&eventDateUid=${eventDateUid}`;
    const response = await playerApiClient.get(url);
    return response.data?.body?.result || response.data;
  },


  getEventSeriesSummaries: async (
    userUid,
    role = "hasRegistered",
    page = 1,
    fromDate = null,
    toDate = null
  ) => {
    let url = `/eventSeriesSummary?userUid=${userUid}&role=${role}&page=${page}`;
    if (fromDate) url += `&fromDateTime=${fromDate}`;
    if (toDate) url += `&toDateTime=${toDate}`;
    const response = await playerApiClient.get(url);
    return response.data?.body?.result || [];
  },

  getEventSeriesEntities: async (
    page = 1,
    role = null,
    position = null,
    direction = null
  ) => {
    let url = `/eventSeries/participating?page=${page}`;
    if (role) url += `&role=${role}`;
    if (direction) url += `&direction=${direction}`;
    if (position) url += `&lat=${position.lat}&lng=${position.lng}`;
    const response = await playerApiClient.get(url);
    return response.data?.body?.result || [];
  },


  updateEventRegistration: async (eventSeriesUid, userUid, eventUserStatus) => {
    const response = await playerApiClient.post("/register", {
      eventSeriesUid,
      userUid,
      eventUserStatus,
    });
    return response.data?.body?.result || response.data;
  },


  addEventLike: async (likeRequest) => {
    const response = await playerApiClient.post("/eventSeries/like", likeRequest);
    return response.data?.body?.result || response.data;
  },

  setEventStatus: async (statusRequest) => {
    const response = await playerApiClient.post("/eventSeries/status", statusRequest);
    return response.data?.body?.result || response.data;
  },


  updateEventDate: async (eventDateData) => {
    const response = await playerApiClient.post("/eventDate", eventDateData);
    return response.data?.body?.result || response.data;
  },

  getEventRange: async (fromDate, toDate, userUid) => {
    const response = await playerApiClient.get(
      `/eventDate?fromDateTime=${fromDate}&toDateTime=${toDate}&uid=${userUid}`
    );
    return response.data?.body?.result || response.data;
  },

  getEventSeriesUserRelationships: async (eventSeriesUid, status) => {
    const response = await playerApiClient.get(
      `/eventSeriesUserRelationship?eventSeriesUid=${eventSeriesUid}&status=${status}`
    );
    return response.data?.body?.result || [];
  },

  deleteEvent: async (eventSeriesUid) => {
    const response = await playerApiClient.delete(
      `/eventSeries?eventSeriesUid=${eventSeriesUid}`
    );
    return response.data?.body?.result || response.data;
  },
};