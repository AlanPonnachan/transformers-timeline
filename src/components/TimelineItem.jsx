import React from 'react';
import { format, parseISO } from 'date-fns';

const TimelineItem = ({ model }) => {
  const formattedDate = format(parseISO(model.transformers_date), 'MMM d, yyyy');

  return (
    <div className="timeline-item">
      <div 
        className="timeline-item-content" 
        style={{'--modality-color': model.modality_color}}
      >
        <div className="item-header">
          <h3 className="item-title">{model.display_name}</h3>
          <time className="item-date">{formattedDate}</time>
        </div>
        <span className="item-modality">{model.modality_name}</span>
        <p className="item-description">
          {model.description.substring(0, 200)}...
        </p>
        <div className="timeline-dot"></div>
      </div>
    </div>
  );
};

// Use React.memo for performance optimization
export default React.memo(TimelineItem);