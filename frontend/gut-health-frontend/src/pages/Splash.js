import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');  // Redirect after fallback
    }, 10000); // 10s fallback in case video doesn't auto-end
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleVideoEnd = () => {
    navigate('/login');
  };

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <video
        src="/GutIntel (4).mp4"
        autoPlay
        muted
        onEnded={handleVideoEnd}
        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

export default Splash;
