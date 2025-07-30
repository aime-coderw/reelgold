import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const ReelDetailPage = () => {
  const { id } = useParams();
  const [reel, setReel] = useState(null);

  useEffect(() => {
    const fetchReel = async () => {
      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setReel(data);
      else console.error("Error fetching reel:", error);
    };

    fetchReel();
  }, [id]);

  if (!reel) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="p-4 text-white max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-2">{reel.caption}</h1>
      <video controls className="w-full rounded" src={reel.video_url} />
    </div>
  );
};

export default ReelDetailPage;
