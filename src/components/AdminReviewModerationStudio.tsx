'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ReviewItem, DEFAULT_REVIEWS } from '../data/defaultReviews';

export interface AdminReviewModerationStudioProps {
  showToast: (msg: string) => void;
  playPopSound: (freq?: number) => void;
}

export function AdminReviewModerationStudio({
  showToast,
  playPopSound,
}: AdminReviewModerationStudioProps) {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(DEFAULT_REVIEWS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // New Official Review Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newReviewName, setNewReviewName] = useState<string>('');
  const [newReviewService, setNewReviewService] = useState<string>('CapCut Pro (1-Year Unlimited)');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [isSubmittingNew, setIsSubmittingNew] = useState<boolean>(false);

  const getAdminHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('saqib_admin_token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reviews?all=true', {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.reviews)) {
        setReviewsList(data.reviews);
      }
    } catch {
      showToast('Network error loading reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Counts by status
  const counts = useMemo(() => {
    const p = reviewsList.filter((r) => r.status === 'pending').length;
    const a = reviewsList.filter((r) => !r.status || r.status === 'approved').length;
    const r = reviewsList.filter((r) => r.status === 'rejected').length;
    return { pending: p, approved: a, rejected: r, total: reviewsList.length };
  }, [reviewsList]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviewsList.filter((r) => {
      const matchesStatus =
        activeStatusTab === 'all'
          ? true
          : activeStatusTab === 'approved'
          ? !r.status || r.status === 'approved'
          : r.status === activeStatusTab;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.service && r.service.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [reviewsList, activeStatusTab, searchQuery]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionInProgressId(id);
    playPopSound(status === 'approved' ? 880 : 440);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ id, status, verified: status === 'approved' }),
      });
      const data = await res.json();
      if (data && data.success) {
        setReviewsList((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status, verified: status === 'approved' }
              : r
          )
        );
        showToast(
          status === 'approved'
            ? '✅ Review approved & published live!'
            : '❌ Review marked as rejected/spam.'
        );
      } else {
        showToast(data.error || 'Failed to update review status');
      }
    } catch {
      showToast('Network error updating review');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) {
      return;
    }
    setActionInProgressId(id);
    playPopSound(340);
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data && data.success) {
        setReviewsList((prev) => prev.filter((r) => r.id !== id));
        showToast('🗑️ Review deleted permanently.');
      } else {
        showToast(data.error || 'Failed to delete review');
      }
    } catch {
      showToast('Network error deleting review');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleCreateOfficialReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      showToast('Please provide client name and review comment');
      return;
    }
    setIsSubmittingNew(true);
    playPopSound(720);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: newReviewName.trim(),
          service: newReviewService.trim(),
          rating: newReviewRating,
          comment: newReviewComment.trim(),
          status: 'approved',
          verified: true,
        }),
      });
      const data = await res.json();
      if (data && data.success && data.review) {
        setReviewsList((prev) => [data.review, ...prev]);
        setShowAddModal(false);
        setNewReviewName('');
        setNewReviewComment('');
        showToast('⭐ Official verified review published directly!');
      } else {
        showToast(data.error || 'Failed to publish review');
      }
    } catch {
      showToast('Network error publishing review');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border border-indigo-500/20 shadow-xl">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <i className="fa-solid fa-shield-halved"></i>
              <span>REVIEWS MODERATION WORKFLOW</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Customer Feedback & Moderation Studio
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Public reviews stay in <span className="text-amber-400 font-bold">Pending Approval</span> until you verify them. Once approved, they instantly appear on the live storefront marquee!
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={fetchReviews}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <i className={`fa-solid fa-arrows-rotate ${isLoading ? 'animate-spin' : ''}`}></i>
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Official Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveStatusTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeStatusTab === 'pending'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-clock"></i>
            <span>Pending Approval</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px]">
              {counts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('approved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeStatusTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-circle-check"></i>
            <span>Approved &amp; Live</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px]">
              {counts.approved}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('rejected')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeStatusTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-ban"></i>
            <span>Rejected / Spam</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px]">
              {counts.rejected}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeStatusTab === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Reviews</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px]">
              {counts.total}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews or clients..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-pink-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Reviews Cards Grid */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            <i className="fa-solid fa-comment-slash"></i>
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">
            No reviews found in this category
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeStatusTab === 'pending'
              ? 'All clear! There are currently no customer reviews waiting for approval.'
              : 'Try changing your search term or status filter above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => {
            const isPending = rev.status === 'pending';
            const isApproved = !rev.status || rev.status === 'approved';
            const isRejected = rev.status === 'rejected';

            const ratingCount = Math.max(1, Math.min(5, Number(rev.rating) || 5));
            const stars = '★'.repeat(ratingCount);

            const initials =
              (rev.name || 'VC')
                .split(' ')
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'VC';

            return (
              <div
                key={rev.id}
                className={`bg-white rounded-2xl p-5 border flex flex-col justify-between space-y-4 shadow-xs transition hover:shadow-md ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Rating + Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm tracking-wider font-black">
                      {stars}
                    </span>
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1 border border-amber-200">
                        <i className="fa-solid fa-clock text-[9px] animate-pulse"></i>
                        Pending Approval
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200">
                        <i className="fa-solid fa-circle-check text-[9px]"></i>
                        Approved &amp; Live
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold flex items-center gap-1 border border-rose-200">
                        <i className="fa-solid fa-ban text-[9px]"></i>
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Card Footer: Reviewer Info + Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {rev.name}
                      </div>
                      <div className="text-[10px] font-bold text-pink-600 truncate">
                        {rev.service || 'Digital Service'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'approved')}
                          disabled={actionInProgressId === rev.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-1 transition cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <i className="fa-solid fa-check"></i>
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                          disabled={actionInProgressId === rev.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-rose-600 font-extrabold flex items-center justify-center gap-1 transition cursor-pointer border border-rose-200 disabled:opacity-50"
                        >
                          <i className="fa-solid fa-xmark"></i>
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                          disabled={actionInProgressId === rev.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-amber-700 font-bold flex items-center justify-center gap-1 transition cursor-pointer border border-slate-200"
                        >
                          <i className="fa-solid fa-pause"></i>
                          <span>Unpublish</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rev.id)}
                          disabled={actionInProgressId === rev.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center justify-center gap-1 transition cursor-pointer border border-rose-200"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                          <span>Delete</span>
                        </button>
                      </>
                    )}

                    {isRejected && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'approved')}
                          disabled={actionInProgressId === rev.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
                        >
                          <i className="fa-solid fa-rotate-left"></i>
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rev.id)}
                          disabled={actionInProgressId === rev.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center justify-center gap-1 transition cursor-pointer border border-rose-200"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Official Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-pink-100 space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-extrabold">
                <i className="fa-solid fa-award"></i> ADMIN VERIFIED CREATION
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Publish Official Testimonial
              </h3>
              <p className="text-xs text-slate-500">
                This review will be published directly as <span className="text-emerald-600 font-bold">Approved &amp; Live</span> on the storefront ticker.
              </p>
            </div>

            <form onSubmit={handleCreateOfficialReview} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Client Name &amp; City:
                </label>
                <input
                  type="text"
                  required
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  placeholder="e.g. Asad Malik (Karachi)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Service / Tool Purchased:
                </label>
                <input
                  type="text"
                  required
                  value={newReviewService}
                  onChange={(e) => setNewReviewService(e.target.value)}
                  placeholder="e.g. CapCut Pro (1-Year Unlimited)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Rating:
                </label>
                <div className="flex items-center gap-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        newReviewRating === star
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{star}</span>
                      <span>★</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Client Review Feedback:
                </label>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Detailed customer feedback..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md hover:scale-105 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingNew ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      <span>Publish Testimonial</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviewModerationStudio;
