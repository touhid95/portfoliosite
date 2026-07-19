import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Mahfujul Kader Touhid',
  description: 'Mahfujul Kader Touhid — data enthusiast, photographer, and BBA student at IBA-JU.',
};

export default async function AboutPage() {
  const content = await getCmsContent();
  const p = content.personal || {};

  return (
    <>
      <Nav />

      {/* ── Name block ── */}
      <div className="mt-3 mb-2">
        <h1 className="font-serif text-xxl m-0 font-bold" style={{ margin: 0 }}>
          {p.name || 'MAHFUJUL KADER TOUHID'}
        </h1>
      </div>

      <hr className="hr-light mb-3 mt-3" />

      <div className="font-mono text-sm text-muted mb-4">
        {p.location || 'Dhaka, Bangladesh'}
        {' · '}
        <a className="text-blue" href={p.emailLink || `mailto:${p.email || 'm.k.touhid95@gmail.com'}`}>
          {p.email || 'm.k.touhid95@gmail.com'}
        </a>
        {' · '}
        <a className="text-blue" href={p.linkedin || 'https://www.linkedin.com/in/mktouhid/'} target="_blank" rel="noreferrer">LinkedIn</a>
        {' · '}
        <a className="text-blue" href={p.github || 'https://github.com/touhid95/portfolio'} target="_blank" rel="noreferrer">GitHub</a>
      </div>

      <hr className="hr-red mb-4 mt-4" />

      {/* ── On character ── */}
      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">CHARACTER</div>
        <div className="col-content font-serif text-md" style={{ lineHeight: 1.75 }}>
          Curious by nature, disciplined by practice. I believe most things worth knowing
          sit at the boundary between two fields — and that is exactly where I like to work.
        </div>
      </section>

      <hr className="hr-light mb-4 mt-4" />

      {/* ── On interests ── */}
      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">INTERESTS</div>
        <div className="col-content font-serif text-md" style={{ lineHeight: 1.75 }}>
          Data and its stories. Finance as a language. Photography as a way of slowing down.
          Football for the joy of it. Debate for the discipline of clarity.
        </div>
      </section>

      <hr className="hr-light mb-4 mt-4" />

      {/* ── On practice ── */}
      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">PRACTICE</div>
        <div className="col-content font-serif text-md" style={{ lineHeight: 1.75 }}>
          BBA student at IBA&#8209;JU. I spend most of my time with data — building models,
          finding patterns, asking better questions. The goal is not a title. It is
          to understand systems deeply enough to eventually shape them.
        </div>
      </section>

      <hr className="hr-light mb-4 mt-4" />
      <Footer />
    </>
  );
}
