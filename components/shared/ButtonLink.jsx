import React, { useState, useEffect } from 'react';

const ButtonLink = ({ children, href, className, ...props }) => {
  const [isActive, setIsActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsActive(href === window.location.pathname);
  }, [href]);

  const handleClick = (e) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      window.location.href = href;
    }, 300); // Adjust this value to match your transition duration
  };

  const isRecruitmentPath = isActive && window.location.pathname === "/recruitments";

  const getLinkClassName = () => {
    if (isRecruitmentPath) {
      return "text-[#786CFF] bg-[#786CFF1e] hover:text-[#786CFF] dark:text-[#857aff] dark:bg-[#786CFF1e] dark:hover:text-[#857aff]";
    } else if (isActive) {
      return "bg-light-side text-light-accent dark:bg-dark-side dark:text-dark-accent";
    } else {
      return className || "hover:bg-light-side hover:text-light-accent hover:opacity-70 dark:hover:bg-dark-side dark:hover:text-dark-accent";
    }
  };

  return (
    <a
      href={href}
      tabIndex={0}
      onClick={handleClick}
      {...props}
      className={`
        font-semibold ${getLinkClassName()} 
        text-color flex flex-row-reverse items-center justify-between 
        rounded-xl px-4 py-2 text-lg transition duration-300 
        hover:scale-[0.98] ${isTransitioning ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {children}
    </a>
  );
};

export default ButtonLink;