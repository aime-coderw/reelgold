// src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // ✅ Removed BrowserRouter here
import SplashScreen from './SplashScreen';
import Home from './Home';
import SignInPage from './signin';
import { supabase } from './supabase';
import Signup from './signup';
import UserPage from "./UserPage";
import Upload from './Upload';
import SoundCard from './SoundCard';
import ScrollableReelViewer from './ScrollableReelViewer';
import SearchPage from './SearchPage';
import SoundDetailPage from './SoundDetailPage';
import PromotePage from './PromotePage';
import AdminPanel from './AdminPanel';
import VerificationPage from './VerificationPage';
import UsernameWithBadge from './UsernameWithBadge';
import EarnPage from './EarnPage';
import WithdrawalRequestPage from './WithdrawalRequestPage';
import ContactUs from './ContactUs';
import ChallengePage from './ChallengePage';
import ChallengesPage from './ChallengesPage';
import BlogHome from './BlogHome';
import BlogPost from './BlogPost';
import AddPost from './AddPost';
import Terms from './Terms';
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        console.log("Logged in user:", user);
      } else {
        console.log("No user:", error?.message);
      }
    };

    getUser();
  }, []);

  return (
    <Routes>
      <Route path='/terms' element={<Terms />} />
      <Route path="/add-post" element={<AddPost />} />
      <Route path="/blog" element={<BlogHome />} />
<Route path="/blog/:id" element={<BlogPost />} />
<Route path="/blog/add" element={<AddPost />} />
      <Route path="/challenges" element={<ChallengesPage />} />
      <Route path="/challenge/:id" element={<ChallengePage />} />
      <Route path='/contact' element={<ContactUs />} />
      <Route path="/withdraw" element={<WithdrawalRequestPage />} />
      <Route path="/earn" element={<EarnPage />} />
      <Route path="/UsernameWithBagde" element={<UsernameWithBadge />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/" element={<SplashScreen />} />
      <Route path="/home" element={<Home user={user} />} /> 
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<UserPage />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/SoundCard" element={<SoundCard />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/reel/:id" element={<ScrollableReelViewer />} />
      <Route path="/sound/:id" element={<SoundDetailPage />} />
      <Route path="/promote/:id" element={<PromotePage />} />
      <Route path="/verify" element={<VerificationPage />} />
      <Route path="/:username" element={<UserPage />} />
    </Routes>
  );
}

export default App;
