import React from 'react';
import { FileText } from 'lucide-react';

/**
 * ClientDoc Logo Component
 * Premium, professional logo design
 */
const Logo = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: { icon: 20, text: 'text-base', gap: 'gap-2' },
    md: { icon: 24, text: 'text-xl', gap: 'gap-3' },
    lg: { icon: 32, text: 'text-3xl', gap: 'gap-4' }
  };

  const { icon, text, gap } = sizeClasses[size];

  return (
    <div className={`flex items-center ${gap} cursor-pointer select-none`}>
      <div className="relative flex items-center justify-center">
        {/* Background circle with gradient */}
        <div 
          className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-green-600 shadow-lg`}
          style={{
            width: `${icon + 8}px`,
            height: `${icon + 8}px`
          }}
        >
          <FileText size={icon} color="#ffffff" strokeWidth={2.5} />
        </div>
        {/* Small accent dot */}
        <div 
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white shadow-sm bg-yellow-500"
          style={{
            width: `${icon * 0.4}px`,
            height: `${icon * 0.4}px`
          }}
        />
      </div>
      {showText && (
        <span 
          className={`${text} font-semibold tracking-tight bg-gradient-to-br from-primary to-green-600 bg-clip-text text-transparent`}
        >
          ClientDoc
        </span>
      )}
    </div>
  );
};

export default Logo;
