import {useEffect, useRef, useState} from 'react';

export default function useIllustrationMotion() {
  const element = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [documentVisible, setDocumentVisible] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const media = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReduced(media?.matches ?? false);
      if (media?.matches) setChoice((current) => (current === true ? null : current));
    };
    const updateVisibility = () => setDocumentVisible(!document.hidden);
    updatePreference();
    updateVisibility();
    setReady(true);
    media?.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => setInView(entries[0].isIntersecting), {
            threshold: 0.05,
          })
        : undefined;
    if (element.current) observer?.observe(element.current);
    return () => {
      media?.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer?.disconnect();
    };
  }, []);

  const enabled = choice ?? !reduced;
  return {
    element,
    enabled,
    playing: ready && enabled && documentVisible && inView,
    toggle: () => setChoice(!enabled),
  };
}
