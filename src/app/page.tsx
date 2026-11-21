"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wind,
  ShieldAlert,
  Home,
  Users,
  Compass,
  Sparkles,
  RefreshCw,
  TrendingDown,
  HeartPulse,
  Leaf,
  CheckCircle2,
  Clock,
  Car,
  Baby,
  Activity,
  Search,
  Zap,
  Info
} from "lucide-react";
import { AQIData, POPULAR_CITIES, PresetCity } from "@/lib/aqi-types";

export interface AssistantResponse {
  summary: string;
  routinePlan: Array<{
    timeSlot: string;
    recommendation: string;
    emissionTip: string;
  }>;
  indoorHacks: Array<{
    title: string;
    description: string;
    budget: string;
    impact: string;
  }>;
  familySpecificAdvice: string;
  quantifiedImpact: {
    co2SavedKg: number;
    pm25AvoidedGram: number;
    respiratoryRiskReduction: string;
    communityContribution: string;
  };
  actionableTakeaways: string[];
}

export default function HomeDashboard() {
  const [selectedCity, setSelectedCity] = useState<PresetCity>(POPULAR_CITIES[0]);
  const [customCity, setCustomCity] = useState("");
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loadingAqi, setLoadingAqi] = useState(false);
  
  // Family & Lifestyle profile
  const [hasKids, setHasKids] = useState(true);
  const [hasElderly, setHasElderly] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(true);
  const [petOwner, setPetOwner] = useState(false);
  const [commuteMode, setCommuteMode] = useState("Public Metro / Bus");
  const [userQuery, setUserQuery] = useState("");

  // AI Assistant state
  const [assistantData, setAssistantData] = useState<AssistantResponse | null>(null);
  const [engineUsed, setEngineUsed] = useState<string>("");
  const [loadingAssistant, setLoadingAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState<"routine" | "hacks" | "impact">("routine");

  // Generate Assistant Advice
  const generateRecommendations = useCallback(async (currentAqi: AQIData | null = aqiData) => {
    const targetAqi = currentAqi || aqiData || {
      location: selectedCity.name,
      country: selectedCity.country,
      aqi: 220,
      level: "Very Unhealthy" as const,
      pm25: 160,
      pm10: 210,
      no2: 45,
      o3: 30,
      color: "text-purple-400",
      badgeBg: "",
      latitude: selectedCity.lat,
      longitude: selectedCity.lon,
      so2: 12,
      co: 500,
      timestamp: new Date().toLocaleTimeString(),
      summary: "High pollution levels require indoor protocols."
    };

    setLoadingAssistant(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: targetAqi.location,
          aqi: targetAqi.aqi,
          level: targetAqi.level,
          pollutants: {
            pm25: targetAqi.pm25,
            pm10: targetAqi.pm10,
            no2: targetAqi.no2,
            o3: targetAqi.o3
          },
          familyProfile: {
            hasKids,
            hasElderly,
            hasAsthma,
            petOwner
          },
          lifestyle: `Commute: ${commuteMode}`,
          userQuery
        })
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        setAssistantData(resData.data);
        setEngineUsed(resData.engine || "adaptive-engine");
      }
    } catch (err) {
      console.error("Failed generating assistant plan", err);
    } finally {
      setLoadingAssistant(false);
    }
  }, [aqiData, selectedCity, hasKids, hasElderly, hasAsthma, petOwner, commuteMode, userQuery]);

  // Fetch AQI
  const loadAQI = useCallback(async (cityObj: { name: string; lat?: number; lon?: number; country?: string }) => {
    setLoadingAqi(true);
    try {
      const query = cityObj.lat && cityObj.lon 
        ? `lat=${cityObj.lat}&lon=${cityObj.lon}&city=${encodeURIComponent(cityObj.name)}`
        : `city=${encodeURIComponent(cityObj.name)}`;
      
      const res = await fetch(`/api/aqi?${query}`);
      const data: AQIData = await res.json();
      setAqiData(data);
      generateRecommendations(data);
    } catch (e) {
      console.error("Failed to load AQI", e);
    } finally {
      setLoadingAqi(false);
    }
  }, [generateRecommendations]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch(`/api/aqi?lat=${selectedCity.lat}&lon=${selectedCity.lon}&city=${encodeURIComponent(selectedCity.name)}`);
        const data = await res.json();
        if (!ignore) {
          setAqiData(data);
          generateRecommendations(data);
        }
      } catch (err) {
        console.error("Init AQI error", err);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [selectedCity.lat, selectedCity.lon, selectedCity.name, generateRecommendations]);

  const handleCitySelect = (city: PresetCity) => {
    setSelectedCity(city);
    loadAQI(city);
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCity.trim()) return;
    const custom = { name: customCity.trim(), country: "Global" };
    loadAQI(custom);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Skip link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header role="banner" className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
            >
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  AuraClean AI
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  PromptWars Challenge 6
                </span>
              </div>
              <p className="text-xs text-slate-400">Urban Winter Smog &amp; Low-Emission Lifestyle Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              aria-live="polite"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg"
            >
              <Sparkles aria-hidden="true" className="w-3.5 h-3.5" />
              {engineUsed === "gemini" ? "Gemini 1.5/2.5 Flash Connected" : "GenAI Adaptive Engine Connected"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" role="main" className="max-w-7xl mx-auto px-4 py-6 sm:px-6 flex-1 w-full space-y-6">
        
        {/* Top Controls: City Switcher & Search */}
        <section
          aria-labelledby="location-heading"
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 id="location-heading" className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Compass aria-hidden="true" className="w-4 h-4 text-cyan-400" />
                Select High-Smog Urban Center or Custom Search
              </h2>
              <div role="group" aria-label="Popular urban smog centers" className="flex flex-wrap gap-2 mt-3">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCitySelect(c)}
                    aria-pressed={selectedCity.name === c.name}
                    aria-label={`Select city ${c.name}, ${c.country}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                      selectedCity.name === c.name
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/40"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                    }`}
                  >
                    {c.name}, {c.country}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCustomSearch} role="search" aria-label="City search" className="flex items-center gap-2 w-full lg:w-72">
              <div className="relative w-full">
                <Search aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="custom-city-input" className="sr-only">Search city or coordinates</label>
                <input
                  id="custom-city-input"
                  type="text"
                  placeholder="Enter city or coordinates..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <button
                type="submit"
                aria-label="Search city"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl border border-slate-700 text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                Go
              </button>
            </form>
          </div>
        </section>

        {/* Live AQI Banner & Key Metrics */}
        <section aria-labelledby="live-aqi-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main AQI Card */}
          <article className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Real-Time Atmosphere</span>
                <h1 id="live-aqi-heading" className="text-2xl font-bold text-white mt-0.5">{aqiData?.location || selectedCity.name}</h1>
                <p className="text-xs text-slate-400">{aqiData?.country || selectedCity.country}</p>
              </div>
              <button
                type="button"
                onClick={() => loadAQI(selectedCity)}
                disabled={loadingAqi}
                aria-label="Refresh Air Quality Data"
                className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700/70 text-slate-300 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <RefreshCw aria-hidden="true" className={`w-4 h-4 ${loadingAqi ? "animate-spin text-cyan-400" : ""}`} />
              </button>
            </div>

            <div className="my-6 flex items-baseline gap-4" aria-live="polite">
              <div className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
                {loadingAqi ? "--" : aqiData?.aqi}
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">US AQI Index</div>
                <div className={`text-sm sm:text-base font-semibold mt-0.5 ${aqiData?.color || "text-cyan-400"}`}>
                  {aqiData?.level || "Calculating..."}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${aqiData?.badgeBg || "bg-slate-800/50 border-slate-700 text-slate-300"}`}>
                <div className="flex items-start gap-2">
                  <ShieldAlert aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aqiData?.summary}</span>
                </div>
              </div>

              {/* Pollutant Matrix */}
              <div role="region" aria-label="Pollutant concentrations" className="grid grid-cols-4 gap-2 pt-2">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">PM2.5</div>
                  <div className="text-sm font-bold text-white mt-1">{aqiData?.pm25 ?? "--"} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">PM10</div>
                  <div className="text-sm font-bold text-white mt-1">{aqiData?.pm10 ?? "--"} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">NO₂</div>
                  <div className="text-sm font-bold text-white mt-1">{aqiData?.no2 ?? "--"} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">O₃</div>
                  <div className="text-sm font-bold text-white mt-1">{aqiData?.o3 ?? "--"} <span className="text-[9px] font-normal text-slate-400">µg/m³</span></div>
                </div>
              </div>
            </div>
          </article>

          {/* Family & Community Setup Panel */}
          <article className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users aria-hidden="true" className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-semibold text-white">Family Profile &amp; Daily Routine Tailoring</h2>
                </div>
                <span className="text-xs text-slate-400">GenAI Personalization</span>
              </div>

              {/* Toggles */}
              <div role="group" aria-label="Family vulnerability toggles" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setHasKids(!hasKids)}
                  aria-pressed={hasKids}
                  aria-label={`Toggle Children demographic: currently ${hasKids ? "active" : "inactive"}`}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    hasKids
                      ? "bg-indigo-950/50 border-indigo-500/50 text-indigo-200 shadow-md"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Baby aria-hidden="true" className="w-4 h-4 mb-2 text-indigo-400" />
                  <span className="text-xs font-semibold">Children</span>
                  <span className="text-[10px] opacity-70">{hasKids ? "Active (High Vuln)" : "None"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasElderly(!hasElderly)}
                  aria-pressed={hasElderly}
                  aria-label={`Toggle Elderly demographic: currently ${hasElderly ? "active" : "inactive"}`}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    hasElderly
                      ? "bg-indigo-950/50 border-indigo-500/50 text-indigo-200 shadow-md"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Users aria-hidden="true" className="w-4 h-4 mb-2 text-indigo-400" />
                  <span className="text-xs font-semibold">Elderly</span>
                  <span className="text-[10px] opacity-70">{hasElderly ? "Active (Cardio)" : "None"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasAsthma(!hasAsthma)}
                  aria-pressed={hasAsthma}
                  aria-label={`Toggle Asthma / Respiratory condition: currently ${hasAsthma ? "active" : "inactive"}`}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                    hasAsthma
                      ? "bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-md"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Activity aria-hidden="true" className="w-4 h-4 mb-2 text-rose-400" />
                  <span className="text-xs font-semibold">Asthma / Resp.</span>
                  <span className="text-[10px] opacity-70">{hasAsthma ? "High Alert" : "No"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPetOwner(!petOwner)}
                  aria-pressed={petOwner}
                  aria-label={`Toggle Pet Owner: currently ${petOwner ? "active" : "inactive"}`}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    petOwner
                      ? "bg-indigo-950/50 border-indigo-500/50 text-indigo-200 shadow-md"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <HeartPulse aria-hidden="true" className="w-4 h-4 mb-2 text-indigo-400" />
                  <span className="text-xs font-semibold">Pet Owner</span>
                  <span className="text-[10px] opacity-70">{petOwner ? "Dogs/Cats" : "No"}</span>
                </button>
              </div>

              {/* Commute Mode & Custom Question */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="commute-select" className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Car aria-hidden="true" className="w-3.5 h-3.5 text-cyan-400" /> Commute / Travel Habit
                  </label>
                  <select
                    id="commute-select"
                    value={commuteMode}
                    onChange={(e) => setCommuteMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option>Public Metro / Electric Train</option>
                    <option>Personal Gasoline / Diesel Car</option>
                    <option>Motorbike / Scooter</option>
                    <option>Carpool / Ride Share</option>
                    <option>Walk / Bicycle</option>
                    <option>Work From Home (Remote)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="family-query-input" className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-cyan-400" /> Custom Family Concern / Question
                  </label>
                  <input
                    id="family-query-input"
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="e.g. Can my child go to school sports day today?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Click to compute personalized low-emission schedule &amp; IAQ hacks
              </span>
              <button
                type="button"
                onClick={() => generateRecommendations()}
                disabled={loadingAssistant}
                aria-label="Generate adaptive low-emission routine and indoor air quality plan"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {loadingAssistant ? (
                  <>
                    <RefreshCw aria-hidden="true" className="w-3.5 h-3.5 animate-spin" />
                    Synthesizing GenAI Strategy...
                  </>
                ) : (
                  <>
                    <Zap aria-hidden="true" className="w-3.5 h-3.5 text-amber-300" />
                    Generate Adaptive Routine
                  </>
                )}
              </button>
            </div>
          </article>
        </section>

        {/* Tab Navigation for Assistant Output */}
        <section aria-labelledby="assistant-guidance-heading" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles aria-hidden="true" className="w-5 h-5 text-cyan-400" />
                <h2 id="assistant-guidance-heading" className="text-lg font-bold text-white">Adaptive GenAI Assistant Guidance</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tailored for {aqiData?.location || selectedCity.name} • Winter Inversion &amp; Low-Emission Protocols
              </p>
            </div>

            {/* Tabs with full ARIA tablist semantics */}
            <div role="tablist" aria-label="Assistant Guidance Sections" className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                id="tab-routine"
                role="tab"
                aria-selected={activeTab === "routine"}
                aria-controls="panel-routine"
                type="button"
                onClick={() => setActiveTab("routine")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  activeTab === "routine" ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-white"
                }`}
              >
                Daily Routine &amp; Transit
              </button>
              <button
                id="tab-hacks"
                role="tab"
                aria-selected={activeTab === "hacks"}
                aria-controls="panel-hacks"
                type="button"
                onClick={() => setActiveTab("hacks")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  activeTab === "hacks" ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-white"
                }`}
              >
                Indoor Air Quality Hacks
              </button>
              <button
                id="tab-impact"
                role="tab"
                aria-selected={activeTab === "impact"}
                aria-controls="panel-impact"
                type="button"
                onClick={() => setActiveTab("impact")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  activeTab === "impact" ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-white"
                }`}
              >
                Direct Impact Meter
              </button>
            </div>
          </div>

          {/* Assistant Executive Summary */}
          {assistantData?.summary && (
            <div role="status" aria-live="polite" className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
              <Info aria-hidden="true" className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-300">Executive Atmospheric Assessment</div>
                <div className="text-xs text-slate-400 leading-relaxed">{assistantData.summary}</div>
              </div>
            </div>
          )}

          {/* Tab 1: Daily Routine Plan */}
          {activeTab === "routine" && (
            <div id="panel-routine" role="tabpanel" aria-labelledby="tab-routine" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assistantData?.routinePlan.map((slot, idx) => (
                  <article key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Clock aria-hidden="true" className="w-3.5 h-3.5" />
                        {slot.timeSlot}
                      </div>
                      <h3 className="text-xs font-semibold text-white mb-1.5">Atmospheric Health Action:</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{slot.recommendation}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 bg-emerald-950/20 -mx-5 -mb-5 p-4 rounded-b-2xl border-t-emerald-900/30">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-1">
                        <Leaf aria-hidden="true" className="w-3 h-3" /> Emission Reduction Alternative:
                      </div>
                      <p className="text-[11px] text-emerald-200/90 leading-tight">{slot.emissionTip}</p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Family Demographics Advice Callout */}
              {assistantData?.familySpecificAdvice && (
                <aside aria-label="Family Demographic Protection Shield" className="mt-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-3">
                  <HeartPulse aria-hidden="true" className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-indigo-300">Family Demographic Protection Shield</h3>
                    <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
                      {assistantData.familySpecificAdvice}
                    </p>
                  </div>
                </aside>
              )}
            </div>
          )}

          {/* Tab 2: Indoor Air Quality Hacks */}
          {activeTab === "hacks" && (
            <div id="panel-hacks" role="tabpanel" aria-labelledby="tab-hacks" className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {assistantData?.indoorHacks.map((hack, idx) => (
                <article key={idx} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {hack.budget}
                      </span>
                      <Home aria-hidden="true" className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{hack.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{hack.description}</p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 mb-1">
                      <TrendingDown aria-hidden="true" className="w-3 h-3" /> Measured Exposure Impact:
                    </span>
                    <p className="text-xs font-medium text-slate-200">{hack.impact}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Tab 3: Direct Impact Meter */}
          {activeTab === "impact" && assistantData?.quantifiedImpact && (
            <div id="panel-impact" role="tabpanel" aria-labelledby="tab-impact" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <article className="bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-900/40 rounded-2xl p-5 text-center">
                  <div
                    aria-hidden="true"
                    className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400"
                  >
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {assistantData.quantifiedImpact.co2SavedKg} <span className="text-sm font-medium text-emerald-400">kg</span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-300 mt-1">Direct CO₂ Prevented</h3>
                  <p className="text-[10px] text-slate-400 mt-1">From transit shifts &amp; energy conservation</p>
                </article>

                <article className="bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-900/40 rounded-2xl p-5 text-center">
                  <div
                    aria-hidden="true"
                    className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400"
                  >
                    <Wind className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {assistantData.quantifiedImpact.pm25AvoidedGram} <span className="text-sm font-medium text-cyan-400">g</span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-300 mt-1">PM2.5 Emissions Mitigated</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Avoiding vehicle idle &amp; localized burning</p>
                </article>

                <article className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-900/40 rounded-2xl p-5 text-center">
                  <div
                    aria-hidden="true"
                    className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400"
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {assistantData.quantifiedImpact.respiratoryRiskReduction}
                  </div>
                  <h3 className="text-xs font-semibold text-slate-300 mt-1">Lung Exposure Reduction</h3>
                  <p className="text-[10px] text-slate-400 mt-1">With recommended N95 + IAQ ventilation schedule</p>
                </article>
              </div>

              {/* Community Contribution Box */}
              <article className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Users aria-hidden="true" className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-white">Collective Community Ripple Effect</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {assistantData.quantifiedImpact.communityContribution}
                  </p>
                </div>
              </article>

              {/* Key Takeaways Checklist */}
              {assistantData.actionableTakeaways && (
                <section aria-label="Priority Action Checklist" className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Priority Action Checklist For Today
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {assistantData.actionableTakeaways.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                        <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        PromptWars Challenge 6: Urban Air Quality Assistant • Built with Next.js, Tailwind CSS, Open-Meteo &amp; Google Gemini
      </footer>
    </div>
  );
}
