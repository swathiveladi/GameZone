const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const Score = require("../models/Score");

// Save a player's score
router.post("/", authMiddleware, async (req, res)  => {
  try {
    const { playerName, game, score } = req.body;

    if (!playerName || !game || score === undefined) {
      return res.status(400).json({
        message: "Player name, game and score are required."
      });
    }

    const newScore = new Score({
      playerName,
      game,
      score
    });

    await newScore.save();

    res.status(201).json({
      message: "Score saved successfully!",
      data: newScore
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not save score.",
      error: error.message
    });
  }
});

// Get the top 10 scores
router.get("/leaderboard", authMiddleware, async (req, res)  => {
  try {
    const scores = await Score.find()
      .sort({ score: -1, createdAt: 1 })
      .limit(10);

    res.json(scores);
  } catch (error) {
    res.status(500).json({
      message: "Could not load leaderboard.",
      error: error.message
    });
  }
});

// Get player statistics
router.get("/stats/:playerName", authMiddleware, async (req, res) =>  {
  try {
    const playerName = req.params.playerName;

    const scores = await Score.find({
      playerName: {
        $regex: `^${playerName}$`,
        $options: "i"
      }
    });

    const totalGames = scores.length;

    const totalWins = scores.length;

    const highestScore = scores.length > 0
      ? Math.max(...scores.map(item => item.score))
      : 0;

    res.json({
      playerName,
      totalGames,
      totalWins,
      highestScore
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching player statistics"
    });
  }
});


module.exports = router;
