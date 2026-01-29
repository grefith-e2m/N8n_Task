# Supabase Integration Setup Guide

This chatbot is now configured to use Supabase as the backend for lead management and interaction logging.

## 1. Prerequisites

- **Node.js** installed.
- A **Supabase** account (Free tier is sufficient).

## 2. Setup Steps

### Step A: Create Supabase Project
1. Log in to [Supabase](https://supabase.com/dashboard).
2. Create a new project.
3. Get your **Project URL** and **anon public key** from the API settings.

### Step B: Database Schema
1. Go to the **SQL Editor** in your Supabase dashboard.
2. Open the file `supabase_schema.sql` from this project.
3. Copy the content and run it in the SQL Editor to create the `leads` and `interactions` tables.

### Step C: Environment Variables
1. Create a file named `.env` in the root directory (`e2m-chatbot/`).
2. Copy the content from `.env.example`.
3. Replace the placeholder values with your actual keys:

```
VITE_SUPABASE_URL=https://mqjlqbztiarginzbradf.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xamxxYnp0aWFyZ2luemJyYWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjkxMzUsImV4cCI6MjA4NTI0NTEzNX0.M3eis_hU02X4y4jg7LA5_gIi53HKpVi-93IfjuEnX8g
```

### Step D: Install Dependencies
Run the following command in the terminal to install the Supabase client:

```bash
cd e2m-chatbot
npm install
```

### Step E: Run the Application
Start the development server:

```bash
npm run dev
```

## 3. Data Structure

- **Leads Table**: Stores Name and Email. Enforces unique email constraint.
- **Interactions Table**: Logs every Question, Answer, Intent, and Status.
- **Unanswered Queries**: If the bot cannot find an answer, it logs the status as `UNANSWERED`.

## 4. Admin Dashboard
- Access `http://localhost:5173/admin.html` (port number may vary).
- The dashboard auto-refreshes every 10 seconds.
- You can filter by **Intent** (High/Medium/Low) and **Status** (Answered/Unanswered).
