import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="font-mono text-sm text-muted-lighter mt-3 mb-5 text-center">
      &copy; 2026 Mahfujul Kader Touhid &nbsp;|&nbsp;
      <Link href="/" className="text-muted-lighter">Home</Link> &nbsp;|&nbsp;
      <Link href="/about" className="text-muted-lighter">About</Link> &nbsp;|&nbsp;
      <Link href="/education" className="text-muted-lighter">Education</Link> &nbsp;|&nbsp;
      <Link href="/projects" className="text-muted-lighter">Projects</Link> &nbsp;|&nbsp;
      <Link href="/gallery" className="text-muted-lighter">Gallery</Link> &nbsp;|&nbsp;
      <Link href="/contact" className="text-muted-lighter">Contact</Link>
    </footer>
  );
}
