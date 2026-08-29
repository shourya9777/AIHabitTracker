🚀 AI Habit Tracker

An AI-powered Habit Tracker application that helps users build better habits, track their progress, and manage their daily routines. The application consists of a separate Frontend and Backend.

📁 Project Structure
AIHabitTracker/
│
├── frontend/        # Frontend application
├── backend/         # Backend server and API
├── .gitignore
└── README.md
🛠️ Prerequisites

Before running this project, make sure you have the following installed:

Node.js
npm
A MongoDB Atlas account and database
A Google Gemini API key
⚙️ Installation & Setup
1. Clone the Repository
git clone https://github.com/shourya9777/AIHabitTracker.git

Navigate to the project folder:

cd AIHabitTracker
2. Configure Environment Variables

Create a .env file inside the backend folder and add the following variables:

MONGO_URI=YOUR_MONGO_URI
JWT_SECRET=YOUR_SECRET_KEY
JWT_EXPIRES_IN=YOUR_EXPIRATION_TIME
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=YOUR_GEMINI_MODEL
CLIENT_URL=YOUR_FRONTEND_URL
🔐 Environment Variables Explained
Variable	Description
MONGO_URI	Your MongoDB Atlas connection string
JWT_SECRET	A secret key used for JWT authentication
JWT_EXPIRES_IN	The expiration time for JWT tokens
GEMINI_API_KEY	Your Google Gemini API key
GEMINI_MODEL	The Gemini model used by the application
CLIENT_URL	The URL where the frontend application is running

⚠️ Important: Never upload your .env file, MongoDB password, API keys, or other secrets to GitHub.

▶️ How to Run the Project

The frontend and backend need to be run separately. Open two terminals from the main project folder.

💻 Terminal 1 — Start the Backend

Navigate to the backend folder:

cd backend

Install the dependencies:

npm install

Start the backend server:

npm start
🌐 Terminal 2 — Start the Frontend

Open a new terminal and navigate to the frontend folder:

cd frontend

Install the dependencies:

npm install

Start the frontend application:

npm start
🎉 Open the Application

Once both the frontend and backend servers are running, open the URL shown in your frontend terminal in your web browser.

You should now be able to use the AI Habit Tracker! 🚀

📝 Quick Start
Terminal 1:
cd backend
npm install
npm start
Terminal 2:
cd frontend
npm install
npm start