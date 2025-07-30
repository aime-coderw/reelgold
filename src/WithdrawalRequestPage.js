import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
const WithdrawalRequestPage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', notes: '' });
  const [earnings, setEarnings] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/signin');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: views } = await supabase
        .from('views')
        .select('*')
        .eq('user_id', user.id);

      const badge = profileData.verification_badge?.replace('.png', '');
      const rates = { basic: 0.000006, creator: 0.00001, pro: 0.00002 };
      const rate = rates[badge] || 0;
      const earnings = views.length * rate;

      setEarnings(earnings.toFixed(4));
      setProfile(profileData);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (earnings < 30) return alert("You need at least $30 to withdraw.");

    const { error } = await supabase.from('withdrawal_requests').insert([{
      user_id: profile.id,
      full_name: form.full_name,
      phone: form.phone,
      amount: earnings,
      notes: form.notes
    }]);

    if (error) {
      console.error(error);
      alert('Something went wrong.');
    } else {
      alert('Withdrawal request submitted!');
      navigate('/earn');
    }
  };

  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold text-center">Withdrawal Request</h2>

      <p className="text-center text-gray-600">Earnings: <strong>${earnings}</strong></p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Submit Withdrawal
        </button>
      </form>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-700 z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export default WithdrawalRequestPage;
