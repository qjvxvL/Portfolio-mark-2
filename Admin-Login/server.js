const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "12460",
  database: "portfolio",
});

client.connect();

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM projects");
    console.log("Projects fetched:", result.rows); // Add this for debugging
    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error); // Add this for debugging
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  const projectId = req.params.id;
  try {
    await client.query("DELETE FROM projects WHERE id = $1", [projectId]);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/projects", async (req, res) => {
  const { title, description, image_url } = req.body;
  try {
    await client.query(
      "INSERT INTO projects (title, description, image_url) VALUES ($1, $2, $3)",
      [title, description, image_url]
    );
    res.json({ success: true, message: "Project added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/projects/:id", async (req, res) => {
  const projectId = req.params.id;
  const { title, description, image_url } = req.body;
  try {
    await client.query(
      "UPDATE projects SET title = $1, description = $2, image_url = $3 WHERE id = $4",
      [title, description, image_url, projectId]
    );
    res.json({ success: true, message: "Project updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/skills", async (req, res) => {
  const { skills, description } = req.body;
  try {
    await client.query(
      "INSERT INTO skills (skills, description) VALUES ($1, $2)",
      [skills, description]
    );
    res.json({ success: true, message: "Skill added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/skills", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM skills");
    console.log("Skills fetched:", result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/skills/:id", async (req, res) => {
  const skillId = req.params.id;
  try {
    await client.query("DELETE FROM skills WHERE id = $1", [skillId]);
    res.json({ success: true, message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/skills/:id", async (req, res) => {
  const skillId = req.params.id;
  const { skills, description } = req.body;
  try {
    await client.query(
      "UPDATE skills SET skills = $1, description = $2 WHERE id = $3",
      [skills, description, skillId]
    );
    res.json({ success: true, message: "Skill updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
