// GoalSelection.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css'; // Default light-blue theme
import axios from 'axios';
import './GoalSelection.css';
import './Auth.css'; // for box styles

function GoalSelection() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const handleGoalSelect = (selectedGoal) => {
    setGoal(selectedGoal);
    setShowCalendar(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      email: localStorage.getItem('email'),
      goal,
      start_date: dateRange[0].startDate.toISOString().split('T')[0],
      end_date: dateRange[0].endDate.toISOString().split('T')[0]
    };

    try {
      await axios.post('http://127.0.0.1:8000/set-goal', payload);
      localStorage.setItem('goal', goal);
      localStorage.setItem('start_date', payload.start_date);
      localStorage.setItem('end_date', payload.end_date);
      navigate('/meal-plan');
    } catch (error) {
      alert('Error saving goal. Please try again.');
    }
  };

  const getGoalIcon = (goal) => {
    const icons = {
      'Gut Health': '🌱',
      'Immunity': '🛡️',
      'Energy Boost': '⚡',
      'Hormonal Balance': '⚖️'
    };
    return icons[goal] || '✨';
  };

  return (
    <div className="auth-container">
      <div className="auth-box goal-selection-box">
        <h2>Select Your Health Goal</h2>
        <p className="subtitle">Choose one goal to focus on</p>

        <div className="goal-buttons">
          {['Gut Health', 'Immunity', 'Energy Boost', 'Hormonal Balance'].map((item) => (
            <button
              key={item}
              onClick={() => handleGoalSelect(item)}
              className={goal === item ? 'selected' : ''}
            >
              <span className="icon">{getGoalIcon(item)}</span>
              {item}
            </button>
          ))}
        </div>

        {showCalendar && (
          <div className="calendar-section">
            <h3>Select Date Range</h3>
            <div className="calendar-wrapper">
              <DateRange
                editableDateInputs={true}
                onChange={(item) => setDateRange([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
              />
            </div>

            <div className="date-display">
              <div><strong>From:</strong> {dateRange[0].startDate.toDateString()}</div>
              <div><strong>To:</strong> {dateRange[0].endDate.toDateString()}</div>
            </div>

            <button onClick={handleSubmit} className="submit-btn">
              Continue to Meal Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoalSelection;
