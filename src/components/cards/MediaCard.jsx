import PropTypes from 'prop-types';
import { Calendar } from 'lucide-react';
import { formatDateID, limitWords } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const ImageWithFallback = ({ src, alt, className, fallback }) => {
  const onError = (e) => {
    e.currentTarget.src = fallback || 'https://placehold.co/800x450';
  };
  return <img src={src || fallback || 'https://placehold.co/800x450'} alt={alt} className={className} loading="lazy" decoding="async" onError={onError} />;
};

export default function MediaCard({ title, subtitle, image, description, category, date, href, to, state, gradientClass = 'from-[var(--primary-500)] to-[var(--primary-400)]', subtitleWordsLimit = 10, badge, className = '' }) {
  const Wrapper = to ? Link : href ? 'a' : 'div';
  const wrapperProps = to ? { to } : href ? { href } : {};

  const Card = (
    <article
      className={`group bg-white rounded-xl overflow-hidden border border-[#F3F5F9] shadow-sm h-full flex flex-col transform-gpu transition-transform duration-200 ease-out cursor-pointer hover:scale-[1.02] hover:shadow-xl-primary-500/30 ${className}`}
      aria-label={`Edit aktivitas: ${title}`}
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        <ImageWithFallback src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transform-none" />
        {badge && <span className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">{badge}</span>}
      </div>

      <Wrapper
        {...wrapperProps}
        aria-label={title}
        className={`p-4 bg-gradient-to-r ${gradientClass} text-white rounded-b-xl flex-1 flex flex-col space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2`}
      >
        <div>
          {category && <span className="inline-flex w-fit items-center bg-white/15 text-white text-[11px] leading-none px-2 py-0.5 rounded-full mb-2 border border-white/25">{category}</span>}
          <h6 className="font-semibold text-white leading-snug">{title}</h6>
          {description && <p className="text-xs mt-2 text-white/80 line-clamp-2">{description}</p>}
          {subtitle && (
            <p className="text-sm text-white/85" title={subtitle}>
              {limitWords(subtitle, subtitleWordsLimit)}
            </p>
          )}
        </div>

        {date && (
          <div className="mt-auto pt-2 flex items-center gap-2 text-xs text-white/85">
            <Calendar className="w-4 h-4 opacity-90" aria-hidden="true" />
            <time dateTime={date}>{formatDateID(date)}</time>
          </div>
        )}
      </Wrapper>
    </article>
  );

  return to ? (
    <Link to={to} state={state} className="block focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)]">
      {Card}
    </Link>
  ) : (
    Card
  );
}

MediaCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  category: PropTypes.string,
  date: PropTypes.string,
  href: PropTypes.string,
  to: PropTypes.string,
  gradientClass: PropTypes.string,
  subtitleWordsLimit: PropTypes.number,
  badge: PropTypes.string,
  className: PropTypes.string,
};
