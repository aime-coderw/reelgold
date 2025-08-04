// components/LatestPosts.js
import { Link } from "react-router-dom";

export default function LatestPosts({ posts }) {
  return (
    <div className="w-full sm:w-1/3 sm:pl-4">
      <h3 className="text-blue-700 font-bold mb-2">Latest posts</h3>
      <ul className="space-y-2 overflow-y-auto max-h-64">
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link to={`/blog/${post.id}`}>
              <span className="font-bold text-red-600">{index + 1}. {post.title}</span>
              <p className="text-sm text-gray-700">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
