LBC OVERLAY - LEADERBOARD WIDGET
Version: 1.0 
--------------------------------------------------

1. PACKAGE CONTENTS
-------------------
/leaderboard
  ├── index.html   (Main entry point)
  ├── style.css    (Black & Gold Theme)
  ├── script.js    (WebSocket Logic & UI Controller)
  └── README.txt   (This file)

2. DEPLOYMENT INSTRUCTIONS (SYSADMIN)
-------------------------------------
1. Extract this folder to your release directory:
   Target: /srv/lbc/overlays/releases/[version]/leaderboard/

2. Ensure Nginx/Apache serves this directory as static content.

3. No build step (npm/node) is required. These are raw static files.

3. QA / TESTING INSTRUCTIONS
----------------------------
The overlay has a built-in "Simulation Mode" for QA to verify animations 
without needing a live backend connection.

- Production Mode (Default):
  URL: .../leaderboard/index.html
  Behavior: Connects to WebSocket, waits for real events. Shows "Waiting..." if no data.

- Simulation Mode (For QA):
  URL: .../leaderboard/index.html?sim=true
  Behavior: Auto-generates fake tips and leaderboard updates every 5-10 seconds.
  Use this to verify animations, font rendering, and layout in OBS.

4. CONFIGURATION
----------------
To point to the production WebSocket Gateway:

1. Open 'script.js' in a text editor.
2. Edit the CONFIG object at the top (Line 7):
   
   const CONFIG = {
       wsUrl: "wss://overlays.lbc.domain/ws/events",  <-- UPDATE THIS URL
       ...
   };