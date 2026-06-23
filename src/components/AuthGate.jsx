import React, { useState } from "react";

const SECRET_PASSWORD = "2519";

function AuthGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const handleUnlock = () => {
    setShowLoading(true);

    setTimeout(() => {
      setUnlocked(true);
      setShowLoading(false);
    }, 2200);
  };

  if (showLoading) {
    return <RomanticLoadingScreen />;
  }

  if (!unlocked) {
    return <PasswordScreen onUnlock={handleUnlock} />;
  }

  return children;
}

function PasswordScreen({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hearts, setHearts] = useState([]);

  const submitPassword = (e) => {
    e.preventDefault();

    if (password.trim() === SECRET_PASSWORD) {
      setError("");
      onUnlock();
    } else {
      setError("Wrong love code. Please try again 💔");
      setPassword("");
    }
  };

  const createHeart = (e) => {
    const newHeart = {
      id: `${Date.now()}-${Math.random()}`,
      x: e.clientX,
      y: e.clientY,
    };

    setHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((heart) => heart.id !== newHeart.id));
    }, 1000);
  };

  return (
    <div className="password-page" onClick={createHeart}>
      <div className="password-bg-glow glow-a" />
      <div className="password-bg-glow glow-b" />

      <div className="heart-rain">
        {Array.from({ length: 30 }).map((_, index) => (
          <span
            key={index}
            style={{
              left: `${(index * 11) % 100}%`,
              animationDelay: `${index * 0.22}s`,
              animationDuration: `${8 + (index % 8)}s`,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      <div className="click-hearts">
        {hearts.map((heart) => (
          <span key={heart.id} style={{ left: heart.x, top: heart.y }}>
            ♥
          </span>
        ))}
      </div>

      <div className="password-card" onClick={(e) => e.stopPropagation()}>
        <div className="lock-circle">💖</div>

        <p className="password-mini-title">Private Wedding Surprise</p>

        <h1 className="couple-love-title">
          Yesu
          <small>&</small>
          Sridevi
        </h1>

        <div className="love-divider">
          <span />
          <b>♥</b>
          <span />
        </div>

        <p className="password-subtitle">
          Enter the secret love code to open 7 years of memories, blessings,
          photos, videos and the final wedding surprise.
        </p>

        <form onSubmit={submitPassword} className="password-form">
          <label>Enter Love Code</label>

          <div className="password-input-wrap">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error ? <p className="password-error">{error}</p> : null}

          <button type="submit" className="unlock-btn">
            Unlock Memories <span>♥</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function RomanticLoadingScreen() {
  return (
    <div className="romantic-loader-page">
      <div className="loader-heart">♥</div>

      <h1 className="loader-names">
        Yesu
        <small>&</small>
        Sridevi
      </h1>

      <p>Opening their love story...</p>

      <div className="loading-line">
        <span />
      </div>

      <div className="loading-steps">
        <span>Photos</span>
        <span>Videos</span>
        <span>Voice Wishes</span>
        <span>Timeline</span>
      </div>
    </div>
  );
}

export default AuthGate;
