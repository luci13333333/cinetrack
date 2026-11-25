import React from 'react';

export function RatingBadge({ rating }) {
  return (
    <div className="bg-black/65 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold text-yellow-400 flex items-center gap-1 whitespace-nowrap">
      <span>★</span>
      <span>{rating}</span>
    </div>
  );
}