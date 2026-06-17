# Communify 🪐

**Communify** is a high-performance, real-time networking and intelligence matrix designed exclusively for elite innovators. While traditional professional platforms remain passive, Communify actively facilitates collaboration by pairing builders using a custom technical synergy matchmaking engine, domain-specific communication hubs, and a cinematic, data-dense interface.

---

## 🚀 Key Features

### 🪐 Orbit (Dashboard / Command Center)
*   **Live Telemetry Ticker:** Real-time simulated system events that animate platform activity.
*   **Match Engine Results:** AI-driven suggestion feed showing the top connections computed by a custom algorithmic synergy engine.
*   **Opportunity Feed:** Highly visual list of active hackathons, bounties, and internship postings with dynamic match percentages and urgency markers.
*   **Collab Score & Rank:** A gamified reputation matrix to encourage active sharing and project execution.

### 📡 Radar (Global Telemetry & Leaderboard)
*   **Live Feed Terminal:** A matrix-style terminal tracking global activities across all interest hubs.
*   **Interactive Leaderboard:** Showcases the top visionaries with detailed, Framer Motion-animated pop-ups displaying Top Skills and Network Impact.
*   **Cinematic Synergy Core:** A pulsing, rotating SVG/CSS animation representing the engine's core intelligence.

### 🎯 Nexus (Opportunity Hub)
*   **3D Interactive Cards:** Opportunity cards that physically "lift off" the page with glowing hover shadows.
*   **Deployment Flow:** Simple filters for different engagement types (e.g., Hackathons, Internships) and a streamlined opportunity posting module.

### 🌐 Hubs (Domain-Specific Feeds)
*   **Targeted Nodes:** Dedicated channels for specific domains (AI, Web3, Fintech, etc.).
*   **Noise Filtration:** Keeps communication channels highly focused on relevant discussions.

### 🛡️ Teams (Collaborative Projects)
*   **Workspace Execution:** Create collaborative projects, assign domain responsibilities, and recruit team members.

### 💬 Neural Inbox (Messaging)
*   **Socket.io Integration:** High-speed, secure, real-time direct messaging.
*   **Connection Gated:** Only linked visionaries can send messages, keeping the environment spam-free.

### 👤 Identity Matrix (Profile)
*   **Capability Grid:** Displays skills, collaboration scores, and links to GitHub/portfolio assets.

---

## 🛠️ The Tech Stack

*   **Frontend:** React.js, Tailwind CSS (v4), Framer Motion, Zustand (State Management), Axios, Socket.io-client.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB via Mongoose.
*   **Real-Time Layer:** Socket.io (real-time chat and global activity telemetry).
*   **Authentication:** Stateless JSON Web Token (JWT) system.

---

## ⚡ Technical "Secret Sauce"

1.  **Custom Match Engine (`services/matchEngine.js`):**
    *   **TF-IDF Weighted Skill Proximity:** Rare skills (e.g., CUDA, Solidity) carry more weight than common skills when computing compatibility scores.
    *   **Logarithmic Experience Decay:** Normalizes connections between developers of different skill levels, allowing juniors and seniors to pair while preventing massive mismatch outliers.
2.  **Procedural Data Seeding (`seedMassive.js` / `seed.js`):**
    *   Generates a mock network of 50+ users, relationships, posts, and opportunities. Ensures the application looks data-rich and functional immediately after setup.

---

## 💻 Local Setup & Installation

Follow these steps to run the application locally on your machine:

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017` (or access to a MongoDB Atlas cluster).

### Step 1: Install Dependencies
A root-level helper has been configured. Run the following command in the project root to install all dependencies for both the frontend (`client`) and backend (`server`):
```bash
npm run install:all
```

### Step 2: Configure Environment Variables
Create a file named `.env` in the `server/` directory and populate it with the following configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/communify
JWT_SECRET=communify_secret_key_2026_futuristic
NODE_ENV=development
```

### Step 3: Seed the Database (Optional but Recommended)
To populate your MongoDB database with high-density mock users, hubs, connections, and posts:
```bash
# Seed standard demo data
npm run seed

# OR seed a massive network
npm run seed:massive
```

### Step 4: Run the Application
Start both the React development server and the Node/Express backend concurrently:
```bash
npm run dev
```

The application will launch on:
*   **Frontend:** `http://localhost:5173` (Vite dev server)
*   **Backend:** `http://localhost:5000` (API & Socket Server)
