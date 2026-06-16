YESU & SRIDEVI WEDDING MEMORY WEBSITE

Password:
2519

Run commands:
1) npm install
2) npm run dev
3) Open http://localhost:5173

Admin JSON Builder:
Open http://localhost:5173/?admin=2519
Use it to create new memories.json and wishes.json.
Then copy downloaded JSON into public/data.
Copy selected media files into the correct public folder.

Data files:
public/data/site.json          - Couple names, hero text, hero images, music playlist
public/data/memories.json      - Gallery photos/videos/voice memories
public/data/wishes.json        - Family/friends wishes and blessings
public/data/timeline.json      - 7 years love journey
public/data/love-game.json     - One game: 7 Hearts Love Quest
public/data/final-gift.json    - Countdown and final gift details

Media folders:
public/images                  - Photos, thumbnails, hero images, year images
public/videos/gallery          - Gallery videos and final gift video
public/videos/wishes           - Friends/family video wishes
public/audio/gallery           - Gallery voice/audio memories
public/audio/wishes            - Friends/family voice wishes
public/audio                   - Background music and final blessing audio

How to add gallery memory:
1) Copy photo into public/images.
2) Copy video/audio into public/videos/gallery or public/audio/gallery if needed.
3) Add object in public/data/memories.json.

Example video memory:
{
  "id": 100,
  "type": "Videos",
  "category": "Friends",
  "title": "College Friends Memory",
  "image": "/images/my-thumb.jpg",
  "mediaUrl": "/videos/gallery/my-video.mp4"
}

How to add family/friend wish:
1) Copy sender image into public/images.
2) Copy video/audio into public/videos/wishes or public/audio/wishes.
3) Add object in public/data/wishes.json.

Example voice wish:
{
  "id": 200,
  "name": "Mom",
  "relation": "Mother",
  "type": "VOICE",
  "message": "God bless Yesu and Sridevi.",
  "image": "/images/mom.jpg",
  "mediaUrl": "/audio/wishes/mom-voice.mp3",
  "date": "Wedding Day"
}

How to change countdown date:
Open public/data/final-gift.json and change unlockDate.
Example:
"unlockDate": "2026-12-31T18:00:00"

How to change password:
Open src/components/AuthGate.jsx and change:
const SECRET_PASSWORD = "2519";

Important:
This is a frontend-only website. It uses JSON files in public/data instead of backend hardcoding.
For real-time online uploads by guests, add Firebase Storage + Firestore later.
