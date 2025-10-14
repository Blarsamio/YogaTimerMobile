# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server**
```bash
npm start
# or
expo start
```

**Platform-Specific Builds**
```bash
npm run android     # Run on Android device/emulator
npm run ios         # Run on iOS device/simulator  
npm run web         # Run in web browser
```

**Code Quality**
```bash
npm run lint        # ESLint checking with expo config
```

**iOS Development**
```bash
cd ios && npx pod-install    # Install iOS dependencies (if needed)
```

## Project Architecture

### Core Technology Stack
- **React Native 0.79.4** with **Expo 53** 
- **TypeScript** with strict mode enabled
- **NativeWind** (Tailwind CSS for React Native styling)
- **React Navigation v7** (native stack) for navigation
- **AsyncStorage** for local data persistence
- **Expo Audio** for sound playback

### Application Structure

This is a **yin yoga timer mobile application** focused on meditation and long-hold posture practices. The app connects to a Rails backend API and manages:

- **Sessions**: Collections of timed yoga sequences (predefined or custom)
- **Timers**: Individual segments within sessions (stored in seconds on backend)
- **Asanas**: Detailed yoga pose information with instructions and benefits

### Key Directories

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components (Loading, Error)
│   └── ui/             # Base UI components (Button, Typography)
├── screens/            # Main screen components
├── navigation/         # React Navigation setup
├── contexts/           # React contexts (Theme)
├── config/             # API configuration and endpoints
└── types/              # TypeScript type definitions
```

### Navigation Structure

The app uses a single stack navigator with these main screens:
- **HomeScreen**: Entry point with session type selection
- **SessionsScreen**: Browse predefined yoga sequences  
- **CreateTimerScreen**: Build custom timer sequences
- **SessionExecutionScreen**: Active timer with countdown
- **AsanasScreen**: Browse yoga pose library
- **BackgroundMusicScreen**: Audio preferences

### Backend Integration

**API Configuration** (`src/config/api.ts`):
- Development: `http://localhost:3000` (Rails backend)
- Production: Configurable endpoint
- All API calls use `ApiService` class with typed responses

**Data Models** (matching Rails backend):
- `Session`: Has many timers, includes name/description
- `Timer`: Belongs to session, duration stored in seconds
- `Asana`: Yoga pose with detailed information (benefits, instructions, contraindications)

### State Management Patterns

- **Local State**: `useState` for component-level state
- **Persistence**: `AsyncStorage` for user preferences and session data  
- **Theme Context**: Global dark/light mode via `ThemeProvider`
- **Navigation State**: Handled by React Navigation

### Audio System

Uses **Expo Audio** for:
- Transition sound cues between poses (gentle bells/bowls)
- Background music during practice
- Sound previews for user selection
- Proper audio session management and cleanup

### Styling Architecture

**NativeWind Configuration**:
- Tailwind classes work directly in React Native components
- Custom theme colors defined in `tailwind.config.js`
- Responsive design with mobile-first approach

**Color Palette**:
- Primary accent: `#A99985` (warm beige)
- Surface: `#F5F1ED` (cream)
- Theme-aware backgrounds and text colors

### Development Notes

**TypeScript Usage**:
- Strict mode enabled in `tsconfig.json`
- Type definitions in `src/types/index.ts`
- Navigation types in `src/navigation/types.ts`

**API Data Handling**:
- Durations: Backend stores in seconds, UI shows minutes/seconds
- Sessions always include associated timers via `include: :timers`
- Error handling with typed `ApiResponse<T>` wrapper

**Mobile Considerations**:
- Touch-friendly interactions (44pt minimum touch targets)
- Gesture support via `react-native-gesture-handler`
- Safe area handling for iOS notches
- Screen dimension adaptation for different devices

**Yin Yoga Context**:
- Long-hold postures (3-10+ minutes per asana)
- Gentle, non-jarring transition sounds
- Minimal distractions during practice
- Custom and predefined session workflows

## Rails Backend Architecture

