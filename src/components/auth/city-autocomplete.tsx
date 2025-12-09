'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X, MapPin } from 'lucide-react';
import { fetchAutocompleteSuggestions, fetchPlaceDetails, generateSessionToken, type PlaceSuggestion } from '@/lib/places-api';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string, country: string, coordinates?: { lat: number; lng: number }) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export default function CityAutocomplete({
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = 'Search for a city...',
  label,
  required = false,
  className = '',
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>(generateSessionToken());
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
    
    // If user clears input, clear the selection
    if (!value) {
      onChange('', '', undefined);
      setSuggestions([]);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  }, [fetchSuggestions, onChange]);

  // Handle place selection
  const handlePlaceSelect = useCallback(async (suggestion: PlaceSuggestion) => {
    setInputValue(suggestion.displayName);
    setShowSuggestions(false);
    setIsFocused(false);
    setSuggestions([]);
    
    // Generate new session token for next search
    setSessionToken(generateSessionToken());

    // Use location from suggestion directly (backend proxy already provides it)
    if (suggestion.location) {
      // Extract country from display name (format: "City, State, Country")
      const parts = suggestion.displayName.split(',').map(s => s.trim());
      const country = parts.length > 1 ? parts[parts.length - 1] : '';
      
      // Extract city name (first part before comma)
      const cityName = parts[0];
      
      onChange(cityName, country, suggestion.location);
    } else {
      // Fallback: try to fetch place details if location is missing
      const placeDetails = await fetchPlaceDetails(suggestion.placeId, sessionToken);
      
      if (placeDetails && placeDetails.location) {
        // Extract country from address components
        let country = '';
        if (placeDetails.addressComponents) {
          for (const component of placeDetails.addressComponents) {
            if (component.types.includes('country')) {
              country = component.longText;
              break;
            }
          }
        }
        
        onChange(placeDetails.displayName, country, placeDetails.location);
      }
    }
  }, [sessionToken, onChange]);

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
    onChange('', '', undefined);
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="city-autocomplete">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          id="city-autocomplete"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
            if (inputValue.length >= 2) {
              fetchSuggestions(inputValue);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 200);
            onBlur?.();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required}
          className="pl-10 pr-10"
        />
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
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
      {isFocused && inputValue && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>Start typing to see city suggestions</span>
        </div>
      )}
    </div>
  );
}

