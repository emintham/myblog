import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, PencilLine } from 'lucide-react';
import '../../styles/context-toggle.css'; // Adjusted path

const STORAGE_KEY = 'dev-context';
const DEFAULT_CONTEXT = 'reader';

interface ContextToggleProps {
  adminPathPrefix: string;
}

const ContextToggle: React.FC<ContextToggleProps> = ({ adminPathPrefix }) => {
  const [currentContext, setCurrentContext] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAdminPage = currentPath.startsWith(adminPathPrefix);
      const storedContext = localStorage.getItem(STORAGE_KEY);
      if (isAdminPage) return 'author';
      return storedContext || DEFAULT_CONTEXT;
    }
    return DEFAULT_CONTEXT; // Fallback for environments without window
  });

  const applyContextToNavigation = useCallback(
    (context: string) => {
      if (typeof document === 'undefined') return;
      const navElement = document.querySelector('nav');
      if (!navElement) return;

      const navLinks = navElement.querySelectorAll('.nav-links li');
      navLinks.forEach((li) => {
        const link = li.querySelector('a');
        if (!link) return;

        const href = link.getAttribute('href');
        const isAdminLink = href?.startsWith(adminPathPrefix);

        const listItem = li as HTMLLIElement; // Type assertion
        if (context === 'author') {
          listItem.style.display = isAdminLink ? '' : 'none';
        } else {
          listItem.style.display = isAdminLink ? 'none' : '';
        }
      });
    },
    [adminPathPrefix]
  );

  const applyBodyAttribute = useCallback((context: string) => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-dev-context', context);
    }
  }, []);

  // Effect for initial setup and context application
  useEffect(() => {
    applyBodyAttribute(currentContext);
    applyContextToNavigation(currentContext);
  }, [currentContext, applyBodyAttribute, applyContextToNavigation]); // Added currentContext to dependencies

  // Effect for handling context changes (from state update or storage event)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, currentContext);
    }
    applyBodyAttribute(currentContext);
    applyContextToNavigation(currentContext);
  }, [currentContext, applyBodyAttribute, applyContextToNavigation]);

  // Effect for listening to storage events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue !== currentContext) {
        setCurrentContext(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentContext]); // Re-bind if currentContext changes to ensure comparison is fresh

  const handleToggleClick = () => {
    setCurrentContext((prevContext) =>
      prevContext === 'author' ? 'reader' : 'author'
    );
  };

  if (typeof window === 'undefined') {
    // Avoid rendering on server or during build if it causes issues
    return null; 
  }

  return (
    <div className="context-toggle-container">
      <button
        id="devContextToggle" // Kept for consistency, can be removed if not used elsewhere
        className="context-toggle-pill"
        type="button"
        aria-live="polite"
        data-context={currentContext}
        onClick={handleToggleClick}
        aria-label={
          currentContext === 'author'
            ? 'Switch to Reader Mode'
            : 'Switch to Author Mode'
        }
      >
        <span className="toggle-label toggle-reader">
          <BookOpen width="14" height="14" viewBox="0 0 24 24" />
          Reader
        </span>
        <span className="toggle-slider" />
        <span className="toggle-label toggle-author">
          <PencilLine width="14" height="14" viewBox="0 0 24 24" />
          Author
        </span>
      </button>
    </div>
  );
};

export default ContextToggle;