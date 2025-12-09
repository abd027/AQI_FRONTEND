'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Bell, MessageSquare } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useAuth } from '@/contexts/auth-context';
import { fetchAutocompleteSuggestions, fetchPlaceDetails, generateSessionToken, type PlaceSuggestion } from '@/lib/places-api';

interface DashboardHeaderProps {
  onCitySearch?: (city: string, location: { lat: number, lng: number }) => void;
  onToggleAssistant?: () => void;
}

export default function DashboardHeader({ onCitySearch, onToggleAssistant }: DashboardHeaderProps) {
  const { user } = useAuth();
  const userCity = user?.city;
  const [inputValue, setInputValue] = useState('');
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
    setSuggestions([]);

    // Generate new session token for next search
    setSessionToken(generateSessionToken());

    // Use location from suggestion directly if available
    if (suggestion.location) {
      if (onCitySearch) {
        onCitySearch(suggestion.displayName, suggestion.location);
      }
      // If onCitySearch is not provided, silently ignore (some pages don't need city search)
    } else if (suggestion.placeId && onCitySearch) {
      // Fallback: try to fetch place details if location is missing
      try {
        const placeDetails = await fetchPlaceDetails(suggestion.placeId, sessionToken);
        if (placeDetails && placeDetails.location) {
          onCitySearch(placeDetails.displayName || suggestion.displayName, placeDetails.location);
        } else {
          console.warn("Could not fetch location data for selected place", suggestion);
        }
      } catch (error) {
        console.error("Error fetching place details:", error);
      }
    } else if (!onCitySearch) {
      // If onCitySearch is not provided, silently ignore (some pages don't need city search)
      // No error needed
    } else {
      // Only log error if location is missing and we need it
      console.warn("No location data in suggestion and could not fetch place details", suggestion);
    }
  }, [sessionToken, onCitySearch]);

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

  const handleSearch = () => {
    if (inputValue && inputRef.current) {
      inputRef.current.focus();
      setShowSuggestions(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 lg:px-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Welcome back,
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Here's the latest on air quality.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64 flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setShowSuggestions(true);
                if (inputValue.length >= 2) {
                  fetchSuggestions(inputValue);
                }
              }}
              placeholder={userCity ? `Search for a city... (Your city: ${userCity})` : "Search for a city..."}
              className="pl-10 h-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
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
          <ThemeSwitcher />
          {onToggleAssistant && (
            <Button
              variant="default"
              size="icon"
              onClick={onToggleAssistant}
              className="h-10 w-10 transition-all hover:bg-accent/50"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Toggle AI Assistant</span>
            </Button>
          )}
          <Avatar className="h-10 w-10 border-2 border-border transition-all hover:border-primary/50 cursor-pointer">
            <AvatarImage src={PlaceHolderImages[0].imageUrl} alt="User avatar" data-ai-hint="person face" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
