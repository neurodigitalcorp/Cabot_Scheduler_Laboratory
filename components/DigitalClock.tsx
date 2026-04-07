import React, { useState, useEffect } from 'react';

/**
 * DigitalClock Component
 * 
 * Un componente visual independiente que muestra la hora de Colombia (GMT-5)
 * con un estilo moderno de glassmorphism y textos decorativos.
 */
const DigitalClock: React.FC = () => {
  const [timeParts, setTimeParts] = useState({ hh: '00', mm: '00', ss: '00' });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      const formatter = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const hh = parts.find(p => p.type === 'hour')?.value || '00';
      const mm = parts.find(p => p.type === 'minute')?.value || '00';
      const ss = parts.find(p => p.type === 'second')?.value || '00';

      setTimeParts({ hh, mm, ss });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      id="digital-clock-container"
      className="flex flex-col items-start gap-2 select-none pointer-events-none"
 
style={{
  fontFamily: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",

  position: 'fixed',

  left: '40px',     // ✅ controla la distancia al borde izquierdo
  bottom: '24px',   // ✅ controla qué tan abajo queda

  zIndex: 50,
  pointerEvents: 'none',
}}
    >
      {/* Reloj Digital con Glassmorphism (Ahora arriba) */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1a1c23]/80 backdrop-blur-md px-10 py-6 shadow-2xl"
        style={{
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          minWidth: '320px',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* HOURS */}
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-[#2dd4bf] drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]">
              {timeParts.hh}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-2 tracking-[0.2em] uppercase">Hours</span>
          </div>

          {/* Separator */}
          <span className="text-3xl font-bold text-[#f97316] mb-6">:</span>

          {/* MINUTES */}
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-[#2dd4bf] drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]">
              {timeParts.mm}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-2 tracking-[0.2em] uppercase">Minutes</span>
          </div>

          {/* Separator */}
          <span className="text-3xl font-bold text-[#f97316] mb-6">:</span>

          {/* SECONDS */}
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-[#2dd4bf] drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]">
              {timeParts.ss}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-2 tracking-[0.2em] uppercase">Seconds</span>
          </div>
        </div>
      </div>

      {/* Texto Intermedio */}
      <span 
        className="text-orange-500 italic text-sm tracking-wide ml-1"
        style={{ color: '#f97316' }}
      >
        a neuroDigitalverse App´s.
      </span>

      {/* Texto Inferior */}
      <span 
        className="text-orange-500 italic text-xs mt-0.5 opacity-90 ml-1"
        style={{ color: '#f97316' }}
      >
        Decoding Tomorrow Through neuroDigitalverse.
      </span>
    </div>
  );
};

export default DigitalClock;
