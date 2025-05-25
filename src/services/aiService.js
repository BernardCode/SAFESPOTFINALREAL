import { OPENAI_API_KEY, OPENAI_CONFIG, API_ENDPOINTS } from "../config/api";
import { haversine } from "../utils/distance";

/**
 * Analyze a shelter's suitability for a specific disaster type
 * @param {Object} shelter - Shelter object
 * @param {string} disasterType - Type of disaster
 * @param {Object} userLocation - User's current location
 * @returns {Object} Analyzed shelter with score and analysis
 */
export async function analyzeShelter(shelter, disasterType, userLocation) {
  try {
    const distance = haversine(
      userLocation.latitude,
      userLocation.longitude,
      shelter.latitude,
      shelter.longitude
    );

    // Calculate base score based on disaster type and shelter characteristics
    const baseScore = calculateBaseScore(shelter, disasterType, distance);

    // Use AI to provide detailed analysis
    const aiAnalysis = await getAIAnalysis(shelter, disasterType, distance);

    return {
      shelter: {
        ...shelter,
        distance: distance,
        score: baseScore,
        aiAnalysis:
          aiAnalysis ||
          `This shelter is ${distance.toFixed(
            1
          )}km away and suitable for ${disasterType} emergencies.`,
      },
    };
  } catch (error) {
    console.error("Error analyzing shelter:", error);

    // Fallback calculation without AI
    const distance = haversine(
      userLocation.latitude,
      userLocation.longitude,
      shelter.latitude,
      shelter.longitude
    );

    const baseScore = calculateBaseScore(shelter, disasterType, distance);

    return {
      shelter: {
        ...shelter,
        distance: distance,
        score: baseScore,
        aiAnalysis: `This shelter is ${distance.toFixed(
          1
        )}km away. Distance-based recommendation for ${disasterType}.`,
      },
    };
  }
}

/**
 * Get disaster-specific safety context and guidance
 * @param {string} disasterType - Type of disaster
 * @param {Object} userLocation - User's current location
 * @returns {string} Safety guidance text
 */
export async function getDisasterContext(disasterType, userLocation) {
  try {
    const prompt = `Provide concise safety guidelines for a ${disasterType} emergency. Include:
1. Immediate safety actions
2. What to look for in a safe shelter
3. Items to bring if evacuating
Keep response under 150 words and practical.`;

    const response = await fetch(API_ENDPOINTS.openai, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: "system",
            content:
              "You are an emergency preparedness expert providing concise, actionable safety advice.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content || getDefaultGuidance(disasterType)
    );
  } catch (error) {
    console.error("Error getting disaster context:", error);
    return getDefaultGuidance(disasterType);
  }
}

/**
 * Get AI analysis for a specific shelter
 * @param {Object} shelter - Shelter object
 * @param {string} disasterType - Type of disaster
 * @param {number} distance - Distance to shelter in km
 * @returns {string} AI analysis text
 */
async function getAIAnalysis(shelter, disasterType, distance) {
  try {
    const prompt = `Analyze this shelter for a ${disasterType} emergency:
- Name: ${shelter.name}
- Type: ${shelter.type || "Emergency Shelter"}
- Distance: ${distance.toFixed(1)}km
- Capacity: ${shelter.capacity || "Unknown"} people

Provide a brief analysis (50 words max) of why this shelter is suitable or not for ${disasterType}.`;

    const response = await fetch(API_ENDPOINTS.openai, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: "system",
            content:
              "You are a disaster preparedness expert. Provide concise shelter analysis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 80,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content;
  } catch (error) {
    console.error("Error getting AI analysis:", error);
    return null;
  }
}

/**
 * Calculate base score for shelter based on disaster type
 * @param {Object} shelter - Shelter object
 * @param {string} disasterType - Type of disaster
 * @param {number} distance - Distance in km
 * @returns {number} Score between 0 and 1
 */
function calculateBaseScore(shelter, disasterType, distance) {
  let score = 0.5; // Base score

  // Distance factor (closer is better, max useful distance is 20km)
  const distanceFactor = Math.max(0, 1 - distance / 20);
  score += distanceFactor * 0.3;

  // Capacity factor
  if (shelter.capacity) {
    const capacityFactor = Math.min(1, shelter.capacity / 1000);
    score += capacityFactor * 0.1;
  }

  // Disaster-specific factors
  switch (disasterType) {
    case "flood":
      // Higher elevation is better for floods
      if (shelter.elevation && shelter.elevation > 10) {
        score += 0.2;
      }
      // Multi-story buildings are better
      if (shelter.type && shelter.type.toLowerCase().includes("multi")) {
        score += 0.1;
      }
      break;

    case "earthquake":
      // Newer, reinforced buildings are better
      if (
        shelter.type &&
        (shelter.type.toLowerCase().includes("reinforced") ||
          shelter.type.toLowerCase().includes("concrete"))
      ) {
        score += 0.2;
      }
      break;

    case "wildfire":
      // Distance is most important for wildfires
      score += distanceFactor * 0.2;
      // Concrete/brick buildings are better
      if (
        shelter.type &&
        (shelter.type.toLowerCase().includes("concrete") ||
          shelter.type.toLowerCase().includes("brick"))
      ) {
        score += 0.1;
      }
      break;

    case "tornado":
      // Underground or reinforced structures are best
      if (
        shelter.type &&
        (shelter.type.toLowerCase().includes("underground") ||
          shelter.type.toLowerCase().includes("reinforced"))
      ) {
        score += 0.3;
      }
      break;

    case "hurricane":
      // Reinforced, elevated structures
      if (shelter.elevation && shelter.elevation > 5) {
        score += 0.1;
      }
      if (shelter.type && shelter.type.toLowerCase().includes("reinforced")) {
        score += 0.2;
      }
      break;
  }

  return Math.min(1, Math.max(0, score));
}

/**
 * Get default safety guidance for disaster types
 * @param {string} disasterType - Type of disaster
 * @returns {string} Default guidance text
 */
function getDefaultGuidance(disasterType) {
  const guidance = {
    flood:
      "Move to higher ground immediately. Avoid walking or driving through flood water. Bring emergency supplies, important documents, and medications. Stay away from electrical equipment if you're wet.",

    earthquake:
      "Drop, Cover, and Hold On during shaking. After shaking stops, evacuate if building is damaged. Watch for aftershocks. Bring emergency kit with water, food, flashlight, and first aid supplies.",

    wildfire:
      "Evacuate immediately if ordered. Close all windows and doors. Bring identification, medications, and important documents. If trapped, stay low to avoid smoke inhalation.",

    tornado:
      "Seek shelter in interior room on lowest floor. Stay away from windows. Cover yourself with blankets or mattress. Mobile homes are not safe - find sturdy building or underground shelter.",

    hurricane:
      "Evacuate if in evacuation zone. If staying, go to interior room away from windows. Have emergency supplies for several days. Watch for storm surge and flooding.",

    none: "Stay informed about local hazards. Keep emergency kit ready with water, food, flashlight, radio, and first aid supplies. Know your evacuation routes.",
  };

  return guidance[disasterType] || guidance.none;
}
