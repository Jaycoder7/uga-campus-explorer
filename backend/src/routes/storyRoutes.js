// backend/src/routes/storyRoutes.js
const express = require("express");
const { generateStory } = require("../services/geminiService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const story = await generateStory(req.body);
    res.json({ story });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
