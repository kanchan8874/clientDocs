const SkipToContent = () => {

  const handleClick = (e) => {
    e.preventDefault();
    
    // Try to focus main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If on login/register page, navigate to dashboard after login
      // For now, just focus the first focusable element
      const firstFocusable = document.querySelector('input, button, a, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="skip-to-content"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;