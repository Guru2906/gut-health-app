import { Routes, Route, useLocation } from 'react-router-dom';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import GoalSelection from './pages/GoalSelection';
import MealPlan from './pages/MealPlan';
import Summary from './pages/Summary';
import Admin from './pages/Admin';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';


function App() {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/';

  return (
    <div style={{ display: 'flex' }}>
      {!hideNav && <Sidebar />}
      <div style={{ marginLeft: hideNav ? '0' : '230px', width: '100%' }}>
        {!hideNav && <Navbar />}
        
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/goal-selection" element={<GoalSelection />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
