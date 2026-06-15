import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './MealPlan.css';

function MealPlan() {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState([]);
  const [goalInfo, setGoalInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedMeals, setCheckedMeals] = useState({});
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const email = localStorage.getItem('email');
  const goal = localStorage.getItem('goal');
  const startDate = localStorage.getItem('start_date');
  const endDate = localStorage.getItem('end_date');

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const res = await axios.post('http://127.0.0.1:8000/generate-meal-plan', {
          email,
          goal,
          start_date: startDate,
          end_date: endDate
        });

        setMealPlan(res.data.meal_plan);
        setGoalInfo({
          goal: res.data.goal,
          start_date: res.data.start_date,
          end_date: res.data.end_date,
          target_calories: res.data.target_calories
        });

        localStorage.setItem('mealPlan', JSON.stringify(res.data.meal_plan));
        localStorage.setItem('goalInfo', JSON.stringify({
          goal: res.data.goal,
          start_date: res.data.start_date,
          end_date: res.data.end_date,
          target_calories: res.data.target_calories
        }));

        const initialChecks = {};
        res.data.meal_plan.forEach((_, idx) => {
          initialChecks[idx] = {
            'Morning Drink': false,
            'Breakfast': false,
            'Lunch': false,
            'Snacks': false,
            'Dinner': false
          };
        });
        setCheckedMeals(initialChecks);
        localStorage.setItem('checkedMeals', JSON.stringify(initialChecks));
      } catch (err) {
        setError('Failed to fetch meal plan');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, [email, goal, startDate, endDate]);

  const toggleCheckbox = (mealType) => {
    const updated = {
      ...checkedMeals,
      [currentDayIndex]: {
        ...checkedMeals[currentDayIndex],
        [mealType]: !checkedMeals[currentDayIndex][mealType]
      }
    };
    setCheckedMeals(updated);
    localStorage.setItem('checkedMeals', JSON.stringify(updated));
  };

  const handleNext = () => {
    if (currentDayIndex < mealPlan.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else {
      navigate('/summary');
    }
  };

  const handlePrevious = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const userEmail = email || "user@gutintel.com";

    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("GutIntel - Personalized Meal Plan", 14, 15);

    doc.setFontSize(11);
    doc.text(`User: ${userEmail}`, 14, 22);
    doc.text(`Goal: ${goalInfo.goal}`, 14, 28);
    doc.text(`Duration: ${goalInfo.start_date} to ${goalInfo.end_date}`, 14, 34);

    let currentY = 40;

    mealPlan.forEach((dayPlan, index) => {
      doc.setFontSize(13);
      doc.setTextColor(50);
      doc.text(`${dayPlan.day}`, 14, currentY);

      const tableData = ['Morning Drink', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(mealType => {
        const meal = dayPlan[mealType];
        return [
          mealType,
          meal ? meal.food_name : 'N/A',
          meal ? `${meal.serving_size || '150g'}` : '-',
          meal ? `${meal.carbs_per_serving * meal.servings}g` : '-',
          meal ? `${meal.protein_per_serving * meal.servings}g` : '-',
          meal ? `${meal.fats_per_serving * meal.servings}g` : '-',
          meal ? `${meal.fiber_per_serving * meal.servings}g` : '-'
        ];
      });

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Meal Type', 'Food', 'Approx. Quantity', 'Carbs', 'Protein', 'Fats', 'Fiber']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [60, 141, 188] },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(
        `Total: ${dayPlan.totals.calories} kcal | Protein: ${dayPlan.totals.protein}g | Carbs: ${dayPlan.totals.carbs}g | Fats: ${dayPlan.totals.fats}g | Fiber: ${dayPlan.totals.fiber}g`,
        14,
        currentY
      );

      currentY += 15;
      if (currentY > 270 && index !== mealPlan.length - 1) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save("GutIntel_MealPlan.pdf");
  };

  if (loading) return <div className="loading">Loading your meal plan...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const currentDay = mealPlan[currentDayIndex];

  return (
    <div className="meal-plan-container">
      <h2>Your Meal Plan</h2>
      <div className="goal-info">
        <p><strong>Goal:</strong> {goalInfo.goal}</p>
        <p><strong>Duration:</strong> {goalInfo.start_date} to {goalInfo.end_date}</p>
        <p><strong>Target Calories/day:</strong> {goalInfo.target_calories} kcal</p>
      </div>

      <div className="day-plan">
        <h3>{currentDay.day}</h3>

        {['Morning Drink', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(mealType => {
          const meal = currentDay[mealType];
          return meal ? (
            <div key={mealType} className="meal-item">
              <label className="meal-checkbox">
                <input
                  type="checkbox"
                  checked={checkedMeals[currentDayIndex]?.[mealType] || false}
                  onChange={() => toggleCheckbox(mealType)}
                />
                <strong> {mealType} ({meal.timing}):</strong> {meal.food_name}
              </label>
              <p className="meal-details">
                Approx. {meal.serving_size || '150g'} | 
                {meal.carbs_per_serving * meal.servings}g Carbs, {meal.protein_per_serving * meal.servings}g Protein, 
                {meal.fats_per_serving * meal.servings}g Fats, {meal.fiber_per_serving * meal.servings}g Fiber
              </p>
            </div>
          ) : (
            <div key={mealType} className="meal-item"><strong>{mealType}:</strong> Not planned</div>
          );
        })}

        <div className="daily-totals">
          <h4>Daily Totals:</h4>
          <p>
            Calories: {currentDay.totals.calories} kcal | 
            Protein: {currentDay.totals.protein}g | 
            Carbs: {currentDay.totals.carbs}g | 
            Fats: {currentDay.totals.fats}g | 
            Fiber: {currentDay.totals.fiber}g
          </p>
        </div>

        <div className="navigation-buttons">
          <button onClick={handlePrevious} disabled={currentDayIndex === 0}>Previous Day</button>
          <button onClick={handleNext}>
            {currentDayIndex === mealPlan.length - 1 ? 'Finish' : 'Next Day'}
          </button>
        </div>

        <div className="export-button">
          <button onClick={exportToPDF}>Export Full Meal Plan as PDF</button>
        </div>
      </div>

      <button className="back-button" onClick={() => navigate('/profile')}>Back to Profile</button>
    </div>
  );
}

export default MealPlan;
