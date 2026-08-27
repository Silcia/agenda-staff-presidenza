import React from 'react';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'header';
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'header',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Visual Logo Emblem */}
      <div 
        className={`relative ${sizeMap[size]} rounded-xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center p-1 overflow-hidden flex-shrink-0 group`}
        title="Liceo Classico Statale Gabriele d'Annunzio - Pescara"
      >
        <img
          src="/src/assets/images/liceo_dannunzio_logo_1787761826556.jpg"
          alt="Logo Liceo Classico Gabriele d'Annunzio Pescara"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to SVG if image file is not rendered
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Crisp Vector Graphic Overlay / Fallback */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full absolute inset-0 p-0.5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Classical Column on left */}
          <path d="M12 24 C16 18, 32 18, 36 24 L36 82 L12 82 Z" fill="#1D3557" />
          <path d="M16 28 L16 78 M24 28 L24 78 M32 28 L32 78" stroke="#F1FAEE" strokeWidth="2" strokeLinecap="round" />
          {/* Capital Volute */}
          <circle cx="15" cy="24" r="5" fill="#1D3557" />
          <circle cx="33" cy="24" r="5" fill="#1D3557" />
          
          {/* Monogram LC */}
          <text x="36" y="68" fontFamily="Georgia, serif" fontSize="48" fontWeight="bold" fill="#121212">L</text>
          <text x="50" y="70" fontFamily="Georgia, serif" fontSize="52" fontWeight="900" fill="#121212">C</text>
          
          {/* Golden Stars */}
          <polygon points="86,34 88,40 94,40 89,44 91,50 86,46 81,50 83,44 78,40 84,40" fill="#FFB703" />
          <polygon points="90,52 91,56 95,56 92,59 93,63 90,60 87,63 88,59 85,56 89,56" fill="#FFB703" />
          <polygon points="86,68 87,71 90,71 88,73 89,76 86,74 83,76 84,73 82,71 85,71" fill="#FFB703" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E63946] bg-[#E63946]/10 px-2 py-0.5 rounded border border-[#E63946]/30">
              Staff di Presidenza
            </span>
          </div>
          
          <h1 className={`text-base sm:text-lg font-black tracking-tight uppercase mt-0.5 leading-tight ${
            variant === 'header' || variant === 'dark' ? 'text-white' : 'text-[#121212]'
          }`}>
            Liceo Classico Statale <span className={variant === 'header' || variant === 'dark' ? 'text-slate-100 font-black' : 'text-[#E63946] font-black'}>"Gabriele d'Annunzio"</span>
          </h1>

          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-0.5 w-14 bg-[#E63946] rounded-full" />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${
              variant === 'header' || variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Pescara • Agenda & Disponibilità Staff
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
