// src/pages/Signup.js
import { useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import BottomNav from './BottomNav';
const Signup = () => {
  const [email, setEmail] = useState("");
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const [agreeTerms, setAgreeTerms] = useState(false);


const handleSignup = async (e) => {
  e.preventDefault();
  setErrorMsg("");

  // Step 1: Check if username is already taken
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_name", user_name)
    .single();

  if (existingUser) {
    setErrorMsg("Username already taken.");
    return;
  }

  // Step 2: Sign up
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !data.user) {
    setErrorMsg(signUpError?.message || "Signup failed.");
    return;
  }

  const userId = data.user.id;

  // Step 3: Insert into profiles table
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: userId,
      user_name,
      email,
    },
  ]);

  if (profileError) {
    setErrorMsg("Error saving profile.");
  } else {
    navigate("/home"); // Success
  }
};

  return (
  <div className="min-h-screen flex items-center justify-center bg-black text-white">
    <div className="flex flex-col items-center">
      <form onSubmit={handleSignup} className="bg-[#1a1a1a] p-8 rounded-lg w-full max-w-sm shadow-lg">
        <h2 className="text-2xl mb-4 font-bold">Create Account</h2>

        {errorMsg && <p className="text-red-500 text-sm mb-3">{errorMsg}</p>}

        <div className="mb-4">
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            value={user_name}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            required
          />
        </div>

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
<div className="flex items-start mb-4">
  <input
    type="checkbox"
    id="agreeTerms"
    className="mt-1 mr-2"
    checked={agreeTerms}
    onChange={(e) => setAgreeTerms(e.target.checked)}
  />
  <label htmlFor="agreeTerms" className="text-sm text-gray-700">
    I agree to the{' '}
    <a
      href="/terms"
      className="text-indigo-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      Terms & Regulations
    </a>
  </label>
</div>

       <button
  type="submit"
  disabled={!agreeTerms}
  className={`w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded ${
    !agreeTerms ? 'opacity-50 cursor-not-allowed' : ''
  }`}
>
  Sign Up
</button>

      </form>

      {/* Contact link placed below the form */}
      <p className="text-sm mt-4 text-center">
        Having trouble signing up?{" "}
        <button
          onClick={() => navigate("/contact")}
          className="text-yellow-400 hover:underline"
        >
          Contact Us
        </button>
      </p>
    </div>

    {/* Bottom Navigation */}
    <div className="h-[0vh] bg-[#121212] border-t border-gray-700">
      <BottomNav />
    </div>
  </div>
);

};

export default Signup;
