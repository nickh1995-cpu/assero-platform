"use client";

import { useEffect, useCallback } from 'react';

export function RealEstateFilters() {
  const handleFormSubmit = useCallback((form: HTMLFormElement) => {
    const formData = new FormData(form);
    const params = new URLSearchParams();
    
    // Add all form fields to URL params
    for (const [key, value] of formData.entries()) {
      if (value && value.toString().trim()) {
        params.set(key, value.toString());
      }
    }
    
    window.location.href = `?${params.toString()}`;
  }, []);

  useEffect(() => {
    // Toggle advanced filters
    const toggleButton = document.querySelector('[data-toggle="advanced-filters"]');
    const advancedFilters = document.getElementById('advanced-filters');
    
    if (toggleButton && advancedFilters) {
      toggleButton.addEventListener('click', () => {
        const isVisible = advancedFilters.style.display !== 'none';
        advancedFilters.style.display = isVisible ? 'none' : 'block';
        
        // Update button text
        const buttonText = toggleButton.querySelector('span');
        if (buttonText) {
          buttonText.textContent = isVisible ? 'Erweiterte Suche' : 'Filter schließen';
        }
      });
    }

    // Handle form submissions
    const searchForm = document.querySelector('.immo-search-form') as HTMLFormElement;
    const advancedForm = document.querySelector('.advanced-filter-form') as HTMLFormElement;

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(searchForm);
      });
    }

    if (advancedForm) {
      advancedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(advancedForm);
      });
    }

    // Reset filters function
    const resetButton = document.getElementById('reset-filters-btn');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        window.location.href = window.location.pathname;
      });
    }

    // Handle sort changes
    const sortSelect = document.querySelector('.sort-select-premium') as HTMLSelectElement;
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('sort', sortSelect.value);
        currentUrl.searchParams.set('page', '1');
        window.location.href = currentUrl.toString();
      });
    }

  }, []);

  return null;
}
