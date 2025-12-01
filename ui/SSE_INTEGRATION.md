# SSE Chess AI Integration

## Overview

This implementation provides SSE (Server-Sent Events) integration to stream AI chess moves from the backend and display them on the board with toast notifications.

## Architecture

### Services

#### 1. **SseService** (`services/sse.service.ts`)

- Connects to the backend SSE endpoint: `/api/v1/chess-laps/{lapId}/stream`
- Listens for chess move events in JSON format
- Returns an Observable stream of `ChessMoveEvent`

#### 2. **ToastService** (`services/toast.service.ts`)

- Manages toast notifications
- Shows player move reasons as formatted toasts
- Auto-dismisses after 5 seconds (configurable)

#### 3. **AiGameService** (`services/ai-game.service.ts`)

- Orchestrates SSE streaming, game moves, and notifications
- Subscribes to SSE events and applies moves to the game
- Displays toast notifications for each move

### Components

#### 1. **ToastContainerComponent** (`components/toast-container/`)

- Displays toast notifications in the top-right corner
- Supports multiple toast types: info, success, warning, error
- Click to dismiss or auto-dismiss after timeout

#### 2. **GameTabComponent** (enhanced)

- Added AI Game Control section
- Input for Lap ID
- Start/Stop AI buttons
- Shows AI active status
- Disables manual input when AI is active

## Event Format

The backend should send SSE events with the following JSON format:

```json
{
  "movement": "e4",
  "player": "WHITE",
  "reason": "Opening with King's Pawn to control the center"
}
```

### Fields:

- **movement**: Algebraic notation for the chess move (e.g., "e4", "Nf3", "O-O")
- **player**: "WHITE" or "BLACK"
- **reason**: Explanation of why the move was made

## Usage

### Starting an AI Game

1. Navigate to the **Game** tab
2. Find the **AI Game Control** section
3. Enter a Lap ID (e.g., "game-123")
4. Click **Start AI**
5. The system will:
  - Connect to `/api/v1/chess-laps/game-123/stream`
  - Listen for move events
  - Apply moves to the board automatically
  - Show toast notifications with player and reason

### Toast Notifications

Each move generates a toast notification in the format:

```
{player}: {reason}
```

Example:

```
WHITE: Opening with King's Pawn to control the center
```

- **WHITE moves**: Blue toast (info)
- **BLACK moves**: Green toast (success)

### Stopping an AI Game

Click the **Stop AI** button to disconnect from the SSE stream.

## Backend Integration

The backend endpoint should:

1. Accept GET request: `/api/v1/chess-laps/{lapId}/stream`
2. Return `Content-Type: text/event-stream`
3. Send events with JSON data containing `movement`, `player`, and `reason`

Example SSE event:

```
data: {"movement":"e4","player":"WHITE","reason":"Opening with King's Pawn to control the center"}

data: {"movement":"e5","player":"BLACK","reason":"Symmetrical response to control center"}
```

## Error Handling

- **Connection errors**: Shows error toast and closes stream
- **Invalid moves**: Shows error toast with move notation
- **Parsing errors**: Logged to console

## Features

- ✅ Real-time chess move streaming via SSE
- ✅ Automatic move application to the board
- ✅ Toast notifications with player and reason
- ✅ Manual input disabled during AI game
- ✅ Visual indicator when AI is active
- ✅ Graceful error handling
- ✅ Clean start/stop functionality

## Development Notes

- All services use Angular 21 signals for reactive state
- Standalone components throughout
- Modern control flow syntax (`@if`, `@for`)
- Proper cleanup on component destroy
- NgZone integration for SSE events

