import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { theme } from "../theme";
import { useAlerts } from "../contexts/AlertsContext";
import ChecklistModal from "../components/ChecklistModal";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";

const { width } = Dimensions.get("window");

const DISASTER_TYPES = [
  { id: "none", label: "No Disaster", icon: "✅" },
  { id: "flood", label: "Flood", icon: "🌊" },
  { id: "earthquake", label: "Earthquake", icon: "🌋" },
  { id: "wildfire", label: "Wildfire", icon: "🔥" },
  { id: "tornado", label: "Tornado", icon: "🌪️" },
  { id: "hurricane", label: "Hurricane", icon: "🌀" },
];

export default function HomeScreen({ navigation }) {
  const {
    refreshData,
    setUserLocation,
    getNearbyHazards,
    loading,
    lastUpdated,
    error,
  } = useAlerts();
  const [showChecklist, setShowChecklist] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [selectedDisaster, setSelectedDisaster] = useState("none");

  useEffect(() => {
    requestLocationPermission();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 10000, // 10 second timeout
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          // Auto-refresh data when location is obtained
          await refreshData();
        } catch (locationError) {
          console.error("Error getting current position:", locationError);
          Alert.alert(
            "Location Error",
            "Unable to get your current location. Using default location.",
            [{ text: "OK" }]
          );
          // Fallback to Cupertino, CA
          setUserLocation({
            latitude: 37.323,
            longitude: -122.0322,
          });
        }
      } else {
        Alert.alert(
          "Location Permission Required",
          "SafeSpot needs location access to provide accurate shelter recommendations. Using default location.",
          [{ text: "OK" }]
        );
        // Fallback to Cupertino, CA
        setUserLocation({
          latitude: 37.323,
          longitude: -122.0322,
        });
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert(
        "Location Services Error",
        "There was a problem accessing location services. Using default location.",
        [{ text: "OK" }]
      );
      setUserLocation({
        latitude: 37.323,
        longitude: -122.0322,
      });
    }
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  const nearbyHazards = getNearbyHazards();
  const hasNearbyHazards = nearbyHazards.length > 0;
  const criticalHazards = nearbyHazards.filter(
    (h) =>
      h.type === "earthquake" || h.type === "wildfire" || h.type === "tornado"
  );

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never updated";
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return "Just updated";
    if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    return `Updated ${date.toLocaleDateString()}`;
  };

  const getStatusInfo = () => {
    if (criticalHazards.length > 0) {
      return {
        status: "active",
        text: `${criticalHazards.length} Critical Alert${
          criticalHazards.length > 1 ? "s" : ""
        }`,
      };
    }
    if (hasNearbyHazards) {
      return {
        status: "warning",
        text: `${nearbyHazards.length} Active Alert${
          nearbyHazards.length > 1 ? "s" : ""
        }`,
      };
    }
    return { status: "safe", text: "All Clear" };
  };

  const statusInfo = getStatusInfo();

  const handleDisasterSelect = (disasterType) => {
    setSelectedDisaster(disasterType);
    if (disasterType !== "none") {
      navigation.navigate("Map", { disasterType });
    }
  };

  return (
    <LinearGradient
      colors={theme.gradients.background}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.textPrimary}
            colors={[theme.colors.textPrimary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>SafeSpot</Text>
            <Text style={styles.subtitle}>
              Real-time disaster monitoring & emergency shelter finder
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <StatusBadge
              status={statusInfo.status}
              text={statusInfo.text}
              size="large"
            />
          </View>
        </Animated.View>

        <Card style={styles.disasterSelector}>
          <Text style={styles.disasterSelectorTitle}>
            Select Current Disaster
          </Text>
          <View style={styles.disasterGrid}>
            {DISASTER_TYPES.map((disaster) => (
              <TouchableOpacity
                key={disaster.id}
                style={[
                  styles.disasterButton,
                  selectedDisaster === disaster.id &&
                    styles.disasterButtonSelected,
                ]}
                onPress={() => handleDisasterSelect(disaster.id)}
              >
                <Text style={styles.disasterIcon}>{disaster.icon}</Text>
                <Text
                  style={[
                    styles.disasterLabel,
                    selectedDisaster === disaster.id &&
                      styles.disasterLabelSelected,
                  ]}
                >
                  {disaster.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {hasNearbyHazards && (
          <Card style={styles.alertsCard}>
            <Text style={styles.alertsTitle}>Active Alerts</Text>
            <View style={styles.alertsList}>
              {nearbyHazards
                .map((hazard) => {
                  // Skip rendering if hazard is invalid
                  if (!hazard || !hazard.id) return null;

                  const disasterType = DISASTER_TYPES.find(
                    (d) => d.id === hazard.type
                  );
                  const icon = disasterType?.icon || "⚠️";
                  const title = hazard.title || "Unknown Alert";
                  const description =
                    hazard.description || "No additional details available";

                  return (
                    <View key={hazard.id} style={styles.alertItem}>
                      <Text style={styles.alertIcon}>{icon}</Text>
                      <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>{title}</Text>
                        <Text style={styles.alertDescription}>
                          {description}
                        </Text>
                      </View>
                    </View>
                  );
                })
                .filter(Boolean)}{" "}
              {/* Remove any null entries */}
            </View>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Emergency Checklist"
            onPress={() => setShowChecklist(true)}
            style={styles.checklistButton}
            textStyle={styles.checklistButtonText}
          />
        </View>

        <Text style={styles.lastUpdated}>{formatLastUpdated()}</Text>
      </ScrollView>

      <ChecklistModal
        visible={showChecklist}
        onClose={() => setShowChecklist(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  titleContainer: {
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.displayLarge,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textSecondary,
    opacity: 0.9,
  },
  statusContainer: {
    marginTop: theme.spacing.md,
  },
  disasterSelector: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  disasterSelectorTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  disasterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.spacing.xs,
  },
  disasterButton: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 3,
    aspectRatio: 1,
    margin: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.sm,
    ...theme.shadows.small,
  },
  disasterButtonSelected: {
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1.05 }],
  },
  disasterIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  disasterLabel: {
    ...theme.typography.labelMedium,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  disasterLabelSelected: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  alertsCard: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  alertsTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  alertsList: {
    gap: theme.spacing.md,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...theme.typography.labelLarge,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  alertDescription: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    marginBottom: theme.spacing.xl,
  },
  checklistButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.medium,
  },
  checklistButtonText: {
    ...theme.typography.labelLarge,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  lastUpdated: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
});
