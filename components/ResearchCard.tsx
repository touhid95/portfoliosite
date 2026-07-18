'use client';
import { useState } from 'react';
import type { Research } from '@/lib/cms';

export default function ResearchCard({ art, num }: { art: Research; num: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const id = `research-${num}`;
  const statusCssClass = `okf-status-${art.status || 'draft'}`;
  const tags = art.tags
    ? art.tags.split(',').map((t, i) => (
        <span key={i} className="tech-tag">{t.trim()}</span>
      ))
    : null;

  if (!isExpanded) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          padding: '16px 8px', 
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all 0.3s ease-in-out'
        }}
        onClick={() => setIsExpanded(true)}
        className="research-card-collapsed hover:bg-[rgba(200,50,50,0.05)] hover:text-[#B22222]"
        title="Click to expand article details"
      >
        <style>{`
          .research-card-collapsed:hover .res-collapse-title { color: #B22222 !important; }
          .research-card-collapsed:hover .res-collapse-indicator { transform: scale(1.2); color: #B22222; }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          <span className="font-mono text-sm text-muted-light" style={{ width: '80px', marginTop: '2px' }}>ART {num}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="font-serif text-lg font-bold res-collapse-title" style={{ color: '#2C2C2C', transition: 'color 0.2s ease' }}>{art.title}</span>
            {art.subtitle && <span className="font-mono text-xs text-muted mt-1">{art.subtitle}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="font-mono text-sm text-muted">{art.year || '2026'}</span>
          <span className="font-mono text-sm text-muted-light font-bold res-collapse-indicator" style={{ fontSize: '18px', transition: 'all 0.2s ease' }}>+</span>
        </div>
      </div>
    );
  }

  return (
    <section className="row mt-4 animate-slide-down" id={id} style={{ animation: 'slideDown 0.3s ease-out forwards' }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="col-label" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(false)}>
        <div className="font-mono text-sm text-muted-light" style={{ lineHeight: '1.8' }}>
          ARTICLE<br />{num}
        </div>
        <div className="font-mono text-xs text-red mt-2 hover:underline">
          [ CLOSE ]
        </div>
      </div>
      <div className="col-content">
        <div className="okf-meta" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(false)} title="Click to collapse">
          <span className="okf-meta-item"><strong>id:</strong> <span>{id}</span></span>
          <span className="okf-meta-item"><strong>type:</strong> <span className="res-type">{art.type}</span></span>
          <span className="okf-meta-item"><strong>domain:</strong> <span className="res-domain">{art.domain}</span></span>
          <span className="okf-meta-item"><strong>status:</strong> <span className={`res-status ${statusCssClass}`}>{art.status || 'draft'}</span></span>
          <span className="okf-meta-item"><strong>year:</strong> <span className="res-year">{art.year}</span></span>
        </div>
        <div className="okf-title-block" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(false)} title="Click to collapse">
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
