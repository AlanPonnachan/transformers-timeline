import React from 'react';
import { Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TimelineItem = React.memo(({ model, index, isExpanded, onToggleExpand }) => {
  const isLeft = index % 2 === 0;

  return (
    <div className={`timeline-item ${isLeft ? 'left' : 'right'}`}>
      <div
        className={`timeline-card ${isExpanded ? 'expanded' : ''}`}
        style={{ '--accent-color': model.modality_color || '#3b82f6' }}
        onClick={() => onToggleExpand(model.model_name)}
      >
        <div className="card-header">
          <h3 className="card-title">{model.display_name}</h3>
          <time className="card-date">
            <Calendar size={14} />
            {formatDate(model.transformers_date)}
          </time>
        </div>

        <span className="modality-badge">{model.modality_name}</span>

        {/* --- Replace the <p> tag with the ReactMarkdown component --- */}
        <div className="card-description">
          <ReactMarkdown>
            {model.description}
          </ReactMarkdown>
        </div>
        {/* --- End of replacement --- */}
        
        {isExpanded && model.tasks && model.tasks.length > 0 && (
          <div className="card-tasks">
            <strong>Tasks:</strong>
            <div className="task-list">
              {model.tasks.map(task => (
                <span key={task} className="task-badge">{task}</span>
              ))}
            </div>
          </div>
        )}

        <div className="timeline-marker"></div>
      </div>
    </div>
  );
});

export default TimelineItem;