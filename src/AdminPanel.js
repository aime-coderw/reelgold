import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const AdminPanel = () => {
  const [tab, setTab] = useState('promotion');
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promotionRequests, setPromotionRequests] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        alert('Access denied');
        return navigate('/');
      }

      setAuthChecked(true);
    };

    checkAdmin();
  }, [navigate]);

  const fetchPromotionRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promotion_requests')
      .select('id, reel_id, full_name, phone_number, is_approved, plan')
      .order('created_at', { ascending: false });

    if (!error) setPromotionRequests(data);
    else console.error('Promotion fetch error:', error);

    setLoading(false);
  };
  const fetchWithdrawRequests = async () => {
  setLoading(true);
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error) setWithdrawRequests(data);
  else console.error('Withdraw fetch error:', error);

  setLoading(false);
};

  const fetchVerificationRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setVerificationRequests(data);
    else console.error('Verification fetch error:', error);

    setLoading(false);
  };

  const handleApprovePromotion = async (requestId, reelId) => {
    if (!reelId) return console.error("Missing reel ID");
    setLoading(true);

    const { error: updateReq } = await supabase
      .from('promotion_requests')
      .update({ is_approved: true })
      .eq('id', requestId);

    const { error: updateReel } = await supabase
      .from('reels')
      .update({ is_promoted: true })
      .eq('id', reelId);

    if (updateReq || updateReel) {
      console.error(updateReq || updateReel);
    } else {
      alert('✅ Reel promoted successfully!');
      fetchPromotionRequests();
    }

    setLoading(false);
  };

  const handleApproveVerification = async (id, userId, plan) => {
  const { error: updateReq } = await supabase
    .from('verification_requests')
    .update({ is_verified: true })
    .eq('id', id);

  const badgeUrls = {
    basic: 'basic.png',
    creator: 'creator.png',
    pro: 'pro.png',
  };

  const { error: updateProfile } = await supabase
    .from('profiles')
    .update({
        is_verified: true,
    verification_badge: badgeUrls[plan],  // image path or badge icon
    verification_level: plan    // ✅ this line was missing
    })
    .eq('id', userId);

 if (updateReq || updateProfile) {
  console.error("Update Request Error:", updateReq);
  console.error("Update Profile Error:", updateProfile);
  alert('❌ Failed to verify user.');
  } else {
    alert('✅ User verified!');
    fetchVerificationRequests();
  }
};
const handleApproveWithdraw = async (id) => {
  setLoading(true);
  const { error } = await supabase
    .from('withdrawal_requests')
    .update({ is_paid: true })
    .eq('id', id);

  if (error) {
    console.error("Withdraw update error:", error);
    alert('❌ Failed to mark as paid.');
  } else {
    alert('✅ Marked as paid.');
    fetchWithdrawRequests();
  }

  setLoading(false);
};

  useEffect(() => {
    if (!authChecked) return;

    if (tab === 'promotion') fetchPromotionRequests();
  else if (tab === 'verification') fetchVerificationRequests();
  else if (tab === 'withdraw') fetchWithdrawRequests();
  }, [authChecked, tab]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">🛠️ Admin Panel</h2>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setTab('promotion')}
            className={`px-4 py-2 rounded-l ${tab === 'promotion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Promotion
          </button>
          <button
            onClick={() => setTab('verification')}
            className={`px-4 py-2 rounded-r ${tab === 'verification' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Verification
          </button>
            <button
    onClick={() => setTab('withdraw')}
    className={`px-4 py-2 ${tab === 'withdraw' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
  >
    Withdraw
  </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <>
            {tab === 'promotion' && (
              <>
                {promotionRequests.length === 0 ? (
                  <p className="text-center text-gray-500">No promotion requests found.</p>
                ) : (
                  promotionRequests.map((req) => (
                    <div key={req.id} className="bg-gray-50 border p-4 rounded-lg mb-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <p><strong>Name:</strong> {req.full_name}</p>
                          <p><strong>Phone:</strong> {req.phone_number}</p>
                          <p><strong>Plan:</strong> {req.plan}</p>
                          <p className="text-sm text-gray-500"><strong>Reel ID:</strong> {req.reel_id}</p>
                        </div>
                        <div>
                          {req.is_approved ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">✅ Approved</span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">⏳ Pending</span>
                          )}
                        </div>
                      </div>
                      {!req.is_approved && req.reel_id && (
                        <button
                          onClick={() => handleApprovePromotion(req.id, req.reel_id)}
                          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
                        >
                          Approve & Promote
                        </button>
                      )}

                    </div>
                  ))
                )}
              </>
            )}

            {tab === 'verification' && (
              <>
                {verificationRequests.length === 0 ? (
                  <p className="text-center text-gray-500">No verification requests found.</p>
                ) : (
                  verificationRequests.map((req) => (
                    <div key={req.id} className="bg-gray-50 border p-4 rounded-lg mb-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <p><strong>Name:</strong> {req.full_name}</p>
                          <p><strong>Phone:</strong> {req.phone_number}</p>
                          <p><strong>Plan:</strong> {req.plan}</p>
                        </div>
                        <div>
                          {req.is_verified ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">✅ Verified</span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">⏳ Pending</span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-4 mt-2">
                        <a
                          href={`https://xafezxfziuvdjhtzbbwh.supabase.co/storage/v1/object/public/verification/${req.passport_photo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Passport Photo
                        </a>
                        <a
                          href={`https://xafezxfziuvdjhtzbbwh.supabase.co/storage/v1/object/public/verification/${req.id_document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          ID Document
                        </a>
                      </div>

                      {!req.is_verified && (
                        <button
                          onClick={() => handleApproveVerification(req.id, req.user_id, req.plan)}
                          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                        >
                          Approve & Verify
                        </button>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
            {tab === 'withdraw' && (
  <>
    {withdrawRequests.length === 0 ? (
      <p className="text-center text-gray-500">No withdrawal requests found.</p>
    ) : (
      withdrawRequests.map((req) => (
        <div key={req.id} className="bg-gray-50 border p-4 rounded-lg mb-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p><strong>User:</strong> {req.user_id}</p>
              <p><strong>Amount:</strong> ${req.amount.toFixed(2)}</p>
              <p><strong>Phone:</strong> {req.phone_number}</p>
              <p><strong>Status:</strong> {req.is_paid ? '✅ Paid' : '⏳ Pending'}</p>
            </div>
          </div>

          {!req.is_paid && (
            <button
              onClick={() => handleApproveWithdraw(req.id)}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
            >
              Mark as Paid
            </button>
          )}
        </div>
      ))
    )}
  </>
)}

          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
