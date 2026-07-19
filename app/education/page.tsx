import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Education | Mahfujul Kader Touhid',
  description: 'Academic history and certifications of Mahfujul Kader Touhid.',
};

export default async function EducationPage() {
  const content = await getCmsContent();
  const e = content.education || {};

  return (
    <>
      <Nav />
      <div className="mt-3 mb-2">
        <h1 className="font-serif text-xxl m-0 font-bold" style={{ margin: 0 }}>EDUCATION</h1>
      </div>
      <hr className="hr-light mb-3" />
      <div className="font-mono text-sm text-muted mb-5">ACADEMIC HISTORY</div>
      <hr className="hr-red mb-4 mt-5" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">ACADEMIC<br />RECORD</div>
        <div className="col-content">
          <div className="table-container">
            <table id="edu-record-table" className="data-table" width="100%" cellPadding={7} cellSpacing={0}>
              <tbody>
                <tr>
                  <th align="left" style={{ width: '15%' }} className="font-mono text-sm text-muted-lighter">Level</th>
                  <th align="left" style={{ width: '45%' }} className="font-mono text-sm text-muted-lighter">Institution</th>
                  <th align="left" style={{ width: '20%' }} className="font-mono text-sm text-muted-lighter">Year</th>
                  <th align="left" style={{ width: '20%' }} className="font-mono text-sm text-muted-lighter">Result</th>
                </tr>
                <tr>
                  <td valign="top" className="font-serif text-md"><b>BBA</b></td>
                  <td valign="top"><span className="font-serif text-md">IBA, Jahangirnagar University</span><br /><span className="font-mono text-sm text-muted-light">Business Administration</span></td>
                  <td valign="top" className="font-serif text-md">2021 – Present</td>
                  <td valign="top"><span className="font-serif text-md"><b>CGPA 3.24 / 4.00</b></span><br /><span className="font-mono text-sm text-muted-light">6 Semesters</span></td>
                </tr>
                <tr>
                  <td valign="top" className="font-serif text-md"><b>HSC</b></td>
                  <td valign="top"><span className="font-serif text-md">Mirzapur Cadet College</span><br /><span className="font-mono text-sm text-muted-light">Science</span></td>
                  <td valign="top" className="font-serif text-md">2020</td>
                  <td valign="top" className="font-serif text-md"><b>GPA 5.00 / 5.00</b></td>
                </tr>
                <tr>
                  <td valign="top" className="font-serif text-md"><b>SSC</b></td>
                  <td valign="top"><span className="font-serif text-md">Mirzapur Cadet College</span><br /><span className="font-mono text-sm text-muted-light">Science</span></td>
                  <td valign="top" className="font-serif text-md">2019</td>
                  <td valign="top" className="font-serif text-md"><b>GPA 5.00 / 5.00</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">CURRENT<br />STATUS</div>
        <div className="col-content font-serif text-md">
          <blockquote style={{ margin: '0 0 0 20px', color: '#555' }}
            dangerouslySetInnerHTML={{ __html: e.currentStatus || 'Currently pursuing a <b>Bachelor of Business Administration (BBA)</b> at IBA, Jahangirnagar University. Completed <b>6 semesters</b> with an aggregated <b>CGPA of 3.24</b>.' }}
          />
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">LICENSES &amp;<br />CERTIFICATIONS</div>
        <div className="col-content">
          <div className="table-container">
            <table id="cert-table" className="data-table" width="100%" cellPadding={7} cellSpacing={0}>
              <tbody>
                <tr>
                  <th align="left" style={{ width: '30%' }} className="font-mono text-sm text-muted-lighter">Course</th>
                  <th align="left" style={{ width: '25%' }} className="font-mono text-sm text-muted-lighter">Issuer</th>
                  <th align="left" style={{ width: '20%' }} className="font-mono text-sm text-muted-lighter">Issued</th>
                  <th align="left" style={{ width: '25%' }} className="font-mono text-sm text-muted-lighter">Certificate ID</th>
                </tr>
                {[
                  { course: 'Introduction to HTML', issuer: 'Sololearn', issued: '31 March 2026', id: 'CC-PCKFQGVS' },
                  { course: 'Python Core', issuer: 'Sololearn', issued: '07 December 2022', id: 'CT-VIWPDMXG' },
                  { course: 'R', issuer: 'Sololearn', issued: '09 December 2024', id: 'CC-ONCVDTPD' },
                  { course: 'SQL', issuer: 'Sololearn', issued: '05 October 2023', id: 'CC-RPHT4UCX' },
                  { course: 'Data Science', issuer: 'Sololearn', issued: '29 August 2023', id: 'CC-9FYOGHRZ' },
                ].map(row => (
                  <tr key={row.id}>
                    <td valign="top" className="font-serif text-md"><b>{row.course}</b></td>
                    <td valign="top" className="font-serif text-md">{row.issuer}</td>
                    <td valign="top" className="font-mono text-sm text-muted-light">{row.issued}</td>
                    <td valign="top" className="font-mono text-sm text-muted-light">{row.id}</td>
                  </tr>
                ))}
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
