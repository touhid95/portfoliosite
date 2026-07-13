import type { Project } from '@/lib/cms';

function esc(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function ProjectCard({ proj, num }: { proj: Project; num: string }) {
  const id = `project-${num}`;
  const statusCssClass = `okf-status-${proj.status || 'complete'}`;
  const tags = proj.tech
    ? proj.tech.split(',').map((t, i) => (
        <span key={i} className="tech-tag">{t.trim()}</span>
      ))
    : null;

  return (
    <section className="row mt-4" id={id}>
      <div className="col-label">
        <div className="font-mono text-sm text-muted-light" style={{ lineHeight: '1.8' }}>
          PROJECT<br />{num}
        </div>
      </div>
      <div className="col-content">
        <div className="okf-meta">
          <span className="okf-meta-item"><strong>id:</strong> <span>{id}</span></span>
          <span className="okf-meta-item"><strong>type:</strong> <span className="okf-type">{proj.type}</span></span>
          <span className="okf-meta-item"><strong>domain:</strong> <span className="okf-domain">{proj.domain}</span></span>
          <span className="okf-meta-item"><strong>status:</strong> <span className={`okf-status ${statusCssClass}`}>{proj.status || 'complete'}</span></span>
          <span className="okf-meta-item"><strong>year:</strong> <span className="okf-year">{proj.year}</span></span>
        </div>
        <div className="okf-title-block">
          <span className="proj-num">// DOCUMENT {num}</span>
          <div className="font-serif text-lg font-bold mb-1">
            <span className="proj-title-text">{proj.title}</span>
          </div>
          <div className="font-mono text-sm text-muted">
            <span className="proj-subtitle-text">{proj.subtitle}</span>
          </div>
        </div>
        <div className="proj-body">
          {proj.description && (
            <div className="font-serif text-md mb-3">{proj.description}</div>
          )}
          {(proj.contrib1 || proj.contrib2 || proj.contrib3) && (
            <div className="font-serif text-md mb-3">
              <span className="font-mono text-sm text-muted-light">KEY CONTRIBUTIONS</span>
              <ul className="contrib-list">
                {proj.contrib1 && <li>{proj.contrib1}</li>}
                {proj.contrib2 && <li>{proj.contrib2}</li>}
                {proj.contrib3 && <li>{proj.contrib3}</li>}
              </ul>
            </div>
          )}
          {(proj.image1 || proj.image2) && (
            <div className="project-photos">
              {proj.image1 && (
                <div className="project-photo-slot" data-label="Photo 1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proj.image1} alt={proj.img1label || 'Photo 1'} loading="lazy" />
                  <span className="project-photo-label">{proj.img1label || 'OUTPUT — PHOTO 1'}</span>
                </div>
              )}
              {proj.image2 && (
                <div className="project-photo-slot" data-label="Photo 2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proj.image2} alt={proj.img2label || 'Photo 2'} loading="lazy" />
                  <span className="project-photo-label">{proj.img2label || 'DETAIL — PHOTO 2'}</span>
                </div>
              )}
            </div>
          )}
          {tags && <div style={{ marginTop: '12px' }}>{tags}</div>}
          {proj.link && (
            <div className="proj-links">
              <a href={proj.link} target="_blank" rel="noreferrer">↗ View Project</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
