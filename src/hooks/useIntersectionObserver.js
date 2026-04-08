import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to observe an element's visibility within the viewport.
 * Re-implemented following the project's standard pattern for scroll-based animations.
 */
export const useIntersectionObserver = (options = { threshold: 0.1, triggerOnce: true }) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (options.triggerOnce && entry.isIntersecting) {
        setIntersecting(true);
        observer.unobserve(entry.target);
      } else {
        setIntersecting(entry.isIntersecting);
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.triggerOnce]);

  return [ref, isIntersecting];
};
