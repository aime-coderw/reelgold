import React, { useState } from 'react';
import { supabase } from './supabase';
import BottomNav from './BottomNav';
const VerificationPage = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file, pathPrefix) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;
    const { error } = await supabase.storage.from('verification').upload(filePath, file);
    return error ? null : filePath;
  };

  const handleSubmit = async () => {
    if (!fullName || !phoneNumber || !passportPhoto || !idDocument || !plan) {
      alert('Please fill in all fields.');
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

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('verification_requests').insert([
      {
        user_id: user.id,
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

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded text-black">
      <h2 className="text-2xl font-bold mb-4 text-center">Request Verification</h2>

      <label className="block mb-2 font-semibold">Full Name</label>
      <input className="border px-3 py-2 w-full mb-4" value={fullName} onChange={e => setFullName(e.target.value)} />

      <label className="block mb-2 font-semibold">Phone Number</label>
      <input className="border px-3 py-2 w-full mb-4" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />

      <label className="block mb-2 font-semibold">Upload Passport Photo</label>
      <input type="file" className="mb-4" accept="image/*" onChange={e => setPassportPhoto(e.target.files[0])} />

      <label className="block mb-2 font-semibold">Upload ID Document (ID, Driver’s License or Passport)</label>
      <input type="file" className="mb-4" accept="image/*" onChange={e => setIdDocument(e.target.files[0])} />

      <label className="block mb-2 font-semibold">Choose Plan</label>
      <select className="border px-3 py-2 w-full mb-4" value={plan} onChange={e => setPlan(e.target.value)}>
        <option value="">-- Select Plan --</option>
        <option value="basic">Basic (White Badge - 4340 RWF / $3)</option>
        <option value="creator">Creator (Blue Badge - 8680 RWF / $6)</option>
        <option value="pro">Pro (Gold Badge - 13,020 RWF / $9)</option>
      </select>
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

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
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
