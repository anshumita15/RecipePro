import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "recipe-pro-secret-key-123";
const db = new Database("recipes.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS saved_recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    ingredients TEXT,
    instructions TEXT,
    macros TEXT,
    image_url TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/signup", async (req, res) => {
    const { username, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const info = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, hashedPassword);
      const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ id: info.lastInsertRowid, username });
    } catch (error) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ id: user.id, username: user.username });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // --- Recipe Routes ---
  app.get("/api/recipes/saved", authenticateToken, (req: any, res) => {
    const recipes = db.prepare("SELECT * FROM saved_recipes WHERE user_id = ?").all(req.user.id);
    res.json(recipes.map((r: any) => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      instructions: JSON.parse(r.instructions),
      macros: JSON.parse(r.macros)
    })));
  });

  app.post("/api/recipes/save", authenticateToken, (req: any, res) => {
    const { title, ingredients, instructions, macros, image_url } = req.body;
    console.log(`Saving recipe: ${title} for user: ${req.user.username}`);
    try {
      const info = db.prepare(`
        INSERT INTO saved_recipes (user_id, title, ingredients, instructions, macros, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        title,
        JSON.stringify(ingredients),
        JSON.stringify(instructions),
        JSON.stringify(macros),
        image_url
      );
      console.log(`Recipe saved with ID: ${info.lastInsertRowid}`);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ error: "Failed to save recipe" });
    }
  });

  app.delete("/api/recipes/saved/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM saved_recipes WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ message: "Deleted" });
  });

  // --- ElevenLabs Proxy ---
  app.post("/api/tts", async (req, res) => {
    const { text } = req.body;
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_f83750e6f5943669dc1f752b82df1a70d3372b6b0c94de3a";

    if (!ELEVENLABS_API_KEY) {
      console.warn("ELEVENLABS_API_KEY is missing, falling back to browser TTS");
      return res.status(500).json({ error: "ElevenLabs API key not configured" });
    }

    try {
      console.log(`Generating TTS for: "${text.substring(0, 50)}..."`);
      const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            errorData = { error: text || `ElevenLabs returned ${response.status}` };
          }
        } catch (e) {
          errorData = { error: `ElevenLabs request failed with status ${response.status}` };
        }
        console.error("ElevenLabs API Error:", errorData);
        return res.status(response.status).json(errorData);
      }

      const audioBuffer = await response.arrayBuffer();
      console.log("TTS generated successfully, buffer size:", audioBuffer.byteLength);
      res.set("Content-Type", "audio/mpeg");
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      console.error("TTS Proxy Error:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
