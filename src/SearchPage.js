import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import SoundCard from "./SoundCard";
import BottomNav from './BottomNav';
import { useNavigate, Link } from "react-router-dom";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [reels, setReels] = useState([]);
  const [sounds, setSounds] = useState([]);
  const [sortBy, setSortBy] = useState("recent");

  const navigate = useNavigate();

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchResults();
      }
    }, 400);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, activeTab, sortBy]);

  const fetchResults = async () => {
    if (activeTab === "all" || activeTab === "users") {
      const { data } = await supabase
        .from("profiles")
        .select("id, user_name, profile_picture")
        .ilike("user_name", `%${searchTerm}%`);
      setUsers(data || []);
    }

    if (activeTab === "all" || activeTab === "reels") {
      let query = supabase
        .from("reels")
        .select("id, video_url, caption, categories, created_at, user_id, like_count, views_count")
        .ilike("caption", `%${searchTerm}%`);

      if (sortBy === "likes") query = query.order("like_count", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data } = await query;
      setReels(data || []);
    }

    if (activeTab === "all" || activeTab === "sounds") {
      let query = supabase
        .from("sounds")
        .select("*")
        .ilike("title", `%${searchTerm}%`);

      if (sortBy === "likes") query = query.order("like_count", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data } = await query;
      setSounds(data || []);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto text-white">
      {/* Search bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users, reels or sounds..."
        className="w-full p-3 mb-4 rounded bg-gray-800 border border-gray-600 focus:outline-none"
      />

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {["all", "users", "reels", "sounds"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-1 rounded-full ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters */}
      {(activeTab === "reels" || activeTab === "sounds" || activeTab === "all") && (
        <div className="mb-4">
          <label className="text-sm text-gray-400 mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white p-1 rounded"
          >
            <option value="recent">Most Recent</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-2">Users</h3>
            <div className="space-y-2">
              {users.map((user) => (
  <div
    key={user.id}
    className="flex items-center gap-3 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
    onClick={() => navigate(`/${user.user_name}`)}
  >
    <img
      src={user.profile_picture || "/default-avatar.png"}
      alt=""
      className="w-10 h-10 rounded-full object-cover"
    />
    <span>@{user.user_name}</span>
  </div>
))}

            </div>
          </div>
        )}
{(activeTab === "all" || activeTab === "reels") && reels.length > 0 && (
  <div>
    <h3 className="text-xl font-bold mb-2">Reels</h3>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {reels.map((reel) => (
        <Link
          key={reel.id}
          to={`/reel/${reel.id}`}
          state={{ selectedId: reel.id, reels }}
          className="relative aspect-[9/16] overflow-hidden rounded-md bg-black"
        >
          <video
            src={reel.video_url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            onMouseOver={(e) => e.currentTarget.play()}
            onMouseOut={(e) => e.currentTarget.pause()}
          />
          <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[10px] text-white bg-gradient-to-t from-black/70 to-transparent truncate">
            {reel.caption}
          </div>
          {reel.categories?.length > 0 && (
  <div className="absolute top-1 left-1 flex flex-wrap gap-1">
    {reel.categories.map((cat, i) => (
      <span
        key={i}
        className="bg-yellow-600 text-white text-[10px] px-2 py-0.5 rounded-full"
      >
        #{cat}
      </span>
    ))}
  </div>
)}

        </Link>
      ))}
    </div>
  </div>
)}


       {(activeTab === "all" || activeTab === "sounds") && sounds.length > 0 && (
  <div>
    <h3 className="text-xl font-bold mb-2">Sounds</h3>
    <div className="grid gap-2">
      {sounds.map((sound) => (
        <SoundCard key={sound.id} sound={sound} />
      ))}
    </div>
  </div>
)}
      </div>
       {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
};

export default SearchPage;
