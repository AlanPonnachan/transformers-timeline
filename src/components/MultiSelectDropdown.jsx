import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Check } from 'lucide-react';

const MultiSelectDropdown = ({ options, selectedOptions, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionToggle = (option) => {
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    onChange(newSelected);
  };

  const getButtonText = () => {
    if (selectedOptions.length === 0) return 'None';
    if (selectedOptions.length === 1) return selectedOptions[0];
    if (selectedOptions.length === options.length) return 'All Modalities';
    return `${selectedOptions.length} selected`;
  };

  return (
    <div className="multiselect-wrapper" ref={dropdownRef}>
      <label className="filter-label">{label}</label>
      <button
        type="button"
        className="multiselect-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={16} />
        <span>{getButtonText()}</span>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="dropdown-panel">
          <div className="dropdown-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search modalities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="dropdown-options">
            {filteredOptions.map((option) => (
              <label key={option} className="dropdown-option">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleOptionToggle(option)}
                />
                <span className="checkbox-custom">
                  {selectedOptions.includes(option) && <Check size={12} />}
                </span>
                <span className="option-label">{option}</span>
              </label>
            ))}
          </div>

          <div className="dropdown-footer">
            <button onClick={() => onChange([])}>Clear All</button>
            <button onClick={() => onChange(options)}>Select All</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;