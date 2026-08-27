import React, { useState } from 'react';
import liceoLogoImg from '../assets/images/liceo_dannunzio_logo_1787761826556.jpg';

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
  const [imgError, setImgError] = useState(false);

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
        className={`relative ${sizeMap[size]} rounded-xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center p-0.5 overflow-hidden shrink-0 group`}
        title="Liceo Classico Statale Gabriele d'Annunzio - Pescara"
      >
        {!imgError ? (
          <img
            src={liceoLogoImg}
            alt="Logo Liceo Classico Gabriele d'Annunzio Pescara"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Crisp Official Emblem Vector Graphic Fallback */
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full p-1"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Shield/Circle */}
            <circle cx="50" cy="50" r="46" fill="#1D3557" />
            <circle cx="50" cy="50" r="41" stroke="#E63946" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="37" stroke="#F1FAEE" strokeWidth="1" strokeDasharray="2 2" />

            {/* Classical Ionic Column */}
            <path d="M25 35 C28 30, 42 30, 45 35 L45 74 L25 74 Z" fill="#F1FAEE" />
            <line x1="30" y1="38" x2="30" y2="70" stroke="#1D3557" strokeWidth="1.5" />
            <line x1="35" y1="38" x2="35" y2="70" stroke="#1D3557" strokeWidth="1.5" />
            <line x1="40" y1="38" x2="40" y2="70" stroke="#1D3557" strokeWidth="1.5" />
            <circle cx="27" cy="35" r="3.5" fill="#FFB703" />
            <circle cx="43" cy="35" r="3.5" fill="#FFB703" />

            {/* Monogram GD / LC */}
            <text x="50" y="58" fontFamily="Georgia, serif" fontSize="24" fontWeight="bold" fill="#FFB703">LC</text>
            <text x="50" y="74" fontFamily="Georgia, serif" fontSize="12" fontWeight="bold" fill="#F1FAEE">PESCARA</text>
            
            {/* Golden Star Accent */}
            <polygon points="50,16 52,22 58,22 53,26 55,32 50,28 45,32 47,26 42,22 48,22" fill="#FFB703" />
          </svg>
        )}
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
