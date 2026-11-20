import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      city = "Delhi",
      aqi = 250,
      level = "Very Unhealthy",
      pollutants = {},
      familyProfile = { hasKids: true, hasElderly: false, hasAsthma: false, petOwner: false },
      lifestyle = "Hybrid worker with daily commute",
      userQuery = ""
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are the Urban Air Quality AI Assistant for PromptWars.
Your mission is to help families and urban communities navigate severe winter smog and urban air pollution.
You must provide actionable, compassionate, and science-grounded advice that:
1. Suggests LOW-EMISSION daily routines tailored to their location and lifestyle (e.g. commuting alternatives, optimal travel windows during thermal inversions).
2. Provides practical INDOOR AIR QUALITY (IAQ) hacks (DIY air purifier techniques like Corsi-Rosenthal boxes, safe ventilation windows, avoiding incense/frying during smog peaks).
3. Offers SUSTAINABLE ALTERNATIVES tailored to their specific family profile.
4. Clearly explains the DIRECT IMPACT of their personal and household choices (e.g., kilograms of CO2 and PM2.5 prevented, lung protection factor).

Return your response in clean, beautiful JSON with the following structure:
{
  "summary": "Short 2-sentence executive summary of the current air emergency & health stance.",
  "routinePlan": [
    { "timeSlot": "Morning (6 AM - 10 AM)", "recommendation": "...", "emissionTip": "..." },
    { "timeSlot": "Mid-Day (11 AM - 4 PM)", "recommendation": "...", "emissionTip": "..." },
    { "timeSlot": "Evening (5 PM - 10 PM)", "recommendation": "...", "emissionTip": "..." }
  ],
  "indoorHacks": [
    { "title": "...", "description": "...", "budget": "Free / Low Cost / Investment", "impact": "..." }
  ],
  "familySpecificAdvice": "Targeted advice for their family demographic...",
  "quantifiedImpact": {
    "co2SavedKg": 3.8,
    "pm25AvoidedGram": 4.5,
    "respiratoryRiskReduction": "65%",
    "communityContribution": "..."
  },
  "actionableTakeaways": [
    "Tip 1...",
    "Tip 2...",
    "Tip 3..."
  ]
}`;

    const userPrompt = `Location: ${city}
