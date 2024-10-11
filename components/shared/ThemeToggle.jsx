import useLongPress from "@/hooks/useLongPress";
import { useTheme } from "@/provider/ThemeProvider";
import React from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export default function ThemeToggle() {
  const { isDark, toggleTheme, setBw } = useTheme();
  
  // Custom hook to detect long press
  const [onStart, onEnd] = useLongPress(() => {
    setBw();  // Activates black-and-white theme after 1 second long press
  }, 1000);

  return (
    <button
      onClick={toggleTheme} // Switch between light and dark themes on click
      onTouchStart={onStart}
      onTouchEnd={onEnd}
      onMouseDown={onStart}
      onMouseUp={onEnd}
      title="Toggle Theme (Alt + T)"
      className="text-md rounded-full p-2 opacity-60 transition duration-200 hover:bg-light-background-dark active:-rotate-45 dark:hover:bg-dark-background-dark"
    >
      {isDark ? <LuMoon /> : <LuSun />} {/* Show moon for dark mode, sun for light mode */}
    </button>
  );
}
