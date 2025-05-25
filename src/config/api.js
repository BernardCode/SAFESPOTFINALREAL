// API Configuration
export const OPENAI_API_KEY =
  "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";

// OpenAI API Configuration
export const OPENAI_CONFIG = {
  model: "gpt-4o-mini", // Using a more cost-effective model
  temperature: 0.3, // Lower temperature for more consistent responses
  max_tokens: 500,
};

// API Endpoints
export const API_ENDPOINTS = {
  openai: "https://api.openai.com/v1/chat/completions",
  // Add other API endpoints here as needed
  nws: "https://api.weather.gov/alerts/active",
  usgs: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
};

// Helper function to validate API key
export function validateApiKey() {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
    console.warn("OpenAI API key appears to be invalid or missing");
    return false;
  }
  return true;
}

// Helper function to make OpenAI API calls with error handling
export async function makeOpenAIRequest(messages, options = {}) {
  if (!validateApiKey()) {
    throw new Error("Invalid OpenAI API key");
  }

  const response = await fetch(API_ENDPOINTS.openai, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || OPENAI_CONFIG.model,
      messages: messages,
      temperature: options.temperature || OPENAI_CONFIG.temperature,
      max_tokens: options.max_tokens || OPENAI_CONFIG.max_tokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenAI API error: ${response.status} - ${
        errorData.error?.message || "Unknown error"
      }`
    );
  }

  return response.json();
}
