import { useEffect, useState } from 'react';
import { Images, ImageOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from './ui/carousel';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from './ui/empty';
import { WatchPhoto } from './WatchPhoto';

export function WatchCarousel({ images, model }: { images: string[]; model: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    update(); api.on('select', update); api.on('reInit', update);
    return () => { api.off('select', update); api.off('reInit', update); };
  }, [api]);

  if (!images.length) return <div className="detail-gallery-empty"><Empty><EmptyHeader>
    <EmptyMedia variant="icon"><ImageOff/></EmptyMedia>
    <EmptyTitle>Um olhar mais de perto, em breve.</EmptyTitle>
    <EmptyDescription>As fotos deste modelo ainda não foram adicionadas. Você já pode consultar suas informações.</EmptyDescription>
  </EmptyHeader></Empty></div>;

  return <div className="detail-gallery">
    <Carousel setApi={setApi} opts={{ align: 'start', duration: reducedMotion ? 0 : 25 }} aria-label={`Fotos de ${model}`} tabIndex={0}>
      <CarouselContent className="ml-0">
        {images.map((src, index) => <CarouselItem key={src} className="pl-0" aria-label={`${index + 1} de ${images.length}`} aria-hidden={selected !== index}>
          <div className="detail-gallery-stage"><WatchPhoto src={src} alt={`${model} — foto ${index + 1} do anúncio`} eager={index === 0}/></div>
        </CarouselItem>)}
      </CarouselContent>
      <div className="detail-gallery-toolbar">
        <span className="detail-gallery-label"><Images size={15}/>Fotos do anúncio</span>
        <div className="detail-gallery-controls">
          <span className="detail-gallery-count" aria-live="polite" aria-atomic="true">{String(selected + 1).padStart(2, '0')} <span>/ {String(images.length).padStart(2, '0')}</span></span>
          {images.length > 1 && <><CarouselPrevious className="static inset-auto size-11 translate-x-0 translate-y-0"/><CarouselNext className="static inset-auto size-11 translate-x-0 translate-y-0"/></>}
        </div>
      </div>
      {images.length > 1 && <div className="detail-thumbnails" role="group" aria-label="Escolher foto">
        {images.map((src, index) => <button type="button" key={src} className={cn('detail-thumbnail', selected === index && 'is-selected')}
          aria-label={`Ver foto ${index + 1} de ${model}`} aria-current={selected === index ? 'true' : undefined}
          onClick={() => api?.scrollTo(index, reducedMotion)}><WatchPhoto src={src} alt=""/></button>)}
      </div>}
    </Carousel>
    <p className="detail-gallery-note">Imagens do vendedor. A galeria pode mostrar variações do modelo.</p>
  </div>;
}
