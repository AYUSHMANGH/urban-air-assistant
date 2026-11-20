import { NextRequest, NextResponse } from "next/server";
import { fetchLiveAQI } from "@/lib/aqi-service";
import { POPULAR_CITIES } from "@/lib/aqi-types";

// Geocode any city name worldwide to latitude & longitude using Open-Meteo's free geocoding API
async function geocodeCity(query: string): Promise<{ lat: number; lon: number; name: string; country: string } | null> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=1&language=en&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.results && data.results.length > 0) {
      const best = data.results[0];
      return {
        lat: best.latitude,
        lon: best.longitude,
        name: best.name,
        country: best.country || ""
      };
    }
    return null;
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get("city");
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  let lat = 28.6139;
  let lon = 77.2090;
  let location = "Delhi";
  let country = "India";

  if (latParam && lonParam) {
    lat = parseFloat(latParam);
    lon = parseFloat(lonParam);
    location = cityParam || "Custom Location";
  } else if (cityParam) {
    // 1. Check presets first
    const matched = POPULAR_CITIES.find(
      (c) => c.name.toLowerCase() === cityParam.trim().toLowerCase()
    );

    if (matched) {
      lat = matched.lat;
      lon = matched.lon;
      location = matched.name;
      country = matched.country;
    } else {
      // 2. Perform live Geocoding for ANY city input (e.g., Kolkata, Mumbai, Tokyo, etc.)
      const geocoded = await geocodeCity(cityParam);
      if (geocoded) {
        lat = geocoded.lat;
        lon = geocoded.lon;
        location = geocoded.name;
        country = geocoded.country;
      } else {
        location = cityParam;
      }
    }
  }

  const result = await fetchLiveAQI(lat, lon, location, country);
  return NextResponse.json(result);
}
