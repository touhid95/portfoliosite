import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gallery | Mahfujul Kader Touhid',
  description: 'Photography and visual work by Mahfujul Kader Touhid — a curated archive of images.',
};

interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  section?: string;
}

async function getGallery(): Promise<GalleryItem[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey    = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_kv?key=eq.touhid_gallery&select=value`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    const rows: { value: string }[] = await res.json();
    if (!rows.length) return [];
    return JSON.parse(rows[0].value) as GalleryItem[];
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <>
      {/* ── Page header — same pattern as all other pages ── */}
      <div className="mb-4">
        <span className="font-mono text-sm text-muted-lighter">PORTFOLIO &nbsp;&mdash;&nbsp; 2026</span>
        <hr className="hr-light mb-4 mt-2" />
      </div>
      <Nav />

      {/* ── Gallery title block ── */}
      <div className="gallery-title-block">
        <h1 className="font-serif text-xxl m-0 font-bold">GALLERY</h1>
        <div className="gallery-title-meta">
          <span className="font-mono text-xs text-muted-lighter">COLLECTION 2024</span>
          <span className="font-mono text-xs text-muted-lighter">PHOTOGRAPHY &amp; VISUAL WORK</span>
        </div>
      </div>

      <hr className="hr-light mb-3" />
      <div className="font-mono text-sm text-muted mb-5">PHOTOGRAPHY &amp; VISUAL WORK</div>
      <hr className="hr-red" style={{ marginBottom: 0 }} />

      {/* ── Gallery body ── */}
      {gallery.length === 0 ? (
        <div className="gallery-empty">
          <div className="gallery-empty-inner">
            <span className="font-mono text-sm text-muted-lighter">ARCHIVE — UNPUBLISHED</span>
            <p className="font-serif" style={{ color: '#aaa', marginTop: 8 }}>
              No images in the collection yet. Add them via the Admin Panel.
            </p>
          </div>
        </div>
      ) : (
        <div className="gallery-editorial-list">
          {gallery.map((item, i) => {
            const index = String(i + 1).padStart(2, '0');
            const total = String(gallery.length).padStart(2, '0');
            // Alternate layout: odd items → image left-offset, even → image right-offset
            const isEven = i % 2 === 0;
            return (
              <article
                key={item.id}
                className={`gallery-entry ${isEven ? 'gallery-entry--left' : 'gallery-entry--right'}`}
                id={`gallery-item-${item.id}`}
              >
                {/* Index rule */}
                <div className="gallery-entry-index font-mono text-xs text-muted-lighter">
                  <span>{index}</span>
                  <span className="gallery-index-rule" aria-hidden="true" />
                  <span>{total}</span>
                </div>

                {/* Image frame */}
                <div className="gallery-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.caption || `Gallery image ${i + 1}`}
                    loading="lazy"
                    className="gallery-frame-img"
                  />
                  {/* Accent corner mark */}
                  <div className="gallery-frame-corner" aria-hidden="true" />
                </div>

                {/* Caption block */}
                <div className="gallery-caption-block">
                  {item.section && (
                    <span className="font-mono text-xs text-muted-lighter gallery-caption-section">
                      {item.section.toUpperCase()}
                    </span>
                  )}
                  {item.caption && (
                    <p className="font-serif gallery-caption-title">{item.caption}</p>
                  )}
                  <span className="font-mono text-xs text-muted-lighter gallery-caption-ref">
                    REF &nbsp;{index} / {total}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Inquire section ── */}
      <section className="gallery-inquire" aria-labelledby="inquire-heading">
        <hr className="hr-light" style={{ marginBottom: 40 }} />
        <div className="gallery-inquire-inner">
          <h2 className="font-serif gallery-inquire-heading" id="inquire-heading">
            INQUIRE FOR ARCHIVE
          </h2>
          <p className="font-mono text-sm text-muted gallery-inquire-body">
            Our digital collection is a fraction of the physical archive. For licensing,
            curation requests, or high-fidelity print acquisition, please reach out to our custodial office.
          </p>
          <div className="gallery-inquire-actions">
            <a href="/contact" className="gallery-inquire-btn font-mono text-xs">
              EMAIL THE CURATOR
            </a>
            <a href="#" className="gallery-inquire-link font-mono text-xs text-muted">
              VIEW CATALOGUE INDEX &nbsp;→
            </a>
          </div>
        </div>
        <hr className="hr-light" style={{ marginTop: 40 }} />
      </section>

      <Footer />
    </>
  );
}
