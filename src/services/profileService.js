import { playerApiClient } from './apiClient';

export const getUserProfile = async (uid) => {
  try {
    const response = await playerApiClient.get(`/user?uid=${uid}`);
    console.log('Profile API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getCurrentUserProfile = async () => {
  try {
    const { auth } = await import('../firebase');
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    const response = await playerApiClient.get(`/user?uid=${user.uid}`);
    console.log('Current Profile API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData, profileImage = null) => {
  try {
    const { auth } = await import('../firebase');
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add the body with profile data
    const bodyData = {
      uid: user.uid,
      email: profileData.email || user.email,
      displayName: profileData.displayName,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      bio: profileData.bio,
      activities: profileData.activities || [],
      permissions: profileData.permissions || ["age", "gender", "fullName"]
    };

    // Add optional fields if they exist
    if (profileData.phone) bodyData.phone = profileData.phone;
    if (profileData.gender) bodyData.gender = profileData.gender;
    if (profileData.dateOfBirth) bodyData.dateOfBirth = profileData.dateOfBirth;

    // Use Blob with application/json to match backend expectations
    formData.append(
      'body',
      new Blob([JSON.stringify(bodyData)], { type: 'application/json' })
    );

    // Add profile image if provided
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    // Use native fetch to bypass Axios boundary-related parsing errors
    const token = await user.getIdToken();
    const { API_BASE_URL } = await import('../config/api');
    
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      const errMsg = data?.body?.error || data?.body?.message || 'Failed to update profile';
      throw new Error(errMsg);
    }

    console.log('Update Profile Response:', data);
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};


export const getUserMemberships = async (uid) => {
  try {
    const response = await playerApiClient.get(`/user?uid=${uid}`);
    const memberships = response.data?.body?.result?.userEntity?.memberships || [];
    console.log('Memberships API Response:', memberships);
    return memberships;
  } catch (error) {
    console.error('Error fetching user memberships:', error);
    throw error;
  }
};

export const getUserActivities = async (uid) => {
  try {
    const response = await playerApiClient.get(`/user?uid=${uid}`);
    const activities = response.data?.body?.result?.user?.activities || [];
    console.log('Activities API Response:', activities);
    return activities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

export const getUserChatInfo = async (uid) => {
  try {
    const response = await playerApiClient.get(`/user?uid=${uid}`);
    const chatUser = response.data?.body?.result?.chatUser || null;
    console.log('Chat Info API Response:', chatUser);
    return chatUser;
  } catch (error) {
    console.error('Error fetching user chat info:', error);
    throw error;
  }
};



