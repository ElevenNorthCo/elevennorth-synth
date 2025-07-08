import React from 'react';

interface PianoKeyProps {
  note: string;
  keyboardKey: string;
  isActive: boolean;
  type: 'white' | 'black';
  style?: React.CSSProperties;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  note,
  keyboardKey,
  isActive,
  type,
  style,
  onMouseDown,
  onMouseUp,
  onMouseLeave
}) => {
  const baseClasses = "relative cursor-pointer select-none transition-all duration-100 ease-out";
  
  const whiteKeyClasses = `
    ${baseClasses}
    w-12 h-32 md:w-16 md:h-40 lg:w-20 lg:h-48
    bg-gradient-to-b from-white via-gray-50 to-gray-100
    border border-gray-200 rounded-b-xl
    shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]
    flex flex-col items-center justify-end
    pb-4 md:pb-6
    backdrop-blur-sm
    ${isActive 
      ? 'bg-gradient-to-b from-blue-100 via-blue-50 to-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.4)] transform scale-[0.98] border-blue-200' 
      : 'hover:bg-gradient-to-b hover:from-gray-50 hover:to-gray-50 hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]'
    }
  `;
  
  const blackKeyClasses = `
    ${baseClasses}
    w-8 h-20 md:w-10 md:h-24 lg:w-12 lg:h-30
    bg-gradient-to-b from-gray-800 via-gray-900 to-black
    border border-gray-700 rounded-b-xl
    shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)]
    flex flex-col items-center justify-end
    pb-2 md:pb-3
    z-10
    backdrop-blur-sm
    ${isActive 
      ? 'bg-gradient-to-b from-purple-700 via-purple-800 to-purple-900 shadow-[0_0_25px_rgba(147,51,234,0.5)] transform scale-[0.98] border-purple-600' 
      : 'hover:bg-gradient-to-b hover:from-gray-700 hover:to-gray-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]'
    }
  `;

  return (
    <div
      className={type === 'white' ? whiteKeyClasses : blackKeyClasses}
      style={style}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
    >
      <div className={`text-xs md:text-sm font-bold tracking-wide ${
        type === 'white' 
          ? (isActive ? 'text-blue-700' : 'text-gray-700') 
          : (isActive ? 'text-purple-200' : 'text-gray-200')
      }`}>
        {note}
      </div>
      <div className={`text-xs font-mono font-medium ${
        type === 'white' 
          ? (isActive ? 'text-blue-600' : 'text-gray-500') 
          : (isActive ? 'text-purple-300' : 'text-gray-300')
      }`}>
        {keyboardKey}
      </div>
      
      {/* Active state overlay */}
      {isActive && (
        <div className={`absolute inset-0 rounded-b-xl ${
          type === 'white' 
            ? 'bg-gradient-to-b from-blue-200/30 to-blue-300/20' 
            : 'bg-gradient-to-b from-purple-400/20 to-purple-500/30'
        }`} />
      )}
    </div>
  );
};

export default PianoKey;