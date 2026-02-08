import React from 'react';
import { Image as ImageIcon, Camera } from 'lucide-react';

const FrameIcon = ({ className = '' }) => (
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path
      d="m 4 1 c -1.644531 0 -3 1.355469 -3 3 v 1 h 1 v -1 c 0 -1.109375 0.890625 -2 2 -2 h 1 v -1 z m 2 0 v 1 h 4 v -1 z m 5 0 v 1 h 1 c 1.109375 0 2 0.890625 2 2 v 1 h 1 v -1 c 0 -1.644531 -1.355469 -3 -3 -3 z m -5 4 c -0.550781 0 -1 0.449219 -1 1 s 0.449219 1 1 1 s 1 -0.449219 1 -1 s -0.449219 -1 -1 -1 z m -5 1 v 4 h 1 v -4 z m 13 0 v 4 h 1 v -4 z m -4.5 2 l -2 2 l -1.5 -1 l -2 2 v 0.5 c 0 0.5 0.5 0.5 0.5 0.5 h 7 s 0.472656 -0.035156 0.5 -0.5 v -1 z m -8.5 3 v 1 c 0 1.644531 1.355469 3 3 3 h 1 v -1 h -1 c -1.109375 0 -2 -0.890625 -2 -2 v -1 z m 13 0 v 1 c 0 1.109375 -0.890625 2 -2 2 h -1 v 1 h 1 c 1.644531 0 3 -1.355469 3 -3 v -1 z m -8 3 v 1 h 4 v -1 z m 0 0"
      fill="currentColor"
      fillOpacity="0.55"
    />
  </svg>
);

const MediaPlaceholder = ({
  ratio = '16/9', // '16/9' | '4/3' | '1/1' | '3/2'
  label = '',
  icon = 'frame', // 'frame' | 'image' | 'camera'
  className = '',
}) => {
  const aspect = ratio === '1/1' ? 'aspect-square' : ratio === '4/3' ? 'aspect-[4/3]' : ratio === '3/2' ? 'aspect-[3/2]' : 'aspect-[16/9]';

  const Icon = icon === 'camera' ? Camera : icon === 'image' ? ImageIcon : FrameIcon;

  return (
    <div className={['relative overflow-hidden bg-gray-100 text-gray-500', aspect, className].join(' ')} aria-label={label || 'Tidak ada gambar'}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon className="w-6 h-6" />
        {label ? <span className="mt-2 text-xs font-medium text-gray-600">{label}</span> : null}
      </div>
    </div>
  );
};

export default MediaPlaceholder;
