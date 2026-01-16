# 🍳 Món Ngon Mỗi Ngày (Food Daily)

> **Assistant for your daily meal planning. Simple. Calm. Offline-first.**

A Progressive Web App (PWA) built to solve the "What should I eat today?" dilemma without decision fatigue.

![App Screenshot](/public/icon.png)

## ✨ Key Features

### 🎲 Smart Random Logic
- **Constraint-Based**: Randomizes meals based on budget, dish counts, and history.
- **Intelligent Fallback**:
    1.  **Strict Mode**: No repetition in 7 days, strict tag rules (e.g., no eggs 2 meals in a row).
    2.  **Relaxed History**: If strict fails, allows older recent dishes.
    3.  **Relaxed Rules**: If that fails, allows rule-breaking (with warnings).
    4.  **Cheapest**: If budget is too low, finds the best fit sorted by price.

### 🧠 Meaningful AI (Gemini Pro)
- **Explanation**: "Why this meal?" - Explains the choice based on variety and balance.
- **Suggestion**: Suggests **new** dishes to add to your database based on what you *don't* have.
- **Replacement**: Replace a single dish in a combo while keeping the rest and staying within budget.
- **Habit Analysis**: Analyzes your last 30 days of history to give friendly, non-judgmental insights.

### ⚡ PWA & Offline First
- **Offline Mode**: Works 100% offline. Falls back to local data if the server/network is unreachable.
- **Installable**: Install prompt on mobile/desktop.
- **Persistent**: Syncs data when back online (Simulated for now with SQLite/Local dual strategy).

### 🥗 Features for Humans
- **No Login Required**: Open and use.
- **Daily Check-in**: A quiet prompt after 6 PM to track if you followed the plan.
- **Silent & Calm**: No gamification, no streaks, no noise. Just a tool.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via `@libsql/client` - Turso)
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion + Canvas Confetti
- **AI**: Google Gemini Pro (`@google/generative-ai`)
- **PWA**: `@ducanh2912/next-pwa`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Turso Database or Local SQLite file
- Google Gemini API Key

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/JethroHawthorn/daily_food.git
    cd daily_food
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    Create `.env` file:
    ```env
    TURSO_URL="your-turso-url-or-file:local.db"
    TURSO_TOKEN="your-turso-token"
    GEMINI_API_KEY="your-gemini-key"
    ```

4.  **Initialize Database**
    ```bash
    node scripts/init-db.js
    ```

5.  **Run Development**
    ```bash
    npm run dev
    ```

## 📱 PWA Tips
- **iOS**: Share -> Add to Home Screen.
- **Android**: Chrome menu -> Install App.

## 🤝 Contributing
Usage is personal, but feel free to fork and adapt for your own daily needs!

## 📄 License
MIT
