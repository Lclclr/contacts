const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// expose pool for tests to allow graceful shutdown
app.locals.pool = pool;

// List contacts (optionally filter by precinct)
app.get("/api/contacts", async (req, res) => {
  const { precinct } = req.query;
  try {
    let result;
    if (precinct) {
      result = await pool.query(
        "SELECT * FROM contacts WHERE voter_precinct = $1 ORDER BY id DESC",
        [precinct]
      );
    } else {
      result = await pool.query("SELECT * FROM contacts ORDER BY id DESC");
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get a single contact by id
app.get("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM contacts WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) return res.status(404).send("Not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update a contact
app.put("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    cell_phone,
    voter_precinct,
    county,
    state,
  } = req.body;
  try {
    const result = await pool.query(
      "UPDATE contacts SET first_name=$1, last_name=$2, email=$3, cell_phone=$4, voter_precinct=$5, county=$6, state=$7 WHERE id=$8 RETURNING *",
      [
        first_name,
        last_name,
        email,
        cell_phone,
        voter_precinct,
        county,
        state,
        id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).send("Not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a contact
app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM contacts WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).send("Not found");
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// List distinct precincts
app.get("/api/precincts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT voter_precinct FROM contacts WHERE voter_precinct IS NOT NULL ORDER BY voter_precinct"
    );
    const precincts = result.rows.map((r) => r.voter_precinct);
    res.json(precincts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/api/contacts", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    cell_phone,
    voter_precinct,
    county,
    state,
  } = req.body;
  try {
    const newContact = await pool.query(
      "INSERT INTO contacts (first_name, last_name, email, cell_phone, voter_precinct, county, state) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [first_name, last_name, email, cell_phone, voter_precinct, county, state]
    );
    res.json(newContact.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Health-check endpoint for readiness checks
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Only start server when run directly (makes app testable)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
