// Shared CMS content types
export interface Project {
  title: string;
  subtitle: string;
  type: string;
  domain: string;
  status: string;
  year: string;
  description: string;
  contrib1?: string;
  contrib2?: string;
  contrib3?: string;
  tech?: string;
  link?: string;
  image1?: string;
  img1label?: string;
  image2?: string;
  img2label?: string;
}

export interface Research {
  title: string;
  subtitle: string;
  type: string;
  domain: string;
  status: string;
  year: string;
  authors?: string;
  journal?: string;
  abstract?: string;
  finding1?: string;
  finding2?: string;
  finding3?: string;
  tags?: string;
  doi?: string;
  link?: string;
  image1?: string;
  img1label?: string;
  image2?: string;
  img2label?: string;
}

export interface CmsContent {
  personal?: Record<string, string>;
  home?: Record<string, string>;
  about?: Record<string, string>;
  education?: Record<string, string>;
  projects?: Project[];
  research?: Research[];
  [key: string]: unknown;
}

// Supabase helpers
async function kvGet(key: string): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/portfolio_kv?key=eq.${key}&select=value`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );
  if (!res.ok) return null;
  const rows: { value: string }[] = await res.json();
  return rows.length > 0 ? rows[0].value : null;
}

// FALLBACK content shown when Supabase has no data yet
const FALLBACK: CmsContent = {
  projects: [
    {
      title: 'JACSU Election Survey Analysis',
      subtitle: 'EDA on Survey Data',
      type: 'case-study',
      domain: 'Policy Research',
      status: 'complete',
      year: '2025',
      description:
        'Comprehensive analysis of voter trends among Jahangirnagar University students ahead of the JACSU Election 2025.',
      contrib1: 'Designed and distributed structured survey instruments.',
      contrib2: 'Performed exploratory data analysis revealing key voter blocs.',
      contrib3: 'Produced visualised reports with actionable campaign strategy insights.',
      tech: 'Python, Pandas, Power BI',
      image2:
        'https://res.cloudinary.com/doonxbwcz/image/upload/v1783174710/Screenshot_2026-07-04_201755_cvxopt.png',
      img2label: 'Political Spectrum',
    },
    {
      title: 'Financial Market Predictive Analytics',
      subtitle: 'Portfolio Forecasting & Asset Optimization',
      type: 'case-study',
      domain: 'finance / analytics',
      status: 'complete',
      year: '2024',
      description:
        'A stock trend forecasting and risk simulation model based on Modern Portfolio Theory (MPT) principles.',
      contrib1: 'Automated streaming of ticker histories with Python yfinance API.',
      contrib2: 'Executed 5,000 portfolio simulation iterations.',
      contrib3: 'Crafted interactive dashboards displaying rolling standard deviations.',
      tech: 'Python, Pandas, NumPy, Power BI, yfinance, Monte Carlo',
      link: 'https://github.com/touhid95/portfolio',
    },
    {
      title: 'Retail Sales Database Optimization',
      subtitle: 'Database Normalisation & Analytical Queries',
      type: 'database-design',
      domain: 'retail / SQL',
      status: 'complete',
      year: '2024',
      description: 'An enterprise schema refactoring project to minimize storage redundancy.',
      contrib1: 'Structured a 3NF database layout supporting 200,000 purchase logs.',
      contrib2: 'Wrote query pipelines using SQL CTEs and Window Functions.',
      contrib3: 'Designed retail performance boards with Tableau heatmaps.',
      tech: 'SQL Server, 3NF Design, Window Functions, CTEs, Tableau',
    },
    {
      title: 'Customer Segmentation & RFM Analysis',
      subtitle: 'Unsupervised Machine Learning & Segment Analysis',
      type: 'ml-analysis',
      domain: 'marketing / data-science',
      status: 'complete',
      year: '2023',
      description:
        'An analytical approach to segmenting retail store buyers using historical activity.',
      contrib1: 'Engineered cohort RFM scores from high-volume transactional audit files.',
      contrib2: 'Applied KMeans clustering, evaluating clusters via Elbow method.',
      contrib3: 'Profiled buyer segments for the marketing division.',
      tech: 'Python, Scikit-Learn, Pandas, KMeans Clustering, RFM Modeling, Seaborn',
    },
    {
      title: 'Cadet College Sports Analytics',
      subtitle: 'Historical Sports Records Modeling & Forecasting',
      type: 'sports-analytics',
      domain: 'education / sports',
      status: 'complete',
      year: '2023',
      description:
        "An athletic performance tracking dashboard consolidating Mirzapur Cadet College's historic scores.",
      contrib1: 'Consolidated, digitised, and normalised sports metrics over 10 years.',
      contrib2: 'Constructed predictive trends to project house standings.',
      contrib3: 'Configured an automated tracker using Excel VBA scripts.',
      tech: 'Python, Excel VBA, Matplotlib, Data Cleaning, Time Series',
    },
  ],
  research: [
    {
      title: 'JACSU Election 2025 — Voter Trend Analysis',
      subtitle: 'A Survey-Based Study of Student Political Inclinations at Jahangirnagar University',
      type: 'research-article',
      domain: 'political science / data science',
      status: 'published',
      year: '2025',
      authors: 'Mahfujul Kader Touhid',
      journal: 'Jahangirnagar University — Independent Research',
      abstract:
        "The Jahangirnagar University Central Students' Union (JUCSU) election is one of the most significant political events in Bangladesh. This study provides a comprehensive analysis of voter trends.",
      finding1:
        'Identified distinct political spectrum clusters among students.',
      finding2: 'Quality education and job creation ranked as top reform priorities.',
      finding3: 'Youth engagement has increased significantly post-July Revolution.',
      tags: 'Political Science, EDA, Python, Survey Analysis, Bangladesh',
      image2:
        'https://res.cloudinary.com/doonxbwcz/image/upload/v1783174710/Screenshot_2026-07-04_201755_cvxopt.png',
      img2label: 'Political Spectrum Distribution',
    },
  ],
};

/**
 * Fetch CMS content from Supabase, falling back to hardcoded data.
 * Called server-side in Next.js Server Components.
 */
export async function getCmsContent(): Promise<CmsContent> {
  try {
    const raw = await kvGet('touhid_content');
    if (!raw) return FALLBACK;
    const parsed: CmsContent = JSON.parse(raw);
    const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    const research = Array.isArray(parsed.research) ? parsed.research : [];
    return {
      ...parsed,
      projects: projects.length > 0 ? projects : FALLBACK.projects,
      research: research.length > 0 ? research : FALLBACK.research,
    };
  } catch {
    return FALLBACK;
  }
}