### Backend Technology Stack
- **Rails 7.1 API** backend
- **PostgreSQL** database (inferred from structure)
- **RESTful API** with JSON responses
- **CORS enabled** for mobile app integration

### Database Schema & Models

**Sessions Table**:
```sql
create_table "sessions" do |t|
  t.string "name"              # Required
  t.text "description"         # Optional
  t.datetime "created_at"
  t.datetime "updated_at"
end
```

**Timers Table**:
```sql
create_table "timers" do |t|
  t.integer "duration"          # Duration in seconds, required > 0
  t.string "title"              # Optional timer name
  t.integer "session_id"        # Foreign key, required
  t.datetime "created_at"
  t.datetime "updated_at"
end
```

**Asanas Table**:
```sql
create_table "asanas" do |t|
  t.string "title"                      # Pose name
  t.text "benefits"                     # Physical/mental benefits
  t.text "contraindications"           # Safety warnings
  t.text "into_pose"                   # Entry instructions
  t.text "out_of_pose"                 # Exit instructions
  t.text "alternatives_and_options"    # Modifications
  t.text "counterposes"                # Follow-up poses
  t.text "meridians_and_organs"        # TCM connections
  t.text "joints"                      # Affected body areas
  t.string "recommended_time"          # Suggested duration
  t.text "similar_yang_asanas"         # Related active poses
  t.text "other_notes"                 # Additional info
  t.integer "session_id"               # Optional association
  t.datetime "created_at"
  t.datetime "updated_at"
end
```

### Model Relationships
```ruby
class Session < ApplicationRecord
  has_many :timers, dependent: :destroy
  has_many :asanas
  validates :name, presence: true
end

class Timer < ApplicationRecord
  belongs_to :session
  validates :duration, presence: true, numericality: { greater_than: 0 }
end

class Asana < ApplicationRecord
  # Standalone model with optional session association
end
```

### API Endpoints Reference

**Sessions API**:
- `GET /sessions` → All sessions with timers
- `GET /sessions/:id` → Specific session with timers
- `POST /sessions` → Create session (requires `name`)
- `PATCH /sessions/:id` → Update session
- `DELETE /sessions/:id` → Delete session (cascades to timers)

**Timers API**:
- `POST /sessions/:session_id/timers` → Create timer (requires `duration`)
- `DELETE /timers/:id` → Delete specific timer (non-nested route)

**Asanas API**:
- `GET /asanas` → All yoga poses
- `GET /asanas/:id` → Specific pose details
- `GET /sessions/:session_id/asanas/:id` → Nested route alternative

### Predefined Content

**5 Seeded Yoga Flows**:
1. "An Easy Beginner's Flow" (15 segments, ~27 min)
2. "A Flow for the Spine (60min)" (11 segments)
3. "A Flow for the Spine (90min)" (16 segments)
4. "A Flow for the Hips (60min)" (12 segments)
5. "A Flow for the Hips (90min)" (16 segments)

**Common Timer Patterns**:
- Meditation: 180-300 seconds (3-5 minutes)
- Pose holds: 90-300 seconds (1.5-5 minutes)
- Final relaxation: 420-600 seconds (7-10 minutes)
- Transitions: 60-120 seconds (1-2 minutes)

**Typical Yin Session Structure**:
1. Opening meditation (3-5 min)
2. Warm-up poses (hip openers)
3. Main sequence (spine/hip focus)
4. Backbends (Sphinx, Seal, Camel)
5. Lateral stretches (Bananasana)
6. Twists (reclining twists)
7. Final relaxation (Shavasana, 7-10 min)

### Backend Development Notes

**Data Handling**:
- All durations stored in **seconds** (convert for UI display)
- Sessions always return with `include: :timers`
- Comprehensive asana data with TCM meridian connections

**Error Responses**:
- Validation errors: 422 Unprocessable Entity
- Not found: 404 Not Found
- Successful deletes: 204 No Content

**Development Setup**:
- Run `rails db:seed` to populate predefined flows and asana library
- CORS configured for cross-origin requests from mobile app
- API designed for mobile consumption with nested timer data