// Enhanced Upload.js with scroll fix, tags, and UX improvements
import { useState, useEffect,useRef } from "react";
import { supabase } from "./supabase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BottomNav from './BottomNav';
const Upload = () => {
  const [activeTab, setActiveTab] = useState("reel");
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sounds, setSounds] = useState([]);
  const [selectedSound, setSelectedSound] = useState(null);
const [dragOver, setDragOver] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [soundFile, setSoundFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploadPercent, setUploadPercent] = useState(0);
const fileInputRef = useRef(null);
const [dragOverSound, setDragOverSound] = useState(false);
const soundInputRef = useRef(null);
const handleSoundDrop = (e) => {
  e.preventDefault();
  setDragOverSound(false);
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("audio/")) {
    setSoundFile(file);
  }
};

const handleSoundDragOver = (e) => {
  e.preventDefault();
  setDragOverSound(true);
};

const handleSoundDragLeave = () => {
  setDragOverSound(false);
};

  const availableCategories = [
    { label: "🎵 Music", value: "music" },
    { label: "💃 Dance", value: "dance" },
    { label: "🗿 Culture", value: "culture" },
    { label: "🧠 Education", value: "education" },
    { label: "🎭 Comedy", value: "comedy" },
    { label: "🧘 Motivation", value: "motivation" },
    { label: "📱 Tech", value: "tech" },
    { label: "🍳 Cooking", value: "cooking" },
    { label: "✈️ Travel", value: "travel" },
    { label: "🎮 Gaming", value: "gaming" },
    { label: "🛍️ Fashion", value: "fashion" },
    { label: "👶 Family", value: "family" },
    { label: "🐶 Pets", value: "pets" },
    { label: "🧟 Story Time", value: "storytime" },
  ];
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    } else {
      alert("Please drop a valid video file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };
  const handleVideoChange = (file) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.currentTime = 1;
    video.addEventListener("loadeddata", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumbnail(canvas.toDataURL("image/jpeg"));
    });
  };

  useEffect(() => {
    const fetchSounds = async () => {
      const { data, error } = await supabase.from("sounds").select("id, title, audio_url, profiles(user_name, avatar_url)");
      if (!error) setSounds(data);
    };
    fetchSounds();
  }, []);

  useEffect(() => {
    const fetchLocation = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
          const city = res.data.address.city || res.data.address.town || res.data.address.village;
          const country = res.data.address.country;
          setLocation(`${city}, ${country}`);
        } catch (e) {
          console.error("Location fetch failed", e);
        }
      });
    };
    fetchLocation();
  }, []);

