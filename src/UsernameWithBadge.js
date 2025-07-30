// UsernameWithBadge.js
import React from 'react';

const UsernameWithBadge = ({ user_name, verification_badge }) => {
  console.log('badge:', verification_badge);

  return (
    <div className="flex items-center space-x-1">
      <span className="font-semibold">@{user_name}</span>
      {verification_badge && (
        <img
          src={`/badge/${verification_badge}`}
          alt="badge"
          className="w-4 h-4 rounded-full border border-yellow shadow"
          title={verification_badge.replace('.png', '')}
        />
      )}
    </div>
  );
};

export default UsernameWithBadge;
