import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Profile() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const [profile, setProfile] = useState({
    email: email,
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    preference: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile if exists
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/get-profile?email=${email}`);
        if (res.data) {
          setProfile({
            email: res.data.email || email,
            name: res.data.name || '',
            age: res.data.age?.toString() || '',
            gender: res.data.gender || '',
            height: res.data.height?.toString() || '',
            weight: res.data.weight?.toString() || '',
            preference: res.data.preference || ''
          });
        }
      } catch (error) {
        console.log('No existing profile found');
      }
    };
    fetchProfile();
  }, [email]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!profile.name.trim()) newErrors.name = 'Name is required';
    if (!profile.age) newErrors.age = 'Age is required';
    if (isNaN(Number(profile.age))) newErrors.age = 'Age must be a number';
    if (!profile.gender) newErrors.gender = 'Gender is required';
    if (!profile.preference) newErrors.preference = 'Dietary preference is required';
    if (!profile.height) newErrors.height = 'Height is required';
    if (isNaN(Number(profile.height))) newErrors.height = 'Height must be a number';
    if (!profile.weight) newErrors.weight = 'Weight is required';
    if (isNaN(Number(profile.weight))) newErrors.weight = 'Weight must be a number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const payload = {
        ...profile,
        age: parseInt(profile.age, 10),
        height: parseFloat(profile.height),
        weight: parseFloat(profile.weight)
      };

      const response = await axios.post('http://127.0.0.1:8000/user-profile', payload);

      if (response.status === 200) {
        alert('Profile saved successfully!');
        navigate('/goal-selection');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          const apiErrors = {};
          error.response.data.detail.forEach(err => {
            const field = err.loc[err.loc.length - 1];
            apiErrors[field] = err.msg;
          });
          setErrors(apiErrors);
        } else {
          setErrors({ general: error.response.data.detail || 'Failed to save profile' });
        }
      } else {
        setErrors({ general: error.message || 'Network error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Complete Your Profile</h2>

        {errors.general && <div className="error-msg">{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={profile.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <div className="error-text">{errors.name}</div>}

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={profile.age}
            onChange={handleChange}
            className={errors.age ? 'input-error' : ''}
          />
          {errors.age && <div className="error-text">{errors.age}</div>}

          <select
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            className={errors.gender ? 'input-error' : ''}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <div className="error-text">{errors.gender}</div>}

          <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            value={profile.height}
            onChange={handleChange}
            className={errors.height ? 'input-error' : ''}
          />
          {errors.height && <div className="error-text">{errors.height}</div>}

          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={profile.weight}
            onChange={handleChange}
            className={errors.weight ? 'input-error' : ''}
          />
          {errors.weight && <div className="error-text">{errors.weight}</div>}

          <select
            name="preference"
            value={profile.preference}
            onChange={handleChange}
            className={errors.preference ? 'input-error' : ''}
          >
            <option value="">Dietary Preference</option>
            <option value="Veg">Vegetarian</option>
            <option value="Non-Veg">Non-Vegetarian</option>
          </select>
          {errors.preference && <div className="error-text">{errors.preference}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
