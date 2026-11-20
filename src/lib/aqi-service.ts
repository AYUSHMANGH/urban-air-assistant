import { AQIData, getAQILevel } from "./aqi-types";

export async function fetchLiveAQI(lat: number, lon: number, locationName: string = "Selected Location", countryName: string = ""): Promise<AQIData> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    const rawAqi = current?.us_aqi ?? Math.round((current?.pm2_5 || 25) * 3);
    const aqi = Math.max(10, Math.min(500, Math.round(rawAqi)));
    const levelInfo = getAQILevel(aqi);

    return {
      location: locationName,
      country: countryName,
      latitude: lat,
      longitude: lon,
      aqi,
      level: levelInfo.level,
      color: levelInfo.color,
      badgeBg: levelInfo.badgeBg,
      pm25: current?.pm2_5 ?? 35,
      pm10: current?.pm10 ?? 60,
      no2: current?.nitrogen_dioxide ?? 25,
      o3: current?.ozone ?? 40,
      so2: current?.sulphur_dioxide ?? 10,
      co: current?.carbon_monoxide ?? 450,
      timestamp: current?.time ? new Date(current.time).toLocaleString() : new Date().toLocaleString(),
      summary: levelInfo.summary,
      isSimulated: false,
    };
  } catch {
    // Graceful fallback for offline / rate-limited situations
    const fallbackAqi = locationName.toLowerCase().includes("delhi") ? 385 :
                        locationName.toLowerCase().includes("lahore") ? 410 :
                        locationName.toLowerCase().includes("beijing") ? 165 : 75;
    const levelInfo = getAQILevel(fallbackAqi);

    return {
      location: locationName,
      country: countryName,
      latitude: lat,
      longitude: lon,
      aqi: fallbackAqi,
      level: levelInfo.level,
      color: levelInfo.color,
      badgeBg: levelInfo.badgeBg,
      pm25: Math.round(fallbackAqi * 0.75),
      pm10: Math.round(fallbackAqi * 1.3),
      no2: 45,
      o3: 32,
      so2: 18,
      co: 900,
      timestamp: new Date().toLocaleString(),
      summary: levelInfo.summary,
      isSimulated: true,
    };
  }
}
