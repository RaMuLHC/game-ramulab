import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Steam Profile Scraper Proxy API
  app.get("/api/steam", async (req, res) => {
    try {
      const steamUrl = req.query.url as string;
      if (!steamUrl) {
        return res.status(400).json({ error: "Missing url parameter" });
      }

      // Format clean URL path
      // e.g. "https://steamcommunity.com/id/ramu0" -> "https://steamcommunity.com/id/ramu0/?xml=1"
      let profileXmlUrl = "";
      let gamesXmlUrl = "";

      const idMatch = steamUrl.match(/\/id\/([^/]+)/);
      const profilesMatch = steamUrl.match(/\/profiles\/([^/]+)/);

      if (idMatch) {
        const username = idMatch[1].replace(/\/$/, "");
        profileXmlUrl = `https://steamcommunity.com/id/${username}/?xml=1`;
        gamesXmlUrl = `https://steamcommunity.com/id/${username}/games/?xml=1`;
      } else if (profilesMatch) {
        const profileId = profilesMatch[1].replace(/\/$/, "");
        profileXmlUrl = `https://steamcommunity.com/profiles/${profileId}/?xml=1`;
        gamesXmlUrl = `https://steamcommunity.com/profiles/${profileId}/games/?xml=1`;
      } else {
        return res.status(400).json({ error: "Invalid Steam profile URL" });
      }

      // Fetch Profile XML Content
      const profileRes = await fetch(profileXmlUrl);
      if (!profileRes.ok) {
        throw new Error(`Steam profile returned code ${profileRes.status}`);
      }
      const profileXmlText = await profileRes.text();

      // Simple, robust Regex extractions to avoid pulling heavy parser dependencies
      const memberSinceMatch = profileXmlText.match(/<memberSince>(.*?)<\/memberSince>/i);
      const hoursPlayed2WeeksMatch = profileXmlText.match(/<hoursPlayed2Weeks>(.*?)<\/hoursPlayed2Weeks>/i);
      const privacyStateMatch = profileXmlText.match(/<privacyState>(.*?)<\/privacyState>/i);

      let memberSince = memberSinceMatch ? memberSinceMatch[1] : null;
      let hoursPlayed2Weeks = hoursPlayed2WeeksMatch ? hoursPlayed2WeeksMatch[1] : null;
      const privacyState = privacyStateMatch ? privacyStateMatch[1] : "public";

      // Extra safety check - if privacy state is NOT public, games will not be accessible
      let gameCount: number | null = null;
      if (privacyState === "public") {
        try {
          const gamesRes = await fetch(gamesXmlUrl);
          if (gamesRes.ok) {
            const gamesXmlText = await gamesRes.text();
            const matches = gamesXmlText.match(/<game>/gi);
            if (matches) {
              gameCount = matches.length;
            }
          }
        } catch (err) {
          console.error("Steam proxy games count fetch failed:", err);
        }
      }

      res.json({
        memberSince,
        hoursPlayed2Weeks,
        privacyState,
        gameCount
      });
    } catch (error: any) {
      console.error("Steam Proxy endpoint error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch Steam data" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Enable Vite middleware in development or serve built assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
