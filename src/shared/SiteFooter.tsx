import { useEffect, useRef, useState } from "react";
import { siteInfo, siteLinks, socialLinks } from "./siteInfo";

export function SiteLinks({ className = "" }: { className?: string }) {
  return (
    <nav className={className} aria-label="公開情報">
      {siteLinks.map((link, i) => (
        <span key={link.href}>
          {i > 0 && (
            <span className="link-separator" aria-hidden="true">
              ・
            </span>
          )}
          <a href={link.href}>{link.label}</a>
        </span>
      ))}
    </nav>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <SiteLinks />
      <div className="social-links">
        {socialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-label={link.label}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d={link.path} />
            </svg>
          </a>
        ))}
      </div>
      <p>{siteInfo.operator}</p>
    </footer>
  );
}
export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null),
    button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!container.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="site-menu" ref={container}>
      <button
        ref={button}
        type="button"
        aria-label="その他"
        aria-expanded={open}
        aria-controls="site-menu-links"
        onClick={() => setOpen(!open)}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      </button>
      {open && (
        <div id="site-menu-links">
          <SiteLinks />
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-label={link.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
