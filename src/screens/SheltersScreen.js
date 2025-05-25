import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { useAlerts } from '../contexts/AlertsContext';
import { haversine } from '../utils/distance';

export default function SheltersScreen() {
  const { shelters, userLocation } = useAlerts();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedShelter, setExpandedShelter] = useState(null);

  const filteredShelters = shelters.filter(shelter =>
    shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shelter.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sheltersWithDistance = filteredShelters.map(shelter => ({
    ...shelter,
    distance: userLocation ? haversine(
      userLocation.latitude,
      userLocation.longitude,
      shelter.latitude,
      shelter.longitude
    ) : null
  })).sort((a, b) => {
    if (!a.distance || !b.distance) return 0;
    return a.distance - b.distance;
  });

  const toggleExpanded = (shelterId) => {
    setExpandedShelter(expandedShelter === shelterId ? null : shelterId);
  };

  const openInMaps = (shelter) => {
    const url = `https://maps.google.com/maps?daddr=${shelter.latitude},${shelter.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps application');
    });
  };

  const renderShelterItem = ({ item: shelter }) => {
    const isExpanded = expandedShelter === shelter.id;
    
    return (
      <View style={styles.shelterItem}>
        <TouchableOpacity
          style={styles.shelterHeader}
          onPress={() => toggleExpanded(shelter.id)}
        >
          <View style={styles.shelterInfo}>
            <Text style={styles.shelterName}>{shelter.name}</Text>
            <Text style={styles.shelterType}>{shelter.type}</Text>
            {shelter.distance && (
              <Text style={styles.shelterDistance}>
                {shelter.distance.toFixed(1)} km away
              </Text>
            )}
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.shelterDetails}>
            <Text style={styles.shelterAddress}>{shelter.address}</Text>
            <Text style={styles.shelterCapacity}>
              Capacity: {shelter.capacity} people
            </Text>
            <Text style={styles.shelterCoordinates}>
              {shelter.latitude.toFixed(4)}, {shelter.longitude.toFixed(4)}
            </Text>
            
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={() => openInMaps(shelter)}
            >
              <Text style={styles.mapsButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search shelters..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {sheltersWithDistance.length} shelter{sheltersWithDistance.length !== 1 ? 's' : ''} found
        </Text>
        {userLocation && (
          <Text style={styles.resultsSubtext}>
            Sorted by distance from your location
          </Text>
        )}
      </View>

      {/* Shelters List */}
      <FlatList
        data={sheltersWithDistance}
        renderItem={renderShelterItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* No Results */}
      {sheltersWithDistance.length === 0 && searchQuery.length > 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>
            No shelters found matching "{searchQuery}"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    minHeight: 48,
  },
  resultsContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  resultsText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  resultsSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  shelterItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  shelterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    minHeight: 48,
  },
  shelterInfo: {
    flex: 1,
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
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  expandIcon: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.md,
  },
  shelterDetails: {
    padding: theme.spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  shelterAddress: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  shelterCapacity: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  shelterCoordinates: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.md,
  },
  mapsButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  mapsButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '600',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noResultsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
