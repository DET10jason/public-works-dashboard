# 🛰️ OpenData Public Works & Operational Command Center

A high-performance, dark-mode Geospatial Command Center custom-built entirely outside the expensive Esri enterprise licensing ecosystem. This application bridges real-time field data collection, multi-layered data grid sorting, and interactive vector map visualization into a single, self-sustaining operations console.

**🌐 Live Production Link:** [Insert Your Vercel URL Here after deploying!]

---

## 🎯 The Business Value & Problem Solved
Small municipalities, rural water districts, and private infrastructure contractors frequently struggle with two massive technical bottlenecks:
1. **The Enterprise Software Tax:** Paying thousands of dollars annually for complex GIS server licenses just to track standard field assets.
2. **The Paper & Text Trap:** Field crews reporting job updates via manual phone calls, text messages, or paper forms, leading to severe communication delays and administrative backlogs at the office.

**The Solution:** This application replaces out-of-the-box setups with a lightweight, lightning-fast **React & Next.js frontend** connected to open-source mapping infrastructure. It automates situational awareness for dispatchers while completely eliminating software overhead costs.

---

## 🔥 Key Operational Features

*   **⚡ Responsive Live Map Component:** Renders dynamic interactive vector markers cleanly over an advanced Mapbox dark vector tile basemap centered over Oklahoma.
*   **🟢 Smart Status Visual Identifiers:** Instantly communicates operational risk across the territory—Critical failures flash bright red, active projects show as amber, and wrapped-up tasks update to vibrant emerald green.
*   **🚨 Real-Time Notification Tray:** Features a synchronized header alert bell that computes active field crises dynamically. Clicking the tray drops down an urgent action-briefing card, clearing the badge once viewed.
*   **📊 Dynamic KPI Data Calculation:** Completely eliminates manual daily logs. Statistical headers, unique deployed crew metrics, and Recharts bar graphs automatically calculate active vs. closed volume straight from the live data stream.
*   **🗂️ Advanced Data Grid Filters:** Empowers administrative teams to seamlessly sort and comb through years of project history by Department (Water, Streets, Stormwater), exact Status, or chronological order (Latest to Oldest).

---

## 🛠️ The Independent Technical Stack

By shifting to an agile, open-source stack, this system completely bypasses proprietary database lock-ins:

*   **Frontend Environment:** React 19 / Next.js (App Router Architecture)
*   **Interface Styling:** Tailwind CSS (Fluid Grid Layouts & Dark-Mode Theme Optimization)
*   **Geospatial Processing:** React-Map-GL / Mapbox GL JS (High-Performance Web Canvas)
*   **Analytical Visuals:** Recharts Core Component Library
*   **Infrastructure Icons:** Lucide React Architecture Pack
*   **Production Hosting Engine:** Vercel Cloud Automation Pipeline
*   **Database Infrastructure (Ready):** Structured explicitly to instantly scale into a live **Supabase + PostGIS** cloud spatial database.

---

## 🚦 Local Developer Installation Guide

To run this operational console locally on your machine for testing or verification:

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd public-works-dashboard
   ```

2. **Install node packages:**
   ```bash
   npm install
   ```

3. **Configure your secure environment credentials:**
   Create a `.env.local` file in the root directory and securely add your personal Mapbox public token:
   ```text
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
   ```

4. **Boot the local development instance:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` to review the running system.

---

## 👨‍💻 Enterprise Engineering Credits
**Jason Stanley** – *Enterprise GIS Consultant & Certified Meta Front-End Developer*  
Leveraging deep analytical workflows, high-pressure data synthesis, and technical quality control background as a US Navy Intelligence Analyst Lead to design high-utility spatial software environments.

