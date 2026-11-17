import {
  CircleDashed, CircleDot, Eye, CheckCircle2, PauseCircle, Circle, Search, Mail, Sparkles, Archive,
  UserCheck, UserPlus, UserMinus, Clock, Ban,
} from 'lucide-react';
import { labelFor } from '@shared/domain.js';
import { Badge } from './Badge.jsx';

/** Every status in the product maps to a tone and an icon, so it reads without colour. */
const STATUS_STYLE = {
  // projects
  planning: { tone: 'neutral', icon: CircleDashed },
  'in-progress': { tone: 'primary', icon: CircleDot },
  review: { tone: 'warning', icon: Eye },
  completed: { tone: 'success', icon: CheckCircle2 },
  'on-hold': { tone: 'outline', icon: PauseCircle },
  // tasks
  todo: { tone: 'neutral', icon: Circle },
  'in-review': { tone: 'warning', icon: Eye },
  // inquiries
  new: { tone: 'info', icon: Sparkles },
  reviewing: { tone: 'warning', icon: Search },
  contacted: { tone: 'primary', icon: Mail },
  converted: { tone: 'success', icon: CheckCircle2 },
  archived: { tone: 'outline', icon: Archive },
  // clients
  active: { tone: 'success', icon: UserCheck },
  onboarding: { tone: 'info', icon: UserPlus },
  inactive: { tone: 'outline', icon: UserMinus },
  // team availability
  available: { tone: 'success', icon: CheckCircle2 },
  limited: { tone: 'warning', icon: Clock },
  unavailable: { tone: 'outline', icon: Ban },
};

export function StatusBadge({ status, className }) {
  const style = STATUS_STYLE[status] ?? { tone: 'neutral', icon: Circle };
  return (
    <Badge tone={style.tone} icon={style.icon} className={className}>
      {labelFor(status)}
    </Badge>
  );
}
