# Chess AI vs AI - Angular v21 Application

A fully functional chess application built with Angular v21, following SOLID principles and Angular best practices.

## Features

✅ **Full Chess Game Implementation**

- Complete chess board with 8x8 grid
- All chess pieces (Pawn, Rook, Knight, Bishop, Queen, King)
- Legal move validation for all piece types
- Check, checkmate, and stalemate detection
- En passant and pawn promotion support
- Move history tracking
- FEN (Forsyth-Edwards Notation) display

✅ **Interactive Gameplay**

- Click-based piece movement
- Visual highlighting of valid moves
- Algebraic notation input (e.g., "e4", "Nf3", "O-O")
- Real-time game state updates

✅ **Modern Angular v21 Features**

- Standalone components (no NgModules)
- Signals for reactive state management
- OnPush change detection strategy
- Computed signals for derived state
- Dependency injection throughout

✅ **SOLID Principles**

- **S**ingle Responsibility: Each service has one clear purpose
- **O**pen/Closed: Strategy pattern for move validation
- **L**iskov Substitution: All validators implement common interface
- **I**nterface Segregation: Clean, focused interfaces
- **D**ependency Inversion: Services depend on abstractions

## Project Structure

```
src/app/
├── models/                      # Domain models
│   ├── board-position.ts       # Position representation with utilities
│   ├── chess-piece.ts          # Piece model and factory
│   ├── chess-move.ts           # Move representation
│   ├── game-state.ts           # Complete game state
│   ├── piece-type.enum.ts      # Piece types enumeration
│   └── piece-color.enum.ts     # Color enumeration
│
├── services/                    # Business logic layer
│   ├── game.service.ts         # Main game orchestration
│   ├── move-validator.service.ts # Move validation (Strategy pattern)
│   ├── board-initializer.service.ts # Board setup
│   ├── notation.service.ts     # Algebraic notation parsing
│   └── fen.service.ts          # FEN notation generation
│
├── components/                  # UI components
│   ├── chess-board/            # Main board component
│   ├── board-square/           # Individual square component
│   ├── chess-piece/            # Piece rendering component
│   └── game-info/              # Game information panel
│
└── app.ts                       # Root component
```

## Architecture Highlights

### Services Architecture (SOLID)

**GameService** - Main coordinator

- Manages game state using signals
- Orchestrates moves and validates game rules
- Provides computed signals for reactive UI

**MoveValidatorService** - Strategy Pattern

- Factory for piece-specific validators
- Each piece type has its own validator class
- Shared base class for common validation logic

**BoardInitializerService** - Single Responsibility

- Initializes chess board to starting position
- Creates initial game state

**NotationService** - Single Responsibility

- Parses algebraic notation (e.g., "e4", "Nf3")
- Generates algebraic notation from moves

**FenService** - Single Responsibility

- Generates FEN notation from game state
- Displays current board position

### Component Architecture

**ChessBoardComponent**

- Container for the 8x8 grid
- Manages piece selection and highlighting
- Handles user interactions

**BoardSquareComponent**

- Represents individual squares
- Shows valid move indicators
- Handles click events

**ChessPieceComponent**

- Renders chess piece symbols (♔ ♕ ♖ ♗ ♘ ♙)
- Provides accessibility labels

**GameInfoComponent**

- Displays game status and turn
- Shows move history
- Algebraic notation input
- FEN notation display
- Captured pieces tracking

## Running the Application

### Prerequisites

- Node.js is already included in `ui/nodejs/node-v24.11.1-win-x64`

### Development Server

```bash
cd ui
npm start
```

Navigate to `http://localhost:4200/`

### Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## How to Play

### Using the Board

1. Click on a piece to select it (must be your turn)
2. Valid moves will be highlighted
3. Click on a highlighted square to move the piece
4. The game alternates between White and Black

### Using Algebraic Notation

You can also enter moves using standard chess notation:

- **Pawn moves**: `e4`, `d5`
- **Piece moves**: `Nf3` (Knight to f3), `Bc4` (Bishop to c4)
- **Captures**: `exd5` (pawn captures), `Nxe5` (knight captures)
- **Castling**: `O-O` (kingside), `O-O-O` (queenside)

## Code Quality Features

✅ **Strong Typing**

- Full TypeScript strict mode
- No implicit any
- Comprehensive interfaces

✅ **Reactive State**

- Signals for state management
- Computed values automatically update
- OnPush change detection

✅ **Accessibility**

- ARIA labels on all interactive elements
- Keyboard navigation support
- Semantic HTML

✅ **Performance**

- OnPush change detection strategy
- Standalone components (tree-shakeable)
- Efficient move validation

## Design Patterns Used

1. **Strategy Pattern** - Move validation per piece type
2. **Factory Pattern** - Chess piece creation, validator selection
3. **Service Layer Pattern** - Separation of business logic
4. **Observer Pattern** - Signals for reactive state
5. **Command Pattern** - Move execution and history

## Future Enhancements

- [ ] Castling implementation
- [ ] Move undo/redo functionality
- [ ] Game save/load using PGN format
- [ ] AI opponent integration
- [ ] Time controls
- [ ] Draw by repetition/50-move rule
- [ ] Piece drag-and-drop
- [ ] Move animations
- [ ] Sound effects
- [ ] Online multiplayer

## License

This project is created for educational purposes.

