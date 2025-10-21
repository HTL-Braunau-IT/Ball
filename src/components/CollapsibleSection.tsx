"use client";

import { useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true,
  className = ""
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`collapsible-section ${className}`}>
      <div 
        className="collapsible-header"
        onClick={toggleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        }}
        aria-expanded={isOpen}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <h3 className="collapsible-title">{title}</h3>
        <svg
          className={`collapsible-icon ${isOpen ? 'open' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <div
        id={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`collapsible-content ${isOpen ? 'open' : ''}`}
      >
        <div className="collapsible-body">
          {children}
        </div>
      </div>
    </div>
  );
}
