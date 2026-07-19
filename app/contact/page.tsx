import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Contact | Mahfujul Kader Touhid',
  description: 'Get in touch with Mahfujul Kader Touhid.',
};

export default async function ContactPage() {
  const content = await getCmsContent();
  const p = content.personal || {};

  return (
    <>
      <Nav />
      <div className="mt-3 mb-2">
        <h1 className="font-serif text-xxl m-0 font-bold" style={{ margin: 0 }}>CONTACT</h1>
      </div>
      <hr className="hr-red mb-3" />
      <div className="font-mono text-sm text-muted mb-5">GET IN TOUCH</div>
      <hr className="hr-red mb-4 mt-5" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">CONTACT<br />INFORMATION</div>
        <div className="col-content">
          <div className="table-container">
            <table className="data-table key-value-table" width="100%" cellPadding={11} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ width: '28%' }} className="font-mono text-sm text-muted">Email</td>
                  <td><a className="text-blue font-serif text-md" href={p.emailLink || `mailto:${p.email || 'm.k.touhid95@gmail.com'}`}>{p.email || 'm.k.touhid95@gmail.com'}</a></td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted">Phone</td>
                  <td className="font-serif text-md">{p.phone || '+880 1734773509'}</td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted">Address</td>
                  <td className="font-serif text-md">{p.location || 'Sector-6, Uttara, Dhaka, Bangladesh'}</td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted">University</td>
                  <td className="font-serif text-md">{p.university || 'IBA, Jahangirnagar University, Savar, Dhaka'}</td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted">LinkedIn</td>
                  <td><a className="text-blue font-serif text-md" href={p.linkedin || 'https://www.linkedin.com/in/mktouhid/'} target="_blank" rel="noreferrer">{p.linkedinText || 'linkedin.com/in/mktouhid/'}</a></td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted">GitHub</td>
                  <td><a className="text-blue font-serif text-md" href={p.github || 'https://github.com/touhid95/portfolio'} target="_blank" rel="noreferrer">{p.githubText || 'github.com/touhid95/portfolio'}</a></td>
                </tr>
                <tr>
                  <td className="font-mono text-sm text-muted">Google Drive</td>
                  <td><a className="text-blue font-serif text-md" href="https://drive.google.com/drive/folders/1YMb8mrbaCoMiCzjBfWzGI-TPjOJgBgod" target="_blank" rel="noreferrer">Drive Portfolio / CV</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">SEND A<br />MESSAGE</div>
        <div className="col-content">
          <ContactForm />
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />
      <Footer />
    </>
  );
}
