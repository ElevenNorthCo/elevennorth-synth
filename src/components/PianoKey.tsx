import React from 'react';

interface PianoKeyProps {
  note: string;
  keyboardKey: string;
  isActive: boolean;
  type: 'white' | 'black';
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  style?: React.CSSProperties;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  note,
  keyboardKey,
  isActive,
  type,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  style,
}) => {
  const isWhite = type === 'white';

  const baseClasses = "relative flex flex-col justify-end items-center select-none transition-all duration-75 ease-out";

  const whiteKeyClasses = `
    h-48 w-14 rounded-b-sm z-10
    ${isActive
      ? 'bg-gray-200 shadow-[inset_0_5px_10px_rgba(0,0,0,0.2)] translate-y-[2px]'
      : 'bg-[#fdfdfd] shadow-[inset_0_-5px_10px_rgba(0,0,0,0.1),0_2px_5px_rgba(0,0,0,0.3)] hover:bg-white'}
  `;

  const blackKeyClasses = `
    h-32 w-10 rounded-b-sm z-20
    ${isActive
      ? 'bg-gray-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] translate-y-[2px]'
      : 'bg-gradient-to-b from-gray-800 to-black shadow-[2px_5px_5px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)]'}
  `;

  return (
    <div
      className={`${baseClasses} ${isWhite ? whiteKeyClasses : blackKeyClasses}`}
      style={style}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={(e) => {
        e.preventDefault(); // Prevent scrolling
        onMouseDown();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onMouseUp();
      }}
    >
      <div className={`mb-4 flex flex-col items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
        <span className={`text-sm font-bold ${isWhite ? 'text-gray-800' : 'text-gray-200'}`}>
          {note}
        </span>
        <span className={`text-[10px] font-medium ${isWhite ? 'text-gray-500' : 'text-gray-500'}`}>
          {keyboardKey}
        </span>
      </div>
    </div>
  );
};

export default PianoKey;