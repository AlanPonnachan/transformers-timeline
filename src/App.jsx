// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Filters from './components/Filters';
import Timeline from './components/Timeline';

function App() {
  const [allModels, setAllModels] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    modalities: [],
    startDate: '',
    endDate: ''
  });

  // 1. Fetch data on component mount
  useEffect(() => {
    fetch('/timeline-data.json')
      .then(response => response.json())
      .then(data => {
        // Sort models by date initially
        const sortedModels = data.models.sort((a, b) => 
          new Date(a.transformers_date) - new Date(b.transformers_date)
        );
        setAllModels(sortedModels);
      });
  }, []);

  // 2. Filter the models whenever 'allModels' or 'filters' change
  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      const modelDate = new Date(model.transformers_date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      const matchesSearch = model.display_name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesModality = filters.modalities.length === 0 || filters.modalities.includes(model.modality);
      const matchesDate = (!startDate || modelDate >= startDate) && (!endDate || modelDate <= endDate);
      
      return matchesSearch && matchesModality && matchesDate;
    });
  }, [allModels, filters]);

  return (
    <div className="App">
      <h1>Transformers Timeline</h1>
      <Filters onFilterChange={setFilters} />
      <p>Showing {filteredModels.length} of {allModels.length} models</p>
      <Timeline models={filteredModels} />
    </div>
  );
}

export default App;