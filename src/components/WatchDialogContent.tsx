import { X } from 'lucide-react';
import type { WatchItem } from '../store/catalogStore';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { WatchDetails } from './WatchDetails';

export function WatchDialogContent({ watch, onClose }: { watch: WatchItem; onClose: () => void }) {
  return <DialogContent className="watch-dialog" showCloseButton={false}>
    <DialogHeader className="watch-dialog-header">
      <DialogTitle>{watch.model}</DialogTitle>
      <DialogDescription>{watch.brand}</DialogDescription>
      <DialogClose render={<Button variant="ghost" size="icon" className="size-11"/>} className="watch-dialog-close" aria-label="Fechar detalhes"><X/></DialogClose>
    </DialogHeader>
    <div className="watch-dialog-body"><WatchDetails watch={watch} onClose={onClose}/></div>
  </DialogContent>;
}
