import React, { useState } from 'react';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export function AuthModal({ isOpen, onClose, onLogin, lang = 'ru' }) {
  if (!isOpen) return null;

  const isEn = lang === 'en';
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const endpoint = isRegister ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;
    const payload = isRegister ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Ответ сервера не является JSON:', text);
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            (isEn ? `Server error (status ${res.status})` : `Ошибка сервера (статус ${res.status})`)
        );
      }

      onLogin(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 text-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">
          {isRegister
            ? isEn
              ? 'Sign Up'
              : 'Регистрация'
            : isEn
            ? 'Sign In'
            : 'Вход'}
        </h2>

        {error && (
          <div className="bg-red-900/40 border border-red-500/50 text-red-300 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs text-gray-400">
                {isEn ? 'Name' : 'Имя'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">
              {isEn ? 'Password' : 'Пароль'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            {isRegister
              ? isEn
                ? 'Create Account'
                : 'Зарегистрироваться'
              : isEn
              ? 'Sign In'
              : 'Войти'}
          </button>
        </form>

        <p
          className="text-xs text-center text-gray-400 mt-4 cursor-pointer hover:underline"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? isEn
              ? 'Already have an account? Sign In'
              : 'Уже есть аккаунт? Войти'
            : isEn
            ? "Don't have an account? Sign Up"
            : 'Нет аккаунта? Зарегистрироваться'}
        </p>
      </div>
    </div>
  );
}