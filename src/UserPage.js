 import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Link } from 'react-router-dom';
import BottomNav from './BottomNav';
import UsernameWithBadge from './UsernameWithBadge';
function UserPage() {
  const { username } = useParams();
  const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
const [uploading, setUploading] = useState(false);
const [editing, setEditing] = useState(false); // optional: if you want to track editing separately
const [requesting, setRequesting] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [reason, setReason] = useState('');

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState('');
  const [reels, setReels] = useState([]);
  const [sounds, setSounds] = useState([]);
  const [likes, setLikes] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reels");
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser(data.user);
      }
    };
    fetchUser();
  }, []);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_name, bio, profile_picture, location, verification_badge')
        .eq('user_name', cleanUsername)
        .single();

      if (data) {
        setProfile(data);
        setAvatar(data.profile_picture || '/default-avatar.png');
      } else {
        console.error("User not found:", error);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [cleanUsername]);

  // Check ownership
  useEffect(() => {
    if (currentUser && profile) {
      setIsOwner(currentUser.id === profile.id);
    }
  }, [currentUser, profile]);

  // Fetch profile-related data
  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;

      if (currentUser && currentUser.id !== profile.id) {
        const { data: existingFollow } = await supabase
          .from('followers')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
          .single();
        setIsFollowing(!!existingFollow);
      }

      const { data: reelsData } = await supabase
        .from('reels')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setReels(reelsData || []);

      const { data: soundsData } = await supabase
        .from('sounds')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setSounds(soundsData || []);

      if (reelsData?.length > 0) {
        const reelIds = reelsData.map(r => r.id);
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('reel_id', reelIds);
        setLikes(count || 0);
      }

      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id);
      setFollowers(followersCount || 0);
    };

    fetchData();
  }, [profile, currentUser]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profile) return;

    setFollowLoading(true);

    if (isFollowing) {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id);
      if (!error) {
        setIsFollowing(false);
        setFollowers(prev => prev - 1);
      }
    } else {
      const { error } = await supabase.from('followers').insert([
        {
          follower_id: currentUser.id,
          following_id: profile.id,
        },
      ]);
      if (!error) {
        setIsFollowing(true);
        setFollowers(prev => prev + 1);
      }
    }

    setFollowLoading(false);
  };
const handleUpload = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${profile.id}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  setAvatar(publicUrl); // update local avatar state
  return publicUrl;
};
const handleEditSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);

  const formData = new FormData(e.target);

  const updatedFields = {
    user_name: formData.get("user_name"),
    bio: formData.get("bio"),
    location: formData.get("location"),
  };

  const picture = formData.get("profile_picture");

  if (picture && picture.size > 0) {
    const uploadedUrl = await handleUpload(picture);
    if (uploadedUrl) {
      updatedFields.profile_picture = uploadedUrl;
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(updatedFields)
    .eq("id", profile.id);

  if (error) {
    console.error("Update error:", error);
  } else {
    setShowEditModal(false);
    setProfile({ ...profile, ...updatedFields });
    if (updatedFields.profile_picture) {
      setAvatar(updatedFields.profile_picture);
    }
  }

  setUploading(false);
};
if (!profile) {
  return <div className="text-center mt-10">Loading profile...</div>;
}
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md text-black">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleEditSubmit}>
              <label className="block mb-2 text-sm">Never Change Username,</label>
              <input
                name="user_name"
                defaultValue={profile.user_name}
                required
                className="w-full mb-3 px-3 py-2 border rounded"
              />

              <label className="block mb-2 text-sm">Bio</label>
              <textarea
                name="bio"
                defaultValue={profile.bio}
                className="w-full mb-3 px-3 py-2 border rounded"
              />

              <label className="block mb-2 text-sm">Location</label>
              <input
                name="location"
                defaultValue={profile.location}
                className="w-full mb-3 px-3 py-2 border rounded"
              />

              <label className="block mb-2 text-sm">Profile Picture</label>
              <input
                type="file"
                name="profile_picture"
                accept="image/*"
                className="w-full mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="flex flex-col items-center">
        <img
          src={avatar}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover mb-2"
        />
        <UsernameWithBadge
  user_name={profile.user_name}
  verification_badge={profile.verification_badge}
/>
        {profile.location && <p className="text-gray-500">{profile.location}</p>}
        <p className="text-sm text-gray-400 mb-4">{profile.bio || 'No bio provided.'}</p>

        <div className="flex gap-6 my-4 text-center">
          <span>🎥 {reels.length} Reels</span>
          <span>🎵 {sounds.length} Sounds</span>
          <span>❤️ {likes} Likes</span>
          <span>👥 {followers} Followers</span>
        </div>

        {isOwner ? (
          <>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-sm px-4 py-2 bg-yellow-500 rounded-md text-white"
            >
              Edit Profile
            </button>
             <button
        onClick={() => navigate('/verify')}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Request Verification
      </button>
          </>
        ) : currentUser && (
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`text-sm px-3 py-2 rounded-md ${
              isFollowing ? "bg-gray-600" : "bg-green-500"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 my-6 justify-center">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "reels" ? "bg-white text-black" : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("reels")}
        >
          Reels
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "sounds" ? "bg-white text-black" : "bg-gray-700"
          }`}
          onClick={() => setActiveTab("sounds")}
        >
          Sounds
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "reels" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 w-full justify-center">
  {reels.length > 0 ? (
    reels.map((reel) => (
      <Link
  to={`/reel/${reel.id}`}
  state={{ reels, selectedId: reel.id }}
  key={reel.id}
  className="relative w-full max-w-[180px] aspect-[9/16] rounded-lg overflow-hidden bg-gray-900 mx-auto shadow-md hover:scale-105 transition-transform"
>
  <video
    src={reel.video_url}
    muted
    loop
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover"
  />
</Link>

    ))
  ) : (
    <p className="text-center text-gray-400 w-full">No reels uploaded.</p>
  )}
</div>

      ) : (
        <div className="w-full space-y-4">
          {sounds.length > 0 ? (
            sounds.map((sound) => (
              <div key={sound.id} className="bg-gray-800 p-3 rounded">
                <p className="text-sm font-medium">{sound.title}</p>
                <audio controls className="mt-1 w-full">
                  <source src={sound.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No sounds uploaded.</p>
          )}
        </div>
      )}

      {isOwner && (
        <button
          onClick={handleSignOut}
          className="text-sm px-4 py-2 bg-red-500 rounded-md text-white mt-8 text-sm text-white-400 block mx-auto justify-center"
        >
          Sign Out
        </button>
      )}
      <div className='mt-6 text-center text-black'>
        <p>we diid</p>
      </div>
      {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
    </div>
    </div>
  );
}

export default UserPage;
