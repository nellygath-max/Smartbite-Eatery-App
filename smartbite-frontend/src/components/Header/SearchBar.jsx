import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState(
    () => new URLSearchParams(location.search).get('search') || ''
  );

  const submit = (event) => {
    event.preventDefault();
    const search = query.trim();
    navigate(search ? `/menu?search=${encodeURIComponent(search)}` : '/menu');
  };

  return (
    <form className="header__search" onSubmit={submit} role="search">
      <label className="sr-only" htmlFor="header-search">
        Search the menu
      </label>
      <input
        id="header-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search the menu"
        type="search"
      />
      <button type="submit" aria-label="Search the menu">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        </svg>
      </button>
    </form>
  );
}
