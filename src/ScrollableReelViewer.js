import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import ReelCard from './ReelCard';
import BottomNav from './BottomNav';
import { supabase } from './supabase';

const ScrollableReelViewer = () => {
  const location = useLocation();
  const { selectedId } = location.state || {};
  const { id: fallbackId } = useParams(); // fallback if no state
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [sounds, setSounds] = useState([]);
  const [activeTab, setActiveTab] = useState('reels');
  const [reels, setReels] = useState(location.state?.reels || []);
  const containerRef = useRef(null);
useEffect(() => {
  const fetchSingleReel = async () => {
    if (!reels.length && fallbackId) {
      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .eq('id', fallbackId)
        .single();

      if (data) setReels([data]);
    }
  };

  fetchSingleReel();
}, [reels, fallbackId]);

  // Scroll to the selected reel
  useEffect(() => {
    if (reels.length && containerRef.current) {
      const index = reels.findIndex((r) => r.id === selectedId || r.id === fallbackId);
      if (index !== -1) {
        const child = containerRef.current.children[index];
        child?.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [reels]);

  return (
    
   <div className="h-screen flex flex-col">
  {/* Sticky Header */}
  <div className="bg-black text-center py-2 z-20 sticky top-0">
    <h1 className="text-2xl font-bold text-white">Gold Reels</h1>
  </div>

  {/* Scrollable Video Area */}
  <div className="flex-1 overflow-y-scroll snap-y snap-mandatory h-[85vh]" ref={containerRef}>
    {reels.map((reel) => (
      <div key={reel.id} className="snap-start h-[85vh] snap-always">
        <ReelCard reel={reel} />
      </div>
      ))}
      </div>
      {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
};

export default ScrollableReelViewer;
