import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
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
      <style>{`
        input[type="text"],
        input[type="email"],
        textarea {
          width: 100%;
          max-width: 400px;
          padding: 8px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          border: 1px solid #E0E0E0;
          background: #FCFAF2;
          color: #2C2C2C;
          margin-top: 5px;
        }
        input[type="submit"] {
          padding: 10px 20px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          border: 1px solid #2C2C2C;
          background: #FCFAF2;
          color: #2C2C2C;
          cursor: pointer;
        }
        input[type="submit"]:hover {
          background: #BC2026;
          color: #FCFAF2;
        }
      `}</style>

      <div className="mb-4">
        <span className="font-mono text-sm text-muted-lighter">PORTFOLIO &nbsp;&mdash;&nbsp; 2026</span>
        <hr className="hr-light mb-4 mt-2" />
      </div>
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
          <form action="#" method="post">
            <div className="mb-3">
              <label htmlFor="name" className="font-mono text-sm text-muted block">YOUR NAME</label><br />
              <input type="text" id="name" name="name" placeholder="e.g. John Doe" />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="font-mono text-sm text-muted block">YOUR EMAIL</label><br />
              <input type="email" id="email" name="email" placeholder="e.g. john@example.com" />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="font-mono text-sm text-muted block">MESSAGE</label><br />
              <textarea id="message" name="message" rows={6} placeholder="Write your message here..." />
            </div>
            <div>
              <input type="submit" value="Send Message" />
            </div>
          </form>
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />
      <Footer />
    </>
  );
}
