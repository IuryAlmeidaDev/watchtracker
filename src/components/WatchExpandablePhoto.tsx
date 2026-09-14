import { useRef, type ReactNode } from 'react';
import { useWatchExpansion } from '../store/appearanceStore';
import type { WatchItem } from '../store/catalogStore';
import { getWatchDetails } from '../lib/watch-details';
import { Dialog, DialogTrigger } from './ui/dialog';
import { WatchPhoto } from './WatchPhoto';
import { WatchDialogContent } from './WatchDialogContent';

export function WatchExpandablePhoto({ watch, children, onClosed }: { watch: WatchItem; children?: ReactNode; onClosed?: () => void }) {
  const { open, setOpen } = useWatchExpansion(watch.id);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); };
  return <Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={isOpen => { if (!isOpen) onClosed?.(); }}>
    <DialogTrigger ref={trigger} className="catalog-detail-trigger" aria-label={`${open ? 'Recolher' : 'Expandir'} ${watch.model}`}>
      <span className="catalog-photo-wrap"><WatchPhoto src={getWatchDetails(watch).images[0]} alt={`${watch.brand} ${watch.model}`}/></span>
      <span className="catalog-summary"><span className="brand">{watch.brand}</span><span className="catalog-model">{watch.model}</span><span className="catalog-price">{watch.priceEstimate}</span></span>
    </DialogTrigger>
    <WatchDialogContent watch={watch} onClose={close} actions={children}/>
  </Dialog>;
}
