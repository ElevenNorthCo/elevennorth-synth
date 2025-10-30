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
    <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-slate-200">
      <div
        ref={knobRef}
        className={`relative h-16 w-16 cursor-pointer select-none rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-100 dark:from-slate-700 dark:to-slate-800 dark:shadow-[inset_0_2px_8px_rgba(2,6,23,0.35)] ${
          isDragging
            ? 'scale-105 shadow-[inset_0_2px_12px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_14px_rgba(2,6,23,0.45)]'
            : 'hover:shadow-[inset_0_2px_10px_rgba(0,0,0,0.12)] dark:hover:shadow-[inset_0_2px_12px_rgba(2,6,23,0.4)]'
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Outer ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:from-slate-600 dark:to-slate-700 dark:shadow-[0_1px_3px_rgba(2,6,23,0.55)]">
          {/* Inner knob */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:from-slate-500 dark:to-slate-600 dark:shadow-[inset_0_1px_4px_rgba(2,6,23,0.6)]">
            {/* Indicator */}
            <div
              className="absolute w-full h-full"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-1 left-1/2 h-3 w-0.5 -translate-x-1/2 transform rounded-full bg-gradient-to-b from-blue-500 to-purple-600" />
            </div>
          </div>
        </div>

        {/* Value arc */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(59, 130, 246, 0.25)"
            strokeWidth="2"
            strokeDasharray={`${(value - min) / (max - min) * 175.929} 175.929`}
            strokeLinecap="round"
            className="transition-all duration-200"
          />
        </svg>
      </div>
      
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-200">
          {label}
        </div>
        <div className="text-xs font-mono text-gray-500 dark:text-slate-400">
          {value}{unit}
        </div>
      </div>
    </div>
  );
};

export default ControlKnob;