'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/',           label: 'HOME' },
  { href: '/about',      label: 'ABOUT' },
  { href: '/education',  label: 'EDUCATION' },
  { href: '/projects',   label: 'PROJECTS' },
  { href: '/research',   label: 'RESEARCH' },
  { href: '/gallery',    label: 'GALLERY' },
  { href: '/contact',    label: 'CONTACT' },
  { href: '/cv',         label: 'CV ↗', target: '_blank' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav-wrapper font-mono text-sm">
      <button
        className="nav-toggle"
        id="nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        ☰ MENU
      </button>
      <div className={`nav-links${open ? ' is-open' : ''}`} id="nav-links">
        {links.map(({ href, label, target }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              target={target}
              className={isActive ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
