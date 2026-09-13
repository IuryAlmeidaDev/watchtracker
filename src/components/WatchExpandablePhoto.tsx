import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WatchItem } from '../store/catalogStore';
import { getWatchDetails } from '../lib/watch-details';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { WatchPhoto } from './WatchPhoto';
import { WatchDetails } from './WatchDetails';

export function WatchExpandablePhoto({ watch }: { watch: WatchItem }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }); };
  return <Collapsible open={open} onOpenChange={setOpen} onKeyDown={(event) => {
    if (event.key === 'Escape' && open) { event.stopPropagation(); close(); }
  }}>
    <CollapsibleTrigger ref={trigger} className="catalog-detail-trigger" aria-label={`${open ? 'Recolher' : 'Expandir'} ${watch.model}`}>
      <span className="catalog-photo-wrap"><WatchPhoto src={getWatchDetails(watch).images[0]} alt={`${watch.brand} ${watch.model}`}/></span>
      <span className="catalog-disclosure">{open ? 'Recolher detalhes' : 'Fotos e detalhes'}<ChevronDown size={16}/></span>
    </CollapsibleTrigger>
    <CollapsibleContent className="watch-expansion"><WatchDetails watch={watch} onClose={close}/></CollapsibleContent>
  </Collapsible>;
}
