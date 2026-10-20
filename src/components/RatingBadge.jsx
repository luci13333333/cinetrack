import React from 'react';

export function RatingBadge({ rating }) {
  return (
    <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-yellow-400 flex items-center gap-1">
      <span>★</span>
      <span>{rating}</span>
    </div>
  );
}