import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage({ t }) {
  return (
    <div className="text-center py-14 sm:py-20 px-4 space-y-4">
      <p className="text-5xl sm:text-6xl font-extrabold text-blue-500">404</p>
      <h1 className="text-xl sm:text-2xl font-bold">{t?.notFoundTitle || 'Страница не найдена'}</h1>
      <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
        {t?.notFoundDescription ||
          'Запрашиваемый адрес не существует или был перемещён.'}
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
      >
        {t?.backHome || 'Вернуться на главную'}
      </Link>
    </div>
  );
}