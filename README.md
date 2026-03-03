# SkyPath – Flight Connection Search Engine

SkyPath is a prototype flight connection search engine built as part of an engineering challenge.

The system allows users to search valid itineraries (direct, 1-stop, and 2-stop max) between two airports on a specific date while enforcing realistic airline connection rules such as layover constraints and timezone-aware duration calculation.

---

## 🚀 How to Run

### Using Docker
```bash
git clone <your-repo>
cd skypath
docker-compose up
```

---

## 🏗️ Architecture
```
skypath/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── flightService.js
│   │   ├── dataLoader.js
│   │   └── utils.js
│   ├── Dockerfile
│
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   ├── Dockerfile
│
├── docker-compose.yml
├── flights.json
└── README.md
```

### Backend Responsibilities
- Load `flights.json` on startup
- Expose REST APIs
- Enforce connection rules
- Perform timezone-aware duration calculations
- Return itineraries sorted by total duration

### Frontend Responsibilities
- Searchable origin input (3-letter IATA typeahead)
- Searchable destination input
- Date picker
- Display flight segments
- Display layover durations
- Show stops (Non-stop / 1 Stop / 2 Stops)
- Show total duration and total price
- Loading state
- Input validation
- Graceful API error handling
- Empty state handling

---

## 🔌 API Documentation

### `GET /airports`
Returns all available airports.

### `GET /search`
Search for valid itineraries.

**Query Parameters:**

| Parameter   | Type      | Example      |
|-------------|-----------|--------------|
| origin      | IATA code | JFK          |
| destination | IATA code | LAX          |
| date        | YYYY-MM-DD | 2024-03-15  |

**Example:**
```
GET /search?origin=JFK&destination=LAX&date=2024-03-15
```

**Example Response:**
```json
[
  {
    "segments": [
      {
        "flightNumber": "SP101",
        "origin": "JFK",
        "destination": "LAX",
        "departureTime": "2024-03-15T08:30:00",
        "arrivalTime": "2024-03-15T11:45:00",
        "price": 299,
        "layover": null
      }
    ],
    "totalDuration": 375,
    "totalPrice": 299
  }
]
```

Results are sorted by total travel duration (shortest first).

---

## ✈️ Connection Rules Implemented

- Minimum layover (domestic): 45 minutes
- Minimum layover (international): 90 minutes
- Maximum layover: 6 hours
- No airport switching during connections
- All time calculations performed in UTC
- Domestic vs international determined using airport `country` field

---

## 🧠 Algorithm Choice

### Depth-First Search (DFS)

DFS is used to enumerate all valid itineraries up to 3 segments.

**Reasons:**
- Maximum depth is bounded (2 connections)
- Dataset size is small (~260 flights)
- Requirement is to return all valid paths, not only the shortest
- Layover constraints are easier to enforce during traversal

After generating all valid itineraries, results are sorted by total duration.

---

## 🕒 Timezone Handling

Flight times in the dataset are stored in local airport time. To correctly compute layover duration and total travel duration, all times are converted to UTC before performing comparisons.

This correctly handles:
- Timezone differences
- Overnight arrivals
- Date-line crossing routes (e.g., SYD → LAX)

---

## 🧪 Test Cases Covered

- Direct and multi-stop routes
- International layover rule enforcement
- Routes with no direct flight
- Same origin and destination validation
- Invalid airport codes
- Date-line crossing behavior

---

## ⚖️ Tradeoffs

- In-memory dataset (no database) for simplicity
- DFS chosen over Dijkstra due to full-path enumeration requirement
- No caching layer (dataset size small)
- No pagination (prototype scope)

---

## 🚀 Improvements With More Time

- Unit tests for layover logic
- Cheapest-first sorting option
- Pagination for larger datasets
- Performance optimization for larger graphs
- CI pipeline
- Cloud deployment

---

## 📌 Notes

- Commit history reflects development process (not squashed)
- Docker setup included for reproducible execution
- Focus prioritized correctness and timezone accuracy
- Built with emphasis on correctness, clarity, and realistic flight connection logic