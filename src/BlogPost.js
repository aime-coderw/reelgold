import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        setError('❌ Failed to load post. Please try again later.');
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/blog/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: postUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        alert('🔗 Link copied to clipboard!');
      } catch {
        alert('❌ Failed to copy link.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 text-sm">Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4 text-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <Link
          to="/blog"
          className="mt-4 text-indigo-600 hover:underline font-semibold"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-black shadow-md py-4 px-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/favicon.png" alt="ReelGold Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-white">ReelGold Blog</h1>
        </div>
        <a
          href="https://github.com/aime-coderw/reelgold/releases/download/AndroidApp/reelgold.apk"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
        >
          Download App
        </a>
      </header>

      {/* Blog Post Content */}
      <main className="py-10 px-4 flex-grow">
        <article className="max-w-3xl mx-auto bg-gray shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-snug mb-3">
              {post.title}
            </h1>
            <p className="text-sm text-gray-500 italic mb-2">
              Published on{' '}
              {new Date(post.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

           

            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full md:w-1/4 h-auto max-h-[150px] object-contain mb-6"
              />
            )}

            <div
              className="prose prose-lg max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
<button
              onClick={handleShare}
              className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              aria-label="Share this blog post"
            >
              📤 Share Post
            </button>
            <div className="mt-10">
              <Link
                to="/blog"
                className="text-indigo-600 hover:underline font-semibold"
              >
                More Blog Posts →
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-12 border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-center md:text-left">
            Have issues or feedback?{' '}
            <button
              onClick={() => navigate('/contact')}
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
