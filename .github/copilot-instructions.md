# Copilot Workspace Instructions

## Instructions:

The ui directory is 'root/ui'. The node js is already install in the system and available in the 'D:
\Projects\study\chess-ai-vs-ai\chess-ai\ui\nodejs\node-v24.11.1-win-x64'.

### Angular v21 Chess Application

#### General Guidelines

- Follow SOLID principles strictly in all components, services, and modules
- Adhere to Angular v21 official style guide and best practices
- Use standalone components (no NgModules where possible)
- Implement strong typing with TypeScript
- Use signals for reactive state management
- Apply OnPush change detection strategy for performance

#### Project Structure

- Organize code by feature modules (board, pieces, game, notation)
- Separate concerns: UI components, business logic services, and models
- Use dependency injection for all service dependencies
- Keep components focused on presentation logic only

#### Chess Functionality

- Implement a chess board component (8x8 grid)
- Create separate components for each piece type (Pawn, Rook, Knight, Bishop, Queen, King)
- Support drag-and-drop or click-based piece movement
- Parse and validate standard chess notation (algebraic notation: e.g., "e4", "Nf3", "O-O")
- Display current position using FEN (Forsyth-Edwards Notation)
- Validate legal moves according to chess rules
- Track game state (turn, captured pieces, check/checkmate status)

#### Code Quality

- Write unit tests for services and components using Jasmine/Karma
- Use RxJS observables for asynchronous operations
- Implement proper error handling and user feedback
- Add accessibility features (keyboard navigation, ARIA labels)
- Optimize performance with trackBy functions and lazy loading

#### Naming Conventions

- Use PascalCase for classes and interfaces
- Use camelCase for variables, methods, and properties
- Prefix interfaces with 'I' only when necessary for clarity
- Use descriptive names that reflect business domain (ChessPiece, BoardPosition, MoveValidator)

#### UI/UX Guidelines

- TODO: (This section can be customized based on specific UI/UX requirements)
