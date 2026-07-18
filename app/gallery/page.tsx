import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gallery | Mahfujul Kader Touhid',
  description: 'Photography and gallery by Mahfujul Kader Touhid.',
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
      <div className="mb-4">
        <span className="font-mono text-sm text-muted-lighter">PORTFOLIO &nbsp;&mdash;&nbsp; 2026</span>
        <hr className="hr-light mb-4 mt-2" />
      </div>
      <Nav />
      <div className="mt-3 mb-2">
        <h1 className="font-serif text-xxl m-0 font-bold" style={{ margin: 0 }}>GALLERY</h1>
      </div>
      <hr className="hr-light mb-3" />
      <div className="font-mono text-sm text-muted mb-5">PHOTOGRAPHY &amp; VISUAL WORK</div>
      <hr className="hr-red mb-4 mt-5" />

      {gallery.length === 0 ? (
        <div className="font-mono text-sm text-muted-lighter" style={{ padding: '40px 0', textAlign: 'center' }}>
          No gallery images yet. Add them via the Admin Panel.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {gallery.map(item => (
            <div key={item.id} className="project-photo-slot" style={{ minHeight: '180px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.caption || 'Gallery image'} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {item.caption && (
                <span className="project-photo-label">{item.caption}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <Footer />
    </>
  );
}
