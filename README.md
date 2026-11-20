# AuraClean AI — Urban Air Quality & Winter Smog Assistant
> **PromptWars — Challenge 6 Solution**

A GenAI-powered assistant tailored to help families and urban communities navigate severe winter smog and urban air pollution. The application suggests low-emission daily routines, indoor air quality hacks, and sustainable alternatives tailored to location and lifestyle, while clearly calculating and explaining the direct impact of individual and community choices.

---

## 🌟 Key Features

1. **Real-time Live Atmospheric & AQI Monitor**:
   - Queries Open-Meteo Air Quality API with real-time US AQI, PM2.5, PM10, NO2, and Ozone levels.
   - Quick-switch presets for severe winter smog hotspots (Delhi, Lahore, Beijing, Ulaanbaatar, London, New York) and custom city searches.

2. **Personalized GenAI Daily Routine & Transit Planner**:
   - Dynamic schedule suggestions across morning, mid-day, and evening inversion windows.
   - Recommends low-emission transit alternatives (Metro, carpool, EVs, remote work) to avoid personal emissions during thermal traps.

3. **Budget-Friendly Indoor Air Quality (IAQ) Hacks**:
   - Step-by-step guidance on DIY Corsi-Rosenthal boxes (MERV-13 filters + box fans).
   - Inversion timing protocols (ventilating only during midday solar convection windows).
   - Wet-mopping techniques to prevent toxic particulate resuspension.

4. **Family Demographic Protection Shield**:
   - Dedicated guidance for vulnerable family profiles (infants & children, seniors with cardiovascular risk, asthma/respiratory conditions, pets).

5. **Direct Impact Meter**:
   - Quantified CO2 prevented (kg), particulate matter prevented (g), and personal lung exposure reduction (%).
   - Demonstrates the collective ripple effect of community compliance.

---

## 🚀 Getting Started

### 1. Environment Configuration
The `.env.local` file is already configured with your key:
```env
GEMINI_API_KEY=your_key_here
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Tech Stack
- **Framework**: Next.js 14 / App Router (TypeScript)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Next.js Serverless Route Handlers
- **AI Models**: Google Gemini 1.5 Flash + Contextual Heuristic Adaptive Engine
- **Data Source**: Open-Meteo Air Quality Open Data API
