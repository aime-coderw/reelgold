import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import BottomNav from './BottomNav';

const VerificationPage = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
const [agreeTerms, setAgreeTerms] = useState(false);

  const [stats, setStats] = useState({ videos: 0, likes: 0, views: 0 });
  const [userId, setUserId] = useState('');

  const required = { videos: 5, likes: 500, views: 2000 };

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const [{ data: reels }, { data: likes }, { data: views }] = await Promise.all([
        supabase.from('reels').select('id').eq('user_id', user.id),
        supabase.from('likes').select('id').eq('user_id', user.id),
        supabase.from('views').select('id').eq('user_id', user.id),
      ]);

      setStats({
        videos: reels?.length || 0,
        likes: likes?.length || 0,
        views: views?.length || 0
      });
    };

    fetchStats();
  }, []);

  const handleUpload = async (file, pathPrefix) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;
    const { error } = await supabase.storage.from('verification').upload(filePath, file);
    return error ? null : filePath;
  };

  const meetsRequirement = () =>
    stats.videos >= required.videos &&
    stats.likes >= required.likes &&
    stats.views >= required.views;

  const handleSubmit = async () => {
    if (!fullName || !phoneNumber || !passportPhoto || !idDocument || !plan) {
      alert('Please fill in all fields.');
      return;
    }

    if (!meetsRequirement()) {
      alert('🚫 You must meet the video, likes, and views requirements before verifying.');
      return;
    }

    setLoading(true);

    const passportPath = await handleUpload(passportPhoto, 'passport_photos');
    const idPath = await handleUpload(idDocument, 'id_documents');

    if (!passportPath || !idPath) {
      alert('Upload failed');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('verification_requests').insert([
      {
        user_id: userId,
        full_name: fullName,
        phone_number: phoneNumber,
        passport_photo: passportPath,
        id_document: idPath,
        plan,
        is_verified: false
      }
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Submission failed');
    } else {
      alert('✅ Verification request submitted! Please complete payment.');
    }
  };

  const renderProgress = (label, current, total) => {
    const percent = Math.min((current / total) * 100, 100);
    return (
      <div className="mb-4">
        <p className="text-sm font-semibold mb-1">
          {label}: {current}/{total}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${percent >= 100 ? 'bg-green-500' : 'bg-yellow-400'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded text-black mb-20">
      <h2 className="text-2xl font-bold mb-4 text-center">Request Verification</h2>

      {/* Progress Bars */}
      <div className="mb-6">
        {renderProgress('Videos Uploaded', stats.videos, required.videos)}
        {renderProgress('Total Likes', stats.likes, required.likes)}
        {renderProgress('Total Views', stats.views, required.views)}
        {!meetsRequirement() && (
          <p className="text-red-600 text-sm font-semibold text-center">
            🚫 You must meet all the above requirements before submitting verification.
          </p>
        )}
      </div>

      {/* Form */}
      <label className="block mb-2 font-semibold">Full Name</label>
      <input className="border px-3 py-2 w-full mb-4" value={fullName} onChange={e => setFullName(e.target.value)} />

      <label className="block mb-2 font-semibold">Phone Number</label>
      <input className="border px-3 py-2 w-full mb-4" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />

      <label className="block mb-2 font-semibold">Upload Passport Photo</label>
      <input type="file" className="mb-4" accept="image/*" onChange={e => setPassportPhoto(e.target.files[0])} />

      <label className="block mb-2 font-semibold">Upload ID Document</label>
      <input type="file" className="mb-4" accept="image/*" onChange={e => setIdDocument(e.target.files[0])} />

      <label className="block mb-2 font-semibold">Choose Plan</label>
      <select className="border px-3 py-2 w-full mb-4" value={plan} onChange={e => setPlan(e.target.value)}>
        <option value="">-- Select Plan --</option>
        <option value="basic">Basic (White Badge - 4340 RWF / $3)</option>
        <option value="creator">Creator (Blue Badge - 8680 RWF / $6)</option>
        <option value="pro">Pro (Gold Badge - 13,020 RWF / $9)</option>
      </select>

      {/* Payment Info */}
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
  onClick={handleSubmit}
  disabled={loading || !meetsRequirement() || !agreeTerms}
  className={`w-full py-2 rounded text-white ${
    !meetsRequirement() || !agreeTerms
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-green-600 hover:bg-green-700'
  }`}
>
  {loading ? 'Submitting...' : 'Submit Verification Request'}
</button>


      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-700 z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export default VerificationPage;
