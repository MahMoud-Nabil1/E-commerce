// Reusable star display. Can render filled/half/empty stars and an optional label.
interface ReviewStarsProps {
  rating: number;       // 0–5, supports decimals for averages
  max?: number;         // default 5
  size?: number;        // px, default 16
  showLabel?: boolean;  // show numeric label next to stars
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function ReviewStars({
  rating,
  max = 5,
  size = 16,
  showLabel = false,
  interactive = false,
  onRate,
}: ReviewStarsProps) {
  return (
    <span
      className="review-stars"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = rating >= i + 1;
        const half   = !filled && rating >= i + 0.5;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ cursor: interactive ? 'pointer' : 'default', flexShrink: 0 }}
            onClick={() => interactive && onRate?.(i + 1)}
          >
            <defs>
              <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? '#f59e0b' : half ? `url(#half-${i})` : '#d1d5db'}
              stroke={filled || half ? '#f59e0b' : '#d1d5db'}
              strokeWidth="1"
            />
          </svg>
        );
      })}
      {showLabel && (
        <span style={{ marginLeft: 4, fontSize: size * 0.875, fontWeight: 700, color: 'var(--on-surface)' }}>
          {rating % 1 === 0 ? rating : rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}

// Interactive star picker used inside the write-review form.
interface StarPickerProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

export function StarPicker({ value, onChange, size = 28 }: StarPickerProps) {
  return (
    <span style={{ display: 'inline-flex', gap: 4 }} role="group" aria-label="Select star rating">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer', flexShrink: 0, outline: 'none' }}
          onClick={() => onChange(star)}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(star)}
        >
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={star <= value ? '#f59e0b' : '#d1d5db'}
            stroke={star <= value ? '#f59e0b' : '#d1d5db'}
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  );
}
