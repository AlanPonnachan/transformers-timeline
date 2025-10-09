import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ options, selectedOptions, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionToggle = (option) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onChange(newSelectedOptions);
  };
  
  const getButtonText = () => {
    if (selectedOptions.length === 0) {
      return `All Modalities`;
    }
    if (selectedOptions.length === 1) {
      return selectedOptions[0];
    }
    return `${selectedOptions.length} Selected`;
  };

  return (
    <div className="multiselect-container" ref={dropdownRef}>
      <label>{label}</label>
      <button
        type="button"
        className="multiselect-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{getButtonText()}</span>
        <span className="multiselect-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="dropdown-list">
          {options.map((option) => (
            <div key={option} className="dropdown-item">
              <input
                type="checkbox"
                id={`checkbox-${option}`}
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionToggle(option)}
              />
              <label htmlFor={`checkbox-${option}`}>{option}</label>
            </div>
          ))}
           {options.length > 0 && (
             <div className="dropdown-actions">
                <button onClick={() => onChange([])}>Clear All</button>
                <button onClick={() => onChange(options)}>Select All</button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;