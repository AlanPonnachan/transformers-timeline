import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Moon, Sun, X } from 'lucide-react';
import Timeline from './components/Timeline';
import MultiSelectDropdown from './components/MultiSelectDropdown';
import { debounce } from './utils';

const parseISO = (dateString) => new Date(dateString);

function App() {
  const [allModels, setAllModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [uniqueModalities, setUniqueModalities] = useState([]);
  const [selectedModalities, setSelectedModalities] = useState([]);

  // UI State
  const [expandedModel, setExpandedModel] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const debouncedSetSearch = useCallback(debounce((value) => {
    setSearchQuery(value);
  }, 300), []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('./timeline-data.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        const sorted = data.models.sort((a, b) => new Date(b.transformers_date) - new Date(a.transformers_date));
        setAllModels(sorted);
        
        const modalities = [...new Set(sorted.map(m => m.modality_name))].sort();
        setUniqueModalities(modalities);
        setSelectedModalities(modalities);
        
        if (sorted.length > 0) {
          setStartDate(sorted[sorted.length - 1].transformers_date);
          setEndDate(sorted[0].transformers_date);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModels();
  }, []);

  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      const modelDate = parseISO(model.transformers_date);
      const start = startDate ? parseISO(startDate) : null;
      const end = endDate ? parseISO(endDate) : null;

      if (start && modelDate < start) return false;
      if (end && modelDate > end) return false;
      if (selectedModalities.length > 0 && !selectedModalities.includes(model.modality_name)) return false;
      if (searchQuery && !model.display_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      return true;
    });
  }, [allModels, startDate, endDate, selectedModalities, searchQuery]);
  
  const handleToggleExpand = (modelName) => {
    setExpandedModel(prev => (prev === modelName ? null : modelName));
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🤗 Transformers Timeline</h1>
          <button 
            className="theme-toggle" 
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search models by name..."
            onChange={(e) => debouncedSetSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => {
              setSearchQuery('');
              document.querySelector('.search-box input').value = '';
            }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="date-filters">
          <div className="date-input">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <MultiSelectDropdown
          label="Modality"
          options={uniqueModalities}
          selectedOptions={selectedModalities}
          onChange={setSelectedModalities}
        />

        <div className="results-count">
          <span className="count">{filteredModels.length}</span>
          <span className="label">/ {allModels.length} models</span>
        </div>
      </div>

      <Timeline 
        models={filteredModels} 
        expandedModel={expandedModel}
        onToggleExpand={handleToggleExpand}
      />
    </div>
  );
}

export default App;