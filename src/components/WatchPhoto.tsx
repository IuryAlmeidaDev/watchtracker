import { useState } from 'react';
import { ImageOff, Watch } from 'lucide-react';

export function WatchPhoto({ src, alt, eager = false }: { src?: string; alt: string; eager?: boolean }) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) {
    const Icon = src ? ImageOff : Watch;
    return <span className="detail-photo-placeholder"><Icon strokeWidth={1.1} aria-hidden="true"/><span>{src ? 'Foto indisponível' : 'Foto em breve'}</span></span>;
  }
  return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} onError={() => setFailedSource(src)}/>;
}
