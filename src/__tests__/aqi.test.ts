import { getAQILevel } from "../lib/aqi-types";
import { fetchLiveAQI } from "../lib/aqi-service";

describe("Urban Air Quality Assistant Test Suite", () => {
  describe("AQI Calculation and Health Severity Levels", () => {
    it("should classify AQI <= 50 as Good", () => {
      const res = getAQILevel(35);
      expect(res.level).toBe("Good");
      expect(res.color).toContain("emerald");
    });

    it("should classify AQI 51-100 as Moderate", () => {
      const res = getAQILevel(75);
      expect(res.level).toBe("Moderate");
    });

    it("should classify AQI 101-150 as Unhealthy for Sensitive Groups", () => {
      const res = getAQILevel(130);
      expect(res.level).toBe("Unhealthy for Sensitive Groups");
    });

    it("should classify AQI 151-200 as Unhealthy", () => {
      const res = getAQILevel(180);
      expect(res.level).toBe("Unhealthy");
    });

    it("should classify AQI 201-300 as Very Unhealthy", () => {
      const res = getAQILevel(250);
      expect(res.level).toBe("Very Unhealthy");
    });

    it("should classify severe winter smog AQI > 300 as Hazardous", () => {
      const res = getAQILevel(420);
      expect(res.level).toBe("Hazardous");
      expect(res.summary).toContain("emergency conditions");
    });
  });

  describe("API Resilience and Fallbacks", () => {
    it("should return valid structured AQI data even if location is simulated", async () => {
      const result = await fetchLiveAQI(22.57, 88.36, "Kolkata", "India");
      expect(result).toBeDefined();
      expect(result.location).toBe("Kolkata");
      expect(result.aqi).toBeGreaterThanOrEqual(10);
      expect(result.aqi).toBeLessThanOrEqual(500);
      expect(typeof result.pm25).toBe("number");
      expect(typeof result.summary).toBe("string");
    });
  });
});
