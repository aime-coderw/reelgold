import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaHeart, FaDownload } from "react-icons/fa";
import { supabase } from "./supabase";

const SoundCard = ({ sound }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndLikes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        checkIfLiked(user.id);
      }

      const { count, error: countError } = await supabase
        .from("sound_likes")
        .select("*", { count: "exact", head: true })
        .eq("sound_id", sound.id);

      if (!countError) {
        setLikes(count);
      } else {
        console.error("Error fetching like count:", countError.message);
      }
    };

    fetchUserAndLikes();
  }, [sound.id]);

  const checkIfLiked = async (uid) => {
    const { data } = await supabase
      .from("sound_likes")
      .select("id")
      .eq("sound_id", sound.id)
      .eq("user_id", uid)
      .single();

    if (data) setLiked(true);
  };

  const handleLike = async () => {
    if (!userId) {
      alert("Sign in to like sounds");
      return;
    }

    if (liked) return;

    const { error } = await supabase
      .from("sound_likes")
      .insert([{ sound_id: sound.id, user_id: userId }]);

    if (error) {
      console.error("Failed to like:", error.message);
      return;
    }

    setLiked(true);
    setLikes((prev) => prev + 1);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4 shadow-md border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!audioRef.current) return;
              isPlaying ? audioRef.current.pause() : audioRef.current.play();
              setIsPlaying(!isPlaying);
            }}
            className="text-yellow-400 hover:text-yellow-300"
          >
            {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
          </button>
          <div>
            <p className="font-bold text-white">{sound.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <button
            onClick={handleLike}
            className={`cursor-pointer ${liked ? "text-red-500" : "hover:text-red-500"}`}
          >
            <FaHeart /> {likes}
          </button>
          <a href={sound.audio_url} download>
            <FaDownload className="hover:text-yellow-400 cursor-pointer" />
          </a>
        </div>
      </div>

      <audio ref={audioRef} src={sound.audio_url} preload="none" />
    </div>
  );
};

export default SoundCard;
