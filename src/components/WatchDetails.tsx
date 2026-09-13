import { ArrowUpRight, X, Info, ScanLine } from 'lucide-react';
import type { WatchItem } from '../store/catalogStore';
import { getWatchDetails, safeStoreUrl } from '../lib/watch-details';
import { Button, buttonVariants } from './ui/button';
import { cn } from '../lib/utils';
import { Separator } from './ui/separator';
import { WatchCarousel } from './WatchCarousel';
import { watchTags } from '../lib/watch-tags';
import { Badge } from './ui/badge';

export function WatchDetails({ watch, onClose }: { watch: WatchItem; onClose: () => void }) {
  const { images, facts } = getWatchDetails(watch);
  const url = safeStoreUrl(watch.storeUrl);
  return <div className="watch-details" data-testid={`details-${watch.id}`}>
    <Separator/>
    <div className="details-grid">
      <WatchCarousel images={images} model={watch.model}/>
      <section className="technical-details" aria-labelledby={`spec-title-${watch.id}`}>
        <div className="details-heading"><ScanLine size={19} aria-hidden="true"/><h4 id={`spec-title-${watch.id}`}>Cada detalhe conta.</h4></div>
        <p className="details-description">{watch.specs}</p>
        <div className="watch-tags">{watchTags(watch).map(tag=><Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
        <dl className="technical-grid">{Object.entries(facts).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <div className="purchase-detail">
          <span className="detail-price-label">Valor estimado</span>
          <p className="detail-price">{watch.priceEstimate}</p>
          <p className="detail-price-note"><Info size={14}/>O preço final pode incluir frete e impostos.</p>
          {url ? <a href={url} target="_blank" rel="noopener noreferrer" data-slot="button" className={cn(buttonVariants(), 'h-11 px-4')}>
            Abrir anúncio na {watch.storeName ?? 'loja'}<ArrowUpRight data-icon="inline-end"/>
          </a> : <p className="detail-pending-link">O link do anúncio ainda não foi adicionado.</p>}
        </div>
      </section>
    </div>
    <div className="details-bottom"><span>Seu próximo relógio começa nos detalhes.</span><Button variant="ghost" className="h-11" onClick={onClose}><X data-icon="inline-start"/>Fechar detalhes</Button></div>
  </div>;
}
