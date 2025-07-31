import React, { useEffect, useState } from 'react';
import { FaHome, FaUser, FaPlus, FaSearch, FaDollarSign, FaTrophy } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check admin by email
        if (user.email === 'admin@gmail.com') {
          setIsAdmin(true);
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUsername(profile.user_name);
        }
      }
    };

    getUserInfo();
  }, []);

  const iconClass = (path) =>
    location.pathname.startsWith(path) ? 'text-yellow-400' : 'text-white';

  const handleUserClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else if (username) {
      navigate(`/${username}`);
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-around items-center bg-black py-3 border-t border-gray-800">
      <Link to="/home"><FaHome className={iconClass('/home')} /></Link>
      <Link to="/search"><FaSearch className={iconClass('/search')} /></Link>
      <Link to="/upload"><FaPlus className={`bg-yellow-500 p-2.5 rounded-full ${iconClass('/upload')}`} /></Link>
      <Link to="/challenges"><FaTrophy className={iconClass('/challenges')} /></Link>
      <Link to="/earn"><FaDollarSign className={iconClass('/earn')} /></Link>

      <button onClick={handleUserClick}>
        <FaUser className={iconClass('/profile')} />
      </button>
    </div>
  );
};

export default BottomNav;
