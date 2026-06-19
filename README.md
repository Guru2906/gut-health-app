# Gut Health App

Gut Health App is a full-stack web application designed to generate personalized meal plans based on a user's health goal, physical profile, dietary preference, and selected date range. The application also includes meal tracking, nutrition summary analytics, PDF export, and an admin panel for managing the meal dataset.

## Features

- User signup and login
- Splash screen with intro video and automatic redirection
- User profile creation and update
- Profile validation for name, age, gender, height, weight, and dietary preference
- Existing profile fetch from Firebase Firestore
- Health goal selection
- Support for multiple goals:
  - Gut Health
  - Immunity
  - Energy Boost
  - Hormonal Balance
- Date range selection for meal planning
- Personalized meal plan generation based on:
  - selected health goal
  - user dietary preference
  - user profile details
  - selected start and end dates
- Daily meal planning for:
  - Morning Drink
  - Breakfast
  - Lunch
  - Snacks
  - Dinner
- Daily nutrition totals including:
  - Calories
  - Protein
  - Carbohydrates
  - Fats
  - Fiber
- Meal completion tracking using checkboxes
- Day-by-day navigation through the generated meal plan
- Summary dashboard showing:
  - target intake
  - actual intake based on completed meals
  - compliance percentage
- Interactive nutrient comparison chart
- Clickable nutrient contribution details
- Export full meal plan as PDF
- Sidebar navigation
- Logout support
- Admin panel for meal dataset management
- Admin operations:
  - Add meals
  - View meals
  - Edit meals
  - Delete meals

## Tech Stack

- Frontend: React
- Backend: FastAPI
- Database: Firebase Firestore
- Styling: CSS
- API Communication: Axios
- Charts: Chart.js
- PDF Export: jsPDF, jspdf-autotable

Dataset 

The dataset used in this project was collected and structured by us using external reference sources.

## Project Structure

- `backend/` - FastAPI backend, Firebase integration, and meal dataset
- `frontend/gut-health-frontend/` - React frontend application

## How It Works

1. The user signs up and logs in.
2. The user enters profile details such as age, gender, height, weight, and dietary preference.
3. The user selects a health goal and date range.
4. The backend generates a personalized meal plan using the stored dataset and profile data.
5. The user tracks completed meals using checkboxes.
6. The summary page compares planned nutrition against actual completed intake.
7. The meal plan can be exported as a PDF report.

## Backend Modules

- Authentication
- Profile Management
- Goal Selection
- Meal Plan Generation
- Meal Dataset Administration

## How to Run the Project

### Backend

cd backend
python -m uvicorn main:app --reload 

### Fronted

cd frontend/gut-health-frontend
npm start
