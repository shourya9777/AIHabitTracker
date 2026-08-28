# AIHabitTracker
# 🤖 AI Habit Tracker

A full-stack AI-powered habit tracking application that helps users build consistent habits, monitor their progress, analyze performance, and receive personalized AI-generated insights and motivation.

The application provides habit management, completion tracking, streak calculations, weekly analytics, AI habit suggestions, recovery plans, conversational habit analysis, and personalized morning motivation.

---

## 📸 Application Screenshots

> Add screenshots of your application in the sections below.

### 🏠 Dashboard

<!-- Add Dashboard screenshot here -->

![Dashboard Screenshot](./screenshots/dashboard.png)

---

### 📋 Habits

<!-- Add Habits page screenshot here -->

![Habits Screenshot](./screenshots/habits.png)

---

### 📊 Weekly Insights

<!-- Add Weekly Insights screenshot here -->

![Weekly Insights Screenshot](./screenshots/weekly-insights.png)

---

### 🧠 AI Insights

<!-- Add AI Insights screenshot here -->

![AI Insights Screenshot](./screenshots/ai-insights.png)

---

### 📈 Statistics

<!-- Add Statistics screenshot here -->

![Statistics Screenshot](./screenshots/statistics.png)

---

### ⚙️ Settings

<!-- Add Settings screenshot here -->

![Settings Screenshot](./screenshots/settings.png)

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Protected API routes
- Persistent authentication across page refreshes
- User profile management
- Display name and avatar support

### 📝 Habit Management

- Create new habits
- Edit existing habits
- Delete habits
- Archive habits
- Unarchive habits
- Search habits
- Filter habits by category
- Set habit frequency
- Set weekly target days
- Customize habit colors
- Assign habit icons
- Reorder habits

### ✅ Habit Completion Tracking

- Mark habits as completed
- Unmark completed habits
- Track completion dates
- Daily habit progress
- Weekly progress
- 30/90-day activity tracking
- Habit streak calculation
- Longest streak tracking

### 📊 Statistics & Analytics

- Current streak
- Longest streak
- Completion rate
- Monthly completion breakdown
- 30-day habit performance
- Weekly completion trends
- Daily completion analysis
- Category-based activity analysis
- Habit performance comparison
- Activity heatmap

### 🤖 AI Features

The application integrates Google's Gemini API to provide personalized AI-powered features.

#### Weekly AI Report

Automatically generates a personalized weekly report based on the user's habit activity.

The report analyzes:

- Successful habits
- Struggling habits
- Completion patterns
- Weekly progress
- Areas for improvement
- Recommendations for the following week

#### AI Habit Suggestions

Users can provide:

- Goals
- Most productive time
- Previous struggles

The AI generates personalized habit recommendations.

#### 🔄 Recovery Plan

When a user breaks a habit streak, the AI can generate a personalized three-day recovery plan.

The plan contains:

- Day 1 action
- Day 2 action
- Day 3 action
- Encouraging guidance

#### 💬 AI Habit Chat

Users can ask questions about their habit performance.

The AI receives contextual information about the user's recent habit activity and provides data-driven answers.

#### 🌅 Morning Motivation

The application can generate a personalized morning message based on:

- Current habits
- Current streaks
- Today's completion progress

Users can enable or disable morning motivation from Settings.

---

## 🏗️ Tech Stack

### Frontend

- React.js
- React Router
- Axios
- Tailwind CSS
- Lucide React
- date-fns
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI

- Google Gemini API
- `@google/genai`

### Development Tools

- Vite
- Nodemon
- Git
- GitHub
- VS Code

---

## 📁 Project Structure

```text
AIHabitTracker/
│
├── backend/
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── habitController.js
│   │   └── logController.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── AIInsight.js
│   │   ├── Habit.js
│   │   ├── HabitLog.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── ai.js
│   │   ├── auth.js
│   │   ├── habits.js
│   │   └── log.js
│   │
│   ├── utils/
│   │   ├── aiService.js
│   │   └── dateHelpers.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── components/
│   │   │   ├── MorningMotivation.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ...
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Habits.jsx
│   │   │   ├── Insights.jsx
│   │   │   ├── Weekly.jsx
│   │   │   └── Statistics.jsx
│   │   │
│   │   ├── utils/
│   │   │   └── dateHelpers.js
│   │   │
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── .env
│
├── screenshots/
│   ├── dashboard.png
│   ├── habits.png
│   ├── weekly-insights.png
│   ├── ai-insights.png
│   ├── statistics.png
│   └── settings.png
│
└── README.md
