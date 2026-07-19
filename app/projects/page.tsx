import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Projects | Mahfujul Kader Touhid',
  description: 'Selected data science and analytics projects by Mahfujul Kader Touhid.',
};

export default async function ProjectsPage() {
  const content = await getCmsContent();
  const projects = content.projects || [];

  return (
    <>
      <Nav />
      <div className="mt-3 mb-2">
        <h1 className="font-serif text-xxl m-0 font-bold" style={{ margin: 0 }}>PROJECTS</h1>
      </div>
      <hr className="hr-light mb-3" />
      <div className="font-mono text-sm text-muted mb-3">SELECTED WORK &amp; CASE STUDIES</div>
      <hr className="hr-red mb-5" />

      <div id="projects-list-container">
        {projects.length === 0 ? (
          <div className="font-mono text-sm text-muted-lighter" style={{ padding: '40px 0', textAlign: 'center' }}>
            No projects yet. Add them via the Admin Panel.
          </div>
        ) : (
          projects.map((proj, i) => {
            const num = String(i + 1).padStart(2, '0');
            return (
              <div key={i}>
                <ProjectCard proj={proj} num={num} />
                {i < projects.length - 1 && <hr className="hr-light mb-4 mt-2" />}
              </div>
            );
          })
        )}
      </div>

      <Footer />
    </>
  );
}
