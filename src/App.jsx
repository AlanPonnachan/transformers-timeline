import React, { useState, useEffect, useMemo } from 'react';
import { parseISO } from 'date-fns';
import Timeline from './components/Timeline';
import MultiSelectDropdown from './components/MultiSelectDropdown';

function App() {
  const [allModels, setAllModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [uniqueModalities, setUniqueModalities] = useState([]);
  const [selectedModalities, setSelectedModalities] = useState([]);

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
        const response = await fetch('./timeline-data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        const sortedModels = data.models.sort((a, b) => 
          new Date(a.transformers_date) - new Date(b.transformers_date)
        );

        setAllModels(sortedModels);

        // Extract unique modalities for the dropdown
        const modalities = [...new Set(sortedModels.map(model => model.modality_name))];
        setUniqueModalities(modalities.sort());
        setSelectedModalities(modalities.sort()); // Initially, select all modalities

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

  const filteredModels = useMemo(() => {
    if (!allModels.length) return [];
    
    return allModels.filter(model => {
      const modelDate = parseISO(model.transformers_date);
      const start = startDate ? parseISO(startDate) : null;
      const end = endDate ? parseISO(endDate) : null;

      if (start && modelDate < start) return false;
      if (end && modelDate > end) return false;
      
      // Updated filtering logic for multiple selections
      if (selectedModalities.length > 0 && !selectedModalities.includes(model.modality_name)) {
        return false;
      }
      
      return true;
    });
  }, [allModels, startDate, endDate, selectedModalities]);

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading model data...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem' }}>Error: {error}</div>;
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

        <MultiSelectDropdown 
          label="Filter by Modality"
          options={uniqueModalities}
          selectedOptions={selectedModalities}
          onChange={setSelectedModalities}
        />

        
        <div className="status">
          <p>Showing {filteredModels.length} of {allModels.length} models</p>
        </div>
      </div>
      
      <Timeline models={filteredModels} />
    </div>
  );
}

export default App;