import { NextRequest } from "next/server";
import { GET as getAQI } from "../app/api/aqi/route";
import { POST as postAssistant } from "../app/api/assistant/route";

describe("API Route Integration Tests", () => {
  it("GET /api/aqi should resolve custom city and return valid structure", async () => {
    const req = new NextRequest("http://localhost:3000/api/aqi?city=Kolkata");
    const res = await getAQI(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.location).toBe("Kolkata");
    expect(typeof data.aqi).toBe("number");
    expect(data.aqi).toBeGreaterThanOrEqual(10);
    expect(data.pm25).toBeDefined();
  });

  it("GET /api/aqi should fallback gracefully for arbitrary query", async () => {
    const req = new NextRequest("http://localhost:3000/api/aqi?city=NonExistentCityXYZ");
    const res = await getAQI(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("level");
  });

  it("POST /api/assistant should generate comprehensive adaptive response", async () => {
    const payload = {
      city: "Delhi",
      aqi: 320,
      level: "Hazardous",
      pollutants: { pm25: 190, pm10: 240, no2: 60, o3: 20 },
      familyProfile: { hasKids: true, hasElderly: true, hasAsthma: true, petOwner: true },
      lifestyle: "Commute: Public Metro",
      userQuery: "Are schools safe today?"
    };

    const req = new NextRequest("http://localhost:3000/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const res = await postAssistant(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.routinePlan.length).toBeGreaterThanOrEqual(3);
    expect(json.data.indoorHacks.length).toBeGreaterThanOrEqual(3);
    expect(json.data.quantifiedImpact.co2SavedKg).toBeGreaterThan(0);
    expect(json.data.actionableTakeaways.length).toBeGreaterThan(0);
  });

  it("POST /api/assistant handles empty payloads without crashing", async () => {
    const req = new NextRequest("http://localhost:3000/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    });

    const res = await postAssistant(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.summary).toBeDefined();
  });
});
