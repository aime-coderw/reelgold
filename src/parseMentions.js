import React from 'react';
import { Link } from 'react-router-dom';

export function parseMentions(text) {
  const parts = text.split(/(@\w+)/g); // Split on @username patterns

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.slice(1); // remove '@'
      return (
        <Link
          key={index}
          to={`/@${username}`}
          className="text-blue-600 hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
