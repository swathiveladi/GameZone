
const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true
  },

  game: {
    type: String,
    required: true,
    enum: ["Tic-Tac-Toe", "Rock-Paper-Scissors", "Number Guessing"]
  },

  score: {
    type: Number,
    required: true,
    min: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Score", scoreSchema);
