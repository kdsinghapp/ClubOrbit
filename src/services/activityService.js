import { playerApiClient, searchApiClient } from './apiClient';
import { auth } from "../firebase";

const getToken = async () => {
  try {
    if (auth.currentUser) return await auth.currentUser.getIdToken();
  } catch { }
  return localStorage.getItem("authToken");
};

export const activityService = {
  getActivityFeed: async () => {
    const response = await playerApiClient.get('/feed/activity');
    return response.data?.body?.result || [];
  },

  getPosts: async (refUid, page = 1) => {
    const response = await playerApiClient.get(`/post/club?uid=${refUid}&page=${page}`);
    return response.data?.body?.result || [];
  },

  likePost: async (postUid, userUid) => {
    const response = await playerApiClient.post('/post/like', {
      postUid,
      userUid,
      like: true
    });
    return response.data?.body?.result || response.data;
  },

  unlikePost: async (postUid, userUid) => {
    const response = await playerApiClient.post('/post/like', {
      postUid,
      userUid,
      like: false
    });
    return response.data?.body?.result || response.data;
  },

  getPostComments: async (postUid, page = 1) => {
    const response = await playerApiClient.get(`/comment?postUid=${postUid}&page=${page}`);
    return response.data?.body?.result || [];
  },

  addComment: async (postUid, userUid, text, parentCommentUid = null) => {
    const response = await playerApiClient.post('/comment', {
      uid: null,
      userUid,
      timestamp: new Date().toISOString(),
      text,
      postUid,
      parentCommentUid
    });
    return response.data?.body?.result || response.data;
  },

  likeComment: async (postUid, userUid) => {
    const response = await playerApiClient.post('/comment/like', {
      postUid,
      userUid,
      like: true
    });
    return response.data?.body?.result || response.data;
  },


  unlikeComment: async (postUid, userUid) => {
    const response = await playerApiClient.post('/comment/like', {
      postUid,
      userUid,
      like: false
    });
    return response.data?.body?.result || response.data;
  },

  blockUser: async (category, reporterEmail, targetEmail, objectUid) => {
    const response = await playerApiClient.post('/blockUser', {
      category,
      reporterEmail,
      targetEmail,
      objectUid
    });
    return response.data?.body?.result || response.data;
  },

  reportUser: async (category, reporterEmail, targetEmail, message, objectUid) => {
    const response = await playerApiClient.post('/reportUser', {
      category,
      reporterEmail,
      targetEmail,
      message,
      objectUid
    });
    return response.data?.body?.result || response.data;
  },

  likeEvent: async (eventUid, userUid) => {
    const response = await playerApiClient.post("/eventSeries/like", {
      postUid: eventUid,
      userUid,
      like: true
    });
    return response.data?.body?.result || response.data;
  },

  unlikeEvent: async (eventUid, userUid) => {
    const response = await playerApiClient.post("/eventSeries/like", {
      postUid: eventUid,
      userUid,
      like: false
    });
    return response.data?.body?.result || response.data;
  },


  registerForEvent: async (eventUid) => {
    const response = await playerApiClient.post(`/feed/event/${eventUid}/register`);
    return response.data;
  },

  addPost: async (postData, images = []) => {
    const formData = new FormData();
    formData.append("body", JSON.stringify(postData));

    images.forEach((image) => {
      formData.append("galleryImages", image);
    });

    const response = await playerApiClient.post('/post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.body?.result || response.data;
  },

  searchActivities: async (pattern) => {
    try {
      const response = await searchApiClient.get(`/search/activity?namePattern=${encodeURIComponent(pattern)}`);
      const data = response.data;
      const activities = data?.body?.result?.activities || data?.result?.activities || data?.activities || [];
      return activities;
    } catch (error) {
      console.error("Error in searchActivities:", error);
      return [];
    }
  },
};