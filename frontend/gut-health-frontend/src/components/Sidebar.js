import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiUser, FiTarget, FiBookOpen, FiBarChart2, FiSettings, FiLogOut } from 'react-icons/fi';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <h2 className="logo">Gut<span>Intel</span></h2>

      <nav>
        <NavLink to="/profile" activeclassname="active">
          <FiUser /> Profile
        </NavLink>
        <NavLink to="/goal-selection" activeclassname="active">
          <FiTarget /> Goals
        </NavLink>
        <NavLink to="/meal-plan" activeclassname="active">
          <FiBookOpen /> Meal Plan
        </NavLink>
        <NavLink to="/summary" activeclassname="active">
          <FiBarChart2 /> Summary
        </NavLink>
        <NavLink to="/admin" activeclassname="active">
          <FiSettings /> Admin
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p className="email">{email}</p>
        <button className="logout" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
