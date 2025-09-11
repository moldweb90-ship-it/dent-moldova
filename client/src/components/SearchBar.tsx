import { useDebounce } from '../hooks/use-debounce';
import { useState, useEffect } from 'react';
import { AnimatedSearchInput } from './AnimatedSearchInput';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <AnimatedSearchInput
      value={query}
      onChange={setQuery}
      className={className}
    />
  );
}
