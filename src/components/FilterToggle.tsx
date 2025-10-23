"use client";

import { useEffect } from "react";

export function FilterToggle() {
  useEffect(() => {
    // Add filter toggle functionality
    const toggleButtons = document.querySelectorAll('.filter-toggle[data-toggle="advanced-filters"]');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const advancedFilters = document.querySelector('.advanced-filters');
        if (advancedFilters) {
          advancedFilters.classList.toggle('open');
          button.textContent = advancedFilters.classList.contains('open') 
            ? 'Weniger Filter' 
            : 'Mehr Filter';
        }
      });
    });

    return () => {
      toggleButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
    };
  }, []);

  return null; // This component only adds behavior
}
