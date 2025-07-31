// src/ChallengesPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from "./BottomNav";

const challenges = [
  {
    id: 'creator-challenge',
    name: 'Creator Challenge',
    start: '2025-08-02',
    end: '2025-09-02',
  },
  {
    id: 'culture-challenge',
    name: 'Culture Challenge',
    start: '2025-11-02',
    end: '2025-12-02',
  },
  {
    id: 'dance-challenge',
    name: 'Dance Challenge',
    start: '2026-02-02',
    end: '2026-03-02',
  },
  {
    id: 'comedy-challenge',
    name: 'Comedy Challenge',
    start: '2026-05-02',
    end: '2026-06-02',
  },
];

const ChallengesPage = () => {
  const today = new Date();

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-yellow-400">Challenges</h1>
      <div className="space-y-4">
        {challenges.map((challenge) => {
          const start = new Date(challenge.start);
          const end = new Date(challenge.end);
          const isActive = today >= start && today <= end;

          return (
            <div
              key={challenge.id}
              className="bg-gray-900 rounded-xl p-4 border border-gray-700"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{challenge.name}</h2>
                  <p className="text-sm text-gray-400">
                    {start.toDateString()} - {end.toDateString()}
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      isActive ? 'text-green-400' : 'text-yellow-400'
                    }`}
                  >
                    {isActive ? 'Active' : 'Upcoming'}
                  </p>
                </div>
                <Link
                  to={`/challenge/${challenge.id}`}
                  className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium hover:bg-yellow-400"
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
};

export default ChallengesPage;
