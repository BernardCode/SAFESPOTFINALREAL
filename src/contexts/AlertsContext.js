import React, { createContext, useContext, useState, useEffect } from "react";
import { getEnhancedShelters } from "../data/shelterData";
import { isNearby } from "../utils/distance";

const AlertsContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }
  return context;
};

export const AlertsProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [earthquakes, setEarthquakes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Initialize shelters on mount
  useEffect(() => {
    initializeShelters();
  }, []);

  const initializeShelters = () => {
    try {
      const enhancedShelters = getEnhancedShelters();
      setShelters(enhancedShelters);
      console.log(`Loaded ${enhancedShelters.length} shelters`);
    } catch (error) {
      console.error("Error loading shelters:", error);
      setError("Failed to load shelter data");
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Refreshing alert data...");

      // Simulate API calls - replace with real APIs in production
      await Promise.all([fetchEarthquakes(), fetchWeatherAlerts()]);

      setLastUpdated(new Date().toISOString());
      console.log("Data refresh completed");
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(err.message || "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEarthquakes = async () => {
    try {
      // Sample earthquake data for testing
      const sampleEarthquakes = [
        {
          id: "eq_sample_1",
          geometry: {
            type: "Point",
            coordinates: [-122.1, 37.4], // Near user location
          },
          properties: {
            mag: 3.2,
            title: "M 3.2 - 5km E of Cupertino, CA",
            time: Date.now() - 3600000, // 1 hour ago
            place: "5km E of Cupertino, CA",
            type: "earthquake",
          },
        },
        {
          id: "eq_sample_2",
          geometry: {
            type: "Point",
            coordinates: [-122.0, 37.3],
          },
          properties: {
            mag: 2.8,
            title: "M 2.8 - 3km N of Sunnyvale, CA",
            time: Date.now() - 7200000, // 2 hours ago
            place: "3km N of Sunnyvale, CA",
            type: "earthquake",
          },
        },
      ];

      setEarthquakes(sampleEarthquakes);
    } catch (error) {
      console.error("Error fetching earthquakes:", error);
      throw new Error("Failed to fetch earthquake data");
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      // Sample weather alerts for testing
      const sampleAlerts = [
        {
          id: "alert_sample_1",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-122.2, 37.2],
                [-121.8, 37.2],
                [-121.8, 37.5],
                [-122.2, 37.5],
                [-122.2, 37.2],
              ],
            ],
          },
          properties: {
            event: "Flash Flood Warning",
            headline: "Flash Flood Warning issued for Santa Clara County",
            description:
              "Heavy rainfall may cause flash flooding in low-lying areas.",
            severity: "Severe",
            certainty: "Likely",
            urgency: "Immediate",
            expires: new Date(Date.now() + 6 * 3600000).toISOString(), // 6 hours from now
            areas: "Santa Clara County",
            sent: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          },
        },
      ];

      setAlerts(sampleAlerts);
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
      throw new Error("Failed to fetch weather alert data");
    }
  };

  const getNearbyHazards = (maxDistance = 50) => {
    if (!userLocation) return [];

    const nearbyHazards = [];

    // Check earthquakes
    earthquakes.forEach((earthquake) => {
      const [lon, lat] = earthquake.geometry.coordinates;
      if (
        isNearby(userLocation, { latitude: lat, longitude: lon }, maxDistance)
      ) {
        nearbyHazards.push({
          id: earthquake.id,
          type: "earthquake",
          event: earthquake.properties.title,
          magnitude: earthquake.properties.mag,
          location: earthquake.properties.place,
          time: earthquake.properties.time,
          coordinates: { latitude: lat, longitude: lon },
        });
      }
    });

    // Check weather alerts
    alerts.forEach((alert) => {
      // For polygons, check if user is within the alert area (simplified check)
      if (alert.geometry && alert.geometry.type === "Polygon") {
        const coords = alert.geometry.coordinates[0];
        const bounds = coords.reduce(
          (acc, [lon, lat]) => {
            return {
              minLat: Math.min(acc.minLat, lat),
              maxLat: Math.max(acc.maxLat, lat),
              minLon: Math.min(acc.minLon, lon),
              maxLon: Math.max(acc.maxLon, lon),
            };
          },
          {
            minLat: Infinity,
            maxLat: -Infinity,
            minLon: Infinity,
            maxLon: -Infinity,
          }
        );

        // Simple bounding box check
        if (
          userLocation.latitude >= bounds.minLat &&
          userLocation.latitude <= bounds.maxLat &&
          userLocation.longitude >= bounds.minLon &&
          userLocation.longitude <= bounds.maxLon
        ) {
          const eventType = alert.properties.event.toLowerCase();
          let hazardType = "other";
          if (eventType.includes("flood")) hazardType = "flood";
          else if (eventType.includes("fire")) hazardType = "wildfire";
          else if (eventType.includes("tornado")) hazardType = "tornado";
          else if (eventType.includes("storm") || eventType.includes("wind"))
            hazardType = "storm";

          nearbyHazards.push({
            id: alert.id,
            type: hazardType,
            event: alert.properties.event,
            headline: alert.properties.headline,
            description: alert.properties.description,
            severity: alert.properties.severity,
            urgency: alert.properties.urgency,
            expires: alert.properties.expires,
            sent: alert.properties.sent,
          });
        }
      }
    });

    return nearbyHazards.sort((a, b) => {
      // Sort by severity/magnitude
      if (a.type === "earthquake" && b.type === "earthquake") {
        return (b.magnitude || 0) - (a.magnitude || 0);
      }

      const severityOrder = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1 };
      const aSeverity = severityOrder[a.severity] || 0;
      const bSeverity = severityOrder[b.severity] || 0;

      return bSeverity - aSeverity;
    });
  };

  const getNearbyShelters = (maxDistance = 25) => {
    if (!userLocation) return shelters;

    return shelters.filter((shelter) =>
      isNearby(
        userLocation,
        { latitude: shelter.latitude, longitude: shelter.longitude },
        maxDistance
      )
    );
  };

  const contextValue = {
    // Data
    userLocation,
    shelters,
    earthquakes,
    alerts,

    // State
    loading,
    error,
    lastUpdated,

    // Actions
    setUserLocation,
    refreshData,

    // Computed values
    getNearbyHazards,
    getNearbyShelters,
  };

  return (
    <AlertsContext.Provider value={contextValue}>
      {children}
    </AlertsContext.Provider>
  );
};
