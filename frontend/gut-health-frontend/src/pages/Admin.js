import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Admin() {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({
    id: '',
    food_name: '',
    category: '',
    meal_type: '',
    health_benefits: '',
    goal_tags: '',
    serving_size: '',
    carbs_per_serving: '',
    protein_per_serving: '',
    fats_per_serving: '',
    fiber_per_serving: '',
  });
  const [editMode, setEditMode] = useState(false);

  // Fetch meals from backend
  const fetchMeals = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/get-meals');
      setMeals(res.data.meals);
    } catch (error) {
      console.error('Error fetching meals', error);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update Meal
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://127.0.0.1:8000/update-meal/${form.id}`, form);
        alert('Meal updated successfully');
      } else {
        await axios.post('http://127.0.0.1:8000/add-meal', form);
        alert('Meal added successfully');
      }
      setForm({
        id: '',
        food_name: '',
        category: '',
        meal_type: '',
        health_benefits: '',
        goal_tags: '',
        serving_size: '',
        carbs_per_serving: '',
        protein_per_serving: '',
        fats_per_serving: '',
        fiber_per_serving: '',
      });
      setEditMode(false);
      fetchMeals();
    } catch (error) {
      console.error('Error saving meal', error);
    }
  };

  // Edit Meal
  const handleEdit = (meal) => {
    setForm(meal);
    setEditMode(true);
  };

  // Delete Meal
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/delete-meal/${id}`);
        alert('Meal deleted');
        fetchMeals();
      } catch (error) {
        console.error('Error deleting meal', error);
      }
    }
  };

  return (
    <div className="admin">
      <h2>Admin Panel - Manage Meals</h2>

      <form onSubmit={handleSubmit}>
        <input name="id" placeholder="ID" value={form.id} onChange={handleChange} required />
        <input name="food_name" placeholder="Food Name" value={form.food_name} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="meal_type" placeholder="Meal Type" value={form.meal_type} onChange={handleChange} />
        <input name="health_benefits" placeholder="Health Benefits" value={form.health_benefits} onChange={handleChange} />
        <input name="goal_tags" placeholder="Goal Tags (e.g. #gut_health)" value={form.goal_tags} onChange={handleChange} />
        <input name="serving_size" placeholder="Serving Size" value={form.serving_size} onChange={handleChange} />
        <input name="carbs_per_serving" placeholder="Carbs" value={form.carbs_per_serving} onChange={handleChange} />
        <input name="protein_per_serving" placeholder="Protein" value={form.protein_per_serving} onChange={handleChange} />
        <input name="fats_per_serving" placeholder="Fats" value={form.fats_per_serving} onChange={handleChange} />
        <input name="fiber_per_serving" placeholder="Fiber" value={form.fiber_per_serving} onChange={handleChange} />

        <button type="submit">{editMode ? 'Update Meal' : 'Add Meal'}</button>
      </form>

      <h3>Meal List</h3>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Food Name</th>
            <th>Category</th>
            <th>Meal Type</th>
            <th>Goal Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {meals.map((meal) => (
            <tr key={meal.id}>
              <td>{meal.id}</td>
              <td>{meal.food_name}</td>
              <td>{meal.category}</td>
              <td>{meal.meal_type}</td>
              <td>{meal.goal_tags}</td>
              <td>
                <button onClick={() => handleEdit(meal)}>Edit</button>
                <button onClick={() => handleDelete(meal.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
