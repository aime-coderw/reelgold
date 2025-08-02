import React, { useEffect, useState } from 'react';
import { supabase } from './supabase'; 
import { useParams, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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

              const { data: reelChallengeLinks, error: linkError } = await supabase
          .from('reel_challenges')
          .select('reel_id')
          .eq('challenge_id', challengeData.id);

        if (linkError) throw new Error(linkError.message);

        const reelIds = reelChallengeLinks.map(link => link.reel_id);

        if (reelIds.length > 0) {
          const { data: reelsData, error: reelsError } = await supabase
            .from('reels')
            .select('*')
            .in('id', reelIds)
            .order('created_at', { ascending: false });

          if (reelsError) throw new Error(reelsError.message);

          setReels(reelsData || []);
        } else {
          setReels([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingChallenge(false);
        setLoadingReels(false);
      }
    };

    fetchChallengeAndReels();
  }, [slug]);

  const openScrollable = (reelId) => {
    navigate(`/reel/${reelId}`);
  };

  if (loadingChallenge) return <p className="text-gray-400">Loading challenge...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!challenge) return <p className="text-gray-400">Challenge not found.</p>;
  if (loadingChallenge) return <p className="text-gray-400">Loading challenge...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!challenge) return <p className="text-gray-400">Challenge not found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-yellow-400 mb-2">
        {challenge.title.toUpperCase()}
      </h1>
      <JoinChallengeButton challengeId={challenge.id} />
      <p>      We Tried</p>
     {loadingReels ? (
        <p className="text-gray-400">Loading reels...</p>
      ) : reels.length === 0 ? (
        <p className="text-gray-400 text-center">No reels yet in this challenge.</p>
      ) : (
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 w-full justify-center">
          {reels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => openScrollable(reel.id)}
              className="relative w-full max-w-[180px] aspect-[9/16] rounded-lg overflow-hidden bg-gray-900 mx-auto shadow-md hover:scale-105 transition-transform"
            >
              <video
                src={reel.video_url}
                className="w-full h-55 object-cover rounded-lg"
                muted
                loop
                playsInline
              />
            </div>
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