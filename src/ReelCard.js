import { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHeart, FaComment, FaShare, FaWhatsapp, FaFacebookF, FaTwitter, FaLink } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { supabase } from './supabase';
import { parseMentions } from './parseMentions';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

// ✅ Custom Hook
const useViewCount = (reelId) => {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!reelId) return;

    const fetchViews = async () => {
      const { count } = await supabase
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('reel_id', reelId);

      setViewCount(count || 0);
    };

    fetchViews();

    // Poll every 10 seconds for live-ish updates
    const interval = setInterval(fetchViews, 10000);
    return () => clearInterval(interval);
  }, [reelId]);

  return viewCount;
};

const ReelCard = ({ reel }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [viewed, setViewed] = useState(false);
  const [user, setUser] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const isOwner = user?.id === reel.user_id;
  const logoUrl = '/logoo.mp4'; // Public folder in React

  const viewCount = useViewCount(reel.id);

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchProfile();
  }, []);

  // ✅ Creator profile
  useEffect(() => {
    const fetchCreator = async () => {
      if (!reel?.user_id) return;
      const { data } = await supabase
        .from('profiles')
        .select('profile_picture, verification_badge')
        .eq('id', reel.user_id)
        .single();
      if (data) setCreatorProfile(data);
    };
    
    fetchCreator();

    const subscription = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${reel.user_id}`,
        },
        (payload) => {
          setCreatorProfile((prev) => ({
            ...prev,
            profile_picture: payload.new.profile_picture,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [reel?.user_id]);

  // ✅ Record view
  useEffect(() => {
    const video = videoRef.current;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.9 && !viewed) {
          await supabase.rpc('increment_view_count', { reel_id: reel.id });
          setViewed(true);

          if (!sessionStorage.getItem(`viewed_${reel.id}`)) {
            await supabase.from('views').insert({
              reel_id: reel.id,
              user_id: user?.id || null,
            });
            sessionStorage.setItem(`viewed_${reel.id}`, 'true');
          }

          video?.play().catch(() => {});
          setPlaying(true);
        } else {
          video?.pause();
          setPlaying(false);
        }
      },
      { threshold: [0.9] }
    );

    if (video) observer.observe(video);
    return () => video && observer.unobserve(video);
  }, [reel.id, viewed, user]);

  // ✅ Likes logic
  useEffect(() => {
    const fetchLikes = async () => {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('reel_id', reel.id);
      setLikes(count || 0);

      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('*')
          .eq('reel_id', reel.id)
          .eq('user_id', user.id)
          .single();
        setLiked(!!data);
      }
    };

    if (reel?.id) fetchLikes();
  }, [reel.id, user]);

  const handleLike = async () => {
    if (!user) return navigate('/signin');
    if (liked) return;

    const { error } = await supabase.from('likes').insert({
      reel_id: reel.id,
      user_id: user.id,
    });

    if (!error) {
      setLiked(true);
      setLikes((prev) => prev + 1);
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        text,
        created_at,
        user_id,
        username,
        profiles!user_id ( profile_picture ),
        verification_badge
      `)
      .eq('reel_id', reel.id)
      .order('created_at', { ascending: false });

    setComments(data || []);
  };

  const handleComment = () => {
    if (!user) return navigate('/signin');
    setShowComments(true);
    fetchComments();
  };

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim()) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_name')
      .eq('id', user.id)
      .single();

    const { error } = await supabase.from('comments').insert({
      reel_id: reel.id,
      user_id: user.id,
      text: commentText,
      username: profile?.user_name,
    });

    if (!error) {
      setCommentText('');
      fetchComments();
    }
  };

  const handleShare = (platform) => {
    const url = `${window.location.origin}/reel/${reel.id}`;
    const text = encodeURIComponent("Check out this reel on ReelGold!");

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url)
          .then(() => alert('Link copied!'))
          .catch(() => alert('Failed to copy link.'));
        break;
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex justify-center items-start h-screen bg-black overflow-hidden">
      <div className="p-[5px] rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 shadow-xl">
  <div className="relative bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            src={reel.video_url}
            loop
            playsInline
            onClick={togglePlayPause}
            className="aspect-[9/16] h-[82vh] object-contain bg-black"
          />

          {/* ... rest of your JSX for comments, likes, and sharing (unchanged) ... */}
          {/* User Info */}
          <div className="absolute top-4 left-4 flex items-center gap-3 text-white">
            {creatorProfile?.profile_picture ? (
              <img
                src={creatorProfile.profile_picture}
                alt="User avatar"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <img
                src="/default-avatar.png"
                alt="Default avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
  <Link
    to={`/@${reel.user_name}`}
    className="text-sm text-yellow-400 font-bold hover:underline flex items-center gap-1"
  >
    @{reel.user_name}
    {creatorProfile?.verification_badge && (
      <img
        src={`/badge/${creatorProfile.verification_badge}`}
        alt="Badge"
        className="w-4 h-4"
      />
    )}
  </Link>
  <p className="text-xs text-gray-300">{new Date(reel.created_at).toLocaleString()}</p>
</div>
</div>

          {/* Actions */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 text-white">
            <button onClick={handleLike} className={`hover:scale-110 transform transition ${liked ? 'text-red-500 scale-125' : ''}`}>
              <FaHeart className="text-2xl" />
              <span className="text-sm">{likes}</span>
            </button>

            <button onClick={handleComment} className="flex flex-col items-center">
              <FaComment className="text-2xl" />
              <span className="text-sm">{comments.length}</span>
            </button>

            <button onClick={() => setShowShareOptions(true)} className="flex flex-col items-center">
              <FaShare className="text-2xl" />
            </button>
             </div>

          {/* Caption & Categories */}
<div className="absolute bottom-4 left-4 right-4 text-white text-sm bg-black/50 p-2 rounded">
  {parseMentions(reel.caption)}

  {/* Categories */}
  {reel.categories && reel.categories.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-2">
      {reel.categories.map((cat, idx) => (
        <span
          key={idx}
          className="text-xs px-2 py-1 bg-yellow-600 text-white rounded-full"
        >
          #{cat}
        </span>
      ))}
    </div>
  )}
</div>


          {/* Comments Modal */}
          {showComments && (
            <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50">
              <div className="bg-white p-4 rounded w-3/4 max-h-[80vh] overflow-y-auto text-black">
                <div className="flex justify-end">
                  <button onClick={() => setShowComments(false)} className="text-xl text-gray-500 font-bold">
                    &times;
                  </button>
                </div>
                <h2 className="text-lg font-bold mb-4">Comments</h2>

                {comments.length > 0 ? (
                  comments.map((c, i) => (
                    <div key={i} className="flex flex-col gap-1 mb-4 p-3 rounded bg-gray-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.profiles?.profile_picture || '/default-avatar.png'}
                          alt="avatar"
                          className="w-9 h-9 rounded-full object-cover border border-gray-300"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{c.username}</span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(c.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 ml-12">{parseMentions(c.text)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}

                {/* Input */}
                <div className="relative mt-2">
                  <textarea
                    className="w-full border rounded p-2"
                    rows={3}
                    placeholder="Write your comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-xl">😊</button>
                    <div className="flex gap-2">
                      <button onClick={() => setShowComments(false)} className="text-sm px-3 py-1 bg-gray-300 rounded">Cancel</button>
                      <button onClick={handleSubmitComment} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Submit</button>
                    </div>
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute bottom-[4.5rem] left-0 z-50">
                      <EmojiPicker
                        onEmojiClick={(e) => {
                          setCommentText(commentText + e.emoji);
                          setShowEmojiPicker(false);
                        }}
                        height={300}
                        width={250}
                        theme="light"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Share Modal */}
          {showShareOptions && (
            <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50">
              <div className="bg-white p-5 rounded-lg shadow-lg text-center w-[300px] text-black relative">
                <button onClick={() => setShowShareOptions(false)} className="absolute top-2 right-2 text-xl text-gray-500">
                  &times;
                </button>
                <h3 className="text-lg font-bold mb-4">Share this reel</h3>
                <div className="flex justify-around items-center text-2xl">
                  <button onClick={() => handleShare('whatsapp')}><FaWhatsapp className="text-green-500" /></button>
                  <button onClick={() => handleShare('facebook')}><FaFacebookF className="text-blue-600" /></button>
                  <button onClick={() => handleShare('twitter')}><FaTwitter className="text-sky-500" /></button>
                  <button onClick={() => handleShare('copy')}><FaLink className="text-gray-700" /></button>
                </div>
              </div>
            </div>
          )}
          {/* Three Dots Button */}
<div className="absolute bottom-1 right-2">
  

      {isOwner && (
        <>
          <button
  onClick={() => navigate(`/promote/${reel.id}`)}
  className="absolute bottom-12 text-sm bg-green-500 px-3 py-2 rounded-full shadow-md text-xs text-white mt-3 text-sm text-white-400 block mx-auto justify-right"
>
  Promote
</button>


          <button
            onClick={async () => {
              const confirmed = window.confirm("Are you sure you want to delete this reel?");
              if (confirmed) {
                const { error } = await supabase
                  .from('reels')
                  .delete()
                  .eq('id', reel.id);

                if (!error) {
                  alert('Reel deleted');
                  window.location.reload(); // or remove from state if you're listing
                } else {
                  alert('Failed to delete reel');
                }
              }
              setShowOptions(false);
            }}
            className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-full shadow-md"
          >
            Delete
          </button>
        </>
      )}
    </div>
          <div className="absolute left-4 bottom-20 text-white text-xs bg-black/60 px-2 py-1 rounded-full">
            {viewCount} views
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelCard;
