import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAsset, FALLBACK_IMAGE } from "../App.jsx"; // adjust import path if necessary

/**
 * Carousel component to display a series of images with left/right navigation.
 * Used inside the timeline cards to browse multiple year images.
 */
export default function TimelineImageCarousel({ images = [] }) {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  if (total === 0) return null;

  return (
    <div className="timeline-image-carousel glass-card">
      {total > 1 && (
        <>
          <button className="carousel-arrow left" onClick={prev} aria-label="Previous image">
            <ChevronLeft size={20} />
          </button>
          <button className="carousel-arrow right" onClick={next} aria-label="Next image">
            <ChevronRight size={20} />
          </button>
        </>
      )}
      <img
        src={getAsset(images[idx])}
        alt={`Timeline image ${idx + 1}`}
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
        className="carousel-image"
      />
    </div>
  );
}
