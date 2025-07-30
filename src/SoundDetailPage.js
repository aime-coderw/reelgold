// SoundDetailPage.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabase";

const SoundDetailPage = () => {
  const { id } = useParams();
  const [sound, setSound] = useState(null);

  useEffect(() => {
    const fetchSound = async () => {
      const { data, error } = await supabase
        .from("sounds")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setSound(data);
    };
    fetchSound();
  }, [id]);

  if (!sound) return <p className="text-center text-white mt-10">Loading sound...</p>;

  return (
    <div className="max-w-md mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-2">{sound.title}</h1>
      <p className="mb-4 text-gray-400">Uploaded by: @{sound.uploader_name}</p>

      <audio controls className="w-full">
        <source src={sound.audio_url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <p className="mt-4 text-sm text-gray-300">{sound.description || "No description available."}</p>
    </div>
  );
};

export default SoundDetailPage;
