'use client';
import { useState } from 'react';
import type { Project } from '@/lib/cms';

export default function ProjectCard({ proj, num }: { proj: Project; num: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const id = `project-${num}`;
  const statusCssClass = `okf-status-${proj.status || 'complete'}`;
  const tags = proj.tech
    ? proj.tech.split(',').map((t, i) => (
        <span key={i} className="tech-tag">{t.trim()}</span>
      ))
    : null;

  if (!isExpanded) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 8px', 
          cursor: 'pointer',
          background: 'rgba(0,0,0,0.02)',
          borderRadius: '4px'
        }}
        onClick={() => setIsExpanded(true)}
        title="Click to expand project details"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          <span className="font-mono text-sm text-muted-light" style={{ width: '80px', marginTop: '2px' }}>PROJ {num}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="font-serif text-lg font-bold" style={{ color: '#2C2C2C' }}>{proj.title}</span>
            {proj.subtitle && <span className="font-mono text-xs text-muted mt-1">{proj.subtitle}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="font-mono text-sm text-muted">{proj.year || '2026'}</span>
          <span className="font-mono text-sm text-muted-light font-bold" style={{ fontSize: '18px' }}>+</span>
        </div>
      </div>
    );
  }

  return (
    <section className="row mt-4" id={id}>
      <div className="col-label" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(false)}>
        <div className="font-mono text-sm text-muted-light" style={{ lineHeight: '1.8' }}>
          PROJECT<br />{num}
        </div>
        <div className="font-mono text-xs text-red mt-2 hover:underline">
          [ CLOSE ]
        </div>
      </div>
      <div className="col-content">
        <div className="okf-meta" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(false)} title="Click to collapse">
          <span className="okf-meta-item"><strong>id:</strong> <span>{id}</span></span>
          <span className="okf-meta-item"><strong>type:</strong> <span className="okf-type">{proj.type}</span></span>
          <span className="okf-meta-item"><strong>domain:</strong> <span className="okf-domain">{proj.domain}</span></span>
          <span className="okf-meta-item"><strong>status:</strong> <span className={`okf-status ${statusCssClass}`}>{proj.status || 'complete'}</span></span>
          <span className="okf-meta-item"><strong>year:</strong> <span className="okf-year">{proj.year}</span></span>
        </div>
        <div className="okf-title-block" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(false)} title="Click to collapse">
          <span className="proj-num">{"//"} DOCUMENT {num}</span>
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
                <div className="project-photo-slot" data-label="Photo 1" style={{ cursor: 'zoom-in' }} onClick={() => setExpandedImage(proj.image1 || null)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proj.image1} alt={proj.img1label || 'Photo 1'} loading="lazy" />
                  <span className="project-photo-label">{proj.img1label || 'OUTPUT — PHOTO 1'}</span>
                </div>
              )}
              {proj.image2 && (
                <div className="project-photo-slot" data-label="Photo 2" style={{ cursor: 'zoom-in' }} onClick={() => setExpandedImage(proj.image2 || null)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proj.image2} alt={proj.img2label || 'Photo 2'} loading="lazy" />
                  <span className="project-photo-label">{proj.img2label || 'DETAIL — PHOTO 2'}</span>
                </div>
              )}
            </div>
          )}
          {tags && <div style={{ marginTop: '12px' }}>{tags}</div>}
          {proj.link && (
            <div className="proj-links" style={{ marginTop: '12px' }}>
              <a href={proj.link} target="_blank" rel="noreferrer" className="text-red hover:underline font-mono text-sm">
                ↗ View Project Resource
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {expandedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(28,28,28,0.95)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => setExpandedImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={expandedImage} 
            alt="Expanded view" 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              objectFit: 'contain', 
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              borderRadius: '4px'
            }} 
          />
          <div style={{
            position: 'absolute',
            top: '24px', right: '32px',
            color: '#FCFAF2',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '12px',
            letterSpacing: '0.05em',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid #FCFAF2',
            borderRadius: '2px',
            pointerEvents: 'none'
          }}>
            [ CLOSE ]
          </div>
        </div>
      )}
    </section>
  );
}
