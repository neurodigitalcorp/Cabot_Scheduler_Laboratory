import React, { useRef, useEffect } from 'react';

/**
 * TutorialVideo Component
 * 
 * Componente visual independiente para mostrar el video tutorial de Cabot Scheduler.
 * Posicionado de forma fija en la parte inferior derecha de la pantalla.
 */
const TutorialVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // URL del video en Supabase Storage
  const videoUrl = "https://cmdtlfzbwaaqosymlrbe.supabase.co/storage/v1/object/public/Media/Neuroloader_Cabot_Scheduler_Instructions.mp4";

  useEffect(() => {
    // Forzar reproducción si el navegador bloquea el autoPlay
    if (videoRef.current) {
      videoRef.current.muted = true; // Asegurar que esté en mute para permitir autoPlay
      videoRef.current.play().catch(error => {
        console.log("Auto-play fue bloqueado por el navegador:", error);
      });
    }
  }, []);

  return (
    <div 
      id="tutorial-video-container"
      className="fixed bottom-4 right-[410px] z-40 flex flex-col items-end gap-1 pointer-events-auto"
      style={{
        maxWidth: '155px',
        width: '100%',
      }}
    >
      {/* Etiqueta decorativa superior */}
      <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-1 rounded-t-lg border-x border-t border-white/10 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        TUTORIAL: CABOT SCHEDULER
      </div>

      {/* Contenedor del Video con Glassmorphism - Ajustado a Portrait (9:16) */}
      <div 
        className="relative w-full aspect-[9/16] overflow-hidden rounded-xl rounded-tr-none border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl"
        style={{
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          controls
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
        >
          <source src={videoUrl} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
        
        {/* Overlay sutil de brillo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default TutorialVideo;
