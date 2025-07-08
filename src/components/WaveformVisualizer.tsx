import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  audioLevel: number;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ audioLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bars = 64;
    const barWidth = canvas.width / (bars * window.devicePixelRatio);
    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerY = canvas.height / (2 * window.devicePixelRatio);
      
      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const frequency = (i / bars) * 8; // Different frequencies for each bar
        const amplitude = Math.sin(phase + frequency) * audioLevel * 50;
        const height = Math.abs(amplitude) + 2;
        
        // Create GarageBand-style gradient
        const gradient = ctx.createLinearGradient(0, centerY - height/2, 0, centerY + height/2);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${audioLevel * 0.8})`); // blue
        gradient.addColorStop(0.3, `rgba(99, 102, 241, ${audioLevel * 0.9})`); // indigo
        gradient.addColorStop(0.7, `rgba(139, 92, 246, ${audioLevel * 0.9})`); // violet
        gradient.addColorStop(1, `rgba(168, 85, 247, ${audioLevel * 0.8})`); // purple
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - height/2, barWidth - 2, height);
        
        // Add subtle glow effect
        if (audioLevel > 0) {
          ctx.shadowColor = amplitude > 0 ? '#3b82f6' : '#8b5cf6';
          ctx.shadowBlur = 8;
          ctx.fillRect(x, centerY - height/2, barWidth - 2, height);
          ctx.shadowBlur = 0;
        }
      }
      
      phase += 0.1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel]);

  return (
    <div className="w-full h-32 bg-white/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default WaveformVisualizer;