import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="text-center py-20 space-y-4">
      <p className="text-6xl font-extrabold text-blue-500">404</p>
      <h1 className="text-2xl font-bold">Страница не найдена</h1>
      <p className="text-gray-400 text-sm">
        Запрашиваемый адрес не существует или был перемещён.
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}