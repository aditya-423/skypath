const express = require("express");
const cors = require("cors");
const { loadData } = require("./dataLoader");
const { searchFlights } = require("./flightService");

loadData();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/search", (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const results = searchFlights(
      origin.toUpperCase(),
      destination.toUpperCase(),
      date
    );

    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});