import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function BlogHome() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, created_at, slug, author, cover_image, content')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching posts:', error);
      else setPosts(data);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-black text-white shadow-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="ReelGold Logo" className="h-10" />
          <h1 className="text-2xl font-bold">ReelGold Blog</h1>
        </div>
        <a
          href="https://github.com/aime-coderw/reelgold/releases/download/AndroidApp/app-release.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg shadow transition"
        >
          Download App
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No posts available.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                to={`/blog/${post.id}`}
                key={post.id}
                className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-300"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(post.created_at).toLocaleDateString()} by{" "}
                    <span className="text-indigo-600">{post.author}</span>
                  </p>
                  {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full md:w-1/3 h-auto max-h-[100px] object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                  <p className="mt-3 text-gray-700 text-sm line-clamp-3">
                    {post.content.length > 150
                      ? post.content.slice(0, 150) + "..."
                      : post.content}
                  </p>
                  <span className="mt-4 inline-block text-sm text-indigo-600 font-semibold">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-12 border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-center md:text-left">
            Have issues or feedback?{" "}
            <button
              onClick={() => navigate("/contact")}
              className="text-yellow-400 hover:underline"
            >
              Contact Us
            </button>
          </div>

          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition"
            >
              <i className="fab fa-facebook fa-lg"></i>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition"
            >
              <i className="fab fa-twitter fa-lg"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition"
            >
              <i className="fab fa-instagram fa-lg"></i>
            </a>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 border-t border-gray-700 py-2">
          © {new Date().getFullYear()} ReelGold. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
