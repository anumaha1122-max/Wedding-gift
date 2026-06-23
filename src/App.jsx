import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Download,
  Gamepad2,
  Gift,
  Heart,
  Home,
  Image,
  Menu,
  MessageCircle,
  Mic,
  Music,
  Pause,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  loadFinalGift,
  loadMemories,
  loadSite,
  loadTimeline,
  loadWishes,
} from "./services/contentApi";
import LoveJourneyGame from "./components/LoveJourneyGame.jsx";

function LoveJourneyStats({ startDate = "2019-01-01T00:00:00" }) {
  const [journeyTime, setJourneyTime] = useState({
    years: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateJourneyTime = () => {
      const start = new Date(startDate);
      const now = new Date();

      if (Number.isNaN(start.getTime())) {
        return;
      }

      let years = now.getFullYear() - start.getFullYear();

      const anniversaryThisYear = new Date(start);
      anniversaryThisYear.setFullYear(start.getFullYear() + years);

      if (now < anniversaryThisYear) {
        years -= 1;
      }

      const lastAnniversary = new Date(start);
      lastAnniversary.setFullYear(start.getFullYear() + years);

      const difference = now.getTime() - lastAnniversary.getTime();

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setJourneyTime({
        years: Math.max(years, 0),
        days: Math.max(days, 0),
        hours: Math.max(hours, 0),
        minutes: Math.max(minutes, 0),
        seconds: Math.max(seconds, 0),
      });
    };

    calculateJourneyTime();
    const timer = setInterval(calculateJourneyTime, 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <div className="love-timer-container">
      <div className="love-timer-box love-years">
        <strong>{journeyTime.years}+</strong>
        <span>Years</span>
      </div>
      <div className="love-timer-box love-days">
        <strong>{journeyTime.days}</strong>
        <span>Days</span>
      </div>
      <div className="love-timer-box love-hours">
        <strong>{journeyTime.hours}</strong>
        <span>Hours</span>
      </div>
      <div className="love-timer-box love-minutes">
        <strong>{journeyTime.minutes}</strong>
        <span>Minutes</span>
      </div>
      <div className="love-timer-box love-seconds">
        <strong>{journeyTime.seconds}</strong>
        <span>Seconds</span>
      </div>
    </div>
  );
}

const FALLBACK_IMAGE = "/images/fallback.svg";

function normalizeType(type = "") {
  const value = String(type).toLowerCase();
  if (value.includes("video")) return "VIDEO";
  if (value.includes("voice") || value.includes("audio")) return "VOICE";
  if (value.includes("photo") || value.includes("image")) return "PHOTO";
  return value.toUpperCase() || "TEXT";
}

function getAsset(value) {
  return value || FALLBACK_IMAGE;
}

function App() {
  const [site, setSite] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const isAdminMode = new URLSearchParams(window.location.search).get("admin") === "2519";

  useEffect(() => {
    loadSite().then((data) => setSite(data));
  }, []);

  const couple = site?.couple || { groom: "Yesu", bride: "Sridevi" };

  return (
    <div className="app-shell">
      <FloatingHearts />

      <button className="mobile-menu-btn" onClick={() => setMobileMenu(true)}>
        <Menu size={22} />
      </button>

      <Sidebar site={site} open={mobileMenu} onClose={() => setMobileMenu(false)} />

      <main className="main-content">
        <HeroSection site={site} couple={couple} />
        <MemoryGallery />
        <WishesWallSection />
        <TimelineSection />
        <LoveJourneyGame />
        <FinalBlessing />
        {isAdminMode && <ContentManagerSection />}
      </main>

      <MusicPlayer playlist={site?.musicPlaylist || []} />
    </div>
  );
}

function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {Array.from({ length: 34 }).map((_, index) => (
        <span
          key={index}
          style={{
            left: `${(index * 17) % 100}%`,
            animationDelay: `${index * 0.35}s`,
            animationDuration: `${10 + (index % 8)}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

function Sidebar({ site, open, onClose }) {
  const navItems = [
    { href: "#home", label: "Home", icon: Home },
    { href: "#gallery", label: "Gallery", icon: Image },
    { href: "#wishes", label: "Wishes", icon: MessageCircle },
    { href: "#timeline", label: "Timeline", icon: CalendarDays },
    { href: "#game", label: "Game", icon: Gamepad2 },
    { href: "#gift", label: "Gift", icon: Gift },
  ];

  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <button className="sidebar-close" onClick={onClose}>
          <X size={19} />
        </button>

        <div className="brand-card">
          <div className="brand-heart">♥</div>
          <h1>{site?.couple?.groom || "Yesu"}</h1>
          <small>&</small>
          <h1>{site?.couple?.bride || "Sridevi"}</h1>
          <p>Wedding Memories</p>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.href} href={item.href} onClick={onClose}>
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <Sparkles size={18} />
          2019 to 2026 love becoming forever.
        </div>
      </aside>

      {open && <button className="mobile-backdrop" onClick={onClose} />}
    </>
  );
}

function HeroSection({ site, couple }) {
  const images = site?.heroImages?.length ? site.heroImages : ["/images/hero-bg.svg"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 3800);

    return () => clearInterval(id);
  }, [images.length]);

  return (
    <section className="hero-section" id="home">
      <div className="hero-bg-orb orb-one" />
      <div className="hero-bg-orb orb-two" />

      <div className="hero-copy">
        <p className="eyebrow">{site?.hero?.eyebrow || "Wedding Surprise"}</p>

        <h2>
          {site?.hero?.title || "A Journey of Love"}
          <span>{site?.hero?.highlight || "& Memories"}</span>
        </h2>

        <p className="hero-text">
          {site?.hero?.subtitle ||
            "2019 to 2026 love, care, fights, smiles, dreams and togetherness — now becoming forever in marriage."}
        </p>

        <div className="hero-actions">
          <a href="#gallery" className="primary-btn">
            Begin The Journey <Heart size={17} fill="currentColor" />
          </a>
          <a href="#wishes" className="ghost-btn">
            View Blessings
          </a>
        </div>

          <LoveJourneyStats
            startDate={site?.loveStartDate}
          />
      </div>

      <div className="hero-visual glass-card">
        <div className="hero-frame">
          <img
            src={images[active]}
            alt={`${couple.groom} and ${couple.bride}`}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          <div className="hero-name-plate">
            <p>{couple.groom}</p>
            <span>♥</span>
            <p>{couple.bride}</p>
          </div>
        </div>

        <div className="hero-thumbs">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={image}
              className={active === index ? "active" : ""}
              onClick={() => setActive(index)}
            >
              <img src={image} alt="memory thumbnail" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function MemoryGallery() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [previewIndex, setPreviewIndex] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ["All", "Friends", "Family", "Couple", "Videos", "Voice", "Photos"];

  useEffect(() => {
    let active = true;

    loadMemories()
      .then((data) => {
        if (active) setMemories(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredItems = memories.filter((item) => {
    const type = normalizeType(item.type);
    const matchesFilter =
      filter === "All" || item.category === filter || type === normalizeType(filter);

    const text = `${item.title || ""} ${item.category || ""} ${item.type || ""}`.toLowerCase();
    return matchesFilter && text.includes(search.toLowerCase());
  });

  const movePreview = (direction) => {
    setPreviewIndex((prev) => {
      if (prev === null || filteredItems.length === 0) return null;
      if (direction === "next") return prev === filteredItems.length - 1 ? 0 : prev + 1;
      return prev === 0 ? filteredItems.length - 1 : prev - 1;
    });
  };

  return (
    <section className="gallery-card glass-card" id="gallery">
      <div className="gallery-title-row">
        <div>
          <p className="eyebrow">Memories</p>
          <h2>
            <span>♥</span> Memory Gallery <span>♥</span>
          </h2>
          <p>Photos, videos and voice memories of their love journey.</p>
        </div>
      </div>

      <div className="gallery-controls">
        <div className="filter-buttons">
          {filters.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => {
                setFilter(item);
                setPreviewIndex(null);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <Search size={17} />
          <input
            placeholder="Search memories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPreviewIndex(null);
            }}
          />
        </div>

        <button className="round-filter" aria-label="filters">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {loading ? (
        <EmptyState icon="♥" text="Loading Yesu & Sridevi memories..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState icon="💌" text="No memories found" />
      ) : (
        <div className="polaroid-grid">
          {filteredItems.map((item, index) => (
            <PolaroidCard
              key={item.id || index}
              item={item}
              index={index}
              onOpen={() => setPreviewIndex(index)}
            />
          ))}
        </div>
      )}

      <p className="quote">
        “The best thing to hold onto in life is each other.”
        <br />
        <span>— Audrey Hepburn — ♡</span>
      </p>

      {previewIndex !== null && filteredItems[previewIndex] && (
        <MediaPreviewModal
          item={filteredItems[previewIndex]}
          index={previewIndex}
          total={filteredItems.length}
          onClose={() => setPreviewIndex(null)}
          onMove={movePreview}
          label="Memory"
        />
      )}
    </section>
  );
}

function PolaroidCard({ item, index, onOpen }) {
  const type = normalizeType(item.type);
  const isVideo = type === "VIDEO";
  const isVoice = type === "VOICE";

  return (
    <button type="button" className={`polaroid-card rotate-${index % 4}`} onClick={onOpen}>
      <span className="pin" />

      <div className="polaroid-image">
        <img
          src={getAsset(item.image)}
          alt={item.title || "memory"}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        {(isVideo || isVoice) && (
          <span className="media-overlay-btn">
            {isVideo ? <Play size={24} fill="currentColor" /> : <Mic size={24} />}
          </span>
        )}
      </div>

      <p className="polaroid-caption">{item.title}</p>
    </button>
  );
}

function MediaPreviewModal({ item, index, total, onClose, onMove, label = "Memory" }) {
  const type = normalizeType(item.type);
  const isVideo = type === "VIDEO";
  const isVoice = type === "VOICE";
  const isPhoto = type === "PHOTO";

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onMove) onMove("next");
      if (e.key === "ArrowLeft" && onMove) onMove("prev");
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onMove]);

  return (
    <div className="preview-backdrop" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="preview-close" onClick={onClose}>
          ×
        </button>

        {onMove && (
          <button className="preview-arrow preview-left" onClick={() => onMove("prev")}>
            ‹
          </button>
        )}

        <div className="preview-image-wrap">
          {isVideo && item.mediaUrl ? (
            <video className="preview-video" src={item.mediaUrl} poster={getAsset(item.image)} controls autoPlay playsInline />
          ) : isVoice && item.mediaUrl ? (
            <div className="preview-voice-box">
              <img
                src={getAsset(item.image)}
                alt={item.title || item.name}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="preview-voice-overlay">
                <div className="preview-voice-heart">♥</div>
                <h4>{item.title || item.name}</h4>
                <p>{item.message || `Voice blessing for Yesu & Sridevi`}</p>
                <audio className="preview-audio" src={item.mediaUrl} controls autoPlay />
              </div>
            </div>
          ) : isPhoto || item.image ? (
            <img
              src={getAsset(item.mediaUrl || item.image)}
              alt={item.title || item.name || "preview"}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          ) : (
            <div className="missing-media-box">
              <Heart size={52} />
              <p>No media file added yet</p>
            </div>
          )}
        </div>

        <div className="preview-info">
          <p className="preview-small">Yesu ♥ Sridevi {label}</p>
          <h3>{item.title || item.name}</h3>
          {item.message && <p className="preview-message-text">{item.message}</p>}

          <div className="preview-tags">
            {item.category && <span>{item.category}</span>}
            {item.relation && <span>{item.relation}</span>}
            <span>{item.type}</span>
            {total && (
              <span>
                {index + 1} / {total}
              </span>
            )}
          </div>
        </div>

        {onMove && (
          <button className="preview-arrow preview-right" onClick={() => onMove("next")}>
            ›
          </button>
        )}
      </div>
    </div>
  );
}

function WishesWallSection() {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWish, setSelectedWish] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filters = ["ALL", "FAMILY", "FRIENDS", "PHOTO", "VIDEO", "VOICE", "TEXT"];

  useEffect(() => {
    let active = true;
    loadWishes()
      .then((data) => {
        if (active) setWishes(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredWishes = wishes.filter((wish) => {
    const type = normalizeType(wish.type);
    const relation = String(wish.relation || "").toUpperCase();
    const matchFilter =
      filter === "ALL" || type === filter || relation.includes(filter.slice(0, -1));
    const text = `${wish.name || ""} ${wish.relation || ""} ${wish.message || ""} ${wish.type || ""}`.toLowerCase();
    return matchFilter && text.includes(search.toLowerCase());
  });

  return (
    <section className="json-wishes-section" id="wishes">
      <div className="section-title">
        <p className="eyebrow">Blessings Wall</p>
        <h2>Family & Friends Wishes</h2>
        <p>Beautiful text messages, videos, photos and voice blessings for Yesu & Sridevi.</p>
      </div>

      <div className="gallery-controls wishes-controls">
        <div className="filter-buttons">
          {filters.map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {item[0] + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="search-wrap">
          <Search size={17} />
          <input placeholder="Search wishes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <EmptyState icon="♥" text="Loading wishes..." />
      ) : filteredWishes.length === 0 ? (
        <EmptyState icon="💌" text="No wishes found" />
      ) : (
        <div className="json-wishes-grid">
          {filteredWishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} onOpen={() => setSelectedWish(wish)} />
          ))}
        </div>
      )}

      {selectedWish && (
        <MediaPreviewModal
          item={{
            ...selectedWish,
            title: selectedWish.name,
            category: selectedWish.relation,
          }}
          index={0}
          onClose={() => setSelectedWish(null)}
          label="Blessing"
        />
      )}
    </section>
  );
}

function WishCard({ wish, onOpen }) {
  const type = normalizeType(wish.type);
  const hasMedia = type !== "TEXT" && (wish.mediaUrl || wish.image);

  return (
    <div className="json-wish-card glass-card">
      <div className="json-wish-top">
        <div>
          <h3>{wish.name}</h3>
          <p>
            {wish.relation} • {wish.date}
          </p>
        </div>
        <span>{wish.type}</span>
      </div>

      <p className="json-wish-message">{wish.message}</p>

      {hasMedia && (
        <button className={`json-wish-media ${type === "VIDEO" ? "json-video-thumb" : ""}`} onClick={onOpen}>
          {type === "VOICE" ? (
            <div className="json-voice-preview">
              <span>♥</span>
              <b>Play Voice Blessing</b>
            </div>
          ) : (
            <>
              <img
                src={getAsset(wish.image || wish.mediaUrl)}
                alt={wish.name}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              {type === "VIDEO" && <b>▶</b>}
            </>
          )}
        </button>
      )}

      {!hasMedia && <div className="text-wish-heart">♥</div>}
      <div className="json-wish-bottom">Yesu ♥ Sridevi</div>
    </div>
  );
}

function TimelineSection() {
  const [timeline, setTimeline] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadTimeline().then((data) => setTimeline(Array.isArray(data) ? data : []));
  }, []);

  const closeModal = () => setSelected(null);

  return (
    <section className="timeline-section" id="timeline">
      <div className="section-title">
        <p className="eyebrow">Love Journey</p>
        <h2>2019 – 2026 Love Journey</h2>
        <p>From first meeting to forever marriage.</p>
      </div>

      <div className="timeline-list">
        {timeline.map((item, index) => (
          <button key={item.id || item.year} className="timeline-card glass-card" onClick={() => setSelected(item)}>
            <div className="timeline-year">{item.year}</div>
            <div className="timeline-image">
              {Array.isArray(item.images) ? (
                <div className="timeline-images">
                  {item.images.map((imgSrc, idx) => (
                    <img
                      key={idx}
                      src={getAsset(imgSrc)}
                      alt={`${item.title} ${idx}`}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="timeline-image-thumb"
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={getAsset(item.image)}
                  alt={item.title}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              )}
            </div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <span className="timeline-dot">{index + 1}</span>
          </button>
        ))}
      </div>

      {selected && (
        <TimelineImageModal item={selected} onClose={closeModal} />
      )}
    </section>
  );
}

function TimelineImageModal({ item, onClose }) {
  const images = Array.isArray(item.images) ? item.images : [item.image];
  const [idx, setIdx] = useState(0);
  const total = images.length;

  const prev = () => setIdx((prev) => (prev - 1 + total) % total);
  const next = () => setIdx((prev) => (prev + 1) % total);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="preview-backdrop" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="preview-close" onClick={onClose}>×</button>
        {total > 1 && (
          <>
            <button className="preview-arrow preview-left" onClick={prev}><ChevronLeft size={24} /></button>
            <button className="preview-arrow preview-right" onClick={next}><ChevronRight size={24} /></button>
          </>
        )}
        <div className="preview-image-wrap">
          <img
            src={getAsset(images[idx])}
            alt={`Timeline ${item.year} image ${idx + 1}`}
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            className="preview-image"
          />
        </div>
        <div className="preview-info">
          <p className="preview-small">Year {item.year}</p>
          <h3>{item.title}</h3>
          <span>{idx + 1} / {total}</span>
        </div>
      </div>
    </div>
  );
}

function FinalBlessing() {
  const [gift, setGift] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showGift, setShowGift] = useState(false);

  useEffect(() => {
    let timerId;

    loadFinalGift().then((data) => {
      setGift(data);

      const updateCountdown = () => {
        const target = new Date(data.unlockDate).getTime();
        const now = Date.now();
        const difference = target - now;

        if (difference <= 0) {
          setIsUnlocked(true);
          setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: String(days).padStart(2, "0"),
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
        });
      };

      updateCountdown();
      timerId = setInterval(updateCountdown, 1000);
    });

    return () => timerId && clearInterval(timerId);
  }, []);

  if (!gift) {
    return <section className="final-gift-section glass-card" id="gift">Loading final gift...</section>;
  }

  return (
    <section className="final-gift-section glass-card" id="gift">
      <div className="final-gift-glow" />
      <p className="eyebrow">Final Surprise</p>
      <h2>{gift.title}</h2>
      <p className="final-gift-subtitle">{gift.message}</p>

      <div className="final-countdown-grid">
        {[
          [timeLeft.days, "Days"],
          [timeLeft.hours, "Hours"],
          [timeLeft.minutes, "Minutes"],
          [timeLeft.seconds, "Seconds"],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <button className={`final-gift-btn ${isUnlocked ? "active" : ""}`} disabled={!isUnlocked} onClick={() => setShowGift(true)}>
        {isUnlocked ? "Open Final Gift ♥" : "Gift Locked Until Wedding Day"}
      </button>

      <p className="final-gift-note">
        {isUnlocked ? "The final surprise is ready to open." : "This surprise will unlock automatically when the countdown ends."}
      </p>

      {showGift && <FinalGiftModal gift={gift} onClose={() => setShowGift(false)} />}
    </section>
  );
}

function FinalGiftModal({ gift, onClose }) {
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="final-modal-backdrop" onClick={onClose}>
      <div className="final-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="final-modal-close" onClick={onClose}>×</button>
        <div className="final-modal-heart">♥</div>
        <p className="final-modal-small">Final Wedding Surprise</p>
        <h3>{gift.subtitle}</h3>
        <p className="final-modal-message">{gift.message}</p>

        {gift.imageUrl && (
          <div className="final-modal-image">
            <img src={gift.imageUrl} alt="Final gift" />
          </div>
        )}

        {gift.videoUrl && (
          <div className="final-modal-video">
            <video src={gift.videoUrl} poster={gift.imageUrl} controls playsInline />
          </div>
        )}

        {gift.audioUrl && (
          <div className="final-modal-audio">
            <p>Play final blessing</p>
            <audio src={gift.audioUrl} controls />
          </div>
        )}
      </div>
    </div>
  );
}

function ContentManagerSection() {
  const [activeTab, setActiveTab] = useState("memories");
  const [memories, setMemories] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [status, setStatus] = useState("");
  const [memoryPreview, setMemoryPreview] = useState("");
  const [memoryMediaPreview, setMemoryMediaPreview] = useState("");
  const [wishPreview, setWishPreview] = useState("");
  const [wishMediaPreview, setWishMediaPreview] = useState("");

  const [memoryForm, setMemoryForm] = useState({
    type: "Photos",
    category: "Friends",
    title: "",
    image: "",
    mediaUrl: "",
    sender: "",
    relation: "",
  });

  const [wishForm, setWishForm] = useState({
    name: "",
    relation: "",
    type: "TEXT",
    message: "",
    image: "",
    mediaUrl: "",
    date: "Wedding Day",
  });

  useEffect(() => {
    loadMemories().then((data) => setMemories(Array.isArray(data) ? data : []));
    loadWishes().then((data) => setWishes(Array.isArray(data) ? data : []));
  }, []);

  const publicPath = (file, folder) => (file ? `/${folder}/${file.name}` : "");
  const updateMemory = (key, value) => setMemoryForm((prev) => ({ ...prev, [key]: value }));
  const updateWish = (key, value) => setWishForm((prev) => ({ ...prev, [key]: value }));

  const downloadJson = (fileName, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addMemoryItem = (e) => {
    e.preventDefault();
    if (!memoryForm.title || !memoryForm.image) {
      setStatus("Please add memory title and thumbnail image.");
      return;
    }
    const newItem = { id: Date.now(), ...memoryForm };
    setMemories((prev) => [newItem, ...prev]);
    setStatus("Memory added. Download memories.json and copy selected files into public folders.");
    setMemoryForm({ type: "Photos", category: "Friends", title: "", image: "", mediaUrl: "", sender: "", relation: "" });
    setMemoryPreview("");
    setMemoryMediaPreview("");
  };

  const addWishItem = (e) => {
    e.preventDefault();
    if (!wishForm.name || !wishForm.message) {
      setStatus("Please add sender name and message.");
      return;
    }
    const newItem = { id: Date.now(), ...wishForm };
    setWishes((prev) => [newItem, ...prev]);
    setStatus("Wish added. Download wishes.json and copy selected files into public folders.");
    setWishForm({ name: "", relation: "", type: "TEXT", message: "", image: "", mediaUrl: "", date: "Wedding Day" });
    setWishPreview("");
    setWishMediaPreview("");
  };

  return (
    <section className="content-manager-section" id="admin-builder">
      <div className="section-title">
        <p className="eyebrow">Admin Builder</p>
        <h2>Frontend JSON Content Manager</h2>
        <p>Add real memories and wishes, preview them, download JSON and replace files inside public/data.</p>
      </div>

      <div className="content-manager-tabs glass-card">
        <button className={activeTab === "memories" ? "active" : ""} onClick={() => setActiveTab("memories")}>Memories JSON</button>
        <button className={activeTab === "wishes" ? "active" : ""} onClick={() => setActiveTab("wishes")}>Wishes JSON</button>
      </div>

      {status && <p className="content-manager-status">{status}</p>}

      {activeTab === "memories" ? (
        <div className="content-manager-layout">
          <form className="content-builder-form glass-card" onSubmit={addMemoryItem}>
            <div className="builder-heart">♥</div>
            <h3>Add Memory</h3>
            <select value={memoryForm.type} onChange={(e) => updateMemory("type", e.target.value)}>
              <option value="Photos">Photo</option>
              <option value="Videos">Video</option>
              <option value="Voice">Voice</option>
            </select>
            <select value={memoryForm.category} onChange={(e) => updateMemory("category", e.target.value)}>
              <option value="Friends">Friends</option>
              <option value="Family">Family</option>
              <option value="Couple">Couple</option>
            </select>
            <input placeholder="Memory title" value={memoryForm.title} onChange={(e) => updateMemory("title", e.target.value)} />
            <label className="builder-file-box">
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                updateMemory("image", publicPath(file, "images"));
                setMemoryPreview(URL.createObjectURL(file));
              }} />
              <Upload size={22} />
              <b>Select thumbnail image</b>
              <small>{memoryForm.image || "Copy this image to public/images"}</small>
            </label>
            {memoryPreview && <div className="builder-preview"><img src={memoryPreview} alt="preview" /></div>}
            {memoryForm.type !== "Photos" && (
              <label className="builder-file-box">
                <input type="file" accept={memoryForm.type === "Videos" ? "video/*" : "audio/*"} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const folder = memoryForm.type === "Videos" ? "videos/gallery" : "audio/gallery";
                  updateMemory("mediaUrl", publicPath(file, folder));
                  setMemoryMediaPreview(URL.createObjectURL(file));
                }} />
                <Upload size={22} />
                <b>Select media file</b>
                <small>{memoryForm.mediaUrl || "Copy media file to matching public folder"}</small>
              </label>
            )}
            {memoryMediaPreview && memoryForm.type === "Videos" && <div className="builder-preview"><video src={memoryMediaPreview} controls /></div>}
            {memoryMediaPreview && memoryForm.type === "Voice" && <div className="builder-preview audio"><audio src={memoryMediaPreview} controls /></div>}
            <button className="builder-submit" type="submit">Add Memory</button>
          </form>

          <JsonOutput title="memories.json" data={memories} onDownload={() => downloadJson("memories.json", memories)} onRemove={(id) => setMemories((prev) => prev.filter((item) => item.id !== id))} />
        </div>
      ) : (
        <div className="content-manager-layout">
          <form className="content-builder-form glass-card" onSubmit={addWishItem}>
            <div className="builder-heart">♥</div>
            <h3>Add Wish</h3>
            <input placeholder="Sender name" value={wishForm.name} onChange={(e) => updateWish("name", e.target.value)} />
            <input placeholder="Relation ex: Friend, Mother" value={wishForm.relation} onChange={(e) => updateWish("relation", e.target.value)} />
            <select value={wishForm.type} onChange={(e) => updateWish("type", e.target.value)}>
              <option value="TEXT">Text</option>
              <option value="PHOTO">Photo</option>
              <option value="VIDEO">Video</option>
              <option value="VOICE">Voice</option>
            </select>
            <textarea rows="5" placeholder="Wish message" value={wishForm.message} onChange={(e) => updateWish("message", e.target.value)} />
            <input placeholder="Date ex: Wedding Day" value={wishForm.date} onChange={(e) => updateWish("date", e.target.value)} />
            {wishForm.type !== "TEXT" && (
              <>
                <label className="builder-file-box">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    updateWish("image", publicPath(file, "images"));
                    setWishPreview(URL.createObjectURL(file));
                  }} />
                  <Upload size={22} />
                  <b>Select sender/thumbnail image</b>
                  <small>{wishForm.image || "Copy image to public/images"}</small>
                </label>
                {wishPreview && <div className="builder-preview"><img src={wishPreview} alt="preview" /></div>}
                <label className="builder-file-box">
                  <input type="file" accept={wishForm.type === "PHOTO" ? "image/*" : wishForm.type === "VIDEO" ? "video/*" : "audio/*"} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const folder = wishForm.type === "PHOTO" ? "images" : wishForm.type === "VIDEO" ? "videos/wishes" : "audio/wishes";
                    updateWish("mediaUrl", publicPath(file, folder));
                    setWishMediaPreview(URL.createObjectURL(file));
                  }} />
                  <Upload size={22} />
                  <b>Select wish media file</b>
                  <small>{wishForm.mediaUrl || "Copy media file to matching public folder"}</small>
                </label>
              </>
            )}
            {wishMediaPreview && wishForm.type === "PHOTO" && <div className="builder-preview"><img src={wishMediaPreview} alt="preview" /></div>}
            {wishMediaPreview && wishForm.type === "VIDEO" && <div className="builder-preview"><video src={wishMediaPreview} controls /></div>}
            {wishMediaPreview && wishForm.type === "VOICE" && <div className="builder-preview audio"><audio src={wishMediaPreview} controls /></div>}
            <button className="builder-submit" type="submit">Add Wish</button>
          </form>

          <JsonOutput title="wishes.json" data={wishes} onDownload={() => downloadJson("wishes.json", wishes)} onRemove={(id) => setWishes((prev) => prev.filter((item) => item.id !== id))} />
        </div>
      )}

      <div className="content-manager-note glass-card">
        <b>Important:</b> This admin builder only creates JSON. It cannot save files into the public folder automatically. Copy files manually to public/images, public/videos/gallery, public/videos/wishes, public/audio/gallery, or public/audio/wishes.
      </div>
    </section>
  );
}

function JsonOutput({ title, data, onDownload, onRemove }) {
  return (
    <div className="content-output glass-card">
      <div className="content-output-top">
        <h3>{title}</h3>
        <button onClick={onDownload}><Download size={16} /> Download</button>
      </div>
      <div className="content-item-list">
        {data.map((item) => (
          <div className="content-mini-card" key={item.id}>
            <div>
              <h4>{item.title || item.name}</h4>
              <p>{item.category || item.relation} • {item.type}</p>
              <small>{item.mediaUrl || item.image || item.message}</small>
            </div>
            <button onClick={() => onRemove(item.id)}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function MusicPlayer({ playlist }) {
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  const song = playlist[current] || { title: "Perfect", subtitle: "Wedding Love Song", src: "/audio/love-song.mp3", cover: "/images/music-cover.svg" };

  useEffect(() => {
    if (audioRef.current && playing) {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  }, [current, playing]);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  const next = () => setCurrent((prev) => (prev + 1) % Math.max(playlist.length, 1));

  return (
    <div className="music-player glass-card">
      <audio ref={audioRef} src={song.src} onEnded={next} />
      <img src={song.cover || "/images/music-cover.svg"} alt={song.title} />
      <div className="music-info">
        <p>{song.title}</p>
        <span>{song.subtitle}</span>
      </div>
      <button onClick={toggle}>
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <button onClick={next} aria-label="next song">
        <Volume2 size={18} />
      </button>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="json-loading glass-card">
      <div>{icon}</div>
      <p>{text}</p>
    </div>
  );
}

export default App;
