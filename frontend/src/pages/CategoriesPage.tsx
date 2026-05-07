import { useEffect, useState } from 'react';
import './HomePage.css';

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/public/categories?pageNumber=0&pageSize=100');
        if (!response.ok) {
          throw new Error('Failed to load categories from server.');
        }

        const data = (await response.json()) as CategoryResponse;
        setCategories(data.content ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="home-page">
      <section className="home-section container">
        <div className="section-header">
          <div>
            <p className="section-overline">Categories</p>
            <h2 className="headline-lg">Shop by category</h2>
          </div>
          <div className="status-line">
            {loading && 'Loading categories…'}
            {error && <span className="status-error">{error}</span>}
            {!loading && !error && `${categories.length} categories loaded`}
          </div>
        </div>

        <div className="category-list">
          {categories.map((category) => (
            <span className="category-chip" key={category.categoryId}>
              {category.categoryName}
            </span>
          ))}
          {!loading && !error && categories.length === 0 && (
            <div className="empty-state">No categories available yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
