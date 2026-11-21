import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomeDashboard from "../app/page";

// Completely mock fetch synchronously to prevent unhandled promise hanging
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          location: "Delhi",
          country: "India",
          latitude: 28.6139,
          longitude: 77.209,
          aqi: 220,
          level: "Very Unhealthy",
          color: "text-purple-400",
          badgeBg: "",
          pm25: 160,
          pm10: 210,
          no2: 45,
          o3: 30,
          so2: 12,
          co: 500,
          timestamp: "12:00:00 PM",
          summary: "High pollution levels require indoor protocols.",
          success: true,
          data: {
            summary: "Sample AI summary",
            routinePlan: [],
            indoorHacks: [],
            familySpecificAdvice: "",
            quantifiedImpact: { co2SavedKg: 4, pm25AvoidedGram: 6, respiratoryRiskReduction: "70%", communityContribution: "" },
            actionableTakeaways: []
          }
        })
    })
  ) as jest.Mock;
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("HomeDashboard Accessibility & UI Tests", () => {
  it("renders main landmark and skip link for screen readers", () => {
    render(<HomeDashboard />);
    const skipLink = screen.getByText(/Skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("renders banner and application title with proper heading hierarchy", () => {
    render(<HomeDashboard />);
    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();
    expect(screen.getByText("AuraClean AI")).toBeInTheDocument();
  });

  it("renders tablist with correct ARIA accessibility attributes", () => {
    render(<HomeDashboard />);
    const tablist = screen.getByRole("tablist", { name: /Assistant Guidance Sections/i });
    expect(tablist).toBeInTheDocument();

    const routineTab = screen.getByRole("tab", { name: /Daily Routine & Transit/i });
    expect(routineTab).toBeInTheDocument();
    expect(routineTab).toHaveAttribute("aria-selected", "true");
  });

  it("renders interactive demographic toggle buttons with aria-pressed states", () => {
    render(<HomeDashboard />);
    const childrenBtn = screen.getByRole("button", { name: /Toggle Children demographic/i });
    expect(childrenBtn).toBeInTheDocument();
    expect(childrenBtn).toHaveAttribute("aria-pressed", "true");
  });
});
