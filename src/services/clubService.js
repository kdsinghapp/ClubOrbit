import { playerApiClient } from "./apiClient";
import { auth } from "../firebase";
import { API_BASE_URL } from "../config/api";

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
    new Blob([JSON.stringify(bodyData)], { type: "application/json" }),
  );

  // Attach optional image files
  if (files.profileImage) formData.append("profileImage", files.profileImage);
  if (files.coverImage) formData.append("coverImage", files.coverImage);

  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data?.body?.error || "Request failed");
    err.response = { data, status: response.status };
    throw err;
  }
  return data?.body?.result || data;
};

export const clubService = {
  createClub: async (clubData) => {
    // 1. Defensive Check: Ensure only one club can exist per placeId
    try {
      const existingDTO = await clubService.getClubByPlaceId(clubData.placeId, clubData.userUid);
      const existingClub = existingDTO?.club || existingDTO?.clubEntity;
      if (existingClub && existingClub.uid) {
        // Silently join the existing club instead of creating a duplicate
        await clubService.joinClub(existingClub.uid, clubData.userUid);
        return existingClub;
      }
    } catch (e) {
      console.error("Defensive placeId check failed:", e);
    }

    const GKEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const photoUrl = (ref) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${GKEY}`;

    // Extract top 2 photos from Google Places
    const profilePic = clubData.photos?.[0] ? {
      fullSizeURL: photoUrl(clubData.photos[0].photo_reference),
      thumbnailURL: photoUrl(clubData.photos[0].photo_reference)
    } : null;

    // coverPicUrl should be a simple string URL, not an ImageEntity object
    const coverPicUrl = clubData.photos?.[1] ? photoUrl(clubData.photos[1].photo_reference) : null;

    const clubPayload = {
      name: clubData.name,
      placeId: clubData.placeId,
      formattedAddress: clubData.formattedAddress,
      clubType: clubData.clubType || "club",
      isPrivate: false,          
      adminUid: null,           
      profilePic: profilePic,      
      coverPicUrl: coverPicUrl,   
    };

    if (clubData.lat !== undefined && clubData.lat !== null && clubData.lng !== undefined && clubData.lng !== null) {
      clubPayload.location = {
        lat: Number(clubData.lat),
        lng: Number(clubData.lng)
      };
    }

    return fetchMultipart("POST", "/club", {
      userUid: clubData.userUid,
      club: clubPayload,
    });
  },

  createGroup: async (groupData) => {
    const clubPayload = {
      name: groupData.name,
      placeId: groupData.placeId,
      formattedAddress: groupData.formattedAddress,
      clubType: "group",
      isPrivate: groupData.isPrivate || false,
      adminUid: groupData.adminUid,
      masterClubUid: groupData.masterClubUid,
      about: groupData.about || null,
      activities: groupData.activities || [],
      location: null,
      staticMapUrl: null,
      uid: null,
      phoneNumber: null,
      website: null,
      profilePic: null,
      coverPicUrl: null,
      coverPicAttributions: null,
      shortAddress: null,
      roomAlias: null,
    };

    if (groupData.lat !== undefined && groupData.lat !== null && groupData.lng !== undefined && groupData.lng !== null) {
      clubPayload.location = {
        lat: Number(groupData.lat),
        lng: Number(groupData.lng)
      };
    }

    return fetchMultipart(
      "POST",
      "/club",
      {
        userUid: groupData.userUid,
        club: clubPayload,
      },
      {
        profileImage: groupData.profileImage || null,
        coverImage: groupData.coverImage || null,
      },
    );
  },

  getUserClubs: async (userUid, page = 1, lat = null, lng = null) => {
    let url = `/clubMembership?page=${page}&userUid=${userUid}`;
    if (lat !== null && lng !== null) url += `&lat=${lat}&lng=${lng}`;
    const response = await playerApiClient.get(url);
    return response.data?.body?.result || [];
  },

  getClubById: async (clubId, userUid) => {
    const response = await playerApiClient.get(
      `/club?userUid=${userUid}&uid=${clubId}`,
    );
    return response.data?.body?.result || response.data;
  },

  getClubByPlaceId: async (placeId, userUid) => {
    try {
      // 1. Authoritative lookup matching the Flutter app endpoint
      const response = await playerApiClient.get(
        `/club?userUid=${userUid}&placeId=${placeId}&type=club`,
      );
      const result = response.data?.body?.result || response.data;
      if (result && (result.club?.uid || result.clubEntity?.uid)) {
        return result;
      }
    } catch (e) {
      console.warn("Authoritative placeId check failed, falling back to search API:", e);
    }

    try {
      // 2. Search fallback in case of 404/errors
      const searchResult = await clubService.searchClub(placeId);
      if (searchResult && searchResult.length > 0) {
        return {
          club: searchResult[0],
          clubEntity: searchResult[0]
        };
      }
    } catch (e) {
      console.error("Search API placeId check failed:", e);
    }

    return null;
  },

  // Update club
  updateClub: async (clubId, clubData) => {
    return fetchMultipart("PUT", `/club/${clubId}`, {
      club: {
        name: clubData.name,
        placeId: clubData.placeId,
        formattedAddress: clubData.formattedAddress,
        clubType: clubData.clubType,
        isPrivate: clubData.isPrivate,
      },
    });
  },

  // Delete a club
  deleteClub: async (clubId) => {
    const response = await playerApiClient.delete(`/club/${clubId}`);
    return response.data?.body?.result || response.data;
  },

  // Join a club
  joinClub: async (clubId, userUid) => {
    const token = await getToken();
    const response = await playerApiClient.post(
      "/club/membership",
      {
        userUid: userUid,
        clubUid: clubId,
        type: "belongs",
      },
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data?.body?.result || response.data;
  },

  // Leave a club
  leaveClub: async (clubId, userUid) => {
    const token = await getToken();
    const response = await playerApiClient.delete(
      `/club/membership?uid=${clubId}&userUid=${userUid}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        data: {
          clubUid: clubId,
          userUid: userUid,
          type: "belongs",
        },
      },
    );
    return response.data?.body?.result || response.data;
  },

  // Search clubs by place ID or name
  searchClub: async (placeId, name = null) => {
    try {
      let url = `/club/search?`;
      if (placeId) url += `placeId=${placeId}`;
      if (name) {
        url += placeId
          ? `&name=${encodeURIComponent(name)}`
          : `name=${encodeURIComponent(name)}`;
      }
      const response = await playerApiClient.get(url);
      return response.data?.body?.result || [];
    } catch (error) {
      console.error("Error searching club:", error);
      return [];
    }
  },

  // Save or join club (handles both new and existing clubs)
  saveOrJoinClub: async (clubData, userUid) => {
    try {
      const existingDTO = await clubService.getClubByPlaceId(clubData.placeId, userUid);
      const existingClub = existingDTO?.club || existingDTO?.clubEntity;

      if (existingClub && existingClub.uid) {
        await clubService.joinClub(existingClub.uid, userUid);
        return {
          success: true,
          action: "joined",
          club: existingClub,
          message: "Successfully joined existing club!",
        };
      } else {
        const newClub = await clubService.createClub({
          ...clubData,
          userUid,
          adminUid: null, // paid feature — disabled
        });
        return {
          success: true,
          action: "created",
          club: newClub,
          message: "Successfully created new club!",
        };
      }
    } catch (error) {
      console.error("Error in saveOrJoinClub:", error);
      throw error;
    }
  },
};