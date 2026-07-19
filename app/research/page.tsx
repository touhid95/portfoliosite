import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ResearchCard from '@/components/ResearchCard';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Research | Mahfujul Kader Touhid',
  description: 'Research articles and academic writing by Mahfujul Kader Touhid — data science, finance, and business analytics.',
};

export default async function ResearchPage() {
  const content = await getCmsContent();
  const articles = content.research || [];
  
  const researchArticles = articles.filter(a => a.type === 'research-article' || !a.type);
  const thoughts = articles.filter(a => a.type === 'thoughts');
  const blogs = articles.filter(a => a.type === 'blog');

  return (
    <>
      <Nav />
      <div className="mt-3 mb-2">
        <h1 className="font-serif text-xxl m-0 font-bold" style={{ margin: 0 }}>RESEARCH</h1>
      </div>
      <hr className="hr-light mb-3" />
      <div className="font-mono text-sm text-muted mb-3">ARTICLES, PAPERS &amp; ACADEMIC WRITING</div>
      <div className="font-mono text-sm text-muted-lighter mb-5">
        <a href="https://github.com/touhid95/portfolio" target="_blank" rel="noreferrer" className="text-blue">↗ GitHub Portfolio</a>
        &nbsp;·&nbsp;
        <a href="https://drive.google.com/drive/folders/1YMb8mrbaCoMiCzjBfWzGI-TPjOJgBgod" target="_blank" rel="noreferrer" className="text-blue">↗ Google Drive</a>
      </div>
      <hr className="hr-red mb-5" />

      <div id="research-list-container">
        {articles.length === 0 ? (
          <div className="font-mono text-sm text-muted-lighter" style={{ padding: '40px 0', textAlign: 'center' }}>
            No research articles yet. Add them via the Admin Panel.
          </div>
        ) : (
          <>
            {researchArticles.length > 0 && (
              <div className="mb-5">
                <h2 className="font-mono text-sm text-red mb-3">RESEARCH ARTICLES</h2>
                {researchArticles.map((art, i) => {
                  const num = String(i + 1).padStart(2, '0');
                  return (
                    <div key={i}>
                      <ResearchCard art={art} num={num} />
                      {i < researchArticles.length - 1 && <hr className="hr-light mb-4 mt-2" />}
                    </div>
                  );
                })}
              </div>
            )}
            
            {thoughts.length > 0 && (
              <div className="mb-5">
                <hr className="hr-light mb-4" />
                <h2 className="font-mono text-sm text-red mb-3">THOUGHTS</h2>
                {thoughts.map((art, i) => {
                  const num = String(i + 1).padStart(2, '0');
                  return (
                    <div key={i}>
                      <ResearchCard art={art} num={num} />
                      {i < thoughts.length - 1 && <hr className="hr-light mb-4 mt-2" />}
                    </div>
                  );
                })}
              </div>
            )}

            {blogs.length > 0 && (
              <div className="mb-5">
                <hr className="hr-light mb-4" />
                <h2 className="font-mono text-sm text-red mb-3">BLOG</h2>
                {blogs.map((art, i) => {
                  const num = String(i + 1).padStart(2, '0');
                  return (
                    <div key={i}>
                      <ResearchCard art={art} num={num} />
                      {i < blogs.length - 1 && <hr className="hr-light mb-4 mt-2" />}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
