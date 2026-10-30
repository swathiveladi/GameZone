
import { useState } from "react";
import "./App.css";
import Auth from "./Auth";

function findWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let line of lines) {
    const [a, b, c] = line;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }

  return null;
}

function App() {
  const [selectedGame, setSelectedGame] = useState("");

  // Login state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gamezoneUser")) || null;
    } catch {
      return null;
    }
  });

  const [playerName, setPlayerName] = useState(
    currentUser?.username || ""
  );

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardError, setLeaderboardError] = useState("");

  // Profile state
  const [playerStats, setPlayerStats] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Login function
  function handleLogin(user) {
    setCurrentUser(user);
    setPlayerName(user.username);
    setSelectedGame("");
  }

  // Logout function
  function handleLogout() {
    localStorage.removeItem("gamezoneToken");
    localStorage.removeItem("gamezoneUser");

    setCurrentUser(null);
    setPlayerName("");
    setSelectedGame("");
  }

  // Show leaderboard
  
async function showLeaderboard() {
  setSelectedGame("leaderboard");
  setLeaderboardError("");

  try {
    const token = localStorage.getItem("gamezoneToken");

    if (!token) {
      throw new Error("Please login to view the leaderboard.");
    }

    const response = await fetch(
      "http://localhost:5000/api/scores/leaderboard",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Unable to load leaderboard");
    }

    const data = await response.json();
    setLeaderboard(data);

  } catch (error) {
    console.error(error);
    setLeaderboardError(error.message);
  }
}


  // Show player profile
  async function showProfile() {
    if (!playerName.trim()) {
      alert("Please enter your player name on the home page first!");
      setSelectedGame("");
      return;
    }

    setSelectedGame("profile");
    setProfileLoading(true);
    setProfileError("");
    setPlayerStats(null);

    try {
     const token = localStorage.getItem("gamezoneToken");

if (!token) {
  throw new Error("Please login to view your profile");
}

const response = await fetch(
  `http://localhost:5000/api/scores/stats/${encodeURIComponent(
    playerName.trim()
  )}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      if (!response.ok) {
        throw new Error("Unable to load player profile");
      }

      const data = await response.json();
      setPlayerStats(data);
    } catch (error) {
      console.error(error);
      setProfileError(
        "Could not load profile. Please check the backend."
      );
    } finally {
      setProfileLoading(false);
    }
  }

  // Save game score
 
// Save game score
async function saveScore(game, score, name = playerName) {
  if (!name.trim()) {
    alert("Please enter your player name on the home page!");
    return;
  }

  const token = localStorage.getItem("gamezoneToken");

  if (!token) {
    alert("Please login before saving your score!");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/scores",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          playerName: name.trim(),
          game,
          score
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save score");
    }

    console.log("Score saved:", data);
    alert("Score saved successfully!");

  } catch (error) {
    console.error("Score saving failed:", error);
    alert(error.message || "Could not save score.");
  }
}


  // Tic-Tac-Toe
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const winner = findWinner(board);
  const draw = !winner && board.every(cell => cell !== "");

  function play(index) {
    if (board[index] || winner || draw) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const gameWinner = findWinner(newBoard);

    if (gameWinner) {
      setScores(prev => ({
        ...prev,
        [gameWinner]: prev[gameWinner] + 1
      }));

      if (playerName.trim()) {
        saveScore(
          "Tic-Tac-Toe",
          1,
          `${playerName} (Player ${gameWinner})`
        );
      }
    } else if (!newBoard.every(cell => cell !== "")) {
      setTurn(turn === "X" ? "O" : "X");
    }
  }

  function resetTicTacToe() {
    setBoard(Array(9).fill(""));
    setTurn("X");
  }

  // Rock-Paper-Scissors
  const [choice, setChoice] = useState("");
  const [computer, setComputer] = useState("");
  const [result, setResult] = useState("");
  const [rpsScore, setRpsScore] = useState(0);

  function playRPS(userChoice) {
    const options = ["Rock", "Paper", "Scissors"];

    const computerChoice =
      options[Math.floor(Math.random() * 3)];

    setChoice(userChoice);
    setComputer(computerChoice);

    if (userChoice === computerChoice) {
      setResult("It's a Draw!");
    } else if (
      (userChoice === "Rock" && computerChoice === "Scissors") ||
      (userChoice === "Paper" && computerChoice === "Rock") ||
      (userChoice === "Scissors" && computerChoice === "Paper")
    ) {
      setResult("You Win!");
      setRpsScore(prev => prev + 1);

      saveScore("Rock-Paper-Scissors", 1);
    } else {
      setResult("Computer Wins!");
    }
  }

  function resetRPS() {
    setChoice("");
    setComputer("");
    setResult("");
    setRpsScore(0);
  }

  // Number Guessing Game
  const [secretNumber, setSecretNumber] = useState(
    () => Math.floor(Math.random() * 100) + 1
  );

  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState(
    "Guess a number between 1 and 100!"
  );
  const [attempts, setAttempts] = useState(0);
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);

  function checkGuess() {
    const number = Number(guess);

    if (
      guess.trim() === "" ||
      !Number.isInteger(number) ||
      number < 1 ||
      number > 100
    ) {
      setMessage(
        "Please enter a valid number between 1 and 100."
      );
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (number === secretNumber) {
      setMessage(
        `🎉 Correct! You guessed the number in ${newAttempts} attempts!`
      );

      setGuessedCorrectly(true);

      saveScore(
        "Number Guessing",
        Math.max(1, 101 - newAttempts)
      );
    } else if (number > secretNumber) {
      setMessage("Too High! Try a smaller number.");
    } else {
      setMessage("Too Low! Try a bigger number.");
    }

    setGuess("");
  }

  function resetGuessingGame() {
    setSecretNumber(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setAttempts(0);
    setMessage(
      "New game! Guess a number between 1 and 100."
    );
    setGuessedCorrectly(false);
  }

  // Display authentication screen
  if (selectedGame === "auth") {
    return (
      <div className="app">
        <Auth
          onLogin={handleLogin}
          onBack={() => setSelectedGame("")}
        />
      </div>
    );
  }

  return (
    <div className="app">

      {/* Navigation Bar */}
      <nav className="navbar">
        <h2 onClick={() => setSelectedGame("")}>
          🎮 GameZone
        </h2>

        <div>
          <button
            className="back-btn"
            onClick={() => setSelectedGame("")}
          >
            Home
          </button>

         {currentUser && (
  <>
    <button
      className="nav-game-btn leaderboard-btn"
      onClick={showLeaderboard}
    >
      🏆 Leaderboard
    </button>

    <button
      className="nav-game-btn profile-btn"
      onClick={showProfile}
    >
      👤 My Profile
    </button>
  </>
)}

          {currentUser ? (
            <button
              className="back-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          ) : (
            <button
              className="back-btn"
              onClick={() => setSelectedGame("auth")}
            >
              🔐 Login / Register
            </button>
          )}
        </div>
      </nav>

      {/* Home Page */}
      {!selectedGame ? (
        <>
          <section className="hero">
            <h1>Welcome to GameZone</h1>

            <p>
              Play exciting games, challenge yourself and have fun!
            </p>

            {currentUser && (
              <p>Welcome, {currentUser.username}! 🎉</p>
            )}

            <input
              type="text"
              placeholder="Enter your player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={!!currentUser}
            />
          </section>

          {/* Games */}
          <section className="games-section">
            <h2>Choose Your Game</h2>

            <div className="game-container">

              <div
                className="game-card"
                onClick={() => setSelectedGame("tic")}
              >
                <div className="game-icon">⭕</div>
                <h3>Tic-Tac-Toe</h3>
                <p>
                  Challenge a friend in this classic game.
                </p>
                <button>Play Now</button>
              </div>

              <div
                className="game-card"
                onClick={() => setSelectedGame("rps")}
              >
                <div className="game-icon">✊</div>
                <h3>Rock Paper Scissors</h3>
                <p>Play against the computer.</p>
                <button>Play Now</button>
              </div>

              <div
                className="game-card"
                onClick={() => setSelectedGame("guess")}
              >
                <div className="game-icon">🔢</div>
                <h3>Number Guessing</h3>
                <p>
                  Guess the secret number from 1 to 100.
                </p>
                <button>Play Now</button>
              </div>

            </div>
          </section>

          {/* About */}
          <section className="about">
            <h2>About GameZone</h2>

            <p>
              GameZone is an online gaming platform where players
              can enjoy simple and exciting games.
            </p>
          </section>
        </>
      ) : (
        <section className="tic-section">

          <button
            className="back-btn"
            onClick={() => setSelectedGame("")}
          >
            ← Back to Home
          </button>

          {/* Player Profile */}
          {selectedGame === "profile" && (
            <>
              <h1>👤 Player Profile</h1>

              {profileLoading && (
                <p>Loading your profile...</p>
              )}

              {profileError && (
                <p>{profileError}</p>
              )}

              {playerStats && (
                <div className="profile-dashboard">
                  <h2>
                    Welcome, {playerStats.playerName}!
                  </h2>

                  <div className="profile-cards">

                    <div className="profile-card">
                      <span>🎮</span>
                      <h3>{playerStats.totalGames}</h3>
                      <p>Games Recorded</p>
                    </div>

                    <div className="profile-card">
                      <span>🏆</span>
                      <h3>{playerStats.totalWins}</h3>
                      <p>Wins Recorded</p>
                    </div>

                    <div className="profile-card">
                      <span>⭐</span>
                      <h3>{playerStats.highestScore}</h3>
                      <p>Highest Score</p>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

          {/* Leaderboard */}
          {selectedGame === "leaderboard" && (
            <>
              <h1>🏆 GameZone Leaderboard</h1>
              <p>Top 10 player scores</p>

              {leaderboardError && (
                <p>{leaderboardError}</p>
              )}

              {!leaderboardError &&
                leaderboard.length === 0 && (
                  <p>
                    No scores available yet. Play a game
                    to get on the leaderboard!
                  </p>
                )}

              {leaderboard.length > 0 && (
                <div className="leaderboard">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Game</th>
                        <th>Score</th>
                      </tr>
                    </thead>

                    <tbody>
                      {leaderboard.map((item, index) => (
                        <tr key={item._id}>
                          <td>{index + 1}</td>
                          <td>{item.playerName}</td>
                          <td>{item.game}</td>
                          <td>{item.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Tic-Tac-Toe */}
          {selectedGame === "tic" && (
            <>
              <h1>Tic-Tac-Toe</h1>

              <div className="scoreboard">
                <p>Player X: {scores.X}</p>
                <p>Player O: {scores.O}</p>
              </div>

              <h3 className="status">
                {winner
                  ? `Player ${winner} Wins!`
                  : draw
                    ? "It's a Draw!"
                    : `Player ${turn}'s Turn`}
              </h3>

              <div className="tic-board">
                {board.map((cell, index) => (
                  <button
                    className="tic-cell"
                    key={index}
                    onClick={() => play(index)}
                  >
                    {cell}
                  </button>
                ))}
              </div>

              <button
                className="restart"
                onClick={resetTicTacToe}
              >
                Restart Game
              </button>
            </>
          )}

          {/* Rock-Paper-Scissors */}
          {selectedGame === "rps" && (
            <>
              <h1>Rock Paper Scissors</h1>

              <h3>Your Wins: {rpsScore}</h3>
              <p>Choose your move:</p>

              <div className="rps-options">
                <button
                  className="rps-button"
                  onClick={() => playRPS("Rock")}
                >
                  <span>✊</span> Rock
                </button>

                <button
                  className="rps-button"
                  onClick={() => playRPS("Paper")}
                >
                  <span>✋</span> Paper
                </button>

                <button
                  className="rps-button"
                  onClick={() => playRPS("Scissors")}
                >
                  <span>✌️</span> Scissors
                </button>
              </div>

              {result && (
                <div className="selection">
                  <p>Your choice: {choice}</p>
                  <p>Computer choice: {computer}</p>
                  <h2>{result}</h2>
                </div>
              )}

              <button
                className="restart"
                onClick={resetRPS}
              >
                Reset Score
              </button>
            </>
          )}

          {/* Number Guessing */}
          {selectedGame === "guess" && (
            <>
              <h1>🔢 Number Guessing Game</h1>

              <p>
                I'm thinking of a number between 1 and 100.
              </p>

              <div className="guess-box">
                <h3>{message}</h3>

                <input
                  type="number"
                  min="1"
                  max="100"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !guessedCorrectly
                    ) {
                      checkGuess();
                    }
                  }}
                  placeholder="Enter your guess"
                  disabled={guessedCorrectly}
                />

                <button
                  className="restart"
                  onClick={checkGuess}
                  disabled={guessedCorrectly}
                >
                  Check Guess
                </button>

                <h3>Attempts: {attempts}</h3>

                <button
                  className="restart"
                  onClick={resetGuessingGame}
                >
                  Play Again
                </button>
              </div>
            </>
          )}

        </section>
      )}

      {/* Footer */}
      <footer>
        <p>© 2026 GameZone. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default App;
