// BottomNav.js
import React, { useEffect, useState } from 'react';
import { FaHome, FaUser, FaPlus, FaSearch, FaDollarSign } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from './supabase';

const BottomNav = () => {
  const location = useLocation();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const getUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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

    getUsername();
  }, []);

  const iconClass = (path) =>
    location.pathname.startsWith(path) ? 'text-yellow-400' : 'text-white';

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-around items-center bg-black py-3 border-t border-gray-800">
      <Link to="/home"><FaHome className={iconClass('/home')} /></Link>
      <Link to="/search"><FaSearch className={iconClass('/search')} /></Link>
      <Link to="/upload"><FaPlus className={`bg-yellow-500 p-3 rounded-full ${iconClass('/upload')}`} /></Link>
      <Link to="/earn">
      <FaDollarSign className={iconClass('/earn')} />
    </Link>
      {username ? (
        <Link to={`/${username}`}>
          <FaUser className={iconClass(`/${username}`)} />
        </Link>
      ) : (
        <Link to="/signin">
          <FaUser className={iconClass('/signin')} />
        </Link>
      )}
    </div>
  );
};

export default BottomNav;
