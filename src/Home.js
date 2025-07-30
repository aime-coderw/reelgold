import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import ReelCard from './ReelCard';
import SoundCard from './SoundCard'; // import SoundCard
import BottomNav from './BottomNav';


export default function Home() {
  const [activeTab, setActiveTab] = useState('reels');
  const [reels, setReels] = useState([]);
  const [sounds, setSounds] = useState([]);

  // Fetch reels
  useEffect(() => {
    const fetchReels = async () => {
      const { data, error } = await supabase.from('reels').select('*').order('reel_score', { ascending: false });
      if (error) console.error('Error fetching reels:', error.message);
      else setReels(data);
    };
    fetchReels();
  }, []);

  // Fetch sounds
  useEffect(() => {
    const fetchSounds = async () => {
      const { data, error } = await supabase
        .from('sounds')
        .select(`
          id,
          title,
          audio_url,
          user_id,
          profiles (
            user_name,
            avatar_url
          )
        `);
      if (error) console.error('Error fetching sounds:', error.message);
      else setSounds(data);
    };
    fetchSounds();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Tabs */}
      <div className="flex justify-center border-b border-gray-700 bg-[#1a1a1a]">
        <button
          className={`px-4 py-2 font-bold ${
            activeTab === 'reels' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('reels')}
        >
          Reels
        </button>
        <button
          className={`px-4 py-2 font-bold ${
            activeTab === 'sounds' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('sounds')}
        >
          Sounds
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory h-[88vh]">
        {activeTab === 'reels' ? (
          reels.length > 0 ? (
            reels.map((reel) => (
              <div key={reel.id} className="snap-start h-[88vh] snap-always">
                <ReelCard
                 reel={reel}
                 userId={reel.user_id} />
              </div>
            ))
          ) : (
            <p className="text-center mt-10 text-white">Loading Reels...</p>
          )
        ) : sounds.length > 0 ? (
          sounds.map((sound) => (
            <SoundCard key={sound.id} sound={sound} />
          ))
        ) : (
          <p className="text-center mt-10 text-white">Loading Sounds...</p>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
}
