# NexaSupport AI 🚀

NexaSupport AI is an **AI-Powered IoT Customer Support, Device Diagnostics, & Automated Query Resolution Platform**. It combines Next.js, Prisma, PostgreSQL, and an AI Copilot to provide automated hardware diagnostics, real-time telemetry monitoring, and seamless human-escalation ticketing.

---

## 🛠️ Tech Stack
- **Frontend & Backend**: Next.js 16.3 (App Router)
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Styling**: Tailwind CSS & Shadcn UI
- **AI Engine**: Live LLM Integration (NVIDIA NIM) with Mock fallback for RAG (Retrieval-Augmented Generation).

---

## 💻 How to Set Up & Start the Project

### Prerequisites
Make sure you have the following installed on your machine:
1. **Node.js** (v18 or higher recommended)
2. **Docker Desktop** (Required for the PostgreSQL database)

### Step 1: Clone & Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root of your project if it doesn't already exist, and add the following configuration:

```env
# Database Configuration (matches the docker-compose setup)
DATABASE_URL="postgresql://postgres:postgres@localhost:5440/nexasupport?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-replace-me"

# AI Configuration (Optional)
# If left empty, the app will safely use the built-in Mock RAG Engine
NVIDIA_API_KEY=""
```

### Step 3: Start the Database
Ensure Docker Desktop is running. Then, start the PostgreSQL database container:
```bash
docker-compose up -d
```

### Step 4: Setup Database Schema & Seed Data
Once the database is running, push the Prisma schema and seed the initial data (Users, IoT Devices, Knowledge Base manuals, etc.):
```bash
# Push the schema to the database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed the database with mock users and IoT data
npx prisma db seed
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Your application will now be running at [http://localhost:3000](http://localhost:3000)!

---

## 🔑 Default Login Credentials (from Seed)

The database seed creates a few default accounts you can use to test the platform.

**Customer Portal Account:**
- **Email**: customer@nexa.com
- **Password**: password123
- *Accesses*: My Devices, AI Copilot Chat, Tickets

**Support Agent Account:**
- **Email**: agent@nexa.com
- **Password**: password123
- *Accesses*: Agent Inbox, Device Telemetry, Ticket Resolution

**Admin Account:**
- **Email**: admin@nexa.com
- **Password**: password123
- *Accesses*: System Overview, Fleet Analytics

---

## 🤖 Offline Demo Mode Questions

If you run the application in Offline Demo Mode (e.g. without a valid AI API key), you can test the AI Copilot by asking any of these 10 built-in test questions:

1. **"What is my device status?"** (Checks database for offline/critical devices)
2. **"Check my temperature warnings."** (Simulates a temperature diagnostic)
3. **"Is there a water leak?"** (Simulates a water sensor alert)
4. **"I want to speak to a human support agent."** (Triggers escalation flow)
5. **"What is the normal operating temperature for NexaSense T100?"** (Searches offline manual)
6. **"How do I install the NexaGuard D200 door sensor?"** (Searches offline manual)
7. **"How do I recalibrate the NexaAir A300 air quality sensor?"** (Searches offline manual)
8. **"How do I install the NexaPower P400 power meter?"** (Searches offline manual)
9. **"Why is my device dropping offline?"** (Searches offline troubleshooting guide)
10. **"How can I extend the battery life?"** (Searches offline battery optimization guide)

---

## 🚨 Troubleshooting & Common Issues

### 1. `PrismaClientInitializationError` / "Can't reach database server"
- **Cause**: The PostgreSQL database isn't running or the port (5440) is blocked.
- **Fix**: Open Docker Desktop and make sure the `nexasupport-db` container is running. If it isn't, run `docker-compose up -d` in your terminal.

### 2. `PrismaClientValidationError` / "Unknown field in include statement"
- **Cause**: The database schema was updated but the Prisma Client wasn't regenerated.
- **Fix**: Run `npx prisma generate` in your terminal. Restart your Next.js server (`npm run dev`).

### 3. AI Copilot Returns "404 Not Found" or Crashes
- **Cause**: The `NVIDIA_API_KEY` provided in your `.env` file is expired, invalid, or restricts access to the requested models.
- **Fix**: The application has a robust mock engine built-in. Remove or comment out `NVIDIA_API_KEY` from your `.env` file and restart the server. The app will automatically switch to the Mock RAG Engine and pull responses directly from your local database KnowledgeBase.

### 4. "Module not found" Errors
- **Cause**: Missing NPM packages.
- **Fix**: Run `npm install` to ensure all packages in `package.json` are installed correctly.

### 5. Port 3000 is already in use
- **Cause**: Another background process or Next.js server is already running on port 3000.
- **Fix**: Kill the existing terminal process, or run Next.js on a different port using `npm run dev -- -p 3001`.
