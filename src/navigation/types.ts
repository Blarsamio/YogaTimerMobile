import { Session, Timer, Asana } from '../types';

export type RootStackParamList = {
  Home: undefined;
  Sessions: undefined;
  SessionDetail: { sessionId: number };
  SessionCountdown: { sessionId: number };
  SessionExecution: {
    session: Session;
    transitionSound: string;
    backgroundMusic?: string;
  };
  Asanas: undefined;
  AsanaDetail: { asanaId: number };
  QuickTimer: undefined;
  SimpleTimer: { duration: number };
  CreateTimer: undefined;
  BackgroundMusic: undefined;
  Contact: undefined;
};

// Type for screen props
export type SessionsScreenProps = {
  sessions: Session[];
  onDelete: (id: number) => Promise<void>;
};

export type SessionDetailScreenProps = {
  session: Session;
  onAddTimer: (duration: number, title: string) => Promise<void>;
};

export type SessionCountdownScreenProps = {
  session: Session;
  onComplete: () => void;
};

export type AsanasScreenProps = {
  asanas: Asana[];
};

export type AsanaDetailScreenProps = {
  asana: Asana;
};

export type QuickTimerScreenProps = {
  onSelectTimer: (duration: number) => void;
};

export type SimpleTimerScreenProps = {
  duration: number;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
