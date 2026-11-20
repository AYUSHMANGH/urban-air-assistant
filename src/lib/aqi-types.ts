export interface AQIData {
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  aqi: number; // US AQI scale (0-500)
  level: "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy" | "Very Unhealthy" | "Hazardous";
  color: string;
  badgeBg: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  timestamp: string;
  summary: string;
  isSimulated?: boolean;
}

export interface PresetCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
  knownFor: string;
}

export const POPULAR_CITIES: PresetCity[] = [
  { name: "Delhi", country: "India", lat: 28.6139, lon: 77.2090, knownFor: "Severe Winter Smog & Agricultural Burning" },
  { name: "Lahore", country: "Pakistan", lat: 31.5497, lon: 74.3436, knownFor: "Dense Seasonal Inversion Smog" },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074, knownFor: "Winter Heating & Industrial Basin" },
  { name: "Ulaanbaatar", country: "Mongolia", lat: 47.9188, lon: 106.9176, knownFor: "Sub-zero Heating Stoves Smoke" },
  { name: "London", country: "UK", lat: 51.5074, lon: -0.1278, knownFor: "Urban Traffic & Maritime Inversions" },
  { name: "New York", country: "USA", lat: 40.7128, lon: -74.0060, knownFor: "Urban Congestion & Episodic Wildfire Influx" }
];

export function getAQILevel(aqi: number): { level: AQIData["level"]; color: string; badgeBg: string; summary: string } {
  if (aqi <= 50) {
    return {
      level: "Good",
      color: "text-emerald-500",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      summary: "Air quality is satisfactory, and air pollution poses little or no risk."
    };
  }
  if (aqi <= 100) {
    return {
      level: "Moderate",
      color: "text-amber-400",
      badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      summary: "Acceptable quality; sensitive individuals may experience slight respiratory irritation."
    };
  }
  if (aqi <= 150) {
    return {
      level: "Unhealthy for Sensitive Groups",
      color: "text-orange-500",
      badgeBg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      summary: "Members of sensitive groups may experience health effects. General public less likely affected."
    };
  }
  if (aqi <= 200) {
    return {
      level: "Unhealthy",
      color: "text-rose-500",
      badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      summary: "Everyone may begin to experience health effects; sensitive groups may experience serious effects."
    };
  }
  if (aqi <= 300) {
    return {
      level: "Very Unhealthy",
      color: "text-purple-400",
      badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      summary: "Health alert: everyone may experience more serious health effects. Keep doors and windows closed."
    };
  }
  return {
    level: "Hazardous",
    color: "text-red-700",
    badgeBg: "bg-red-900/30 border-red-600/40 text-red-300",
    summary: "Health warning of emergency conditions. Severe winter smog crisis. Avoid all outdoor activity."
  };
}
