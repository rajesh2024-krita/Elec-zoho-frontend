import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LogoutButton: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="logout-button"
      title={`Logged in as ${auth.user}`}
    >
      Logout ({auth.user})
    </button>
  );
};

export default LogoutButton;