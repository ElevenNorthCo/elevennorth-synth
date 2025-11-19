import React from 'react';

interface DisplayProps {
  title: string;
  subtitle: string;
}

const Display: React.FC<DisplayProps> = ({ title, subtitle }) => {
  return (
    <div className="relative h-24 w-full overflow-hidden rounded bg-black p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,1)] border-b border-white/10">
      {/* Glass reflection effect */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
      
      {/* Inner Bezel */}
      <div className="h-full w-full rounded border border-gray-800 bg-[#110f0d] p-4 flex flex-col justify-center relative">
        {/* Orange Glow Border */}
        <div className="absolute inset-2 rounded border border-orange-500/30 shadow-[0_0_15px_rgba(255,140,0,0.2)]"></div>
        
        <div className="relative z-20 px-2">
          <h2 className="text-2xl font-bold text-orange-400 tracking-wide drop-shadow-[0_0_8px_rgba(255,165,0,0.6)]">
            {title}
          </h2>
          <div className="mt-1 h-px w-full bg-orange-900/50"></div>
          <p className="mt-1 text-sm font-medium text-orange-600/80 tracking-wider">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Display;
