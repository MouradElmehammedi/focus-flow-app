# FocusFlow

A local-first productivity web application that helps users manage focus sessions, tasks, habits, and long-term goals entirely on their own device.

## Features

### Focus Timer (Pomodoro)
- 25-minute focus sessions with 5-minute breaks
- Pixel-art coffee cup with steam animation
- Automatic session tracking
- Visual progress ring
- Persistent timer state across page refreshes

### To-Do List Management
- Create, edit, and delete tasks
- Mark tasks as complete
- Time estimation per task
- Clean, distraction-free interface
- Automatic calculation of total estimated time

### Habit Tracker
- Weekly frequency-based habits (not daily streaks)
- 7-day grid view (Monday → Sunday)
- Visual progress tracking
- Week navigation (previous/current/next)
- Color-coded completion states

### Analytics Dashboard
- Total focus hours and sessions
- Daily average focus time
- Weekly comparison charts
- Time distribution by time of day
- Goal progress tracking
- Interactive charts with Recharts

### Settings & Data Management
- Export all data as JSON backup
- Import data from backup files
- Clear all data option
- Storage statistics
- Local-first data storage

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom components with Lucide React icons
- **Charts:** Recharts
- **Storage:** Browser Local Storage
- **State Management:** React hooks
- **Date Utilities:** date-fns

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will automatically redirect to the Timer page.

## Building for Production

```bash
npm run build
npm start
```

## Data Storage

All data is stored locally in your browser using Local Storage with the namespace `focusflow.*`:

- `focusflow.tasks` - To-do list items
- `focusflow.habits` - Habit definitions and completions
- `focusflow.goals` - Long-term goals
- `focusflow.sessions` - Completed focus sessions

**Important:** Clearing your browser data will delete all FocusFlow data. Use the Export feature in Settings to create regular backups.

## Privacy

- Zero account creation required
- No data sent to servers
- No tracking or analytics
- Fully offline-capable
- All data stays on your device

## Project Structure

```
app/
├── app/
│   ├── timer/          # Pomodoro timer page
│   ├── todos/          # To-do list page
│   ├── habits/         # Habit tracker page
│   ├── dashboard/      # Analytics dashboard
│   └── settings/       # Settings & data management
├── components/
│   └── ui/             # Reusable UI components
├── lib/
│   ├── storage.ts      # Local storage utilities
│   └── utils.ts        # Helper functions
└── types/
    └── index.ts        # TypeScript type definitions
```

## MVP Success Criteria

- User can start a focus session in < 3 seconds ✓
- Timer persists across refresh ✓
- Habits and tasks feel lightweight and fast ✓
- Dashboard provides clear, understandable insights ✓

## Future Enhancements (Not in MVP)

- Cloud sync across devices
- Push notifications
- AI-powered suggestions
- Collaboration features
- Mobile app versions

## License

MIT
