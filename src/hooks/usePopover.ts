import { useEffect, useRef } from 'react';

/**
 * Wires a popover so it closes on:
 *   - mousedown outside the trigger + content tree
 *   - Escape key
 *
 * Returns refs to attach to the trigger button and the popover content root.
 */
export function usePopover(open: boolean, onClose: () => void) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      onClose();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  return { triggerRef, contentRef } as const;
}
