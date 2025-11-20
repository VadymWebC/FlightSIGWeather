# Aviation Weather Map

Interactive web application for visualizing aviation weather advisories (SIGMET, AIRMET, G‑AIRMET) on an interactive map.  
The app uses MapLibre GL JS, an Express-based proxy backend for the Aviation Weather Center (AWC) API, and client-side filtering by layer, altitude, and time.

---

## Table of Contents

1. [Features](#features)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)

---

## Features

- **Interactive map with aviation weather data**

  - MapLibre GL JS with OpenStreetMap raster tiles.
  - Advisories rendered as GeoJSON polygons on top of the base map.

- **AWC API integration via mini backend**

  - Express proxy for AWC endpoints:
    - `/isigmet`
    - `/airsigmet`
  - Normalized GeoJSON output on the client.
  - In‑memory cache with **1 hour TTL** to reduce API load.

- **Filtering**

  - **Layer toggles** for:
    - SIGMET
    - AIRMET
    - G‑AIRMET
  - **Altitude range filter**:
    - 0 – 48,000 ft equivalent range (via FL), adjustable with sliders.
  - **Time filter**:
    - From **−24h** to **+6h** relative to current time.
    - Separate sliders for “from” and “to” offsets.
  - Filters update the map in real time.

- **User interactions**

  - Clickable polygons:
    - Popups with detailed advisory information (type, id, raw text, etc.).
  - Smooth UX:
    - Instant visual feedback when toggling layers or moving sliders.
    - Status overlay with loading/error/feature count indicators.
    - Legend describing color mapping for each layer type.

- **Clean, self‑explanatory code**

  - React hooks for data fetching and filtering.
  - Explicit types for normalized data.
  - Separation of concerns between:
    - Data layer
    - Map rendering
    - UI controls

- **Basic unit test coverage**
  - Pure filtering/normalization logic is covered with unit tests (Jest).

---

## Architecture Overview

The project is split into **frontend** and **mini-backend**:

- **Frontend (React + MapLibre)**

  - Responsible for:
    - Rendering the map and layers.
    - Requesting normalized data from the backend proxy.
    - Applying filters (layer, altitude, time).
    - Displaying popups and UI controls.

- **Backend (Node.js + Express)**
  - Responsible for:
    - Proxying AWC API requests.
    - Applying a simple in‑memory cache (1h TTL).
    - Returning raw AWC JSON responses to the client, which then normalizes them into GeoJSON.

Data flow:

1. Frontend calls `/api/isigmet` and `/api/airsigmet` on the local Express server.
2. Express proxies requests to `https://aviationweather.gov/api/data/...`, applying caching per URL.
3. Frontend normalizes responses into GeoJSON and applies filtering.
4. Normalized + filtered data is passed to the MapLibre source to render polygons.

---

## Tech Stack

**Frontend**

- React
- TypeScript
- MapLibre GL JS
- OpenStreetMap raster tiles

**Backend**

- Node.js
- Express
- `node-fetch`
- In‑memory cache (plain `Map`)

**Testing**

- Jest (or compatible test runner)
- Unit tests for filtering and normalization utilities

---

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm or yarn

### Install dependencies

```bash
npm install
# or
yarn install
```

## Run the backend (AWC proxy server)

```bash
npm run server
# or
node server/index.ts
```

## Run the frontend

```bash
npm start
# or
yarn start

```