const handleUploadReel = async () => {
  if (!videoFile || !caption) return alert("Please select a video and add a caption");
  setUploading(true);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_name, profile_picture")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) throw new Error("Failed to fetch user profile");

    const avatar = profile?.user_avatar || "/default-avatar.png";

    const fileName = `${user.id}_${Date.now()}.${videoFile.name.split(".").pop()}`;
    const filePath = `videos/${fileName}`;

    const { data: uploadUrl, error: signedError } = await supabase.storage
      .from("reels")
      .createSignedUploadUrl(filePath, 60);

    if (signedError) throw new Error("Signed URL creation failed");

    const uploadRes = await fetch(uploadUrl.signedUrl, {
      method: "PUT",
      body: videoFile,
    });

    if (!uploadRes.ok) {
      console.error(await uploadRes.text());
      throw new Error("Video upload failed");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("reels").getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("reels").insert([
      {
        video_url: publicUrl,
        caption,
        user_id: user.id,
        user_name: profile.user_name,
        user_avatar: avatar,
        likes: 0,
        location,
        categories: selectedCategories,
      },
    ]);

    if (insertError) throw insertError;

    alert("Video uploaded successfully!");
    navigate("/home");
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed: " + err.message);
  } finally {
    setUploading(false);
    setUploadPercent(100);
  }
};

  const handleUploadSound = async () => {
    if (!soundFile || !title) return;
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const fileName = `${user.id}_${Date.now()}.${soundFile.name.split(".").pop()}`;
    const filePath = `sounds/${fileName}`;
    await supabase.storage.from("sounds").upload(filePath, soundFile);
    const { data: { publicUrl } } = supabase.storage.from("sounds").getPublicUrl(filePath);

    await supabase.from("sounds").insert([{ title, audio_url: publicUrl, user_id: user.id }]);
    setUploading(false);
    navigate("/home");
  };

  return (
    <div className="bg-black text-white flex justify-center">
  <div className="w-full max-w-2xl p-4 pb-16 overflow-y-auto">
    {/* TABS */}
    <div className="flex mb-6 space-x-4 justify-center">
      <button
        onClick={() => setActiveTab("reel")}
        className={`px-4 py-2 rounded ${
          activeTab === "reel" ? "bg-yellow-500 text-black" : "bg-gray-700"
        }`}
      >
        Upload Reel
      </button>
      <button
        onClick={() => setActiveTab("sound")}
        className={`px-4 py-2 rounded ${
          activeTab === "sound" ? "bg-yellow-500 text-black" : "bg-gray-700"
        }`}
      >
        Upload Sound
      </button>
    </div>
   {activeTab === "reel" && (
  <div
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onClick={() => fileInputRef.current.click()}
    className={`mb-4 border-2 ${
      dragOver ? "border-yellow-400 bg-yellow-100/10" : "border-gray-600"
    } border-dashed rounded-lg p-6 text-center cursor-pointer transition`}
  >
    <p className="text-sm mb-2">Drag & drop your video here</p>
    <p className="text-xs text-gray-400">or click to browse</p>
    <input
      ref={fileInputRef}
      type="file"
      accept="video/*"
      onChange={(e) => handleVideoChange(e.target.files[0])}
      className="hidden"
    />
  </div>
)}

{activeTab === "sound" && (
  <div
    onDrop={handleSoundDrop}
    onDragOver={handleSoundDragOver}
    onDragLeave={handleSoundDragLeave}
    onClick={() => soundInputRef.current.click()}
    className={`mb-4 border-2 ${
      dragOverSound ? "border-yellow-400 bg-yellow-100/10" : "border-yellow-600"
    } border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:shadow-lg`}
  >
    <div className="flex flex-col items-center justify-center space-y-2">
      <p className="font-semibold text-white">Drag & drop your sound here</p>
      <p className="text-sm text-gray-400">or click to browse</p>
    </div>
    <input
      ref={soundInputRef}
      type="file"
      accept="audio/*"
      onChange={(e) => setSoundFile(e.target.files[0])}
      className="hidden"
    />
  </div>
)}

    
    {/* REST OF YOUR CONTENT GOES HERE (like the thumbnail, inputs, etc.) */}


      {activeTab === "reel" && (
        <div className="max-w-xl mx-auto space-y-4">
          {thumbnail && <img src={thumbnail} alt="Thumbnail" className="rounded-lg w-48 h-auto mx-auto shadow-md" />}
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption..." className="w-full p-2 bg-gray-800 rounded" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 bg-gray-800 rounded" placeholder="Location (optional)" />

          <div>
            <label>Choose Categories</label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(cat => {
                const selected = selectedCategories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => {
  if (selected) {
    // Unselect if already selected
    setSelectedCategories(selectedCategories.filter(c => c !== cat.value));
  } else if (selectedCategories.length < 3) {
    // Allow selecting only if less than 3
    setSelectedCategories([...selectedCategories, cat.value]);
  } else {
    alert("You can only select up to 3 categories.");
  }
}}
                    className={`px-3 py-1 rounded-full text-sm border ${selected ? "bg-yellow-400 text-black border-yellow-400" : "border-white text-white"}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>


          {selectedSound && <audio src={selectedSound} controls className="w-full" />}
{uploading && (
  <div className="mb-4">
    <div className="w-full bg-gray-700 rounded-full h-4">
      <div
        className="bg-yellow-400 h-4 rounded-full transition-all duration-300"
        style={{ width: `${uploadPercent}%` }}
      ></div>
    </div>
    <p className="text-sm mt-1 text-center">{uploadPercent}% uploaded</p>
  </div>
)}

          <button onClick={handleUploadReel} disabled={uploading} className="w-full py-2 bg-yellow-500 text-black font-bold rounded">
            {uploading ? "Uploading..." : "Upload Reel"}
          </button>
        </div>
      )}

      {activeTab === "sound" && (
        <div className="max-w-xl mx-auto space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sound Title" className="w-full p-2 bg-gray-800 rounded" />
          <button onClick={handleUploadSound} disabled={uploading} className="w-full py-2 bg-yellow-500 text-black font-bold rounded">
            {uploading ? "Uploading..." : "Upload Sound"}
          </button>
        </div>
      )}
      <p className="text-sm mt-4 text-center">
        Have troubles Uploading?{" "}
        <button onClick={() => navigate("/contact")}
        className="text-yellow-400 hover:underline"> Contact Us</button>
        </p>
    </div>
    {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
};

export default Upload;
