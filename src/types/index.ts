// Backend API Types (matching Rails models)
export interface Session {
  id: number | string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  timers: Timer[];
  device_id?: string;
}

export interface Timer {
  id: number | string;
  duration: number; // Duration in seconds (Rails stores in seconds)
  title?: string;
  session_id: number | string;
  created_at: string;
  updated_at: string;
}

export interface Asana {
  id: number;
  title: string;
  benefits?: string;
  contraindications?: string;
  alternatives_and_options?: string;
  counterposes?: string;
  meridians_and_organs?: string;
  joints?: string;
  recommended_time?: string;
  other_notes?: string;
  into_pose?: string;
  out_of_pose?: string;
  session_id?: number;
  similar_yang_asanas?: string;
  created_at: string;
  updated_at: string;
}

// Session execution state
export interface SessionExecutionState {
  session: Session;
  currentTimerIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  currentTimerElapsed: number; // seconds elapsed in current timer
  totalElapsed: number; // total session elapsed time
  backgroundMusic?: string;
  transitionSound: string;
}

// Local timer for custom creation (before saving to backend)
export interface LocalTimer {
  id: string;
  duration: number; // in minutes for UI, convert to seconds for API
  label: string;
}

// Session preferences
export interface SessionPreferences {
  transitionSound: string;
  backgroundMusic?: string;
  volume: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
