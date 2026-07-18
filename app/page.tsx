import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getCmsContent } from '@/lib/cms';
export const metadata: Metadata = {
  title: 'Mahfujul Kader Touhid — Portfolio',
  description: 'Undergraduate · Data Analyst · IBA-JU. Projects, research, and contact.',
};

export default async function HomePage() {
  const content = await getCmsContent();
  const p = content.personal || {};
  const h = content.home || {};

  return (
    <>
      <div className="mb-4">
        <span className="font-mono text-sm text-muted-lighter">PORTFOLIO &nbsp;&mdash;&nbsp; 2026</span>
        <hr className="hr-light mb-4 mt-2" />
      </div>

      <Nav />

      <div className="mt-3 mb-2">
        <h1 className="font-serif text-xxl m-0 font-bold" style={{ margin: 0 }}>
          {p.name || 'MAHFUJUL KADER TOUHID'}
        </h1>
      </div>

      <hr className="hr-light mb-3 mt-3" />

      <div className="font-mono text-sm text-muted mb-4">
        {h.subtitle || 'UNDERGRADUATE \u00a0·\u00a0 DATA ANALYST \u00a0·\u00a0 IBA-JU'}
      </div>

      <div className="font-mono text-sm mb-5" style={{ lineHeight: '1.6' }}>
        {p.location || 'Sector-6, Uttara, Dhaka'}
        {' · '}
        <a className="text-blue break-words" href={p.emailLink || `mailto:${p.email || 'm.k.touhid95@gmail.com'}`}>
          {p.email || 'm.k.touhid95@gmail.com'}
        </a>
        {' · '}
        <a className="text-blue" href={p.linkedin || 'https://www.linkedin.com/in/mktouhid/'} target="_blank" rel="noreferrer">LinkedIn</a>
        {' · '}
        <a className="text-blue" href={p.github || 'https://github.com/touhid95/portfolio'} target="_blank" rel="noreferrer">GitHub</a>
      </div>

      <hr className="hr-red mb-4 mt-5" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">INTRODUCTION</div>
        <div className="col-content font-serif text-md">
          {h.intro || 'I am a driven person and enthusiast about data science. My curriculum revolves around core business knowledge, especially finance. My goal is to become a data-driven decision-maker — and perhaps one day build the next Aladdin of BlackRock.'}
        </div>
      </section>

      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">PROFILE</div>
        <div className="col-content">
          <div className="table-container">
            <table className="data-table key-value-table" width="100%" cellPadding={7} cellSpacing={0}>
              <tbody>
                <tr>
                  <td width="30%" className="font-mono text-sm text-muted-lighter">Degree</td>
                  <td className="font-serif text-md">{h.degree || 'B.B.A. (Ongoing) — 6 Semesters'}</td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted-lighter">Department</td>
                  <td className="font-serif text-md">{h.department || 'Institute of Business Administration'}</td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted-lighter">University</td>
                  <td className="font-serif text-md">{h.university || 'Jahangirnagar University, Savar, Dhaka'}</td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted-lighter">CGPA</td>
                  <td className="font-serif text-md">{h.cgpa || '3.24 / 4.00'}</td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted-lighter">Location</td>
                  <td className="font-serif text-md">{p.location || 'Sector-6, Uttara, Dhaka, Bangladesh'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className="hr-light mb-4 mt-4" />
      <Footer />
    </>
  );
}
