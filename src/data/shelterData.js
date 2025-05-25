// Sample shelter data for testing - replace with real data in production
export const SAMPLE_SHELTERS = [
  // San Francisco Bay Area Shelters
  {
    id: "sf_community_center_1",
    name: "Cupertino Community Center",
    type: "Community Center",
    address: "10350 Torre Ave, Cupertino, CA 95014",
    latitude: 37.323,
    longitude: -122.032,
    capacity: 500,
    elevation: 15,
    phone: "(408) 777-3100",
    features: [
      "Reinforced Structure",
      "Emergency Power",
      "Kitchen Facilities",
      "Medical Station",
    ],
  },
  {
    id: "sf_school_1",
    name: "Cupertino High School Gymnasium",
    type: "School Gymnasium",
    address: "10100 Finch Ave, Cupertino, CA 95014",
    latitude: 37.328,
    longitude: -122.041,
    capacity: 800,
    elevation: 12,
    phone: "(408) 522-8200",
    features: ["Large Open Space", "Restroom Facilities", "Parking"],
  },
  {
    id: "sf_fire_station_1",
    name: "Cupertino Fire Station 1",
    type: "Fire Station",
    address: "19990 Homestead Rd, Cupertino, CA 95014",
    latitude: 37.337,
    longitude: -122.043,
    capacity: 50,
    elevation: 20,
    phone: "(408) 299-2281",
    features: [
      "Emergency Services",
      "Medical Equipment",
      "Communication Center",
      "Reinforced Structure",
    ],
  },
  {
    id: "sf_library_1",
    name: "Cupertino Library Main Branch",
    type: "Public Library",
    address: "10800 Torre Ave, Cupertino, CA 95014",
    latitude: 37.321,
    longitude: -122.034,
    capacity: 200,
    elevation: 14,
    phone: "(408) 446-1677",
    features: ["Internet Access", "Reading Areas", "Meeting Rooms"],
  },
  {
    id: "sf_hospital_1",
    name: "Kaiser Permanente Santa Clara",
    type: "Medical Facility",
    address: "700 Lawrence Expy, Santa Clara, CA 95051",
    latitude: 37.354,
    longitude: -121.999,
    capacity: 300,
    elevation: 25,
    phone: "(408) 851-1000",
    features: [
      "Medical Care",
      "Emergency Power",
      "Water Supply",
      "Reinforced Structure",
    ],
  },
  {
    id: "sf_church_1",
    name: "St. Joseph Catholic Church",
    type: "Religious Facility",
    address: "10110 N Blaney Ave, Cupertino, CA 95014",
    latitude: 37.327,
    longitude: -122.032,
    capacity: 400,
    elevation: 18,
    phone: "(408) 252-7653",
    features: ["Large Assembly Hall", "Kitchen", "Parking", "Community Rooms"],
  },
  {
    id: "sf_park_center_1",
    name: "Memorial Park Community Center",
    type: "Park Facility",
    address: "1400 Roosevelt Ave, Cupertino, CA 95014",
    latitude: 37.318,
    longitude: -122.043,
    capacity: 300,
    elevation: 22,
    phone: "(408) 777-3120",
    features: ["Recreational Facilities", "Meeting Rooms", "Open Spaces"],
  },
  {
    id: "sf_shopping_center_1",
    name: "Vallco Shopping Center (Emergency Area)",
    type: "Commercial Center",
    address: "10123 N Wolfe Rd, Cupertino, CA 95014",
    latitude: 37.324,
    longitude: -122.009,
    capacity: 1000,
    elevation: 16,
    phone: "Emergency Use Only",
    features: ["Large Open Areas", "Parking", "Food Courts", "Restrooms"],
  },
  {
    id: "sf_college_1",
    name: "De Anza College Gymnasium",
    type: "College Facility",
    address: "21250 Stevens Creek Blvd, Cupertino, CA 95014",
    latitude: 37.315,
    longitude: -122.046,
    capacity: 600,
    elevation: 13,
    phone: "(408) 864-5678",
    features: [
      "Large Gymnasium",
      "Athletic Facilities",
      "Student Center",
      "Parking",
    ],
  },
  {
    id: "sf_senior_center_1",
    name: "Cupertino Senior Center",
    type: "Senior Center",
    address: "21251 Stevens Creek Blvd, Cupertino, CA 95014",
    latitude: 37.314,
    longitude: -122.047,
    capacity: 150,
    elevation: 14,
    phone: "(408) 777-3150",
    features: [
      "Accessible Design",
      "Medical Facilities",
      "Kitchen",
      "Quiet Areas",
    ],
  },
  // Additional shelters in surrounding areas
  {
    id: "sv_city_hall_1",
    name: "Sunnyvale City Hall",
    type: "Government Building",
    address: "456 W Olive Ave, Sunnyvale, CA 94086",
    latitude: 37.378,
    longitude: -122.025,
    capacity: 250,
    elevation: 28,
    phone: "(408) 730-7350",
    features: [
      "Reinforced Structure",
      "Emergency Communications",
      "Meeting Rooms",
    ],
  },
  {
    id: "mv_rec_center_1",
    name: "Mountain View Recreation Center",
    type: "Recreation Center",
    address: "201 S Rengstorff Ave, Mountain View, CA 94040",
    latitude: 37.394,
    longitude: -122.098,
    capacity: 400,
    elevation: 8,
    phone: "(650) 903-6331",
    features: ["Swimming Pool", "Gymnasium", "Multi-purpose Rooms"],
  },
  {
    id: "sc_convention_center_1",
    name: "Santa Clara Convention Center",
    type: "Convention Center",
    address: "5001 Great America Pkwy, Santa Clara, CA 95054",
    latitude: 37.403,
    longitude: -121.977,
    capacity: 2000,
    elevation: 12,
    phone: "(408) 748-7000",
    features: [
      "Massive Space",
      "Exhibition Halls",
      "Meeting Rooms",
      "Food Services",
    ],
  },
  {
    id: "pa_community_center_1",
    name: "Palo Alto Community Center",
    type: "Community Center",
    address: "1305 Middlefield Rd, Palo Alto, CA 94301",
    latitude: 37.444,
    longitude: -122.136,
    capacity: 350,
    elevation: 19,
    phone: "(650) 463-4900",
    features: ["Theater", "Meeting Rooms", "Kitchen Facilities", "Parking"],
  },
  {
    id: "fc_high_school_1",
    name: "Fremont High School",
    type: "High School",
    address: "1279 Sunnyvale Saratoga Rd, Sunnyvale, CA 94087",
    latitude: 37.368,
    longitude: -122.036,
    capacity: 700,
    elevation: 23,
    phone: "(408) 522-8500",
    features: ["Auditorium", "Gymnasium", "Cafeteria", "Large Campus"],
  },
];

