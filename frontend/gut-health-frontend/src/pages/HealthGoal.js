import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function HealthGoal() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    const storedData = localStorage.getItem('profileData');
    if (storedData) {
      setProfileData(JSON.parse(storedData));
    } else {
      navigate('/profile');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const completeData = { ...profileData, goal };

    try {
      await axios.post('http://127.0.0.1:8000/user-profile', {
        ...completeData,
        age: parseInt(completeData.age),
        height: parseFloat(completeData.height),
        weight: parseFloat(completeData.weight)
      });
      alert('Profile saved successfully!');
      localStorage.removeItem('profileData');
      // You can navigate to dashboard or recommendations page
    } catch (error) {
      console.error('Error saving profile', error);
      alert('Failed to save profile');
    }
  };

  return (
    <div>
      <h2>Select Your Health Goal</h2>
      <form onSubmit={handleSubmit}>
        <select value={goal} onChange={(e) => setGoal(e.target.value)} required>
          <option value="">Select Goal</option>
          <option value="Gut health">Gut Health</option>
          <option value="Immunity">Immunity</option>
          <option value="Energy boosting">Energy Boosting</option>
          <option value="Hormone balance">Hormone Balance</option>
        </select>
        <button type="submit">Submit Profile</button>
      </form>
    </div>
  );
}

export default HealthGoal;
