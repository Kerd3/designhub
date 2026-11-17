import { ChevronsUp, ChevronUp, Minus, ChevronDown } from 'lucide-react';
import { labelFor } from '@shared/domain.js';
import { Badge } from './Badge.jsx';

const PRIORITY_STYLE = {
  urgent: { tone: 'danger', icon: ChevronsUp },
  high: { tone: 'warning', icon: ChevronUp },
  medium: { tone: 'neutral', icon: Minus },
  low: { tone: 'outline', icon: ChevronDown },
};

export function PriorityBadge({ priority, className }) {
  const style = PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.medium;
  return (
    <Badge tone={style.tone} icon={style.icon} className={className}>
      <span className="visually-hidden">Priority: </span>
      {labelFor(priority)}
    </Badge>
  );
}
