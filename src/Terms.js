import React from 'react';
import BottomNav from './BottomNav';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6 text-gray-800 bg-white shadow-md rounded-lg mb-20">
      <h1 className="text-3xl font-bold text-center mb-6 text-black">📜 Terms & Regulations</h1>

      <ul className="space-y-4 list-disc list-inside text-base leading-relaxed">
        <li>
          <strong>Content Usage:</strong> By uploading to <strong>ReelGold</strong>, you give ReelGold Inc. the right to use your reels in marketing or advertisements.
        </li>

        <li>
          <strong>Withdraw Requirements:</strong> You need to accumulate a minimum number of Golds (as defined in the Earn section) before you can request a withdrawal.
        </li>

        <li>
          <strong>Account Verification:</strong> You must verify your account before you can start earning money through your content.
        </li>

        <li>
          <strong>Identity Integrity:</strong> Verification requests using names or identities of celebrities or other public figures are strictly forbidden and will be rejected.
        </li>

        <li>
          <strong>Eligibility for Verification:</strong> To be eligible for verification, you must have:
          <ul className="list-disc list-inside ml-4">
            <li>At least 5 uploaded videos</li>
            <li>At least 100 total likes</li>
            <li>At least 1,000 total views</li>
          </ul>
        </li>

        <li>
          <strong>Email Confirmation:</strong> You must confirm your email before your verification request can be approved.
        </li>

        <li>
          <strong>Withdrawal Deductions:</strong> A standard <strong>17%</strong> platform fee is deducted from every withdrawal you make.
        </li>

        <li>
          <strong>Account Deletion:</strong> To delete your account, please contact our support team. We will process your request manually.
        </li>

        <li>
          <strong>Challenges:</strong> To qualify and win the $20 prize in any ReelGold Challenge, your reel must reach:
          <ul className="list-disc list-inside ml-4">
            <li>100,000 total views</li>
            <li>2,000 total likes</li>
          </ul>
        </li>

        <li>
          <strong>Promotions:</strong> When you promote a reel, the promotion lasts for <strong>1 week</strong>. For extended promotion durations, please contact our team.
        </li>
      </ul>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          ← Go Back
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-700 z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export default Terms;
