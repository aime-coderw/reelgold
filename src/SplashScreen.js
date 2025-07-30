import React, { useEffect, useState } from 'react';
import './SplashScreen.css';
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    const checkConnection = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        setTimeout(() => {
          navigate('/home');
        }, 5000); // 3 seconds splash delay
      }
    };

    checkConnection();
  }, [navigate]);

  return (
    <div className="splash-screen">
        <div className="logocircle">
      <img src="/favicon.png" alt="Logo" className="logo" />
      </div>
      <h1 className='app-name'>ReelGold</h1>
      <h2>Paid to capture your greatest moment</h2>
      {isOnline === false && <p style={{ color: 'red' }}>No Internet Connection</p>}
    </div>
  );
}

export default SplashScreen;
