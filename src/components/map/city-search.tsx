'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { fetchAutocompleteSuggestions, fetchPlaceDetails, generateSessionToken, type PlaceSuggestion } from '@/lib/places-api';

interface CitySearchProps {
  onCitySelect?: (city: string, location: { lat: number; lng: number }) => void;
  className?: string;
}

export default function CitySearch({ onCitySelect, className }: CitySearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>(generateSessionToken());
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const results = await fetchAutocompleteSuggestions(query, sessionToken);
    setSuggestions(results);
  }, [sessionToken]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  }, [fetchSuggestions]);

  // Handle place selection
  const handlePlaceSelect = useCallback(async (suggestion: PlaceSuggestion) => {
    setInputValue(suggestion.displayName);
    setShowSuggestions(false);
    setIsFocused(false);
    setSuggestions([]);
    
    // Generate new session token for next search
    setSessionToken(generateSessionToken());

    // Fetch place details to get coordinates
    const placeDetails = await fetchPlaceDetails(suggestion.placeId, sessionToken);
    
    if (placeDetails && placeDetails.location) {
      onCitySelect?.(placeDetails.displayName, placeDetails.location);
    }
  }, [sessionToken, onCitySelect]);

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handlePlaceSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [suggestions, handlePlaceSelect]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Card className={`glass border-border/50 shadow-lg ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a city..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
            if (inputValue.length >= 2) {
              fetchSuggestions(inputValue);
            }
          }}
          onBlur={() => setTimeout(() => {
            setIsFocused(false);
            setShowSuggestions(false);
          }, 200)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 z-10"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.placeId || index}
                type="button"
                onClick={() => handlePlaceSelect(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <div className="font-medium">{suggestion.displayName}</div>
                {suggestion.formattedAddress && suggestion.formattedAddress !== suggestion.displayName && (
                  <div className="text-xs text-muted-foreground">{suggestion.formattedAddress}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}




