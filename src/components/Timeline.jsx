import React, { useRef, useState, useEffect } from 'react';
import TimelineItem from './TimelineItem';
import { Filter } from 'lucide-react';

const ITEM_HEIGHT = 260; // Estimated height of a collapsed item
const BUFFER = 5; // Number of items to render outside the viewport

const Timeline = ({ models, expandedModel, onToggleExpand }) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      
      const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
      const end = Math.min(models.length, start + Math.ceil(clientHeight / ITEM_HEIGHT) + BUFFER * 2);
      
      if (start !== visibleRange.start || end !== visibleRange.end) {
        setVisibleRange({ start, end });
      }
    };
    
    // Initial calculation
    handleScroll();
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Recalculate on window resize
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [models.length]); // Rerun effect if the number of models changes

  // Reset scroll and visible range when filters change
  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = 0;
    }
    setVisibleRange({ start: 0, end: 20 });
  }, [models]);


  const totalHeight = models.length * ITEM_HEIGHT;
  const visibleModels = models.slice(visibleRange.start, visibleRange.end);
  const paddingTop = visibleRange.start * ITEM_HEIGHT;
  
  return (
    <div ref={containerRef} className="timeline-scroll">
      {models.length > 0 && <div className="timeline-line"></div>}
      <div className="timeline-content" style={{ height: `${totalHeight}px` }}>
        <div style={{ paddingTop: `${paddingTop}px` }}>
          {visibleModels.map((model, idx) => (
            <TimelineItem 
              key={model.model_name} 
              model={model} 
              index={visibleRange.start + idx}
              isExpanded={expandedModel === model.model_name}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      </div>
      {models.length === 0 && (
        <div className="empty-state">
          <Filter size={48} />
          <h3>No models found</h3>
          <p>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default Timeline;