import { useEffect, useMemo, useRef, useState } from 'react';

const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function useInView(options = {}) {
  const { once = true, rootMargin = '0px 0px -10% 0px', threshold = 0.15, root = null, initialInView = false, disabled = false } = options;

  const ref = useRef(null);
  const prefersReducedMotion = useMemo(getPrefersReducedMotion, []);

  const [inView, setInView] = useState(() => Boolean(initialInView));
  const [hasEntered, setHasEntered] = useState(() => Boolean(initialInView));

  useEffect(() => {
    if (disabled) return;

    if (prefersReducedMotion) {
      setInView(true);
      setHasEntered(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver !== 'function') {
      setInView(true);
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = Boolean(entry?.isIntersecting);

        if (isVisible) {
          setInView(true);
          setHasEntered(true);
          if (once) observer.unobserve(node);
          return;
        }

        if (!once) setInView(false);
      },
      { root, rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled, prefersReducedMotion, once, root, rootMargin, threshold]);

  return { ref, inView, hasEntered, reducedMotion: prefersReducedMotion };
}

export default useInView;
