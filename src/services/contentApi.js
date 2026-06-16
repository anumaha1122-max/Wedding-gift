export async function getJsonData(path, fallback = []) {
  try {
    const response = await fetch(path, { cache: "no-store" });

    if (!response.ok) {
      console.warn(`Unable to load ${path}`);
      return fallback;
    }

    return await response.json();
  } catch (error) {
    console.warn(`JSON loading error for ${path}:`, error);
    return fallback;
  }
}

export function loadSite() {
  return getJsonData("/data/site.json", {});
}

export function loadMemories() {
  return getJsonData("/data/memories.json", []);
}

export function loadWishes() {
  return getJsonData("/data/wishes.json", []);
}

export function loadTimeline() {
  return getJsonData("/data/timeline.json", []);
}

export function loadFinalGift() {
  return getJsonData("/data/final-gift.json", {
    unlockDate: "2026-12-31T18:00:00",
    title: "Love Converted Into Marriage",
    subtitle: "A final surprise for Yesu & Sridevi",
    message:
      "Seven years of love are now becoming forever. This is a digital gift filled with memories, blessings and love.",
    imageUrl: "",
    videoUrl: "",
    audioUrl: "",
  });
}

export function loadLoveGame() {
  return getJsonData("/data/love-game.json", {});
}
