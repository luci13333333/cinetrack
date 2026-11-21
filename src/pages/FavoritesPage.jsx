import React from 'react';
import { Link } from 'react-router-dom';

export function FavoritesPage() {
  return (
    <div className="text-center py-16 space-y-4">
      <h1 className="text-2xl font-bold">Избранное</h1>
      <p className="text-gray-400 text-sm">
        Скоро здесь будет избранное. Перейдите на главную, чтобы выбрать фильмы.
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        На главную
      </Link>
    </div>
  );
}