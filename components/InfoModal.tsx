"use client";

import { ReactNode, useEffect, useRef } from "react";
import { CloseIcon } from "./Icons";

interface InfoModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** A clean pop-up card: closes on the X, the Escape key, or a click outside it. */
export default function InfoModal({ title, onClose, children }: InfoModalProps) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__panel info" role="dialog" aria-modal="true" aria-labelledby="info-title">
        <button ref={closeBtn} className="modal__close" onClick={onClose} aria-label="Close">
          <CloseIcon width={18} height={18} />
        </button>
        <h2 id="info-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}