/**
 * Categorize an alert based on its event type
 * @param {Object} alert - Alert object from NWS API
 * @returns {string} Category: earthquake, flood, wildfire, tornado, storm, or other
 */
export function categorizeAlert(alert) {
  // Input validation
  if (!alert || typeof alert !== "object") {
    console.error("Invalid alert object provided to categorizeAlert");
    return "other";
  }

  if (!alert.properties) {
    console.error("Alert missing properties:", alert);
    return "other";
  }

  const event = alert.properties.event?.toLowerCase() || "";
  const type = alert.properties.type?.toLowerCase() || "";

  // Earthquake alerts come from USGS, not NWS
  if (type === "earthquake") {
    return "earthquake";
  }

  // Flood-related events
  if (
    event.includes("flood") ||
    event.includes("flash flood") ||
    event.includes("river flood") ||
    event.includes("coastal flood") ||
    event.includes("flooding")
  ) {
    return "flood";
  }

  // Fire-related events
  if (
    event.includes("fire") ||
    event.includes("red flag") ||
    event.includes("extreme fire") ||
    event.includes("wildfire") ||
    event.includes("brush fire")
  ) {
    return "wildfire";
  }

  // Tornado-related events
  if (
    event.includes("tornado") ||
    event.includes("funnel cloud") ||
    event.includes("tornadic")
  ) {
    return "tornado";
  }

  // Storm-related events
  if (
    event.includes("thunderstorm") ||
    event.includes("severe weather") ||
    event.includes("wind") ||
    event.includes("hail") ||
    event.includes("storm") ||
    event.includes("hurricane") ||
    event.includes("tropical storm")
  ) {
    return "storm";
  }

  return "other";
}

/**
 * Get the centroid of a geometry (point or polygon)
 * @param {Object} geometry - GeoJSON geometry
 * @returns {Object} {latitude, longitude} or null
 */
export function getGeometryCentroid(geometry) {
  // Input validation
  if (!geometry || typeof geometry !== "object") {
    console.error("Invalid geometry object provided to getGeometryCentroid");
    return null;
  }

  if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
    console.error("Geometry missing coordinates array:", geometry);
    return null;
  }

  if (geometry.type === "Point") {
    const [lon, lat] = geometry.coordinates;
    if (typeof lon !== "number" || typeof lat !== "number") {
      console.error("Invalid Point coordinates:", geometry.coordinates);
      return null;
    }
    return { latitude: lat, longitude: lon };
  }

  if (geometry.type === "Polygon") {
    const coordinates = geometry.coordinates[0]; // Outer ring
    if (!Array.isArray(coordinates) || coordinates.length < 3) {
      console.error("Invalid Polygon coordinates:", coordinates);
      return null;
    }

    let latSum = 0;
    let lonSum = 0;
    let validPoints = 0;

    coordinates.forEach(([lon, lat]) => {
      if (typeof lon === "number" && typeof lat === "number") {
        latSum += lat;
        lonSum += lon;
        validPoints++;
      }
    });

    if (validPoints === 0) {
      console.error("No valid points in Polygon coordinates");
      return null;
    }

    return {
      latitude: latSum / validPoints,
      longitude: lonSum / validPoints,
    };
  }

  if (geometry.type === "MultiPolygon") {
    // Use first polygon for simplicity
    const firstPolygon = geometry.coordinates[0]?.[0];
    if (!Array.isArray(firstPolygon) || firstPolygon.length < 3) {
      console.error("Invalid MultiPolygon coordinates:", geometry.coordinates);
      return null;
    }

    let latSum = 0;
    let lonSum = 0;
    let validPoints = 0;

    firstPolygon.forEach(([lon, lat]) => {
      if (typeof lon === "number" && typeof lat === "number") {
        latSum += lat;
        lonSum += lon;
        validPoints++;
      }
    });

    if (validPoints === 0) {
      console.error("No valid points in MultiPolygon coordinates");
      return null;
    }

    return {
      latitude: latSum / validPoints,
      longitude: lonSum / validPoints,
    };
  }

  console.error("Unsupported geometry type:", geometry.type);
  return null;
}
