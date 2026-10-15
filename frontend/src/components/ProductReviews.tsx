// Full review section rendered at the bottom of ProductPage.
// Handles: star summary, paginated list, write/edit form, delete.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import type { Review, ReviewSummary } from '../types';
import ReviewStars, { StarPicker } from './ReviewStars';
import './ProductReviews.css';

interface Props {
  productId: number;
}

const EMPTY_FORM = { rating: 0, headline: '', comment: '' };

export default function ProductReviews({ productId }: Props) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary]             = useState<ReviewSummary | null>(null);
  const [reviews, setReviews]             = useState<Review[]>([]);
  const [totalReviews, setTotalReviews]   = useState(0);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(1);
  const [loadingList, setLoadingList]     = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // My existing review (if any)
  const [myReview, setMyReview]           = useState<Review | null>(null);

  // Form state
  const [showForm, setShowForm]           = useState(false);
  const [editing, setEditing]             = useState(false);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [submitting, setSubmitting]       = useState(false);
  const [formError, setFormError]         = useState<string | null>(null);
  const [formSuccess, setFormSuccess]     = useState<string | null>(null);

  // ── Fetch summary ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingSummary(true);
    apiClient.getProductReviewSummary(productId)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoadingSummary(false));
  }, [productId]);

  // ── Fetch paginated reviews ────────────────────────────────────────────────
  const loadReviews = useCallback(() => {
    setLoadingList(true);
    apiClient.getProductReviews(productId, page, 8)
      .then(r => {
        setReviews(r.content);
        setTotalReviews(r.totalElements);
        setTotalPages(r.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, [productId, page]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  // ── Detect if the current user has already reviewed this product ───────────
  useEffect(() => {
    if (!isAuthenticated || !user) { setMyReview(null); return; }
    apiClient.getMyReviews(0, 100)
      .then(r => {
        const found = r.content.find(rv => rv.productId === productId) ?? null;
        setMyReview(found);
      })
      .catch(() => setMyReview(null));
  }, [isAuthenticated, user, productId]);

  // ── Submit (create or update) ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (form.rating === 0) { setFormError('Please select a star rating.'); return; }

    setSubmitting(true);
    try {
      if (editing && myReview) {
        const updated = await apiClient.updateReview(myReview.reviewId, form);
        setMyReview(updated);
        setFormSuccess('Review updated.');
      } else {
        const created = await apiClient.addReview(productId, form);
        setMyReview(created);
        setFormSuccess('Review submitted — thank you!');
      }
      setShowForm(false);
      setEditing(false);
      setForm(EMPTY_FORM);
      // Refresh list and summary
      loadReviews();
      apiClient.getProductReviewSummary(productId).then(setSummary).catch(() => {});
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setFormError(msg ?? 'Could not submit review. Make sure you have purchased this product.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete own review ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!myReview) return;
    if (!confirm('Delete your review?')) return;
    try {
      await apiClient.deleteReview(myReview.reviewId);
      setMyReview(null);
      setFormSuccess(null);
      loadReviews();
      apiClient.getProductReviewSummary(productId).then(setSummary).catch(() => {});
    } catch {
      setFormError('Could not delete review.');
    }
  };

  const startEdit = () => {
    if (!myReview) return;
    setForm({ rating: myReview.rating, headline: myReview.headline ?? '', comment: myReview.comment ?? '' });
    setEditing(true);
    setShowForm(true);
    setFormError(null);
    setFormSuccess(null);
  };

  const openWriteForm = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setEditing(false);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setFormError(null);
    setFormSuccess(null);
  };

  // ── Star distribution bar helper ──────────────────────────────────────────
  const barWidth = (star: number) => {
    if (!summary || summary.totalReviews === 0) return '0%';
    return `${((summary.starCounts[star] ?? 0) / summary.totalReviews) * 100}%`;
  };

  return (
    <section className="product-reviews" aria-labelledby="reviews-heading">
      <div className="product-reviews__header">
        <h2 id="reviews-heading" className="product-reviews__title">Customer Reviews</h2>
        {!myReview && (
          <button className="review-write-btn" onClick={openWriteForm}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Write a Review
          </button>
        )}
      </div>

      {/* ── Summary block ── */}
      {!loadingSummary && summary && (
        <div className="review-summary">
          <div className="review-summary__score">
            <span className="review-summary__avg">{summary.averageRating.toFixed(1)}</span>
            <ReviewStars rating={summary.averageRating} size={22} />
            <span className="review-summary__count">{summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}</span>
          </div>
          <div className="review-summary__bars">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="review-bar-row">
                <span className="review-bar-label">{star} ★</span>
                <div className="review-bar-track">
                  <div className="review-bar-fill" style={{ width: barWidth(star) }} />
                </div>
                <span className="review-bar-count">{summary.starCounts[star] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── My review banner ── */}
      {myReview && !showForm && (
        <div className="my-review-banner">
          <div className="my-review-banner__head">
            <ReviewStars rating={myReview.rating} size={16} />
            <span className="my-review-banner__label">Your review</span>
            {myReview.verifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
          </div>
          {myReview.headline && <p className="my-review-banner__headline">{myReview.headline}</p>}
          {myReview.comment  && <p className="my-review-banner__comment">{myReview.comment}</p>}
          <div className="my-review-banner__actions">
            <button className="review-action-btn" onClick={startEdit}>Edit</button>
            <button className="review-action-btn review-action-btn--danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

      {formSuccess && !showForm && (
        <p className="review-form-success">{formSuccess}</p>
      )}

      {/* ── Write / Edit form ── */}
      {showForm && (
        <form className="review-form" onSubmit={handleSubmit} noValidate>
          <h3 className="review-form__title">{editing ? 'Edit your review' : 'Write a review'}</h3>
          {formError && <p className="review-form-error" role="alert">{formError}</p>}

          <div className="review-form__field">
            <label className="review-form__label">Rating <span aria-hidden="true">*</span></label>
            <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>

          <div className="review-form__field">
            <label className="review-form__label" htmlFor="rv-headline">Headline</label>
            <input
              id="rv-headline"
              className="review-form__input"
              type="text"
              maxLength={120}
              placeholder="Summarise your experience"
              value={form.headline}
              onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
            />
          </div>

          <div className="review-form__field">
            <label className="review-form__label" htmlFor="rv-comment">Review</label>
            <textarea
              id="rv-comment"
              className="review-form__textarea"
              rows={4}
              placeholder="Tell others what you thought about this product…"
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            />
          </div>

          <div className="review-form__actions">
            <button type="submit" className="review-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting…' : editing ? 'Save Changes' : 'Submit Review'}
            </button>
            <button
              type="button"
              className="review-cancel-btn"
              onClick={() => { setShowForm(false); setEditing(false); setFormError(null); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Review list ── */}
      <div className="review-list" aria-live="polite">
        {loadingList && (
          <div className="review-list__skeleton">
            {[1, 2, 3].map(i => <div key={i} className="review-skeleton-card" />)}
          </div>
        )}

        {!loadingList && reviews.length === 0 && (
          <div className="review-list__empty">
            <span className="review-list__empty-icon">⭐</span>
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}

        {!loadingList && reviews.map(rv => (
          <article key={rv.reviewId} className="review-card">
            <div className="review-card__head">
              <div className="review-card__avatar">{rv.username.slice(0, 2).toUpperCase()}</div>
              <div className="review-card__meta">
                <span className="review-card__username">{rv.username}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ReviewStars rating={rv.rating} size={14} />
                  {rv.verifiedPurchase && <span className="verified-badge">✓ Verified</span>}
                </div>
              </div>
              <span className="review-card__date">
                {new Date(rv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {rv.headline && <p className="review-card__headline">{rv.headline}</p>}
            {rv.comment  && <p className="review-card__comment">{rv.comment}</p>}
          </article>
        ))}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="review-pagination">
          <button
            className="review-page-btn"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          <span className="review-page-info">Page {page + 1} of {totalPages}</span>
          <button
            className="review-page-btn"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {totalReviews > 0 && (
        <p className="review-total-note">{totalReviews} review{totalReviews !== 1 ? 's' : ''} total</p>
      )}
    </section>
  );
}
