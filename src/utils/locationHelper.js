// tri-business/src/utils/locationHelper.js

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API_KEY || '';

// Haversine Distance Formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// Mapbox Reverse Geocoding API
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=IN&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.features && data.features.length > 0) {
      const feature = data.features[0];
      const context = feature.context || [];
      
      let area = feature.text || '';
      let city = 'Bangalore';
      let state = 'Karnataka';
      let country = 'India';
      let pincode = '';

      context.forEach((item) => {
        if (item.id.startsWith('postcode')) {
          pincode = item.text;
        } else if (item.id.startsWith('place')) {
          city = item.text;
        } else if (item.id.startsWith('region')) {
          state = item.text;
        } else if (item.id.startsWith('country')) {
          country = item.text;
        } else if (item.id.startsWith('locality') || item.id.startsWith('neighborhood')) {
          area = item.text;
        }
      });

      if (!area || area.toLowerCase() === city.toLowerCase()) {
        area = feature.text || 'Selected Area';
      }

      const formattedAddress = `${area}, ${city}`;

      return {
        lat,
        lng,
        area,
        city,
        state,
        country,
        pincode,
        formattedAddress,
        lastUpdated: Date.now()
      };
    }
  } catch (err) {
    console.error('Error reverse geocoding in business helper:', err);
  }

  return {
    lat,
    lng,
    area: 'Selected Area',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    pincode: '560038',
    formattedAddress: 'Indiranagar, Bangalore',
    lastUpdated: Date.now()
  };
}

// GPS Location detection with Closeness Caching check
export function getGPSLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Check if there is a cached location in localStorage
          let cached = null;
          try {
            cached = JSON.parse(localStorage.getItem('triBusinessLocation') || 'null');
          } catch (_) {}

          // Check if cached coordinates are within 100 meters and newer than 30 days
          const distance = calculateDistance(cached?.lat, cached?.lng, latitude, longitude);
          const isRecent = cached?.lastUpdated && (Date.now() - cached.lastUpdated < 30 * 24 * 60 * 60 * 1000);

          if (distance !== null && distance < 0.1 && isRecent) {
            console.log('GPS coordinates matched local cache (<100m). Reusing cached address in business app.');
            resolve(cached);
            return;
          }

          const loc = await reverseGeocode(latitude, longitude);
          localStorage.setItem('triBusinessLocation', JSON.stringify(loc));
          resolve(loc);
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}
