import React, { useEffect, useMemo, useState } from "react";
import { Gamepad2, Heart, RefreshCcw, RotateCcw, Sparkles } from "lucide-react";
import { loadLoveGame } from "../services/contentApi";

const stageNames = ["Intro", "Quiz", "Guess", "Match", "Wheel", "Scratch", "Hearts", "Result"];

function normalizeDeck(items = []) {
  const pairs = items.flatMap((item) => [
    { ...item, cardId: `${item.id}-a`, pairId: item.id },
    { ...item, cardId: `${item.id}-b`, pairId: item.id },
  ]);

  return pairs.sort(() => Math.random() - 0.5);
}

function LoveJourneyGame() {
  const [game, setGame] = useState(null);
  const [stage, setStage] = useState("intro");
  const [hearts, setHearts] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [guessIndex, setGuessIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [wheelResult, setWheelResult] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [scratch, setScratch] = useState(false);
  const [scratchBlessing, setScratchBlessing] = useState("");
  const [foundHearts, setFoundHearts] = useState([]);

  useEffect(() => {
    loadLoveGame().then((data) => setGame(data));
  }, []);

  useEffect(() => {
    if (stage === "match" && game?.memoryMatch?.length) {
      setDeck(normalizeDeck(game.memoryMatch));
      setFlipped([]);
      setMatched([]);
      setMoves(0);
    }
  }, [stage, game]);

  const hiddenHeartPositions = useMemo(
    () => [
      { left: "12%", top: "20%" },
      { left: "76%", top: "16%" },
      { left: "43%", top: "26%" },
      { left: "18%", top: "68%" },
      { left: "63%", top: "72%" },
      { left: "86%", top: "52%" },
      { left: "38%", top: "83%" },
    ],
    []
  );

  const addHeart = (count = 1) => {
    setHearts((prev) => Math.min(7, prev + count));
  };

  const goStage = (nextStage) => {
    setFeedback("");
    setStage(nextStage);
  };

  const restartGame = () => {
    setStage("intro");
    setHearts(0);
    setQuizIndex(0);
    setGuessIndex(0);
    setFeedback("");
    setWheelResult("");
    setSpinning(false);
    setScratch(false);
    setScratchBlessing("");
    setFoundHearts([]);
  };

  if (!game) {
    return (
      <section className="love-game-section glass-card" id="game">
        <div className="game-loading-heart">♥</div>
        <p>Loading 7 Hearts Love Quest...</p>
      </section>
    );
  }

  return (
    <section className="love-game-section glass-card" id="game">
      <div className="game-bg-glow" />

      <div className="section-title game-title-block">
        <p className="eyebrow">Couple Game</p>
        <h2>{game.title || "7 Hearts Love Quest"}</h2>
        <p>
          {game.subtitle ||
            "Complete every stage and unlock Yesu & Sridevi's secret blessing."}
        </p>
      </div>

      <div className="game-progress-row">
        {stageNames.map((item, index) => (
          <span
            key={item}
            className={stageNames.findIndex((name) => name.toLowerCase() === stage) >= index ? "active" : ""}
          >
            {index + 1}
          </span>
        ))}
      </div>

      <div className="game-hearts-score">
        {Array.from({ length: 7 }).map((_, index) => (
          <Heart key={index} size={19} fill={index < hearts ? "currentColor" : "none"} />
        ))}
        <b>{hearts}/7 Hearts</b>
      </div>

      {stage === "intro" && (
        <div className="game-stage-card">
          <div className="game-big-heart">♥</div>
          <h3>Start One Romantic Game</h3>
          <p>
            This one game has quiz, memory year, matching, love wheel, blessing
            reveal and hidden hearts inside one beautiful journey.
          </p>
          <button className="game-main-btn" onClick={() => goStage("quiz")}>
            Start Love Quest <span>♥</span>
          </button>
        </div>
      )}

      {stage === "quiz" && (
        <QuizStage
          questions={game.quiz || []}
          index={quizIndex}
          feedback={feedback}
          onAnswer={(correct) => {
            setFeedback(correct ? "Correct! One heart collected 💖" : "Sweet try! Continue 💌");
            if (correct) addHeart();
            setTimeout(() => {
              if (quizIndex >= (game.quiz || []).length - 1) {
                goStage("guess");
              } else {
                setQuizIndex((prev) => prev + 1);
                setFeedback("");
              }
            }, 850);
          }}
        />
      )}

      {stage === "guess" && (
        <GuessYearStage
          items={game.guessYear || []}
          index={guessIndex}
          feedback={feedback}
          onAnswer={(correct) => {
            setFeedback(correct ? "Perfect guess! Heart unlocked ♥" : "Nice try! The journey continues ✨");
            if (correct) addHeart();
            setTimeout(() => {
              if (guessIndex >= (game.guessYear || []).length - 1) {
                goStage("match");
              } else {
                setGuessIndex((prev) => prev + 1);
                setFeedback("");
              }
            }, 900);
          }}
        />
      )}

      {stage === "match" && (
        <MatchStage
          deck={deck}
          flipped={flipped}
          matched={matched}
          moves={moves}
          onFlip={(card) => {
            if (flipped.length === 2 || flipped.includes(card.cardId) || matched.includes(card.cardId)) return;

            const nextFlipped = [...flipped, card.cardId];
            setFlipped(nextFlipped);

            if (nextFlipped.length === 2) {
              setMoves((prev) => prev + 1);
              const first = deck.find((item) => item.cardId === nextFlipped[0]);
              const second = deck.find((item) => item.cardId === nextFlipped[1]);

              if (first?.pairId === second?.pairId) {
                setMatched((prev) => [...prev, first.cardId, second.cardId]);
                setFlipped([]);
              } else {
                setTimeout(() => setFlipped([]), 750);
              }
            }
          }}
          onContinue={() => {
            addHeart();
            goStage("wheel");
          }}
        />
      )}

      {stage === "wheel" && (
        <WheelStage
          items={game.wheel || []}
          result={wheelResult}
          spinning={spinning}
          onSpin={() => {
            if (spinning || wheelResult) return;
            setSpinning(true);
            setTimeout(() => {
              const items = game.wheel || [];
              const selected = items[Math.floor(Math.random() * items.length)] || "Send a blessing";
              setWheelResult(selected);
              setSpinning(false);
              addHeart();
            }, 1500);
          }}
          onContinue={() => goStage("scratch")}
        />
      )}

      {stage === "scratch" && (
        <ScratchStage
          revealed={scratch}
          blessing={scratchBlessing}
          onReveal={() => {
            if (scratch) return;
            const list = game.scratchBlessings || [];
            const selected = list[Math.floor(Math.random() * list.length)] || "Forever Together";
            setScratchBlessing(selected);
            setScratch(true);
            addHeart();
          }}
          onContinue={() => goStage("hearts")}
        />
      )}

      {stage === "hearts" && (
        <HiddenHeartsStage
          positions={hiddenHeartPositions}
          found={foundHearts}
          onFind={(index) => {
            if (foundHearts.includes(index)) return;
            setFoundHearts((prev) => [...prev, index]);
            addHeart();
          }}
          onFinish={() => goStage("result")}
        />
      )}

      {stage === "result" && (
        <div className="game-stage-card result-card">
          <div className="game-big-heart">♥</div>
          <h3>Love Quest Completed</h3>
          <p>{game.finalMessage}</p>
          <div className="result-badge">
            {hearts >= 7 ? "Love Expert 💖" : hearts >= 5 ? "Close Friend 😍" : "Sweet Guest 💌"}
          </div>
          <button className="game-main-btn" onClick={restartGame}>
            <RefreshCcw size={17} /> Play Again
          </button>
        </div>
      )}
    </section>
  );
}

function QuizStage({ questions, index, feedback, onAnswer }) {
  const item = questions[index];

  if (!item) {
    return (
      <div className="game-stage-card">
        <h3>No quiz questions added</h3>
      </div>
    );
  }

  return (
    <div className="game-stage-card">
      <p className="game-step-label">Stage 1 • Couple Quiz</p>
      <h3>{item.question}</h3>
      <div className="game-options-grid">
        {item.options.map((option) => (
          <button key={option} onClick={() => onAnswer(option === item.answer)}>
            {option}
          </button>
        ))}
      </div>
      {feedback && <p className="game-feedback">{feedback}</p>}
    </div>
  );
}

function GuessYearStage({ items, index, feedback, onAnswer }) {
  const item = items[index];

  if (!item) {
    return (
      <div className="game-stage-card">
        <h3>No year memories added</h3>
      </div>
    );
  }

  return (
    <div className="game-stage-card">
      <p className="game-step-label">Stage 2 • Guess The Year</p>
      <div className="guess-year-card">
        <img src={item.image} alt={item.question} />
      </div>
      <h3>{item.question}</h3>
      <div className="game-options-grid">
        {item.options.map((option) => (
          <button key={option} onClick={() => onAnswer(option === item.answer)}>
            {option}
          </button>
        ))}
      </div>
      {feedback && <p className="game-feedback">{feedback}</p>}
    </div>
  );
}

function MatchStage({ deck, flipped, matched, moves, onFlip, onContinue }) {
  const done = deck.length > 0 && matched.length === deck.length;

  return (
    <div className="game-stage-card">
      <p className="game-step-label">Stage 3 • Memory Match</p>
      <h3>Match the romantic memory cards</h3>
      <p className="match-moves">Moves: {moves}</p>

      <div className="memory-match-grid">
        {deck.map((card) => {
          const open = flipped.includes(card.cardId) || matched.includes(card.cardId);

          return (
            <button
              key={card.cardId}
              className={`match-card ${open ? "open" : ""}`}
              onClick={() => onFlip(card)}
            >
              {open ? <img src={card.image} alt={card.label} /> : <span>♥</span>}
            </button>
          );
        })}
      </div>

      {done && (
        <button className="game-main-btn" onClick={onContinue}>
          Continue <span>♥</span>
        </button>
      )}
    </div>
  );
}

function WheelStage({ items, result, spinning, onSpin, onContinue }) {
  return (
    <div className="game-stage-card">
      <p className="game-step-label">Stage 4 • Spin Love Wheel</p>
      <h3>Spin and receive a sweet task</h3>
      <div className={`love-wheel ${spinning ? "spinning" : ""}`}>
        <Sparkles size={34} />
        <span>LOVE</span>
      </div>
      {result ? <p className="wheel-result">{result}</p> : <p className="wheel-hint">Click the wheel to spin</p>}
      {!result ? (
        <button className="game-main-btn" onClick={onSpin} disabled={spinning}>
          {spinning ? "Spinning..." : "Spin Wheel"}
        </button>
      ) : (
        <button className="game-main-btn" onClick={onContinue}>
          Continue <span>♥</span>
        </button>
      )}
    </div>
  );
}

function ScratchStage({ revealed, blessing, onReveal, onContinue }) {
  return (
    <div className="game-stage-card">
      <p className="game-step-label">Stage 5 • Scratch Blessing</p>
      <h3>Reveal a blessing card</h3>
      <button className={`scratch-card ${revealed ? "revealed" : ""}`} onClick={onReveal}>
        {revealed ? <span>{blessing}</span> : <b>Tap to reveal blessing</b>}
      </button>
      {revealed && (
        <button className="game-main-btn" onClick={onContinue}>
          Continue <span>♥</span>
        </button>
      )}
    </div>
  );
}

function HiddenHeartsStage({ positions, found, onFind, onFinish }) {
  const done = found.length === positions.length;

  return (
    <div className="game-stage-card hidden-stage-card">
      <p className="game-step-label">Stage 6 • Find 7 Hidden Hearts</p>
      <h3>Find all 7 hearts for 7 years of love</h3>
      <p className="hidden-count">Found: {found.length}/7</p>

      <div className="hidden-hearts-board">
        {positions.map((position, index) => (
          <button
            key={index}
            className={`hidden-heart-dot ${found.includes(index) ? "found" : ""}`}
            style={position}
            onClick={() => onFind(index)}
          >
            ♥
          </button>
        ))}
      </div>

      {done && (
        <button className="game-main-btn" onClick={onFinish}>
          Unlock Final Result <span>♥</span>
        </button>
      )}
    </div>
  );
}

export default LoveJourneyGame;
