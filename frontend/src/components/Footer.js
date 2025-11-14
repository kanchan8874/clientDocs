const Footer = () => {
    return (
      <footer
        className="relative mt-auto w-full border-t border-primary-200/50 bg-gradient-to-br from-white via-primary-50/40 to-primary-100/50 backdrop-blur-sm shadow-[0_-1px_3px_rgba(59,130,246,0.08)]"
        role="contentinfo"
        aria-label="Site footer"
      >
        {/* Subtle top border with glow effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-300/60 to-transparent" />
        
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 lg:px-10 lg:py-4">
          <div className="flex flex-col items-center justify-center gap-1">
            {/* Reduced gap from gap-2 → gap-1 */}
            <p className="m-0 text-xs sm:text-sm font-medium leading-tight text-text-muted text-center">
              <span className="font-semibold text-text">© 2025 ClientDoc.</span>{' '}
              <span className="text-text-secondary">All rights reserved.</span>
            </p>
  
            <p className="m-0 text-xs sm:text-sm font-medium leading-tight text-text-muted text-center">
              <span className="text-text-secondary">Powered by</span>{' '}
              <span className="font-semibold text-primary-700">
                Mobiloitte Technologies India Pvt. Ltd.
              </span>
            </p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  

