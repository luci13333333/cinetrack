import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop';

export function FavoritesPage({
  currentTheme,
  favorites = [],
  knownMovies = [],
  movieReviewsMap = {},
  onToggleFavorite,
  onOpenMovieModal,
}) {
  const navigate = useNavigate();

  const favoriteMovies = favorites.map((movieId) => {
    const fromKnown = knownMovies.find((m) => m.id === movieId);
    const savedRev = movieReviewsMap[movieId];
    const firstReviewWithPoster = savedRev?.reviews?.find((r) => r.movie_poster);

    return (
      fromKnown || {
        id: movieId,
        title: firstReviewWithPoster?.movie_title || `Фильм #${movieId}`,
        posterUrl: firstReviewWithPoster?.movie_poster || FALLBACK_POSTER,
        rating: savedRev?.rating || 0,
        year: '',
        overview: '',
        reviews: savedRev?.reviews || [],
      }
    );
  });

  if (favoriteMovies.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="text-2xl font-bold">Избранное</h1>
        <p className="opacity-70 text-sm">
          Пока нет избранных фильмов. Перейдите на главную или в поиск, чтобы выбрать фильмы.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Избранное ({favoriteMovies.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {favoriteMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
            onCardClick={() => {
              if (onOpenMovieModal) {
                onOpenMovieModal(movie);
              } else {
                navigate(`/movie/${movie.id}`);
              }
            }}
            theme={currentTheme}
          />
        ))}
      </div>
    </div>
  );
}