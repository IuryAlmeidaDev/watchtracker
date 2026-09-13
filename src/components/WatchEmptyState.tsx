import { ArrowUpRight, Watch } from 'lucide-react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty';
import { Button } from './ui/button';

export function WatchEmptyState({ title, description, action, onAction }: {
  title: string; description: string; action: string; onAction: () => void;
}) {
  return <Empty className="min-h-72 py-12">
    <EmptyHeader>
      <EmptyMedia variant="icon"><Watch/></EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent><Button className="h-11" onClick={onAction}>{action}<ArrowUpRight data-icon="inline-end"/></Button></EmptyContent>
  </Empty>;
}
