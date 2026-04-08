import React from 'react';
import './DynamicBackground.css';

const DynamicBackground = () => {
  return (
    <div className="dynamic-bg-container" aria-hidden="true">
      <div className="ball ball-1"></div>
      <div className="ball ball-2"></div>
      <div className="ball ball-3"></div>
      <div className="ball ball-4"></div>
    </div>
  );
};

export default DynamicBackground;
