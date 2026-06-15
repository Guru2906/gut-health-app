from fastapi import FastAPI, HTTPException, Path, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime, timedelta
import random

# ✅ Initialize Firebase
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ✅ Load meal dataset
try:
    with open("meal_dataset.json", "r") as file:
        meal_data = json.load(file)
except Exception as e:
    print(f"Error loading meal dataset: {e}")
    meal_data = []

# ✅ Initialize FastAPI
app = FastAPI()

# ✅ Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Models
class UserAuth(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    email: str
    name: str
    age: int
    gender: str
    height: float
    weight: float
    preference: str  # Veg or Non-Veg

class GoalSelection(BaseModel):
    email: str
    goal: str
    start_date: str
    end_date: str

class MealPlanRequest(BaseModel):
    email: str
    goal: str
    start_date: str
    end_date: str

# ✅ Meal Timings
meal_timings = {
    "Morning Drink": "6-7 AM",
    "Breakfast": "8-9 AM",
    "Lunch": "1-2 PM",
    "Snacks": "5-6 PM",
    "Dinner": "8-9 PM"
}

# ✅ BMR Calculation
def calculate_bmr(profile):
    if profile["gender"].lower() == "male":
        return 10 * profile["weight"] + 6.25 * profile["height"] - 5 * profile["age"] + 5
    elif profile["gender"].lower() == "female":
        return 10 * profile["weight"] + 6.25 * profile["height"] - 5 * profile["age"] - 161
    else:
        return 10 * profile["weight"] + 6.25 * profile["height"] - 5 * profile["age"]

# ===============================
# ✅ Authentication
# ===============================
@app.post("/signup")
def signup(user: UserAuth):
    user_ref = db.collection('users').document(user.email)
    if user_ref.get().exists:
        raise HTTPException(status_code=400, detail="User already exists")
    user_ref.set(user.dict())
    return {"message": "Signup successful"}

@app.post("/login")
def login(user: UserAuth):
    user_ref = db.collection('users').document(user.email)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    if user_doc.to_dict().get('password') != user.password:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"message": "Login successful"}

# ===============================
# ✅ Profile Management
# ===============================
@app.post("/user-profile")
def save_profile(profile: UserProfile):
    db.collection('profiles').document(profile.email).set(profile.dict())
    return {"message": "Profile saved"}

@app.get("/get-profile")
def get_profile(email: str):
    doc = db.collection('profiles').document(email).get()
    if doc.exists:
        return doc.to_dict()
    else:
        return {}

# ===============================
# ✅ Goal Selection
# ===============================
@app.post("/set-goal")
def set_goal(goal: GoalSelection):
    db.collection('goals').document(goal.email).set(goal.dict())
    return {"message": "Goal saved"}

# ===============================
# ✅ Generate Meal Plan
# ===============================
@app.post("/generate-meal-plan")
def generate_meal_plan(request: MealPlanRequest):
    try:
        start = datetime.strptime(request.start_date, "%Y-%m-%d")
        end = datetime.strptime(request.end_date, "%Y-%m-%d")
        days = (end - start).days + 1

        profile_ref = db.collection('profiles').document(request.email)
        profile_doc = profile_ref.get()
        if not profile_doc.exists:
            raise HTTPException(status_code=404, detail="User profile not found")
        profile = profile_doc.to_dict()

        bmr = calculate_bmr(profile)
        target_calories = bmr

        goal_tag = f"#{request.goal.lower().replace(' ', '_')}"
        user_pref = profile.get("preference", "Veg").lower()

        # Filter based on goal AND dietary preference
        user_pref = profile.get("preference", "Veg").lower()

        filtered_meals = [
        m for m in meal_data

        if goal_tag in m["goal_tags"].lower()

        and (
        user_pref == "non-veg"
        or m.get("preference", "veg").lower() == "veg"  # Veg user only sees Veg meals
        )
        ]


        if not filtered_meals:
            raise HTTPException(status_code=404, detail=f"No meals found for goal {goal_tag} and preference {user_pref}")

        meal_distribution = {
            "Morning Drink": 0.05,
            "Breakfast": 0.25,
            "Lunch": 0.35,
            "Snacks": 0.15,
            "Dinner": 0.20
        }

        meal_types = list(meal_distribution.keys())
        meals_by_type = {t: [m for m in filtered_meals if m["meal_type"] == t] for t in meal_types}

        meal_plan = []

        for day in range(days):
            date = (start + timedelta(days=day)).strftime("%Y-%m-%d")
            day_plan = {"day": date}
            total_cals = total_protein = total_carbs = total_fats = total_fiber = 0

            for meal_type in meal_types:
                target_cal = target_calories * meal_distribution[meal_type]
                meal_list = meals_by_type.get(meal_type, [])

                if not meal_list:
                    day_plan[meal_type] = None
                    continue

                meal = random.choice(meal_list)
                meal_cal = meal["carbs_per_serving"] * 4 + meal["protein_per_serving"] * 4 + meal["fats_per_serving"] * 9
                servings = round(target_cal / meal_cal, 1) if meal_cal > 0 else 1

                day_plan[meal_type] = {
                    **meal,
                    "timing": meal_timings[meal_type],
                    "servings": servings
                }

                total_cals += meal_cal * servings
                total_protein += meal["protein_per_serving"] * servings
                total_carbs += meal["carbs_per_serving"] * servings
                total_fats += meal["fats_per_serving"] * servings
                total_fiber += meal["fiber_per_serving"] * servings

            day_plan["totals"] = {
                "calories": round(total_cals),
                "protein": round(total_protein, 1),
                "carbs": round(total_carbs, 1),
                "fats": round(total_fats, 1),
                "fiber": round(total_fiber, 1)
            }

            meal_plan.append(day_plan)

        return {
            "goal": request.goal,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "target_calories": round(target_calories),
            "meal_plan": meal_plan
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===============================
# ✅ Admin APIs for Meals
# ===============================
@app.get("/get-meals")
def get_meals():
    return {"meals": meal_data}

@app.post("/add-meal")
def add_meal(meal: dict = Body(...)):
    meal_data.append(meal)
    with open("meal_dataset.json", "w") as file:
        json.dump(meal_data, file, indent=4)
    return {"message": "Meal added successfully"}

@app.put("/update-meal/{meal_id}")
def update_meal(meal_id: int = Path(...), meal: dict = Body(...)):
    if meal is None:
        raise HTTPException(status_code=400, detail="Meal data is required")
    for idx, item in enumerate(meal_data):
        if item["id"] == meal_id:
            meal_data[idx] = meal
            with open("meal_dataset.json", "w") as file:
                json.dump(meal_data, file, indent=4)
            return {"message": "Meal updated successfully"}
    raise HTTPException(status_code=404, detail="Meal not found")

@app.delete("/delete-meal/{meal_id}")
def delete_meal(meal_id: int = Path(...)):
    global meal_data
    meal_data = [item for item in meal_data if item["id"] != meal_id]
    with open("meal_dataset.json", "w") as file:
        json.dump(meal_data, file, indent=4)
    return {"message": "Meal deleted successfully"}

# ===============================
# ✅ Root Health Check
# ===============================
@app.get("/")
def root():
    return {"message": "API is running perfectly ✅"}