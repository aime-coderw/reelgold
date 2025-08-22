import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabase';
import BottomNav from './BottomNav';

const PromotePage = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState(''); // ✅ Added state for plan
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !plan) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('promotion_requests').insert([
      { reel_id: id, full_name: name, phone_number: phone, plan },
    ]);
    setLoading(false);

    if (!error) {
      alert('✅ Promotion request submitted! Please complete payment.');
      setName('');
      setPhone('');
      setPlan(''); // ✅ Reset after submit
    } else {
      alert('❌ Error submitting promotion request.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-xl text-black">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-600">Promote Your Reel</h2>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="07xx xxx xxx"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Promotion Plan */}
        <label className="block mb-2 font-semibold">Choose Promotion Plan</label>
        <select
          className="border px-3 py-2 w-full mb-4"
          value={plan}
          onChange={e => setPlan(e.target.value)}
        >
          <option value="">-- Select Plan --</option>
          <option value="basic">1 Week (4340 RWF/$3)</option>
          <option value="creator">2 Weeks (8140 RWF/$5.5)</option>
          <option value="pro">3 Weeks (11840 RWF/$8)</option>
          <option value="monthly">1 Month (14800 RWF/$10)</option>
        </select>

        {/* Payment Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-4 rounded">
          <p className="font-semibold">🇷🇼 MoMoPay for Rwandans:</p>
          <p className="text-sm mt-1">Dial: <strong>*182*8*1*733014#</strong></p>
          <p className="text-sm mt-1">Names: <strong>Aime medard</strong></p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mb-4 rounded">
          <p className="font-semibold">🌍 If you are outside Rwanda:</p>
          <p className="text-sm mt-1">Send to MTN: <strong>(+250) 791 231 993</strong></p>
          <p className="text-sm mt-1">Names: <strong>Niyokwizerwa Aime medard</strong></p>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          ⚠️ Your request will be automatically deleted if payment is not made within <strong>48 hours</strong>.
        </p>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Promotion Request'}
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
};

export default PromotePage;
