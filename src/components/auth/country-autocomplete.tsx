'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X, ChevronDown } from 'lucide-react';

// Comprehensive list of countries
const COUNTRIES = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Italy', code: 'IT' },
  { name: 'Spain', code: 'ES' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Austria', code: 'AT' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Norway', code: 'NO' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Finland', code: 'FI' },
  { name: 'Poland', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Greece', code: 'GR' },
  { name: 'Ireland', code: 'IE' },
  { name: 'India', code: 'IN' },
  { name: 'China', code: 'CN' },
  { name: 'Japan', code: 'JP' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Singapore', code: 'SG' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Thailand', code: 'TH' },
  { name: 'Indonesia', code: 'ID' },
  { name: 'Philippines', code: 'PH' },
  { name: 'Vietnam', code: 'VN' },
  { name: 'Pakistan', code: 'PK' },
  { name: 'Bangladesh', code: 'BD' },
  { name: 'Sri Lanka', code: 'LK' },
  { name: 'Nepal', code: 'NP' },
  { name: 'Afghanistan', code: 'AF' },
  { name: 'Iran', code: 'IR' },
  { name: 'Iraq', code: 'IQ' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'Israel', code: 'IL' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Egypt', code: 'EG' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Kenya', code: 'KE' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Argentina', code: 'AR' },
  { name: 'Mexico', code: 'MX' },
  { name: 'Chile', code: 'CL' },
  { name: 'Colombia', code: 'CO' },
  { name: 'Peru', code: 'PE' },
  { name: 'Venezuela', code: 'VE' },
  { name: 'Russia', code: 'RU' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'New Zealand', code: 'NZ' },
].sort((a, b) => a.name.localeCompare(b.name));

interface CountryAutocompleteProps {
  value: string;
  onChange: (country: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export default function CountryAutocomplete({
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = 'Select or search for a country...',
  label,
  required = false,
  className = '',
}: CountryAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredCountries = useMemo(() => {
    if (!inputValue) return COUNTRIES.slice(0, 20);
    return COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 20);
  }, [inputValue]);

  const handleSelect = (countryName: string) => {
    setInputValue(countryName);
    onChange(countryName);
    setShowSuggestions(false);
  };

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
    setShowSuggestions(false);
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    if (!e.target.value) {
      onChange('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="country-autocomplete">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          id="country-autocomplete"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
            onBlur?.();
          }}
          disabled={disabled}
          required={required}
          className="pl-10 pr-10"
        />
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!inputValue && (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        )}
        
        {/* Suggestions Dropdown */}
        {showSuggestions && filteredCountries.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country.name)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                {country.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

