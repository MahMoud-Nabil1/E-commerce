import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { resolveProductImage } from '../lib/api';

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.quantity > 0;
  const imgSrc  = resolveProductImage(product);

  return (
    <Link
      to={`/products/${product.productId}`}
      className="block no-underline text-inherit"
      aria-label={`View ${product.productName}`}
    >
      <article className="group flex flex-col rounded-2xl bg-white border border-outline-variant shadow-sm overflow-hidden transition-all duration-250 h-full w-full hover:-translate-y-1 hover:shadow-lg hover:border-secondary">
        {/* Image area */}
        <div className="relative min-h-[130px] md:min-h-[170px] flex items-center justify-center bg-surface-container overflow-hidden w-full">
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 md:top-2.5 md:left-2.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-surface-container text-on-surface border border-outline-variant text-[0.65rem] md:text-[0.72rem] font-extrabold tracking-wider z-[1]" aria-label={`${product.discount}% off`}>
              -{product.discount}%
            </span>
          )}
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.productName}
              className="w-full h-[130px] md:h-[170px] object-contain p-2.5 md:p-4 transition-transform duration-400 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" width="40" height="40" className="text-on-surface-variant opacity-40">
              <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
              <circle cx="17" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 34l10-10 8 8 6-6 16 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Body */}
        <div className="p-3 pt-2.5 md:px-[18px] md:pb-[18px] md:pt-4 flex flex-col flex-1 gap-1.5 md:gap-2">
          <h3 className="text-[0.85rem] md:text-[0.95rem] font-bold text-on-surface m-0 leading-snug line-clamp-2">{product.productName}</h3>
          <p className="text-[0.75rem] md:text-[0.82rem] text-on-surface-variant leading-relaxed m-0 flex-1 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between gap-1.5 flex-wrap mt-auto pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[0.92rem] md:text-[1.05rem] font-extrabold text-on-surface">${product.specialPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <span className="text-[0.7rem] md:text-[0.8rem] text-on-surface-variant line-through">${product.price.toFixed(2)}</span>
              )}
            </div>
            <span className={inStock
              ? 'text-[0.65rem] md:text-[0.72rem] font-bold text-green-800 bg-green-100 px-1.5 md:px-[7px] py-0.5 rounded-full whitespace-nowrap'
              : 'text-[0.65rem] md:text-[0.72rem] font-bold text-on-error-container bg-error-container px-1.5 md:px-[7px] py-0.5 rounded-full whitespace-nowrap'
            }>
              {inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
