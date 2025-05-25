// Shelter ranking criteria for different disaster types
const disasterCriteria = {
  flood: {
    elevation: 1.0, // Higher elevation is better
    distance: 0.8, // Distance is important but not as critical as elevation
    structure: 0.6, // Structure type matters less than elevation
    capacity: 0.4, // Capacity is least important for floods
  },
  earthquake: {
    structure: 1.0, // Structure type is most important
    distance: 0.8, // Distance is very important
    elevation: 0.4, // Elevation matters less
    capacity: 0.6, // Capacity is moderately important
  },
  wildfire: {
    distance: 1.0, // Distance from fire is most important
    structure: 0.8, // Structure type is very important
    elevation: 0.6, // Elevation matters
    capacity: 0.4, // Capacity is less important
  },
  tornado: {
    structure: 1.0, // Underground or reinforced structure is most important
    distance: 0.8, // Distance is very important
    capacity: 0.6, // Capacity is moderately important
    elevation: 0.2, // Elevation matters least
  },
  hurricane: {
    structure: 1.0, // Structure type is most important
    elevation: 0.8, // Elevation is very important
    distance: 0.6, // Distance is moderately important
    capacity: 0.4, // Capacity is less important
  },
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Function to rank shelters based on disaster type and user location
export const rankShelters = (shelters, disasterType, userLocation) => {
  if (!shelters || !disasterType || !userLocation) return [];

  const criteria =
    disasterCriteria[disasterType] || disasterCriteria.earthquake; // Default to earthquake criteria

  return shelters
    .map((shelter) => {
      // Calculate distance score (closer is better)
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        shelter.latitude,
        shelter.longitude
      );
      const distanceScore = Math.max(0, 1 - distance / 10); // Normalize to 0-1, max 10km

      // Calculate elevation score (higher is better for floods)
      const elevationScore = shelter.elevation
        ? Math.min(1, shelter.elevation / 100) // Normalize to 0-1, max 100m
        : 0.5; // Default score if elevation unknown

      // Calculate structure score based on disaster type
      let structureScore = 0.5; // Default score
      if (shelter.structureType) {
        switch (disasterType) {
          case "flood":
            structureScore =
              shelter.structureType === "high_rise"
                ? 1.0
                : shelter.structureType === "multi_story"
                ? 0.8
                : shelter.structureType === "single_story"
                ? 0.4
                : 0.5;
            break;
          case "earthquake":
            structureScore =
              shelter.structureType === "reinforced"
                ? 1.0
                : shelter.structureType === "concrete"
                ? 0.8
                : shelter.structureType === "wood"
                ? 0.4
                : 0.5;
            break;
          case "tornado":
            structureScore =
              shelter.structureType === "underground"
                ? 1.0
                : shelter.structureType === "reinforced"
                ? 0.8
                : shelter.structureType === "concrete"
                ? 0.6
                : 0.4;
            break;
          // Add more cases for other disaster types
        }
      }

      // Calculate capacity score
      const capacityScore = shelter.capacity
        ? Math.min(1, shelter.capacity / 1000) // Normalize to 0-1, max 1000 people
        : 0.5; // Default score if capacity unknown

      // Calculate final score using weighted criteria
      const finalScore =
        distanceScore * criteria.distance +
        elevationScore * criteria.elevation +
        structureScore * criteria.structure +
        capacityScore * criteria.capacity;

      return {
        ...shelter,
        score: finalScore,
        distance,
        rankingDetails: {
          distanceScore,
          elevationScore,
          structureScore,
          capacityScore,
        },
      };
    })
    .sort((a, b) => b.score - a.score); // Sort by score in descending order
};