Current AQI: ${aqi} (${level})
Key Pollutants: PM2.5: ${pollutants.pm25 || 'High'} µg/m³, PM10: ${pollutants.pm10 || 'High'} µg/m³, NO2: ${pollutants.no2 || 'Moderate'} µg/m³
Family Profile:
- Has Kids: ${familyProfile.hasKids}
- Has Elderly Members: ${familyProfile.hasElderly}
- Has Respiratory/Asthma: ${familyProfile.hasAsthma}
- Pet Owner: ${familyProfile.petOwner}
Daily Lifestyle: ${lifestyle}
User's Specific Question or Situation: ${userQuery || "How can my family navigate this severe winter smog safely while lowering our own emissions?"}`;

    // Attempt Gemini API call if key is available
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nRespond ONLY in valid JSON matching the schema.` }]
                }
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4,
              }
            })
          }
        );

        if (response.ok) {
          const geminiData = await response.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({ success: true, data: parsed, engine: "gemini" });
          }
        }
      } catch (err) {
        console.warn("Gemini call failed or timed out, falling back to smart heuristic generator:", err);
      }
    }

    // Smart Heuristic Fallback
    const fallbackResponse = generateSmartAssistantFallback(city, aqi, level, familyProfile, lifestyle, userQuery);
    return NextResponse.json({ success: true, data: fallbackResponse, engine: "heuristic-fallback" });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}

function generateSmartAssistantFallback(
  city: string,
  aqi: number,
  level: string,
  profile: any,
  lifestyle: string,
  query: string
) {
  const isSevere = aqi > 200;

  return {
    summary: `In ${city}, air conditions are currently at ${level} levels (AQI: ${aqi}). Winter temperature inversions are trapping particulate matter near ground level, requiring active indoor barrier protocols and strict avoidance of personal combustion.`,
    routinePlan: [
      {
        timeSlot: "Morning (6 AM - 10 AM)",
        recommendation: isSevere
          ? "Thermal inversion is at its peak. Postpone outdoor jogging/walking. Keep home sealed and run indoor air circulation with filtration."
          : "Light activity permitted indoors. Ventilate only if early sun disperses ground haze.",
        emissionTip: "Avoid short car cold-starts. Shift commute to electrified public metro, carpool, or work-from-home if eligible."
      },
      {
        timeSlot: "Mid-Day (11 AM - 3 PM)",
        recommendation: "Solar radiation creates a temporary thermal mixing window. If outdoor air quality shows a dip, perform brief cross-ventilation for 10-15 minutes.",
        emissionTip: "Consolidate errands into a single trip or choose carbon-neutral parcel delivery options."
      },
      {
        timeSlot: "Evening & Night (5 PM - 10 PM)",
        recommendation: isSevere
          ? "Night inversion drops emissions down to street level. Seal windows with damp towel draft-stoppers. Keep children and elderly indoors."
          : "Avoid busy arterial road corridors during rush hour traffic peaks.",
        emissionTip: "Never burn leaves or waste. Keep indoor heating clean using sealed electric appliances rather than biomass or fuel stoves."
      }
    ],
    indoorHacks: [
      {
        title: "DIY Corsi-Rosenthal Box Air Purifier",
        description: "Attach a MERV-13 furnace filter to a standard box fan using duct tape. Achieves high clean air delivery rate (CADR) for a fraction of store-bought purifier prices.",
        budget: "Low Cost (~$20 - $35)",
        impact: "Cuts indoor PM2.5 levels by up to 70-85% within 45 minutes."
      },
      {
        title: "Thermal Inversion Window Timing",
        description: "Never ventilate during early morning or late night smog trap hours. Check live PM2.5 graphs and open windows only between 1 PM and 3 PM when the boundary layer rises.",
        budget: "Free",
        impact: "Prevents up to 80 µg/m³ of particulate ingress into sleeping quarters."
      },
      {
        title: "Wet-Mopping & Microfiber Dust Traps",
        description: "Avoid dry sweeping or vacuuming without HEPA filters which resuspends fine settled ash and toxic heavy metals. Use damp microfiber mops daily.",
        budget: "Free",
        impact: "Reduces secondary particle resuspension by 60%."
      }
    ],
    familySpecificAdvice: `${profile.hasKids ? "For children: Respiratory passages are smaller and inhalation rates per bodyweight are twice as high; require N95/FFP2 masks for school transit. " : ""}${profile.hasElderly ? "For elderly family members: Keep cardiovascular exertion minimal and monitor blood oxygenation on smog spike days. " : ""}${profile.hasAsthma ? "Asthma alert: Keep prophylactic inhalers on person at all times, as winter NO2 and PM2.5 trigger severe bronchial spasms. " : ""}${profile.petOwner ? "For pets: Limit outdoor potty walks to under 10 minutes and wipe paws/fur with a damp cloth before re-entering." : "Maintain good indoor hydration and monitor indoor humidity between 40-50%."}`,
    quantifiedImpact: {
      co2SavedKg: 4.2,
      pm25AvoidedGram: 6.8,
      respiratoryRiskReduction: isSevere ? "78% with N95 + DIY filtration" : "45%",
      communityContribution: "Shifting to metro transit & avoiding localized biomass combustion prevents ~2.1 kg of localized neighborhood toxic soot today."
    },
    actionableTakeaways: [
      "Wear a well-fitted N95 mask whenever stepping out during inversion hours.",
      "Seal door jambs and window cracks using weatherstrip tape or rolled damp towels.",
      "Switch cooking to induction/electric whenever possible and always use exhaust hoods to prevent VOC buildup.",
      "Share localized AQI warnings with neighborhood or apartment groups to coordinate carpooling."
    ]
  };
}
