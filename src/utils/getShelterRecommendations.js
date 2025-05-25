import { makeOpenAIRequest } from "../config/api";
import { haversine } from "./distance";

export async function getShelterRecommendations(
  disasterType,
  userLocation,
  shelters
) {
  // Input validation
  if (!disasterType || typeof disasterType !== "string") {
    throw new Error("Invalid disaster type provided");
  }

  if (
    !userLocation ||
    typeof userLocation.latitude !== "number" ||
    typeof userLocation.longitude !== "number"
  ) {
    throw new Error("Invalid user location provided");
  }

  if (!Array.isArray(shelters) || shelters.length === 0) {
    throw new Error("No shelters provided for recommendations");
  }

  try {
    // Validate each shelter has required fields
    const validShelters = shelters.filter((shelter) => {
      return (
        shelter.id &&
        typeof shelter.latitude === "number" &&
        typeof shelter.longitude === "number" &&
        shelter.name
      );
    });

    if (validShelters.length === 0) {
      throw new Error("No valid shelters found in the provided data");
    }

    // Calculate distances for all shelters
    const sheltersWithDistance = validShelters.map((shelter) => ({
      ...shelter,
      distance: haversine(
        userLocation.latitude,
        userLocation.longitude,
        shelter.latitude,
        shelter.longitude
      ),
    }));

    // Limit to 10 closest shelters for API efficiency
    const sheltersWithDistanceSorted = sheltersWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    const prompt = `You are an expert in disaster safety and emergency management.

DISASTER: ${disasterType}
USER LOCATION: (${userLocation.latitude}, ${userLocation.longitude})

SHELTERS TO EVALUATE:
${JSON.stringify(sheltersWithDistanceSorted, null, 2)}

TASK: Rank these shelters from 1 (best) to ${
      sheltersWithDistanceSorted.length
    } (worst) for this specific disaster type.

RANKING CRITERIA for ${disasterType}:
${getDisasterCriteria(disasterType)}

REQUIRED OUTPUT FORMAT (return ONLY valid JSON):
[
  {
    "id": "shelter_id",
    "rank": 1,
    "score": 0.95,
    "reason": "Brief explanation why this shelter is ranked here"
  }
]

Return EXACTLY a JSON array with all ${
      sheltersWithDistanceSorted.length
    } shelters ranked.`;

    const messages = [
      {
        role: "system",
        content:
          "You are a disaster preparedness expert. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const data = await makeOpenAIRequest(messages, {
      temperature: 0.2, // Lower temperature for more consistent responses
      max_tokens: 1000,
    });

    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.error("Empty response from OpenAI");
      return getFallbackRankings(disasterType, userLocation, validShelters);
    }

    // Try to parse the JSON response with better error handling
    let rankings;
    try {
      // Clean the response in case there's extra text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      rankings = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      console.error("Parse error:", parseError);
      return getFallbackRankings(disasterType, userLocation, validShelters);
    }

    // Validate the response structure
    if (!Array.isArray(rankings) || rankings.length === 0) {
      console.error("Invalid rankings format:", rankings);
      return getFallbackRankings(disasterType, userLocation, validShelters);
    }

    // Merge rankings with original shelter data with validation
    const rankedShelters = rankings
      .map((ranking) => {
        if (!ranking.id || typeof ranking.rank !== "number") {
          console.error("Invalid ranking object:", ranking);
          return null;
        }

        const originalShelter = validShelters.find((s) => s.id === ranking.id);
        const shelterWithDistance = sheltersWithDistance.find(
          (s) => s.id === ranking.id
        );

        if (!originalShelter || !shelterWithDistance) {
          console.error(`Shelter not found: ${ranking.id}`);
          return null;
        }

        return {
          ...originalShelter,
          rank: ranking.rank,
          score:
            ranking.score ||
            1 - (ranking.rank - 1) / sheltersWithDistance.length,
          reason:
            ranking.reason || `Ranked #${ranking.rank} for ${disasterType}`,
          distance: shelterWithDistance.distance,
          aiAnalysis: ranking.reason,
        };
      })
      .filter(Boolean); // Remove any null entries

    if (rankedShelters.length === 0) {
      console.error("No valid ranked shelters after processing");
      return getFallbackRankings(disasterType, userLocation, validShelters);
    }

    // Sort by rank to ensure proper ordering
    return rankedShelters.sort((a, b) => a.rank - b.rank);
  } catch (error) {
    console.error("Error getting shelter recommendations:", error);
    return getFallbackRankings(disasterType, userLocation, shelters);
  }
}

function getDisasterCriteria(disasterType) {
  const criteria = {
    flood: `
- Elevation and height above flood level (MOST IMPORTANT)
- Distance from flood-prone areas
- Multi-story buildings preferred
- Avoid basements or ground floors`,

    earthquake: `
- Structural integrity and building codes compliance
- Distance from fault lines
- Newer construction preferred
- Open areas around building for safety`,

    wildfire: `
- Distance from fire-prone vegetation areas (MOST IMPORTANT)
- Concrete/brick construction preferred
- Access to water supply
- Clear evacuation routes`,

    tornado: `
- Underground or reinforced concrete structures (MOST IMPORTANT)
- Interior rooms without windows
- Lower floors preferred
- Avoid mobile structures`,

    hurricane: `
- Reinforced construction
- Elevated structures (above storm surge)
- Distance from coast
- Structural wind resistance`,

    none: `
- General structural integrity
- Accessibility
- Capacity for occupants
- Distance from user location`,
  };

  return criteria[disasterType] || criteria.none;
}

function getFallbackRankings(disasterType, userLocation, shelters) {
  console.log("Using fallback ranking method");

  return shelters
    .map((shelter) => {
      const distance = haversine(
        userLocation.latitude,
        userLocation.longitude,
        shelter.latitude,
        shelter.longitude
      );

      // Simple scoring based on distance and disaster type
      let score = Math.max(0, 1 - distance / 20); // Max useful distance 20km

      // Add disaster-specific bonuses
      if (
        disasterType === "flood" &&
        shelter.type &&
        shelter.type.toLowerCase().includes("multi")
      ) {
        score += 0.2;
      } else if (
        disasterType === "tornado" &&
        shelter.type &&
        (shelter.type.toLowerCase().includes("underground") ||
          shelter.type.toLowerCase().includes("reinforced"))
      ) {
        score += 0.3;
      }

      return {
        ...shelter,
        distance,
        score: Math.min(1, score),
        reason: `Distance-based ranking: ${distance.toFixed(1)}km away`,
        aiAnalysis: `This shelter is ${distance.toFixed(
          1
        )}km from your location and suitable for ${disasterType} emergencies based on distance.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((shelter, index) => ({
      ...shelter,
      rank: index + 1,
    }));
}
