// components/JoinChallengeButton.js
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const JoinChallengeButton = ({ challengeId }) => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkJoined = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('joined_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (data) setJoined(true);
      setLoading(false);
    };

    checkJoined();
  }, [challengeId]);

  const handleJoin = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Auth error:', userError);
    alert('Could not get user');
    return;
  }

  if (!user) {
    alert('Please sign in first');
    return;
  }

  const { error } = await supabase
    .from('joined_challenges')
    .insert({
      user_id: user.id,
      challenge_id: challengeId,
    });

  if (error) {
    console.error('Join challenge error:', error);
    alert("Error joining challenge");
  } else {
    setJoined(true);
  }
};


  if (loading) return null;

  return (
    <button
      className={`px-4 py-2 rounded-md font-semibold ${
        joined ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-yellow-500 text-black'
      }`}
      disabled={joined}
      onClick={handleJoin}
    >
      {joined ? 'Joined' : 'Join Challenge'}
    </button>
  );
};

export default JoinChallengeButton;
