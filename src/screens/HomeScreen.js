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
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
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
          {/* App Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>SafeSpot</Text>
            <Text style={styles.subtitle}>
              Real-time disaster monitoring & emergency shelter finder
            </Text>
          </View>

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <StatusBadge
              status={statusInfo.status}
              text={statusInfo.text}
              size="large"
            />
          </View>
        </Animated.View>

        {/* Disaster Selector */}
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

        {/* Location Status */}
        {locationPermission === false && (
          <Card variant="warning" style={styles.alertCard}>
            <Text style={styles.alertTitle}>📍 Location Access Required</Text>
            <Text style={styles.alertText}>
              Enable location permissions for personalized disaster alerts and
              nearby shelter recommendations.
            </Text>
            <Button
              title="Enable Location"
              variant="outline"
              size="small"
              onPress={() => requestLocationPermission()}
              style={styles.alertButton}
            />
          </Card>
        )}

        {/* Critical Hazard Alert */}
        {criticalHazards.length > 0 && (
          <Card variant="danger" style={styles.criticalAlert}>
            <Text style={styles.criticalAlertTitle}>⚠️ CRITICAL ALERT</Text>
            <Text style={styles.criticalAlertText}>
              {criticalHazards[0].event} detected in your area
            </Text>
            <Button
              title="View on Map"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate("Map")}
              style={styles.criticalAlertButton}
            />
          </Card>
        )}

        {/* Main Action Cards */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Map")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#DC2626", "#EF4444"]}
              style={styles.actionCardGradient}
            >
              <Text style={styles.actionCardIcon}>🗺️</Text>
              <Text style={styles.actionCardTitle}>Current Hazards</Text>
              <Text style={styles.actionCardSubtitle}>
                {nearbyHazards.length} active alerts nearby
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Shelters")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#2563EB", "#3B82F6"]}
              style={styles.actionCardGradient}
            >
              <Text style={styles.actionCardIcon}>🏠</Text>
              <Text style={styles.actionCardTitle}>Find Shelter</Text>
              <Text style={styles.actionCardSubtitle}>
                Emergency shelters near you
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => setShowChecklist(true)}
          >
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📋</Text>
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Emergency Checklists</Text>
              <Text style={styles.quickActionSubtitle}>
                Safety guidelines for disasters
              </Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={handleRefresh}
            disabled={loading}
          >
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>🔄</Text>
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Refresh Data</Text>
              <Text style={styles.quickActionSubtitle}>
                {formatLastUpdated()}
              </Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Error State */}
        {error && (
          <Card variant="danger" style={styles.errorCard}>
            <Text style={styles.errorTitle}>⚠️ Connection Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              variant="outline"
              size="small"
              onPress={handleRefresh}
              loading={loading}
              style={styles.errorButton}
            />
          </Card>
        )}
      </ScrollView>

      {/* Checklist Modal */}
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
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.displayLarge,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textSecondary,
    textAlign: "center",
    maxWidth: width * 0.8,
  },
  statusContainer: {
    alignItems: "center",
  },
  alertCard: {
    marginBottom: theme.spacing.lg,
  },
  alertTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  alertText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  alertButton: {
    alignSelf: "flex-start",
  },
  criticalAlert: {
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  criticalAlertTitle: {
    ...theme.typography.h2,
    color: "#FFFFFF",
    marginBottom: theme.spacing.sm,
    fontWeight: "700",
  },
  criticalAlertText: {
    ...theme.typography.bodyLarge,
    color: "#FFFFFF",
    marginBottom: theme.spacing.md,
  },
  criticalAlertButton: {
    alignSelf: "flex-start",
  },
  actionGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    ...theme.shadows.medium,
  },
  actionCardGradient: {
    padding: theme.spacing.lg,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  actionCardIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.md,
  },
  actionCardTitle: {
    ...theme.typography.h3,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  actionCardSubtitle: {
    ...theme.typography.bodySmall,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  quickActionsCard: {
    marginBottom: theme.spacing.lg,
  },
  quickActionsTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  quickActionIconText: {
    fontSize: 18,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  quickActionSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  quickActionArrow: {
    ...theme.typography.h2,
    color: theme.colors.textTertiary,
  },
  errorCard: {
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    ...theme.typography.h3,
    color: "#FFFFFF",
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.bodyMedium,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: theme.spacing.md,
  },
  errorButton: {
    alignSelf: "flex-start",
  },
  disasterSelector: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  disasterSelectorTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  disasterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  disasterButton: {
    width: (width - theme.spacing.md * 4) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disasterButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  disasterIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  disasterLabel: {
    ...theme.typography.body2,
    color: theme.colors.text,
    textAlign: "center",
  },
  disasterLabelSelected: {
    color: theme.colors.surface,
  },
});
