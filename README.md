# Google Business Scraper

A full-stack Node.js web application that searches for Google businesses by postal code using the Google Places and Geocoding APIs. Built as the core search engine behind the [ElevareLeadGenerator](https://github.com/) application (private repo) — this standalone version is published for reference and portfolio purposes.

> **Note:** This project is not actively deployed. Its functionality has been integrated into the ElevareLeadGenerator application.

---

## Overview

Google Business Scraper accepts one or more postal codes, converts them to geographic coordinates via the Google Geocoding API, then performs nearby business searches through the Google Places API. Results include business name, website, address, phone number, operating hours, and business status.

### Key Features

- **Batch postal code geocoding** with progress tracking
- **Configurable search radius** (default 5 km)
- **Built-in rate limiting** to stay within Google API quotas
- **Pagination support** for up to 60 results per location
- **Input validation** and structured error handling
- **Health check endpoint** for monitoring

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **HTTP Client:** Axios
- **APIs:** Google Places API, Google Geocoding API

## Project Structure

```
├── config/
│   └── config.js            # Centralized configuration and validation
├── public/
│   ├── index.html            # Frontend entry point
│   ├── css/style.css         # Styles
│   └── js/app.js             # Client-side logic
├── routes/
│   └── api.js                # API route handlers
├── services/
│   ├── geocodingApi.js       # Postal code → lat/lng conversion
│   └── googlePlacesApi.js    # Nearby search and place details
├── server.js                 # Express app setup and middleware
├── package.json
└── .gitignore
```

## Getting Started

### Prerequisites

- **Node.js** v18+
- A **Google Cloud** project with the following APIs enabled:
  - Places API
  - Geocoding API

### Installation

```bash
git clone https://github.com/your-username/google-business-scraper.git
cd google-business-scraper
npm install
```

### Configuration

Create a `.env` file in the project root:

```env
GOOGLE_PLACES_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
SEARCH_RADIUS=5000
RATE_LIMIT_DELAY=200
MAX_POSTAL_CODES_PER_REQUEST=20
```

| Variable | Description | Default |
|---|---|---|
| `GOOGLE_PLACES_API_KEY` | **Required.** Your Google API key | — |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `SEARCH_RADIUS` | Search radius in meters | `5000` |
| `RATE_LIMIT_DELAY` | Delay between API calls (ms) | `200` |
| `MAX_POSTAL_CODES_PER_REQUEST` | Max postal codes per request | `20` |

Configuration is validated on startup. In production, the server will exit if required values are missing; in development it logs a warning and continues.

### Running

```bash
# Development (auto-reload via nodemon)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:3000` (or your configured port).

### Health Check

```
GET /health
```

Returns server status, timestamp, and uptime.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the frontend |
| `GET` | `/health` | Server health check |
| `*` | `/api/*` | Business search API routes |

## Author

**Aiden Perez**

## License

ISC
