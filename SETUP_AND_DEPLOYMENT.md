# Creator OS: Complete Setup & Real Account Integration Guide

This guide covers the exact steps needed to run the Creator OS platform locally and explains the architecture required to connect and publish to real social media accounts (Instagram, Facebook, X/Twitter, LinkedIn, YouTube).

---

## Part 1: Running the Application Locally

### Prerequisites
1.  **Node.js**: Install version 16 or higher from [nodejs.org](https://nodejs.org/).
2.  **MongoDB**: 
    - **Option A (Local)**: Install MongoDB Community Server and have it running locally (`mongodb://localhost:27017`).
    - **Option B (Cloud)**: Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster and get your connection string.
3.  **Redis**: Redis is **required** for the BullMQ job queues (post scheduling, background analytics fetching).
    - **Windows**: Use WSL2 (Windows Subsystem for Linux) and install Redis (`sudo apt install redis-server`), or use Memurai.
    - **Mac**: `brew install redis` and `brew services start redis`.
    - **Cloud**: Use a managed Redis service like Upstash or Redis Labs.

### Step 1: Backend Setup
The backend handles the API, database connection, and background workers.

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the necessary Node.js packages:
   ```bash
   npm install
   ```
3. Create a file named `.env` in the `backend` folder and add these baseline variables:
   ```env
   # Server Configuration
   PORT=5000
   
   # Database Configuration
   MONGO_URI=mongodb://127.0.0.1:27017/creator-os
   
   # Authentication Secret (Change this to a random string)
   JWT_SECRET=super_secret_dev_key_123
   
   # Redis Configuration for BullMQ
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   
   # Open AI Key (For the Caption Generator)
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the backend development server. This will boot up Expres and initialize all BullMQ background workers:
   ```bash
   npm run dev
   ```
   *You should see "MongoDB connected" and "Server running on port 5000" in the console.*

### Step 2: Frontend Setup
The frontend is built with React and Vite.

1. Open a new, separate terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder to point to the backend API:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`. You can now register a user, create an organization, and access the Creator OS dashboard!

---

## Part 2: Connecting Real Social Media Accounts

To make Creator OS interact with real accounts (analytics fetching, one-stop publishing, unified inbox), you must configure **OAuth Applications** with each individual platform's Developer Portal.

Currently, the `SocialAccount` model expects an access token. Here is how that token is acquired and how the platform uses it.

### The Standard OAuth Flow
1. User clicks "Connect Facebook" in Creator OS.
2. The backend redirects the user to Facebook's OAuth page.
3. The user grants Creator OS permission to manage their pages.
4. Facebook redirects back to Creator OS with an authorization code.
5. The backend swaps that code for a long-lived **Access Token** and saves it in the `SocialAccount` MongoDB document.
6. The background workers (BullMQ) use this token to authenticate API calls to Facebook.

### Platform-Specific Setup Guides

#### 1. Meta (Facebook & Instagram)
**How it works:** Facebook Pages and Instagram Professional accounts are linked. You use the Facebook Graph API to publish to both.
1. Go to [Meta for Developers](https://developers.facebook.com/).
2. Create an App (Type: Business).
3. Add the **Facebook Login for Business** and **Instagram Graph API** products.
4. Add your Creator OS redirect URI (e.g., `http://localhost:5000/api/social/callback/facebook`) to the Valid OAuth Redirect URIs.
5. Request Permissions (App Review required for production): `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`.
6. Add your Meta credentials to `backend/.env`:
   ```env
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   ```

#### 2. X (Twitter)
**How it works:** X uses OAuth 2.0 with PKCE for secure authentication. You use the X API v2 endpoints to post tweets or threads.
1. Go to the [X Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2. Create a Project and an App.
3. Set up User Authentication settings (OAuth 2.0).
4. Set the Type of App to "Web App" and add your callback URI (e.g., `http://localhost:5000/api/social/callback/x`).
5. Request Scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`.
6. Add your X credentials to `backend/.env`:
   ```env
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   ```

#### 3. LinkedIn
**How it works:** LinkedIn uses the standard OAuth 2.0 flow to acquire a token to post to personal profiles or company pages (Organization UgcPosts).
1. Go to the [LinkedIn Developer Portal](https://developer.linkedin.com/).
2. Create an App.
3. Go to the "Auth" tab and add your Redirect URL.
4. Request Products: "Share on LinkedIn" and "Sign In with LinkedIn".
5. Request Scopes: `w_member_social`, `r_liteprofile`.
6. Add your LinkedIn credentials to `backend/.env`:
   ```env
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

#### 4. YouTube (Google)
**How it works:** Google OAuth allocates a refresh token that the backend stores to upload videos using the YouTube Data API v3.
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project.
3. Enable the **YouTube Data API v3**.
4. Configure the OAuth Consent Screen (External).
5. Create Credentials (OAuth Client ID -> Web Application) and add your redirect URI.
6. Request Scopes: `https://www.googleapis.com/auth/youtube.upload`.
7. Add your Google credentials to `backend/.env`:
   ```env
   YOUTUBE_CLIENT_ID=your_client_id
   YOUTUBE_CLIENT_SECRET=your_client_secret
   ```

---

## Part 3: Architecture Breakdown for Real Accounts

Once you have your OAuth tokens, here is how Creator OS handles the heavy lifting:

### 1. Unified Multi-Platform Publishing
When a user clicks "Schedule Post" in the Composer:
1. The backend saves the `Post` and creates a `PostVariant` for each selected platform.
2. It pushes a job to the **Redis `postSchedulerQueue`** with the designated publish time.
3. **The Worker (`backend/workers/postSchedulerWorker.js`)**:
   - When the scheduled time hits, BullMQ picks up the job.
   - It retrieves the stored OAuth `accessToken` for the specific `SocialAccount`.
   - It routes the payload through a "Platform Adapter" (e.g., `publishToLinkedIn(variant, token)`), which translates your raw caption and media into the specific JSON format LinkedIn expects.
   - It makes the HTTP POST request. If it fails due to a rate limit, BullMQ automatically retries the job with exponential backoff.

### 2. Analytics Fetching
Creator OS doesn't rely on users opening the dashboard to fetch stats; it happens in the background.
1. **The Worker (`backend/workers/analyticsWorker.js`)**:
   - A cron job runs every night at midnight (or hourly).
   - It iterates over every connected `SocialAccount` in the database.
   - It asks the respective platform (e.g., "Meta, get me the page impressions for Facebook Page XYZ using AccessToken ABC").
   - It saves that data point into the `Analytics` snapshot collection.
   - The Frontend Recharts components read from this snapshot collection, making the dashboard load instantly without waiting on 5 different APIs.

### 3. Unified Inbox & Real-time Webhooks
To populate the Inbox immediately when a user comments on your post, we use Webhooks.
1. **The Listener (`backend/routes/webhookRoutes.js`)**:
   - Creator OS exposes a public endpoint (e.g., `https://api.yourdomain.com/api/webhooks/meta`).
   - In the Meta Developer Portal, you subscribe to "messages" and "feed" events and point them to this URL.
2. **The Flow**:
   - A user comments on your Instagram post.
   - Meta sends an HTTP POST to your webhook endpoint containing the comment text and the sender's ID.
   - Your webhook parses the payload, finds the Organization that owns the connected Instagram account, and saves it as a `Message` in the database.
   - *Note:* Webhooks require your backend to be hosted on a public HTTPS domain. If testing locally, you must use a tunneling service like **ngrok** (`ngrok http 5000`) and provide the ngrok URL to Meta/X.
