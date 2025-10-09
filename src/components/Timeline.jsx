import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import TimelineItem from './TimelineItem';

const Timeline = ({ models }) => {
  const parentRef = useRef(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: models.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // Estimate of item height in pixels
    overscan: 5, // Render 5 items above and below the visible area
  });

  return (
    <div ref={parentRef} className="timeline-container">
      {models.length > 0 && <div className="timeline-axis"></div>}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const model = models[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TimelineItem model={model} />
            </div>
          );
        })}
      </div>
       {models.length === 0 && <p style={{textAlign: 'center'}}>No models match the current filters.</p>}
    </div>
  );
};

export default Timeline;  