import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import Timeline from './components/Timeline';
import { debounce } from './utils';

function App() {
  const [allModels, setAllModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // The path is relative to the `public` folder
        const response = await fetch('./timeline-data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // Sort data by date upon fetching
        const sortedModels = data.models.sort((a, b) => 
          new Date(a.transformers_date) - new Date(b.transformers_date)
        );

        setAllModels(sortedModels);

        // Set initial date range from the full dataset
        if (sortedModels.length > 0) {
          setStartDate(sortedModels[0].transformers_date);
          setEndDate(sortedModels[sortedModels.length - 1].transformers_date);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  const debouncedSetModalityFilter = useCallback(debounce((value) => {
    setModalityFilter(value);
  }, 300), []);


  const filteredModels = useMemo(() => {
    if (!allModels.length) return [];
    
    return allModels.filter(model => {
      const modelDate = parseISO(model.transformers_date);
      const start = startDate ? parseISO(startDate) : null;
      const end = endDate ? parseISO(endDate) : null;

      if (start && modelDate < start) return false;
      if (end && modelDate > end) return false;

      if (modalityFilter && !model.modality.toLowerCase().includes(modalityFilter.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [allModels, startDate, endDate, modalityFilter]);

  if (isLoading) {
    return <div>Loading model data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🤗 Transformers Model Timeline</h1>
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="start-date">Start Date</label>
          <input 
            type="date" 
            id="start-date" 
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="end-date">End Date</label>
          <input 
            type="date" 
            id="end-date" 
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="modality-filter">Filter by Modality</label>
          <input 
            type="text" 
            id="modality-filter"
            placeholder="e.g., text, vision"
            onChange={e => debouncedSetModalityFilter(e.target.value)}
          />
        </div>
        <div className="status">
          <p>Showing {filteredModels.length} of {allModels.length} models</p>
        </div>
      </div>
      
      <Timeline models={filteredModels} />
    </div>
  );
}

export default App;