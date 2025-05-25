/**
 * Calculate the Haversine distance between two points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function haversine(lat1, lon1, lat2, lon2) {
  // Input validation
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  ) {
    console.error("Invalid coordinates provided to haversine:", {
      lat1,
      lon1,
      lat2,
      lon2,
    });
    return Infinity;
  }

  // Validate coordinate ranges
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
    console.error("Latitude out of range (-90 to 90):", { lat1, lat2 });
    return Infinity;
  }

  if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) {
    console.error("Longitude out of range (-180 to 180):", { lon1, lon2 });
    return Infinity;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Validate result
  if (!isFinite(distance) || distance < 0) {
    console.error("Invalid distance calculated:", distance);
    return Infinity;
  }

  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRad(degrees) {
  if (typeof degrees !== "number") {
    console.error("Invalid degrees provided to toRad:", degrees);
    return 0;
  }
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest shelter to a given location
 * @param {Object} userLocation - {latitude, longitude}
 * @param {Array} shelters - Array of shelter objects
 * @returns {Object} Nearest shelter with distance
 */
export function findNearestShelter(userLocation, shelters) {
  // Input validation
  if (
    !userLocation ||
    typeof userLocation.latitude !== "number" ||
    typeof userLocation.longitude !== "number"
  ) {
    console.error(
      "Invalid user location provided to findNearestShelter:",
      userLocation
    );
    return null;
  }

  if (!Array.isArray(shelters) || shelters.length === 0) {
    console.error("No shelters provided to findNearestShelter");
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  shelters.forEach((shelter) => {
    if (
      !shelter ||
      typeof shelter.latitude !== "number" ||
      typeof shelter.longitude !== "number"
    ) {
      console.error("Invalid shelter coordinates:", shelter);
      return;
    }

    const distance = haversine(
      userLocation.latitude,
      userLocation.longitude,
      shelter.latitude,
      shelter.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...shelter, distance };
    }
  });

  return nearest;
}

/**
 * Check if two locations are within a specified distance
 * @param {Object} loc1 - First location {latitude, longitude}
 * @param {Object} loc2 - Second location {latitude, longitude}
 * @param {number} maxDistance - Maximum distance in kilometers
 * @returns {boolean} True if locations are within maxDistance
 */
export function isNearby(loc1, loc2, maxDistance) {
  // Input validation
  if (!loc1 || !loc2 || typeof maxDistance !== "number") {
    console.error("Invalid parameters provided to isNearby:", {
      loc1,
      loc2,
      maxDistance,
    });
    return false;
  }

  if (
    typeof loc1.latitude !== "number" ||
    typeof loc1.longitude !== "number" ||
    typeof loc2.latitude !== "number" ||
    typeof loc2.longitude !== "number"
  ) {
    console.error("Invalid location coordinates:", { loc1, loc2 });
    return false;
  }

  if (maxDistance <= 0) {
    console.error("Invalid maxDistance:", maxDistance);
    return false;
  }

  const distance = haversine(
    loc1.latitude,
    loc1.longitude,
    loc2.latitude,
    loc2.longitude
  );

  return distance <= maxDistance;
}
