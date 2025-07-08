import React, { useState, useRef, useCallback } from 'react';

interface ControlKnobProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

const ControlKnob: React.FC<ControlKnobProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  unit = '%'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = (max - min) / 200;
      const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaY * sensitivity));
      onChange(Math.round(newValue / step) * step);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [value, min, max, step, onChange]);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={knobRef}
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] cursor-pointer select-none transition-all duration-100 ${
          isDragging ? 'scale-105 shadow-[inset_0_2px_12px_rgba(0,0,0,0.15)]' : 'hover:shadow-[inset_0_2px_10px_rgba(0,0,0,0.12)]'
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Outer ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          {/* Inner knob */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
            {/* Indicator */}
            <div
              className="absolute w-full h-full"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-1 left-1/2 w-0.5 h-3 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full transform -translate-x-1/2" />
            </div>
          </div>
        </div>
        
        {/* Value arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(59, 130, 246, 0.2)"
            strokeWidth="2"
            strokeDasharray={`${(value - min) / (max - min) * 175.929} 175.929`}
            strokeLinecap="round"
            className="transition-all duration-200"
          />
        </svg>
      </div>
      
      <div className="text-center">
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          {label}
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {value}{unit}
        </div>
      </div>
    </div>
  );
};

export default ControlKnob;