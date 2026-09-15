import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { WatchItem } from '../store/catalogStore';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { WatchDetails } from './WatchDetails';

export function WatchDialogContent({ watch, onClose, actions }: { watch: WatchItem; onClose: () => void; actions?: ReactNode }) {
  return <DialogContent className="watch-dialog" showCloseButton={false}>
    <DialogHeader className="watch-dialog-header">
      <DialogTitle>{watch.model}</DialogTitle>
      <DialogDescription>{watch.brand}</DialogDescription>
      <DialogClose render={<Button variant="ghost" size="icon" className="size-11"/>} className="watch-dialog-close" aria-label="Fechar detalhes"><X/></DialogClose>
    </DialogHeader>
    <div className="watch-dialog-body">
      <WatchDetails
        watch={watch}
        onClose={onClose}
        actions={
          <>
            <div className="mt-3">
              <a
                href={`/relogios/${watch.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--tone-accent)] hover:underline font-medium"
              >
                Ver página dedicada completa →
              </a>
            </div>
            {actions}
          </>
        }
      />
    </div>
  </DialogContent>;
}
