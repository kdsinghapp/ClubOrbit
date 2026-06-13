import { playerApiClient } from './apiClient';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY 

export const placeService = {
  searchPlaces: async (input, lat = null, lng = null) => {
    if (!input || input.trim().length < 2) return [];

    const params = new URLSearchParams({
      input: input.trim(),
      type: 'establishment',
      key: GOOGLE_API_KEY,
    });
    if (lat && lng) {
      params.set('location', `${lat},${lng}`);
      params.set('radius', '20000');
    }

    const response = await fetch(`/maps/autocomplete?${params}`);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places autocomplete error:', data.status, data.error_message);
      return [];
    }
    return data.predictions || [];
  },

  getPlaceDetails: async (placeId) => {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'formatted_address,address_components,name,geometry,website,international_phone_number,place_id,photos',
      key: GOOGLE_API_KEY,
    });

    const response = await fetch(`/maps/details?${params}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Place details error:', data.status, data.error_message);
      return null;
    }
    return data.result || null;
  },

  /**
   * Fetch nearby objects (clubs, events, etc.) from the backend.
   * Ported from GeoBloc.getNearbyObjects (Flutter)
   */
  getNearbyObjects: async ({
    filter = 'all',
    myLatitude,
    myLongitude,
    latitude = null,
    longitude = null,
    radius = 9999999999,
    activityUid = null,
    clubUid = null,
  }) => {
    try {
      const params = new URLSearchParams({
        myLatitude: myLatitude.toString(),
        myLongitude: myLongitude.toString(),
        latitude: latitude !== null ? latitude.toString() : myLatitude.toString(),
        longitude: longitude !== null ? longitude.toString() : myLongitude.toString(),
        radius: radius.toString(),
        filter: filter,
      });

      if (activityUid) params.set('activityUid', activityUid);
      if (clubUid) params.set('clubUid', clubUid);

      const response = await playerApiClient.get(`/mapping/nearbyObjects?${params}`);
      return response.data?.body?.result || [];
    } catch (error) {
      console.error('getNearbyObjects error:', error);
      throw error;
    }
  },

  /**
   * Construct a Google Places photo URL.
   * Ported from PlacesService.getPlacePhotoURI (Flutter)
   */
  getPlacePhotoURL: (photoReference, maxWidth = 400, maxHeight = null) => {
    if (!photoReference) return null;
    let url = `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
    if (maxWidth) url += `&maxwidth=${maxWidth}`;
    if (maxHeight) url += `&maxheight=${maxHeight}`;
    return url;
  },

  /**
   * Construct a Google Static Map URI.
   * Ported from StaticMapService.getUri (Flutter)
   */
  getStaticMapUri: (lat, lng, zoom = 14, size = '600x300') => {
    if (!lat || !lng) return null;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=color:red%7C${lat},${lng}&key=${GOOGLE_API_KEY}`;
  }
};