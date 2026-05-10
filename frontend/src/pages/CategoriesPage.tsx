import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoriesPage.css';

interface Category {
  categoryId: number;
  categoryName: string;
}

interface CategoryResponse {
  content: Category[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

// ── Category visual config ──────────────────────────────────────────────────
// Maps keywords in a category name to a gradient + SVG icon.
// Falls back to a generic "tag" icon if nothing matches.

interface CategoryVisual {
  gradient: string;
  icon: React.ReactNode;
}

function getCategoryVisual(name: string): CategoryVisual {
  const n = name.toLowerCase();

  if (n.includes('laptop') || n.includes('computer') || n.includes('pc')) {
    return {
      gradient: 'linear-gradient(135deg, #1a2b4c 0%, #264dd9 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="8" y="12" width="48" height="32" rx="4" stroke="white" strokeWidth="3" />
          <rect x="14" y="18" width="36" height="20" rx="2" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" />
          <path d="M4 44h56l-4 8H8l-4-8z" stroke="white" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="32" cy="47" r="2" fill="white" />
        </svg>
      ),
    };
  }

  if (n.includes('phone') || n.includes('mobile') || n.includes('smartphone')) {
    return {
      gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="18" y="6" width="28" height="52" rx="6" stroke="white" strokeWidth="3" />
          <rect x="22" y="12" width="20" height="34" rx="2" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" />
          <circle cx="32" cy="52" r="3" fill="white" />
          <line x1="28" y1="9" x2="36" y2="9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    };
  }

  if (n.includes('audio') || n.includes('headphone') || n.includes('speaker') || n.includes('sound')) {
    return {
      gradient: 'linear-gradient(135deg, #4a1942 0%, #c94b4b 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M12 32C12 20.954 21.954 12 32 12s20 8.954 20 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <rect x="8" y="30" width="10" height="16" rx="5" stroke="white" strokeWidth="3" />
          <rect x="46" y="30" width="10" height="16" rx="5" stroke="white" strokeWidth="3" />
          <path d="M18 46v4a14 14 0 0028 0v-4" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    };
  }

  if (n.includes('camera') || n.includes('photo') || n.includes('lens')) {
    return {
      gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="6" y="18" width="52" height="36" rx="6" stroke="white" strokeWidth="3" />
          <circle cx="32" cy="36" r="10" stroke="white" strokeWidth="3" />
          <circle cx="32" cy="36" r="5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2" />
          <path d="M22 18l4-8h12l4 8" stroke="white" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="50" cy="26" r="3" fill="white" />
        </svg>
      ),
    };
  }

  if (n.includes('tv') || n.includes('television') || n.includes('display') || n.includes('monitor') || n.includes('screen')) {
    return {
      gradient: 'linear-gradient(135deg, #0d0d0d 0%, #434343 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="6" y="10" width="52" height="36" rx="4" stroke="white" strokeWidth="3" />
          <rect x="12" y="16" width="40" height="24" rx="2" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" />
          <path d="M24 46l-4 8M40 46l4 8M20 54h24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    };
  }

  if (n.includes('gaming') || n.includes('game') || n.includes('console') || n.includes('xbox') || n.includes('playstation')) {
    return {
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="8" y="20" width="48" height="28" rx="14" stroke="white" strokeWidth="3" />
          <line x1="20" y1="34" x2="28" y2="34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="30" x2="24" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="30" r="2.5" fill="white" />
          <circle cx="46" cy="34" r="2.5" fill="white" />
          <circle cx="40" cy="38" r="2.5" fill="white" />
          <circle cx="34" cy="34" r="2.5" fill="white" />
        </svg>
      ),
    };
  }

  if (n.includes('watch') || n.includes('wearable') || n.includes('fitness')) {
    return {
      gradient: 'linear-gradient(135deg, #1d4350 0%, #a43931 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="20" y="16" width="24" height="32" rx="8" stroke="white" strokeWidth="3" />
          <rect x="24" y="20" width="16" height="24" rx="4" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" />
          <path d="M26 10l-2-6M38 10l2-6M26 54l-2 6M38 54l2 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="26" x2="32" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="32" x2="36" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    };
  }

  if (n.includes('tablet') || n.includes('ipad')) {
    return {
      gradient: 'linear-gradient(135deg, #005c97 0%, #363795 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="12" y="6" width="40" height="52" rx="6" stroke="white" strokeWidth="3" />
          <rect x="18" y="12" width="28" height="36" rx="2" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" />
          <circle cx="32" cy="53" r="2.5" fill="white" />
        </svg>
      ),
    };
  }

  if (n.includes('accessory') || n.includes('accessories') || n.includes('cable') || n.includes('charger')) {
    return {
      gradient: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M20 8v12M28 8v12" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 20h20v8a10 10 0 01-20 0v-8z" stroke="white" strokeWidth="3" strokeLinejoin="round" />
          <line x1="26" y1="36" x2="26" y2="56" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 56h12" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    };
  }

  if (n.includes('home') || n.includes('smart home') || n.includes('appliance')) {
    return {
      gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M8 28L32 8l24 20" stroke="white" strokeWidth="3" strokeLinejoin="round" />
          <path d="M14 28v28h36V28" stroke="white" strokeWidth="3" strokeLinejoin="round" />
          <rect x="26" y="40" width="12" height="16" rx="2" stroke="white" strokeWidth="2.5" />
          <rect x="18" y="32" width="8" height="8" rx="1" stroke="white" strokeWidth="2" />
          <rect x="38" y="32" width="8" height="8" rx="1" stroke="white" strokeWidth="2" />
        </svg>
      ),
    };
  }

  if (n.includes('network') || n.includes('router') || n.includes('wifi') || n.includes('internet')) {
    return {
      gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      icon: (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M8 24C16 16 48 16 56 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 32c8-8 24-8 32 0" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 40c4-4 12-4 16 0" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="48" r="4" fill="white" />
        </svg>
      ),
    };
  }

  // ── Default fallback ──
  return {
    gradient: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="20" height="20" rx="4" stroke="white" strokeWidth="3" />
        <rect x="36" y="8" width="20" height="20" rx="4" stroke="white" strokeWidth="3" />
        <rect x="8" y="36" width="20" height="20" rx="4" stroke="white" strokeWidth="3" />
        <rect x="36" y="36" width="20" height="20" rx="4" stroke="white" strokeWidth="3" />
      </svg>
    ),
  };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/public/categories?pageNumber=0&pageSize=100');
        if (!res.ok) throw new Error('Failed to load categories.');
        const data = (await res.json()) as CategoryResponse;
        setCategories(data.content ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  function handleCategoryClick(categoryName: string) {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  }

  return (
    <div className="categories-page">
      {/* Hero */}
      <div className="categories-hero">
        <div className="container">
          <p className="section-overline">Browse</p>
          <h1 className="headline-lg">Shop by Category</h1>
          {!loading && !error && categories.length > 0 && (
            <p className="categories-hero__sub">{categories.length} categories available</p>
          )}
        </div>
      </div>

      <div className="container categories-content">
        {/* Loading skeletons */}
        {loading && (
          <div className="categories-grid" aria-busy="true" aria-label="Loading categories">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="category-card-skeleton" aria-hidden="true" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="categories-error" role="alert">
            <p className="status-error">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && categories.length === 0 && (
          <div className="empty-state" role="status">
            No categories available yet.
          </div>
        )}

        {/* Grid */}
        {!loading && !error && categories.length > 0 && (
          <div className="categories-grid" role="list">
            {categories.map((cat) => {
              const visual = getCategoryVisual(cat.categoryName);
              return (
                <button
                  key={cat.categoryId}
                  type="button"
                  className="category-card"
                  role="listitem"
                  onClick={() => handleCategoryClick(cat.categoryName)}
                  aria-label={`Browse ${cat.categoryName}`}
                  style={{ '--cat-gradient': visual.gradient } as React.CSSProperties}
                >
                  <div className="category-card__icon-wrap">
                    {visual.icon}
                  </div>
                  <span className="category-card__name">{cat.categoryName}</span>
                  <span className="category-card__cta">
                    Shop now
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
