import React, { useEffect, useState } from 'react';

interface ControlKnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: 'blue' | 'orange';
}

const ControlKnob: React.FC<ControlKnobProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  color = 'blue'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const percentage = ((value - min) / (max - min)) * 100;
  // Rotation from -135 to 135 degrees
  const rotation = (percentage / 100) * 270 - 135;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = startY - e.clientY;
      const range = max - min;
      const deltaValue = (deltaY / 200) * range; // 200px drag for full range

      let newValue = startValue + deltaValue;
      newValue = Math.max(min, Math.min(max, newValue));

      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startValue, min, max, onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  // LED dots generation
  const renderLeds = () => {
    const leds = [];
    const totalLeds = 11;
    const activeLeds = Math.round((percentage / 100) * (totalLeds - 1));

    for (let i = 0; i < totalLeds; i++) {
      const angle = (i / (totalLeds - 1)) * 270 - 135;
      const isActive = i <= activeLeds;
      const ledColor = color === 'blue'
        ? (isActive ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'bg-blue-900/30')
        : (isActive ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]' : 'bg-orange-900/30');

      leds.push(
        <div
          key={i}
          className={`absolute h-1.5 w-1.5 rounded-full ${ledColor}`}
          style={{
            transform: `rotate(${angle}deg) translateY(-38px)`,
            left: 'calc(50% - 3px)',
            top: 'calc(50% - 3px)',
          }}
        />
      );
    }
    return leds;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-24 w-24 items-center justify-center cursor-ns-resize"
        onMouseDown={handleMouseDown}
      >
        {/* LED Ring Container */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {renderLeds()}
        </div>

        {/* Knob Body */}
        <div
          className="relative h-16 w-16 rounded-full bg-[#1a1a1a] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-black"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Knob Top Gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#111] opacity-90"></div>

          {/* Indicator Line */}
          <div className={`absolute left-1/2 top-2 h-5 w-1 -translate-x-1/2 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.2)] ${color === 'blue' ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          {label}
        </div>
        <div className="text-[10px] font-medium text-gray-600">
          {Math.round(value)}%
        </div>
      </div>
    </div>
  );
};

export default ControlKnob;