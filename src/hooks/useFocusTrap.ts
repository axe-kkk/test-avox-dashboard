import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps Tab navigation inside a container while `active` is true.
 * Restores focus to the previously focused element on close.
 *
 * Attach the returned ref to the modal root.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        el => !el.hasAttribute('aria-hidden') && el.offsetParent !== null,
      );

    const initial = focusables()[0] ?? root;
    requestAnimationFrame(() => initial.focus());

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement as HTMLElement;
      if (e.shiftKey) {
        if (current === first || !root.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    root.addEventListener('keydown', handleKey);
    return () => {
      root.removeEventListener('keydown', handleKey);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}
