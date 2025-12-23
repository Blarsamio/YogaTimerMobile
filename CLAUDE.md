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
- **React Native 0.81.4** with **Expo 54** 
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
- Development: `http://192.168.12.39:3000` (configurable LOCAL_IP for device testing)
- Production: Configurable endpoint
- All API calls use `ApiService` class with typed responses
- 10-second timeout with AbortController for network requests
- **Important**: Update `LOCAL_IP` constant for testing on physical devices

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
- Metro config with NativeWind integration via `withNativeWind()`
- Global CSS imported in `global.css`
- Responsive design with mobile-first approach

**Color Palette & Theme System**:
- **Light Mode**: Primary accent `#A99985`, surface `#F5F1ED`, background `#FFFFFF`
- **Dark Mode**: Background `#1A1A1A`, surface `#2D2D2D`, text `#E8E3D8`
- Theme context provides `isDark` boolean and `toggleTheme()` function
- **Typography**: ZenAntique font for headers, system fonts for body text
- **Custom Sizing**: Button radius `24px`, touch targets ≥44pt for accessibility

### Development Notes

**Key Dependencies**:
- **UI/Animation**: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`
- **Audio**: `expo-audio`, background music and transition sounds
- **Storage**: `@react-native-async-storage/async-storage` for preferences
- **Fonts**: `@expo-google-fonts/zen-antique-soft` for headings
- **Timer UI**: `react-native-countdown-circle-timer` for visual countdown

**TypeScript Usage**:
- Strict mode enabled in `tsconfig.json`
- Type definitions in `src/types/index.ts`
- Navigation types in `src/navigation/types.ts`
- Component props defined in `src/types/props.ts`

**API Data Handling**:
- Durations: Backend stores in seconds, UI shows minutes/seconds
- Sessions always include associated timers via `include: :timers`
- Error handling with typed `ApiResponse<T>` wrapper
- **Local Timer Creation**: Uses `LocalTimer` type with UUID before API persistence
- **State Management**: Local state with `useState`, global theme via Context API
- **Session Execution**: Real-time countdown with elapsed time tracking

**Mobile Considerations**:
- Touch-friendly interactions (44pt minimum touch targets)
- Gesture support via `react-native-gesture-handler`
- **Pan Gestures**: Home screen uses vertical swipe navigation (up/down)
- **Animations**: React Native Reanimated v3 with spring animations
- **Audio**: Expo Audio with proper session management and cleanup
- **Haptics**: Expo Haptics for tactile feedback
- Safe area handling for iOS notches
- Screen dimension adaptation for different devices

**Yin Yoga Context**:
- Long-hold postures (3-10+ minutes per asana)
- Gentle, non-jarring transition sounds
- Minimal distractions during practice
- Custom and predefined session workflows

## Development Best Practices

- **Code Style**:
  - Always use descriptive variable names