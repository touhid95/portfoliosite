import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'About | Mahfujul Kader Touhid',
  description: 'About Mahfujul Kader Touhid — data science enthusiast, BBA student at IBA-JU.',
};

export default async function AboutPage() {
  const content = await getCmsContent();
  const a = content.about || {};

  return (
    <>
      <div className="mb-4">
        <span className="font-mono text-sm text-muted-lighter">PORTFOLIO &nbsp;&mdash;&nbsp; 2026</span>
        <hr className="hr-light mb-4 mt-2" />
      </div>
      <Nav />
      <div className="mb-5 mt-5">
        <div className="sep-line mb-4 mt-2" />
        <div className="mb-4 mt-4">
          <h1 className="font-serif text-xxl m-0 font-bold" style={{ margin: 0 }}>ABOUT ME</h1>
        </div>
        <div className="sep-line" />
      </div>
      <hr className="hr-light mb-3" />
      <div className="font-mono text-sm text-muted mb-5">MAN IN HIGH CASTLE</div>
      <hr className="hr-red mb-4 mt-5" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">WHO AM I</div>
        <div className="col-content">
          <p className="font-serif text-md" style={{ margin: '0 0 16px' }}
            dangerouslySetInnerHTML={{ __html: a.whoami1 || 'My name is <b>Mahfujul Kader Touhid</b>. I am an undergraduate student at the Institute of Business Administration, Jahangirnagar University (IBA-JU), pursuing a Bachelor of Business Administration.' }}
          />
          <p className="font-serif text-md" style={{ margin: '0 0 16px' }}>
            {a.whoami2 || 'I am a driven person and enthusiast about data science. My curriculum revolves around core business knowledge, especially finance. However, my vision is — if I keep learning enough, maybe I will be building the next Aladdin of BlackRock.'}
          </p>
          <p className="font-serif text-md" style={{ margin: 0 }}>
            <i>{a.strengths || 'My personal strengths: I learn fast and I maintain deadlines.'}</i>
          </p>
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">OBJECTIVE</div>
        <div className="col-content font-serif text-md">
          {a.objective || 'Working in a pressurized scenario to learn as much as possible in as short a time as possible.'}
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">EXPERIENCE</div>
        <div className="col-content">
          <div className="font-serif text-md font-bold mb-2">{a.expTitle || 'Data Analyst'}</div>
          <blockquote style={{ margin: '0 0 0 1px', paddingLeft: '14px', borderLeft: '2px solid #E0E0E0', color: '#555' }}>
            <span className="font-serif text-md">
              {a.expDesc || 'Worked on academic projects as a research assistant in IBA to handle business data.'}
            </span>
          </blockquote>
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">INTERESTS</div>
        <div className="col-content">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: '#555' }} className="font-serif text-md">
            {[a.interest_1 || 'Data Science and Analytics', a.interest_2 || 'SQL and Database Management', a.interest_3 || 'Finance and Business Strategy', a.interest_4 || 'Public Speaking and Debate', a.interest_5 || 'Football', a.interest_6 || 'Photography'].map((item, i, arr) => (
              <li key={i} style={{ padding: '6px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0ede4' : undefined }}>
                &middot;&nbsp; {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">SKILLS</div>
        <div className="col-content">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: '#555' }} className="font-serif text-md">
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f0ede4' }}>&middot;&nbsp; {a.skill_1 || 'SQL — 5-star gold rated on HackerRank'}</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f0ede4' }}>&middot;&nbsp; {a.skill_2 || 'Python — Pandas, NumPy, Matplotlib, Seaborn'}</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f0ede4' }}>&middot;&nbsp; {a.skill_3 || 'Power BI · Tableau · Microsoft Excel'}</li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f0ede4' }}>&middot;&nbsp; {a.skill_4 || 'Public Speaking, MS Office, Prezi, Photoshop, Illustrator'}</li>
            <li style={{ padding: '6px 0' }}>&middot;&nbsp;
              <a href={a.skill_5_link1 || 'https://github.com/touhid95/portfolio'} target="_blank" rel="noreferrer" className="text-blue">{a.skill_5_text1 || 'GitHub Portfolio'}</a>
              &nbsp;·&nbsp;
              <a href={a.skill_5_link2 || 'https://drive.google.com/drive/folders/1YMb8mrbaCoMiCzjBfWzGI-TPjOJgBgod'} target="_blank" rel="noreferrer" className="text-blue">{a.skill_5_text2 || 'Google Drive Portfolio'}</a>
            </li>
          </ul>
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />

      <section className="row mt-4">
        <div className="col-label font-mono text-sm text-muted-light">CAREER<br />GOALS</div>
        <div className="col-content font-serif text-md">
          {a.careerGoal || 'To become a data-driven decision-maker in the finance and business sector. I aspire to combine business knowledge with advanced data science skills to solve real-world problems at scale.'}
        </div>
      </section>
      <hr className="hr-light mb-4 mt-4" />
      <Footer />
    </>
  );
}
