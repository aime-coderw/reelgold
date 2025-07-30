import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEye,
  FaDollarSign,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import BottomNav from './BottomNav';

const EarnPage = () => {
  const [profile, setProfile] = useState(null);
  const [views, setViews] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/signin');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      const { data: viewData } = await supabase
        .from('views')
        .select('*')
        .eq('user_id', user.id);

      setViews(viewData.length);
    };

    fetchUser();
  }, []);

  if (!profile) return <div className="p-6 text-center text-gray-600">Loading...</div>;

  if (!profile.is_verified) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center px-4 text-red-600 font-semibold bg-red-50">
        <FaExclamationTriangle className="mb-2 text-3xl" />
        To earn on <span className="text-black font-bold">ReelGold</span>, you must first verify your account.
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-700">
          <BottomNav />
        </div>
      </div>
    );
  }

  const rates = {
    'basic': 0.000006,
    'creator': 0.00001,
    'pro': 0.00002,
  };

  const badge = profile.verification_badge?.replace('.png', '') || 'basic';
  const rate = rates[badge] || 0;
  const earnings = (views * rate).toFixed(4);
  const progress = Math.min((earnings / 30) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen pb-16"> {/* Ensure space for bottom nav */}
      <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">🎉 Earnings Dashboard</h2>

        <div className="space-y-4 text-center text-gray-700">
          <p className="flex items-center justify-center gap-2">
            <FaUser className="text-blue-500" />
            <span className="font-medium">@{profile.user_name}</span>
          </p>

          <p className="flex items-center justify-center gap-2 capitalize">
            <FaCheckCircle className="text-yellow-500" />
            {badge}
          </p>

          <p className="flex items-center justify-center gap-2">
            <FaEye className="text-green-500" />
            {views} Views
          </p>

          <p className="flex items-center justify-center gap-2">
            <FaDollarSign className="text-emerald-600" />
            <span className="font-semibold text-lg">${earnings}</span>
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            ${earnings} / $30 required for withdrawal
          </p>
        </div>

        {earnings >= 30 ? (
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
            Withdraw
          </button>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            💰 Keep earning! You need $30 to withdraw.
          </p>
        )}
        <button
  onClick={() => navigate('/withdraw')}
  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
>
  Withdraw
</button>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-700 z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export default EarnPage;
