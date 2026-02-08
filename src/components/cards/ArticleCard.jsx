import PropTypes from 'prop-types';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MediaPlaceholder from '../shared/MediaPlaceholder';

export default function ArticleCard({ title, excerpt, image, description, date, readTime, badge, href, to, state, placeholder = null, className = '' }) {
  const Wrapper = to ? Link : href ? 'a' : 'div';
  const wrapperProps = to ? { to } : href ? { href } : {};

  const Card = (
    <article
      className={`group bg-white rounded-xl overflow-hidden border border-[#F3F5F9] shadow-sm h-full flex flex-col transform-gpu transition-transform duration-200 ease-out cursor-pointer hover:scale-[1.02] hover:shadow-xl-primary-500/30  ${className}`}
      aria-label={`Edit artikel: ${title}`}
    >
      <div className="relative">
        <div className="w-full aspect-[16/10] bg-gray-100 overflow-hidden">
          <div className="absolute inset-0">
            <MediaPlaceholder ratio="16/10" label="Tidak ada cover" className="h-full w-full rounded-none border-0 hover:scale-100 hover:shadow-none transition-none" />
          </div>
          {image ? (
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
        </div>
        {badge && <span className="absolute top-3 right-3 bg-[#E3EEFC] text-[#01319F] text-xs font-medium px-2 py-1 rounded-md leading-none">{badge}</span>}
      </div>

      <Wrapper {...wrapperProps} aria-label={title} className="p-4 flex-1 flex flex-col space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2">
        <h6 className="font-semibold text-neutral-800 leading-snug line-clamp-2">{title}</h6>
        {description && <p className="text-xs text-neutral-600 line-clamp-2">{description}</p>}
        {excerpt && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{excerpt}</p>}

        <div className="flex items-center gap-3 text-xs text-gray-500">
          {date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
          )}
          {readTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readTime}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <span className="w-full inline-flex items-center justify-center bg-[#F3F5F9] text-[#01319F] text-sm font-medium rounded-lg px-3 py-2 group">
            <span className="group-hover:underline">Baca selengkapnya</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </span>
        </div>
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

ArticleCard.propTypes = {
  title: PropTypes.string.isRequired,
  excerpt: PropTypes.string,
  image: PropTypes.string,
  date: PropTypes.string,
  readTime: PropTypes.string,
  badge: PropTypes.string,
  href: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};
