import { ReactNode } from 'react';
import { Session, Timer, Asana } from './index';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export interface WindDownModalProps {
  onClose: () => void;
  children: ReactNode;
}

export interface TimerProps {
  duration: number;
  title?: string;
  isActive?: boolean;
  onComplete?: () => void;
}

export interface TimerFormProps {
  onAddTimer: (duration: number, title: string) => void;
}

export interface SessionListProps {
  sessions: Session[];
  onDelete: (id: number) => void;
}

export interface SessionFormProps {
  onCreate: (name: string, description: string) => void;
}

export interface AsanaListProps {
  asanas: Asana[];
}

export interface AsanaListItemProps {
  asana: Asana;
  onPress: (asanaId: number) => void;
}

export interface LoadingProps {
  color?: string;
}

export interface ErrorProps {
  message: string;
  onRetry?: () => void;
}
