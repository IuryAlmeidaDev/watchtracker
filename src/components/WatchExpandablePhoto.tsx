import { useRef } from 'react';
import { useWatchExpansion } from '../store/appearanceStore';
import { ChevronDown } from 'lucide-react';
import type { WatchItem } from '../store/catalogStore';
import { getWatchDetails } from '../lib/watch-details';
import { Dialog, DialogTrigger } from './ui/dialog';
import { WatchPhoto } from './WatchPhoto';
import { WatchDialogContent } from './WatchDialogContent';

export function WatchExpandablePhoto({ watch }: { watch: WatchItem }) {
  const { open, setOpen } = useWatchExpansion(watch.id);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); };
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger ref={trigger} className="catalog-detail-trigger" aria-label={`${open ? 'Recolher' : 'Expandir'} ${watch.model}`}>
      <span className="catalog-photo-wrap"><WatchPhoto src={getWatchDetails(watch).images[0]} alt={`${watch.brand} ${watch.model}`}/></span>
      <span className="catalog-disclosure">{open ? 'Recolher detalhes' : 'Fotos e detalhes'}<ChevronDown size={16}/></span>
    </DialogTrigger>
    <WatchDialogContent watch={watch} onClose={close}/>
  </Dialog>;
}
