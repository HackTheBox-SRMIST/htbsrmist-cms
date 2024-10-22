import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`w-full px-2 mb-6 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search 
            className="text-gray-400 dark:text-gray-400" 
            size={18}
          />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full
            py-3
            pl-10
            pr-4
            text-gray-900
            dark:text-gray-100
            placeholder-gray-500
            bg-white/5
            dark:bg-gray-800/50
            border-2
            border-transparent
            rounded-lg
            outline-none
            transition-all
            duration-300
            shadow-[0_0_8px_rgba(0,0,0,0.1)]
            dark:shadow-[0_0_12px_rgba(159,239,0,0.3)]
            hover:shadow-[0_0_12px_rgba(0,0,0,0.15)]
            dark:hover:shadow-[0_0_16px_rgba(159,239,0,0.4)]
            ${
              isFocused 
                ? 'shadow-[0_0_16px_rgba(0,0,0,0.3)] dark:shadow-[0_0_16px_rgba(159,239,0,0.4)] border-gray-200 dark:border-[rgba(159,239,0,0.3)]'
                : ''
            }
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  );
};

export default SearchBar;