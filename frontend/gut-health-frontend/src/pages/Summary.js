import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function Summary() {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState([]);
  const [goalInfo, setGoalInfo] = useState({});
  const [checkedMeals, setCheckedMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [metricDetails, setMetricDetails] = useState([]);

  const email = localStorage.getItem('email');
  const goal = localStorage.getItem('goal');
  const startDate = localStorage.getItem('start_date');
  const endDate = localStorage.getItem('end_date');

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const res = await axios.post('http://localhost:8000/generate-meal-plan', {
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

        const savedChecked = JSON.parse(localStorage.getItem('checkedMeals')) || {};
        setCheckedMeals(savedChecked);
      } catch (err) {
        alert('Failed to fetch meal plan');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, [email, goal, startDate, endDate]);

  if (loading) return <div>Loading summary...</div>;

  let totalTarget = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  let totalActual = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  let totalMeals = 0, checkedMealsCount = 0;
  const nutrientSources = {
    calories: [],
    protein: [],
    carbs: [],
    fats: [],
    fiber: []
  };

  mealPlan.forEach((day, dayIdx) => {
    const meals = ['Morning Drink', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'];

    totalTarget.calories += day.totals.calories;
    totalTarget.protein += day.totals.protein;
    totalTarget.carbs += day.totals.carbs;
    totalTarget.fats += day.totals.fats;
    totalTarget.fiber += day.totals.fiber;

    meals.forEach(mealType => {
      totalMeals++;
      const meal = day[mealType];
      const isChecked = checkedMeals?.[dayIdx]?.[mealType] || false;
      if (meal && isChecked) {
        const servings = meal.servings;
        const totalCal = (meal.carbs_per_serving * 4 + meal.protein_per_serving * 4 + meal.fats_per_serving * 9) * servings;
        totalActual.calories += totalCal;
        totalActual.protein += meal.protein_per_serving * servings;
        totalActual.carbs += meal.carbs_per_serving * servings;
        totalActual.fats += meal.fats_per_serving * servings;
        totalActual.fiber += meal.fiber_per_serving * servings;

        nutrientSources.calories.push({ name: meal.food_name, value: Math.round(totalCal) });
        nutrientSources.protein.push({ name: meal.food_name, value: +(meal.protein_per_serving * servings).toFixed(1) });
        nutrientSources.carbs.push({ name: meal.food_name, value: +(meal.carbs_per_serving * servings).toFixed(1) });
        nutrientSources.fats.push({ name: meal.food_name, value: +(meal.fats_per_serving * servings).toFixed(1) });
        nutrientSources.fiber.push({ name: meal.food_name, value: +(meal.fiber_per_serving * servings).toFixed(1) });

        checkedMealsCount++;
      }
    });
  });

  const compliancePercentage = ((checkedMealsCount / totalMeals) * 100).toFixed(1);

  const chartData = {
    labels: ['Calories', 'Protein', 'Carbs', 'Fats', 'Fiber'],
    datasets: [
      {
        label: 'Target Intake',
        backgroundColor: '#3498db',
        data: [
          totalTarget.calories,
          totalTarget.protein,
          totalTarget.carbs,
          totalTarget.fats,
          totalTarget.fiber
        ]
      },
      {
        label: 'Actual Intake',
        backgroundColor: '#2ecc71',
        data: [
          totalActual.calories,
          totalActual.protein,
          totalActual.carbs,
          totalActual.fats,
          totalActual.fiber
        ]
      }
    ]
  };

  const handleBarClick = (elems) => {
    if (!elems.length) return;
    const index = elems[0].index;
    const nutrientMap = ['calories', 'protein', 'carbs', 'fats', 'fiber'];
    const selected = nutrientMap[index];
    setSelectedMetric(selected);
    setMetricDetails(nutrientSources[selected]);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Summary Report</h2>
      <p><strong>Goal:</strong> {goalInfo.goal}</p>
      <p><strong>Duration:</strong> {goalInfo.start_date} to {goalInfo.end_date}</p>
      <p><strong>Target Calories/day:</strong> {goalInfo.target_calories} kcal</p>
      <p><strong>Compliance:</strong> 
        <span style={{ marginLeft: 8, color: compliancePercentage > 80 ? 'green' : 'orange', fontWeight: 'bold' }}>
          {compliancePercentage}%
        </span>
      </p>

      <div style={{ backgroundColor: '#f8f8f8', padding: '20px', borderRadius: '12px' }}>
        <Bar
  data={chartData}
  options={{
    onClick: (event, elements) => handleBarClick(elements),
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  }}
  height={300}
/>

      </div>

      {selectedMetric && (
        <div style={{ marginTop: '25px', backgroundColor: '#fffaf0', padding: '20px', borderRadius: '10px' }}>
          <h4>🧾 Items contributing to <strong>{selectedMetric.toUpperCase()}</strong></h4>
          <ul>
            {metricDetails.map((item, idx) => (
              <li key={idx}>{item.name}: <strong>{item.value}</strong>{selectedMetric === 'calories' ? ' kcal' : ' g'}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '10px' }}>
        <h4>🔸 Target Intake</h4>
        <p>
          Calories: {totalTarget.calories} kcal | Protein: {totalTarget.protein}g | Carbs: {totalTarget.carbs}g |
          Fats: {totalTarget.fats}g | Fiber: {totalTarget.fiber}g
        </p>
      </div>

      <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#dff0d8', borderRadius: '10px' }}>
        <h4>🔹 Actual Intake (checked)</h4>
        <p>
          Calories: {Math.round(totalActual.calories)} kcal | Protein: {totalActual.protein.toFixed(1)}g |
          Carbs: {totalActual.carbs.toFixed(1)}g | Fats: {totalActual.fats.toFixed(1)}g | Fiber: {totalActual.fiber.toFixed(1)}g
        </p>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => navigate('/meal-plan')} style={{
          padding: '10px 20px',
          backgroundColor: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          ← Back to Meal Plan
        </button>
      </div>
    </div>
  );
}

export default Summary;
