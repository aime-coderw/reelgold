import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabase';
import BottomNav from './BottomNav';

const PromotePage = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('promotion_requests').insert([
      { reel_id: id, full_name: name, phone_number: phone },
    ]);
    setLoading(false);

    if (!error) {
      alert('✅ Promotion request submitted! Please complete payment.');
      setName('');
      setPhone('');
    } else {
      alert('❌ Error submitting promotion request.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-xl text-black">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-600">Promote Your Reel</h2>

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

        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-4 rounded">
          <p className="font-semibold">🇷🇼 MoMoPay for Rwandans:</p>
          <p className="text-sm mt-1">Dial: <strong>*182*8*1*733014*4340#</strong></p>
          <p className="text-sm mt-1">Names: <strong>Aime medard</strong></p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mb-4 rounded">
          <p className="font-semibold">🌍 If you are outside Rwanda:</p>
          <p className="text-sm mt-1">Send to MTN: <strong>(+250) 791 231 993</strong></p>
        <p className="text-sm mt-1">Names: <strong>Niyokwizerwa Aime medard</strong></p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-green-400 text-green-800 p-4 mb-4 rounded">
          <p className="text-sm mt-1">Amount:</p> 
          <p><strong>4340 RWF/$3 for 1 Week</strong></p>
          <p><strong>8140 RWF/$5.5 for  2Week</strong></p>
          <p><strong>11840 RWF/$8 for 3 Week</strong></p>
          <p><strong>14800 RWF/$10 for 1 Month</strong></p>
          </div>
        <p className="text-sm text-gray-600 mb-4">
          ⚠️ Your request will be automatically deleted if payment is not made within <strong>48 hours</strong>.
        </p>

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
