'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLink = { href: string; label: string; target?: string };

const links: NavLink[] = [
  { href: '/about',      label: 'ABOUT' },
  { href: '/education',  label: 'EDUCATION' },
  { href: '/projects',   label: 'PROJECTS' },
  { href: '/research',   label: 'RESEARCH' },
  { href: '/gallery',    label: 'GALLERY' },
  { href: '/contact',    label: 'CONTACT' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav-wrapper font-mono text-sm">
      <div className="nav-links" id="nav-links">
        {links.map(({ href, label, target }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              target={target}
              className={isActive ? 'active' : ''}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
