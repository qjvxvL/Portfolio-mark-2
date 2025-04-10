const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const auth = require("./middleware/auth");
const app = express();

const allowedOrigins = ["http://127.0.0.1:5502", "http://localhost:5502"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));

// Update the session middleware configuration
app.use(
  session({
    secret: "secret-key",
    resave: true, // Changed to true
    saveUninitialized: false, // Keep false to save only when needed
    rolling: true, // Added rolling sessions
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
    },
    name: "sessionId",
  })
);

const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "12460",
  database: "portfolio",
});

client.connect();

// Remove the duplicate app.post("/login"...) and keep only one with these updates:
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Simulate password verification (replace with bcrypt)
    if (password !== user.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.session.isAuthenticated = true;
    req.session.user = {
      id: user.id,
      username: user.username,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Session error" });
      }
      res.json({ success: true, redirectUrl: "/Dashboard-Admin/admin.html" });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Make sure this comes BEFORE any admin routes
app.use(["/Dashboard-Admin", "/Dashboard-Admin/*"], auth);

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    // Clear the cookie
    res.clearCookie("sessionId");

    // Add cache-control headers
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");

    res.json({ success: true });
  });
});

app.get("/Dashboard-Admin/admin.html", (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect("/Admin-Login/admin-login.html");
  }

  // Add cache-control headers
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.sendFile(path.join(__dirname, "../Dashboard-Admin/admin.html"));
});

app.get("/check-auth", (req, res) => {
  // Debug logging
  console.log("Full session:", {
    id: req.sessionID,
    session: req.session,
    isAuth: req.session?.isAuthenticated,
    user: req.session?.user,
  });

  if (req.session && req.session.isAuthenticated === true) {
    res.json({
      authenticated: true,
      user: req.session.user,
    });
  } else {
    // Clear invalid session
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      res.clearCookie("sessionId");
      res.status(401).json({
        authenticated: false,
        message: "No valid session found",
      });
    });
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
