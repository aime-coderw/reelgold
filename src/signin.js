// src/pages/Signin.js
import { useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Sign in with Supabase
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !data.user) {
      setErrorMsg("Invalid email or password.");
      return;
    }

    const userId = data.user.id;

    // Fetch role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_name, role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setErrorMsg("Could not fetch user profile.");
      return;
    }

    // Redirect based on role
    if (profile.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleSignin}
        className="bg-[#1a1a1a] p-8 rounded-lg w-full max-w-sm shadow-lg"
      >
        <h2 className="text-2xl mb-4 font-bold">Sign In</h2>

        {errorMsg && <p className="text-red-500 text-sm mb-3">{errorMsg}</p>}

        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
        >
          Sign In
        </button>
      </form>

      <p className="text-sm mt-4 text-center">
        Don’t have an account?{" "}
        <button
          onClick={() => navigate("/signup")}
          className="text-yellow-400 hover:underline"
        >
          Sign Up
        </button>
      </p>
<p className="text-sm mt-4 text-center">
        Have troubles sign in?{" "}
        <button onClick={() => navigate("/contact")}
        className="text-yellow-400 hover:underline"> Contact Us</button>
        </p>
      {/* Bottom Navigation */}
      <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
};

export default Signin;
