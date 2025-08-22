// components/FeaturedPost.js
export default function FeaturedPost({ post }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <img
        src={post.image_url}
        alt="Post"
        className="w-40 h-40 object-cover"
      />
      <div className="flex-1">
        <h2 className="text-xl font-bold text-red-700">{post.title}</h2>
        <p className="mb-2">{post.description}</p>
        <div className="h-48 overflow-y-auto border p-2 text-sm">
          {post.content}
        </div>
      </div>
    </div>
  );
}
