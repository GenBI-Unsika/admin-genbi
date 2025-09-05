import MediaCard from './MediaCard';

export default function EventCard(props) {
  return <MediaCard gradientClass="from-[var(--primary-500)] to-[var(--primary-400)]" subtitleWordsLimit={10} {...props} />;
}
