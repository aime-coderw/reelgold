import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import BottomNav from './BottomNav';

export default function AddPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [author, setAuthor] = useState('Admin');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = slugify(title);
    let imageUrl = null;

    if (coverFile) {
      setUploading(true);
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, coverFile);

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        alert('❌ Failed to upload image.');
        setUploading(false);
        return;
      }

      const { data: publicURLData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      imageUrl = publicURLData.publicUrl;
      setUploading(false);
    }

    const { error } = await supabase.from('blog_posts').insert([
      {
        title,
        content,
        slug,
        author,
        cover_image: imageUrl,
      },
    ]);

    if (error) {
      console.error('Insert error:', error);
      alert('❌ Failed to create post. Check the console for details.');
    } else {
      navigate('/blog');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <main className="flex-grow px-4 py-8 max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
          ✍️ Add New Blog Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full border border-gray-300 rounded px-4 py-2 h-40 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Post Content (HTML allowed)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Upload Cover Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>

          <input
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Author Name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-black text-white font-semibold py-2 rounded hover:bg-gray-800 transition"
          >
            {uploading ? 'Uploading...' : 'Publish Post'}
          </button>
        </form>
      </main>

      <footer className="bg-black border-t border-gray-800">
        <BottomNav />
      </footer>
    </div>
  );
}
