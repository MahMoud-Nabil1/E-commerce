// Full review section rendered at the bottom of ProductPage.
// Handles: star summary, paginated list, write/edit form, delete.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import type { Review, ReviewSummary } from '../types';
import ReviewStars, { StarPicker } from './ReviewStars';

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
    <section className="border-t border-outline-variant pt-12 mt-14" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h2 id="reviews-heading" className="text-2xl font-extrabold text-on-surface m-0">Customer Reviews</h2>
        {!myReview && (
          <button className="inline-flex items-center gap-[7px] px-[18px] py-[9px] rounded-[10px] border-[1.5px] border-secondary bg-transparent text-secondary font-bold text-sm cursor-pointer hover:bg-secondary hover:text-on-secondary transition-colors" onClick={openWriteForm}>
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
        <div className="flex flex-col md:flex-row gap-5 md:gap-10 items-start p-4 md:p-6 bg-surface-low rounded-2xl border border-outline-variant mb-8">
          <div className="flex flex-col items-center gap-1 mx-auto md:mx-0">
            <span className="text-5xl font-extrabold text-on-surface leading-none">{summary.averageRating.toFixed(1)}</span>
            <ReviewStars rating={summary.averageRating} size={22} />
            <span className="text-sm text-on-surface-variant">{summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 w-full md:min-w-[200px]">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-on-surface-variant w-10 text-right">{star} ★</span>
                <div className="flex-1 h-2 bg-outline-variant rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-[width] duration-400" style={{ width: barWidth(star) }} />
                </div>
                <span className="text-sm text-on-surface-variant w-8">{summary.starCounts[star] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── My review banner ── */}
      {myReview && !showForm && (
        <div className="p-5 bg-amber-50 border-[1.5px] border-amber-300 rounded-[14px] mb-7 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ReviewStars rating={myReview.rating} size={16} />
            <span className="text-[0.78rem] font-bold text-amber-800">Your review</span>
            {myReview.verifiedPurchase && <span className="text-[0.72rem] font-bold text-green-800 bg-green-100 px-[7px] py-0.5 rounded-full inline-block">✓ Verified Purchase</span>}
          </div>
          {myReview.headline && <p className="text-[0.95rem] font-bold text-on-surface m-0">{myReview.headline}</p>}
          {myReview.comment  && <p className="text-sm text-on-surface-variant m-0 leading-relaxed">{myReview.comment}</p>}
          <div className="flex gap-2 mt-1">
            <button className="px-3 py-1 rounded-lg border border-outline-variant bg-transparent text-sm font-semibold text-on-surface cursor-pointer hover:bg-surface-container transition-colors" onClick={startEdit}>Edit</button>
            <button className="px-3 py-1 rounded-lg border border-error bg-transparent text-sm font-semibold text-error cursor-pointer hover:bg-error-container transition-colors" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

      {formSuccess && !showForm && (
        <p className="text-green-700 text-sm font-semibold bg-green-100 px-3 py-2 rounded-lg mb-4">{formSuccess}</p>
      )}

      {/* ── Write / Edit form ── */}
      {showForm && (
        <form className="bg-white border-[1.5px] border-outline-variant rounded-2xl p-7 mb-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <h3 className="text-lg font-bold text-on-surface m-0">{editing ? 'Edit your review' : 'Write a review'}</h3>
          {formError && <p className="text-error text-sm font-semibold bg-error-container px-3 py-2 rounded-lg m-0" role="alert">{formError}</p>}

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-on-surface-variant">Rating <span aria-hidden="true">*</span></label>
            <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-on-surface-variant" htmlFor="rv-headline">Headline</label>
            <input
              id="rv-headline"
              className="px-[14px] py-[11px] border-[1.5px] border-outline-variant rounded-[10px] bg-surface-low text-on-surface font-sans text-[0.95rem] outline-none focus:border-secondary transition-colors"
              type="text"
              maxLength={120}
              placeholder="Summarise your experience"
              value={form.headline}
              onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-on-surface-variant" htmlFor="rv-comment">Review</label>
            <textarea
              id="rv-comment"
              className="px-[14px] py-[11px] border-[1.5px] border-outline-variant rounded-[10px] bg-surface-low text-on-surface font-sans text-[0.95rem] outline-none focus:border-secondary transition-colors resize-y"
              rows={4}
              placeholder="Tell others what you thought about this product…"
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button type="submit" className="px-6 py-[11px] rounded-[10px] border-none bg-secondary text-on-secondary font-bold text-[0.9rem] cursor-pointer hover:bg-secondary-container disabled:opacity-60 disabled:cursor-not-allowed transition-colors" disabled={submitting}>
              {submitting ? 'Submitting…' : editing ? 'Save Changes' : 'Submit Review'}
            </button>
            <button
              type="button"
              className="px-6 py-[11px] rounded-[10px] border border-outline-variant bg-transparent text-on-surface font-bold text-[0.9rem] cursor-pointer hover:bg-surface-container transition-colors"
              onClick={() => { setShowForm(false); setEditing(false); setFormError(null); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Review list ── */}
      <div className="flex flex-col gap-4 mt-6" aria-live="polite">
        {loadingList && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-container rounded-[14px] animate-pulse" />)}
          </div>
        )}

        {!loadingList && reviews.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-on-surface-variant text-center">
            <span className="text-3xl">⭐</span>
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}

        {!loadingList && reviews.map(rv => (
          <article key={rv.reviewId} className="p-4 md:p-5 bg-white border border-outline-variant rounded-[14px] flex flex-col gap-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary text-xs font-extrabold flex items-center justify-center shrink-0">{rv.username.slice(0, 2).toUpperCase()}</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">{rv.username}</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ReviewStars rating={rv.rating} size={14} />
                    {rv.verifiedPurchase && <span className="text-[0.72rem] font-bold text-green-800 bg-green-100 px-[7px] py-0.5 rounded-full inline-block">✓ Verified</span>}
                  </div>
                </div>
              </div>
              <span className="text-[0.78rem] text-on-surface-variant shrink-0">
                {new Date(rv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {rv.headline && <p className="text-[0.95rem] font-bold text-on-surface m-0">{rv.headline}</p>}
            {rv.comment  && <p className="text-sm text-on-surface-variant m-0 leading-relaxed">{rv.comment}</p>}
          </article>
        ))}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            className="px-4 py-2 rounded-[10px] border border-outline-variant bg-white text-sm font-semibold text-on-surface cursor-pointer hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          <span className="text-sm text-on-surface-variant">Page {page + 1} of {totalPages}</span>
          <button
            className="px-4 py-2 rounded-[10px] border border-outline-variant bg-white text-sm font-semibold text-on-surface cursor-pointer hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {totalReviews > 0 && (
        <p className="text-sm text-on-surface-variant text-center mt-3">{totalReviews} review{totalReviews !== 1 ? 's' : ''} total</p>
      )}
    </section>
  );
}
