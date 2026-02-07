import React from 'react';
import useInView from '../utils/useInView';

export default function ScrollReveal({
  as = 'div',
  className = '',
  hiddenClassName = 'opacity-0 translate-y-4',
  shownClassName = 'opacity-100 translate-y-0',
  once = true,
  rootMargin,
  threshold,
  delayMs = 0,
  durationMs = 520,
  style,
  children,
  ...rest
}) {
  const Comp = as;
  const { ref, inView, hasEntered, reducedMotion } = useInView({ once, rootMargin, threshold });
  const isVisible = once ? hasEntered : inView;

  const transitionStyle = reducedMotion
    ? style
    : {
        ...style,
        transitionDelay: delayMs ? `${delayMs}ms` : style?.transitionDelay,
        transitionDuration: durationMs ? `${durationMs}ms` : style?.transitionDuration,
      };

  const base = 'will-change-transform will-change-opacity transition-all ease-out motion-reduce:transition-none motion-reduce:transform-none';

  const state = reducedMotion ? '' : isVisible ? shownClassName : hiddenClassName;

  return (
    <Comp ref={ref} className={[base, state, className].filter(Boolean).join(' ')} style={transitionStyle} {...rest}>
      {children}
    </Comp>
  );
}
