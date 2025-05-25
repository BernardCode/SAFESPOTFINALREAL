import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polygon, Circle } from "react-native-maps";
import { theme } from "../theme";
import { useAlerts } from "../contexts/AlertsContext";
import { findNearestShelter } from "../utils/distance";
import { categorizeAlert, getGeometryCentroid } from "../utils/categorizeAlert";
import { analyzeShelter, getDisasterContext } from "../services/aiService";
import { getShelterRecommendations } from "../utils/getShelterRecommendations";

export default function MapScreen({ route }) {
  const { earthquakes, alerts, shelters, userLocation } = useAlerts();
  const [showLegend, setShowLegend] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    earthquake: true,
    flood: true,
    wildfire: true,
    tornado: true,
    storm: true,
    other: true,
  });
  const [rankedShelters, setRankedShelters] = useState([]);
  const [disasterContext, setDisasterContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const disasterType = route.params?.disasterType || "none";

  useEffect(() => {
    if (disasterType !== "none" && shelters.length > 0 && userLocation) {
      analyzeSheltersForDisaster();
      getDisasterGuidance();
    } else if (disasterType === "none") {
      // Reset analysis when no disaster is selected
      setRankedShelters([]);
      setDisasterContext("");
    }
  }, [disasterType, shelters, userLocation]);

  const analyzeSheltersForDisaster = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      console.log(`Analyzing shelters for ${disasterType}...`);

      // Use the getShelterRecommendations function for AI-powered ranking
      const recommendations = await getShelterRecommendations(
        disasterType,
        userLocation,
        shelters
      );

      setRankedShelters(recommendations);
      console.log(`Successfully analyzed ${recommendations.length} shelters`);
    } catch (error) {
      console.error("Error analyzing shelters:", error);
      setAnalysisError(error.message);

      // Fallback to basic distance-based ranking
      const fallbackShelters = shelters
        .map((shelter) => {
          const distance =
            findNearestShelter(userLocation, [shelter])?.distance || 0;
          return {
            ...shelter,
            distance,
            score: Math.max(0, 1 - distance / 20), // Simple distance-based score
            reason: `Distance-based fallback: ${distance.toFixed(1)}km away`,
            aiAnalysis: `This shelter is ${distance.toFixed(
              1
            )}km from your location.`,
          };
        })
        .sort((a, b) => b.score - a.score);

      setRankedShelters(fallbackShelters);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDisasterGuidance = async () => {
    try {
      const context = await getDisasterContext(disasterType, userLocation);
      setDisasterContext(context);
    } catch (error) {
      console.error("Error getting disaster context:", error);
      // Set default guidance based on disaster type
      setDisasterContext(getDefaultGuidance(disasterType));
    }
  };

  const getDefaultGuidance = (type) => {
    const guidance = {
      flood:
        "Move to higher ground immediately. Avoid walking through flood water.",
      earthquake: "Drop, Cover, and Hold On. Move away from falling hazards.",
      wildfire: "Evacuate immediately if ordered. Close windows and doors.",
      tornado: "Seek interior room on lowest floor. Stay away from windows.",
      hurricane: "Follow evacuation orders. Secure your property and evacuate.",
    };
    return (
      guidance[type] || "Follow local emergency guidance and stay informed."
    );
  };

  const bestShelter = rankedShelters.length > 0 ? rankedShelters[0] : null;

  const toggleLayer = (layer) => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const openDirections = (shelter) => {
    const url = `https://maps.google.com/maps?daddr=${shelter.latitude},${shelter.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open directions");
    });
  };

  const getHazardColor = (type) => {
    const colors = {
      earthquake: "#FF6B35",
      flood: "#4A90E2",
      wildfire: "#E94B3C",
      tornado: "#9B59B6",
      storm: "#F39C12",
      other: "#95A5A6",
    };
    return colors[type] || colors.other;
  };

  const renderEarthquakeMarkers = () => {
    if (!visibleLayers.earthquake || !earthquakes.length) return null;

    return earthquakes.map((earthquake) => {
      const [longitude, latitude] = earthquake.geometry.coordinates;
      const magnitude = earthquake.properties.mag;

      return (
        <Circle
          key={earthquake.id}
          center={{ latitude, longitude }}
          radius={magnitude * 5000} // magnitude * 5km in meters
          fillColor={`${getHazardColor("earthquake")}40`} // 25% opacity
          strokeColor={getHazardColor("earthquake")}
          strokeWidth={2}
        />
      );
    });
  };

  const renderAlertPolygons = () => {
    if (!alerts.length) return null;

    return alerts.map((alert) => {
      const category = categorizeAlert(alert);

      if (!visibleLayers[category]) return null;

      const geometry = alert.geometry;
      if (!geometry || geometry.type !== "Polygon") return null;

      const coordinates = geometry.coordinates[0].map(
        ([longitude, latitude]) => ({
          latitude,
          longitude,
        })
      );

      return (
        <Polygon
          key={alert.id}
          coordinates={coordinates}
          fillColor={`${getHazardColor(category)}40`} // 25% opacity
          strokeColor={getHazardColor(category)}
          strokeWidth={2}
        />
      );
    });
  };

  const renderShelterMarkers = () => {
    const sheltersToRender =
      rankedShelters.length > 0 ? rankedShelters : shelters;

    return sheltersToRender.map((shelter, index) => {
      // Color based on ranking (if available)
      let pinColor = "#2196F3"; // Default blue
      if (rankedShelters.length > 0) {
        if (index === 0) pinColor = "#4CAF50"; // Best shelter - green
        else if (index < 3) pinColor = "#FF9800"; // Top 3 - orange
        else pinColor = "#757575"; // Others - gray
      }

      return (
        <Marker
          key={shelter.id}
          coordinate={{
            latitude: shelter.latitude,
            longitude: shelter.longitude,
          }}
          title={shelter.name}
          description={`${shelter.type}${
            shelter.distance ? ` • ${shelter.distance.toFixed(1)}km away` : ""
          }${
            shelter.score
              ? ` • Score: ${(shelter.score * 100).toFixed(0)}%`
              : ""
          }`}
          pinColor={pinColor}
        />
      );
    });
  };

  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        // Fallback to Cupertino, CA
        latitude: 37.323,
        longitude: -122.0322,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {renderShelterMarkers()}
        {renderEarthquakeMarkers()}
        {renderAlertPolygons()}
      </MapView>

      {/* Loading Indicator */}
      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Analyzing shelters for {disasterType}...
          </Text>
        </View>
      )}

      {/* Error Message */}
      {analysisError && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>⚠️ Analysis Error</Text>
            <Text style={styles.errorText}>{analysisError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={analyzeSheltersForDisaster}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Legend Toggle Button */}
      <TouchableOpacity
        style={styles.legendButton}
        onPress={() => setShowLegend(!showLegend)}
      >
        <Text style={styles.legendButtonText}>{showLegend ? "✕" : "☰"}</Text>
      </TouchableOpacity>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Map Layers</Text>
          {Object.entries(visibleLayers).map(([layer, visible]) => (
            <TouchableOpacity
              key={layer}
              style={styles.legendItem}
              onPress={() => toggleLayer(layer)}
            >
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: getHazardColor(layer) },
                  !visible && styles.legendColorDisabled,
                ]}
              />
              <Text
                style={[
                  styles.legendText,
                  !visible && styles.legendTextDisabled,
                ]}
              >
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Shelter Legend */}
          <View style={styles.legendDivider} />
          <Text style={styles.legendSubtitle}>Shelters</Text>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#4CAF50" }]}
            />
            <Text style={styles.legendText}>Best Shelter</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#FF9800" }]}
            />
            <Text style={styles.legendText}>Good Options</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#757575" }]}
            />
            <Text style={styles.legendText}>Other Shelters</Text>
          </View>
        </View>
      )}

      {/* Best Shelter Card */}
      {bestShelter && disasterType !== "none" && (
        <View style={styles.shelterCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.shelterCardTitle}>
              🏆 Best Shelter for{" "}
              {disasterType.charAt(0).toUpperCase() + disasterType.slice(1)}
            </Text>
            <Text style={styles.shelterName}>{bestShelter.name}</Text>
            <Text style={styles.shelterType}>{bestShelter.type}</Text>
            {bestShelter.score && (
              <Text style={styles.shelterScore}>
                Safety Score: {(bestShelter.score * 100).toFixed(0)}%
              </Text>
            )}
            {bestShelter.distance && (
              <Text style={styles.shelterDistance}>
                📍 {bestShelter.distance.toFixed(1)} km away
              </Text>
            )}
            {bestShelter.aiAnalysis && (
              <Text style={styles.shelterAnalysis}>
                {bestShelter.aiAnalysis}
              </Text>
            )}
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => openDirections(bestShelter)}
            >
              <Text style={styles.directionsButtonText}>🧭 Get Directions</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Disaster Context Card */}
      {disasterContext && disasterType !== "none" && (
        <View style={styles.contextCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.contextTitle}>🛡️ Safety Guidelines</Text>
            <Text style={styles.contextText}>{disasterContext}</Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  legendButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: theme.colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  legendButtonText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  legend: {
    position: "absolute",
    top: 120,
    right: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minWidth: 180,
    maxHeight: "50%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  legendTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  legendSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  legendDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  legendColorDisabled: {
    opacity: 0.3,
  },
  legendText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  legendTextDisabled: {
    opacity: 0.5,
  },
  shelterCard: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  shelterCardTitle: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: "600",
  },
  shelterName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  shelterType: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  shelterDistance: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  shelterScore: {
    ...theme.typography.body2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: "600",
  },
  shelterAnalysis: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
  },
  directionsButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  directionsButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: theme.spacing.sm,
    ...theme.typography.body,
    textAlign: "center",
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  errorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    maxWidth: "90%",
  },
  errorTitle: {
    ...theme.typography.h3,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
  },
  retryButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: "600",
  },
  contextCard: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 140, // Leave space for legend button
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    maxHeight: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  contextTitle: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: "600",
  },
  contextText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    lineHeight: 16,
  },
});
