import React, { useState, useEffect } from 'react';

const DraggableBox = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 40 }); // y starts 20px from the top

  useEffect(() => {
    // Set initial x position to align box in the top-right corner
    const initialX = window.innerWidth - 150; // Adjust 150 to your box's width if different
    setPosition({ x: initialX, y: 70 }); // Set y to 20px from the top
  }, []);

  const handleMouseDown = (e) => {
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e) => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default DraggableBox;
