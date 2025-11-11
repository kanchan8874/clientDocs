import { FileText } from 'lucide-react';

/**
 * ClientDoc Logo Component
 * Premium, professional logo design
 */
const Logo = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: { icon: 24, text: 'text-lg', gap: 'gap-2.5', circle: 8 },
    md: { icon: 32, text: 'text-2xl', gap: 'gap-3.5', circle: 12 },
    lg: { icon: 40, text: 'text-3xl', gap: 'gap-4', circle: 16 }
  };

  const { icon, text, gap, circle } = sizeClasses[size];

  return (
    <div className={`flex items-center ${gap} cursor-pointer select-none transition-transform duration-300 hover:scale-105`}>
      <div className="relative flex items-center justify-center">
        {/* Background circle with enhanced gradient and shadow */}
        <div 
          className={`flex items-center justify-center rounded-full bg-gradient-to-br from-accent via-primary-500 to-primary-700 shadow-soft-glow transition-all duration-300 hover:shadow-surface-strong`}
          style={{
            width: `${icon + circle}px`,
            height: `${icon + circle}px`
          }}
        >
          <FileText size={icon} color="#ffffff" strokeWidth={2.5} className="drop-shadow-sm" />
        </div>
        {/* Enhanced accent dot with glow effect */}
        <div 
          className="absolute -bottom-1 -right-1 rounded-full border-[3px] border-white bg-info shadow-sm"
          style={{
            width: `${icon * 0.45}px`,
            height: `${icon * 0.45}px`
          }}
        />
      </div>
      {showText && (
        <span 
          className={`${text} font-bold tracking-tight bg-gradient-to-br from-neutral-900 to-neutral-600 bg-clip-text text-transparent transition-all duration-300`}
        >
          ClientDoc
        </span>
      )}
    </div>
  );
};

export default Logo;
