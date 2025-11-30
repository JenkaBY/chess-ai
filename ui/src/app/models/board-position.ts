/**
 * Represents a position on the chess board
 */
export interface BoardPosition {
  row: number; // 0-7 (0 = rank 8, 7 = rank 1)
  col: number; // 0-7 (0 = file a, 7 = file h)
}

/**
 * Utility functions for board positions
 */
export class BoardPositionUtil {
  static fromAlgebraic(notation: string): BoardPosition {
    const file = notation.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(notation[1], 10);
    return {row: rank, col: file};
  }

  static toAlgebraic(position: BoardPosition): string {
    const file = String.fromCharCode('a'.charCodeAt(0) + position.col);
    const rank = (8 - position.row).toString();
    return file + rank;
  }

  static isValid(position: BoardPosition): boolean {
    return (
      position.row >= 0 &&
      position.row < 8 &&
      position.col >= 0 &&
      position.col < 8
    );
  }

  static equals(pos1: BoardPosition, pos2: BoardPosition): boolean {
    return pos1.row === pos2.row && pos1.col === pos2.col;
  }
}

