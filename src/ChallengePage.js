import React, { useEffect, useState } from 'react';
import { supabase } from './supabase'; 
import { useParams } from 'react-router-dom';
import ReelCard from './ReelCard'; 
import JoinChallengeButton from './JoinChallengeButton';
import BottomNav from "./BottomNav";
// Helper to check if string is a valid UUID v4 (simple regex)
const isValidUUID = (str) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

const ChallengePage = () => {
  const { id: slug } = useParams(); // param named 'id' assumed in route
  const [challenge, setChallenge] = useState(null);
  const [reels, setReels] = useState([]);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [loadingReels, setLoadingReels] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchChallengeAndReels = async () => {
    console.log("Fetching challenge with slug/id:", slug);
    setError(null);
    setLoadingChallenge(true);
    setLoadingReels(true);

    try {
      let { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .ilike('slug', slug)
        .maybeSingle();

      if (!challengeData && isValidUUID(slug)) {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', slug)
          .maybeSingle();
        challengeData = data;
        challengeError = error;
      }

      if (challengeError) {
        throw new Error(challengeError.message);
      }
      if (!challengeData) {
        setError('Challenge not found');
        setLoadingChallenge(false);
        setLoadingReels(false);
        return;
      }

      setChallenge(challengeData);

      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select('*')
        .eq('challenge', challengeData.id)
        .order('created_at', { ascending: false });

      if (reelsError) {
        throw new Error(reelsError.message);
      }

      setReels(reelsData || []);
    } catch (err) {
      setError('Error: ' + err.message);
      setReels([]);
      setChallenge(null);
    } finally {
      setLoadingChallenge(false);
      setLoadingReels(false);
    }
  };

  fetchChallengeAndReels();
}, [slug]);


  if (loadingChallenge) return <p className="text-gray-400">Loading challenge...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!challenge) return <p className="text-gray-400">Challenge not found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-yellow-400 mb-2">
        {challenge.title.toUpperCase()}
      </h1>
      <JoinChallengeButton challengeId={challenge.id} />

      {loadingReels ? (
        <p className="text-gray-400">Loading reels...</p>
      ) : reels.length === 0 ? (
        <p className="text-gray-400">No reels yet in this challenge.</p>
      ) : (
        <div className="grid gap-4">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      )}
      {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
};

export default ChallengePage;
