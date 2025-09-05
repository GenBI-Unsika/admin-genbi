import MediaCard from './MediaCard';

export default function ProkerCard(props) {
  return <MediaCard gradientClass="from-[var(--primary-600)] to-[var(--primary-500)]" subtitleWordsLimit={10} {...props} />;
}
