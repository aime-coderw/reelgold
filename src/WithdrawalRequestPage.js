import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

const WithdrawalRequestPage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', notes: '' });
  const [earnings, setEarnings] = useState(0);
  const [golds, setGolds] = useState(0);
  const navigate = useNavigate();
const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/signin');

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch views
      const { data: views } = await supabase
        .from('views')
        .select('*')
        .eq('user_id', user.id);

      // Fetch total likes
      const { data: likesData } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id);

      const totalLikes = likesData?.length || 0;
      const calculatedGolds = Math.floor(totalLikes / 20000);

      const badge = profileData.verification_badge?.replace('.png', '');
      const rates = { basic: 0.000002, creator: 0.00001, pro: 0.00002 };
      const rate = rates[badge] || 0;
      const earnings = views.length * rate;

      setEarnings(earnings.toFixed(4));
      setGolds(calculatedGolds);
      setProfile(profileData);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (golds < 5) return alert("🚫 You need at least 5 Golds (1M likes) to withdraw.");

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
      alert('✅ Withdrawal request submitted!');
      navigate('/earn');
    }
  };

  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4 mb-20">
      <h2 className="text-xl font-bold text-center">Withdrawal Request</h2>

      <div className="text-center text-gray-700 space-y-1">
        <p><strong>Earnings:</strong> ${earnings}</p>
        <p><strong>Golds:</strong> 🟡 {golds}</p>
        {golds < 5 && (
          <p className="text-red-600 text-sm">❌ You need at least 5 Golds to withdraw.</p>
        )}
      </div>

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
<div className="flex items-start mb-4">
  <input
    type="checkbox"
    id="agreeTerms"
    className="mt-1 mr-2"
    checked={agreeTerms}
    onChange={(e) => setAgreeTerms(e.target.checked)}
  />
  <label htmlFor="agreeTerms" className="text-sm text-gray-700">
    I agree to the{' '}
    <a
      href="/terms"
      className="text-indigo-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      Terms & Regulations
    </a>
  </label>
</div>

        <button
  type="submit"
  disabled={golds < 5 || !agreeTerms}
  className={`w-full py-2 rounded text-white ${
    golds < 5 || !agreeTerms ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
  }`}
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
