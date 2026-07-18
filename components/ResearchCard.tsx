import type { Research } from '@/lib/cms';

export default function ResearchCard({ art, num }: { art: Research; num: string }) {
  const id = `research-${num}`;
  const statusCssClass = `okf-status-${art.status || 'draft'}`;
  const tags = art.tags
    ? art.tags.split(',').map((t, i) => (
        <span key={i} className="tech-tag">{t.trim()}</span>
      ))
    : null;

  return (
    <section className="row mt-4" id={id}>
      <div className="col-label">
        <div className="font-mono text-sm text-muted-light" style={{ lineHeight: '1.8' }}>
          ARTICLE<br />{num}
        </div>
      </div>
      <div className="col-content">
        <div className="okf-meta">
          <span className="okf-meta-item"><strong>id:</strong> <span>{id}</span></span>
          <span className="okf-meta-item"><strong>type:</strong> <span className="res-type">{art.type}</span></span>
          <span className="okf-meta-item"><strong>domain:</strong> <span className="res-domain">{art.domain}</span></span>
          <span className="okf-meta-item"><strong>status:</strong> <span className={`res-status ${statusCssClass}`}>{art.status || 'draft'}</span></span>
          <span className="okf-meta-item"><strong>year:</strong> <span className="res-year">{art.year}</span></span>
        </div>
        <div className="okf-title-block">
          <span className="proj-num">{"//"} ARTICLE {num}</span>
          <div className="font-serif text-lg font-bold mb-1">
            <span className="res-title-text">{art.title}</span>
          </div>
          <div className="font-mono text-sm text-muted">
            <span className="res-subtitle-text">{art.subtitle}</span>
          </div>
        </div>
        <div className="research-body">
          {(art.authors || art.journal) && (
            <div className="font-mono text-sm text-muted mb-2">
              {art.authors && <><strong>Authors:</strong> {art.authors}</>}
              {art.authors && art.journal && <>&nbsp;&nbsp;·&nbsp;&nbsp;</>}
              {art.journal && <><strong>Journal:</strong> {art.journal}</>}
            </div>
          )}
          {art.abstract && (
            <div className="font-serif text-md mb-3">{art.abstract}</div>
          )}
          {(art.finding1 || art.finding2 || art.finding3) && (
            <div className="font-serif text-md mb-3">
              <span className="font-mono text-sm text-muted-light">KEY FINDINGS</span>
              <ul className="contrib-list">
                {art.finding1 && <li>{art.finding1}</li>}
                {art.finding2 && <li>{art.finding2}</li>}
                {art.finding3 && <li>{art.finding3}</li>}
              </ul>
            </div>
          )}
          {(art.image1 || art.image2) && (
            <div className="project-photos">
              {art.image1 && (
                <div className="project-photo-slot" data-label="Figure 1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={art.image1} alt={art.img1label || 'Figure 1'} loading="lazy" />
                  <span className="project-photo-label">{art.img1label || 'FIGURE 1'}</span>
                </div>
              )}
              {art.image2 && (
                <div className="project-photo-slot" data-label="Figure 2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={art.image2} alt={art.img2label || 'Figure 2'} loading="lazy" />
                  <span className="project-photo-label">{art.img2label || 'FIGURE 2'}</span>
                </div>
              )}
            </div>
          )}
          {tags && <div style={{ marginTop: '12px' }}>{tags}</div>}
          {(art.doi || art.link) && (
            <div className="article-links">
              {art.doi && <a href={art.doi} target="_blank" rel="noreferrer">↗ DOI / Full Paper</a>}
              {art.link && <a href={art.link} target="_blank" rel="noreferrer">↗ View / Download</a>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