// Function to get shelters with additional calculated properties
export function getEnhancedShelters() {
  return SAMPLE_SHELTERS.map((shelter) => ({
    ...shelter,
    // Add calculated properties
    structureType: getStructureType(shelter.type),
    safetyRating: calculateSafetyRating(shelter),
    accessibilityScore: calculateAccessibilityScore(shelter),
  }));
}

function getStructureType(type) {
  const typeMapping = {
    "Fire Station": "reinforced",
    "Medical Facility": "reinforced",
    "Government Building": "reinforced",
    "School Gymnasium": "concrete",
    "High School": "concrete",
    "College Facility": "concrete",
    "Convention Center": "large_span",
    "Community Center": "multi_story",
    "Public Library": "multi_story",
    "Recreation Center": "multi_story",
    "Religious Facility": "traditional",
    "Senior Center": "single_story",
    "Park Facility": "single_story",
    "Commercial Center": "commercial",
  };

  return typeMapping[type] || "standard";
}

function calculateSafetyRating(shelter) {
  let rating = 0.5; // Base rating

  // Structure type bonus
  const structureBonus = {
    reinforced: 0.3,
    concrete: 0.2,
    multi_story: 0.1,
    large_span: 0.1,
    traditional: 0.05,
    single_story: 0.0,
    commercial: 0.05,
    standard: 0.0,
  };

  const structureType = getStructureType(shelter.type);
  rating += structureBonus[structureType] || 0;

  // Capacity bonus (larger facilities often have better infrastructure)
  if (shelter.capacity > 500) rating += 0.1;
  else if (shelter.capacity > 200) rating += 0.05;

  // Elevation bonus (helps with flooding)
  if (shelter.elevation > 20) rating += 0.1;
  else if (shelter.elevation > 10) rating += 0.05;

  // Features bonus
  if (shelter.features) {
    if (shelter.features.includes("Emergency Power")) rating += 0.05;
    if (
      shelter.features.includes("Medical Equipment") ||
      shelter.features.includes("Medical Care")
    )
      rating += 0.05;
    if (shelter.features.includes("Reinforced Structure")) rating += 0.1;
  }

  return Math.min(1, rating);
}

function calculateAccessibilityScore(shelter) {
  let score = 0.5; // Base score

  // Type-based accessibility
  const accessibilityBonus = {
    "Senior Center": 0.3,
    "Medical Facility": 0.2,
    "Public Library": 0.2,
    "Government Building": 0.2,
    "Community Center": 0.15,
    "School Gymnasium": 0.1,
    "Recreation Center": 0.1,
  };

  score += accessibilityBonus[shelter.type] || 0;

  // Features that improve accessibility
  if (shelter.features) {
    if (shelter.features.includes("Accessible Design")) score += 0.2;
    if (shelter.features.includes("Parking")) score += 0.1;
    if (
      shelter.features.includes("Medical Station") ||
      shelter.features.includes("Medical Care")
    )
      score += 0.1;
  }

  return Math.min(1, score);
}
