import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BoardPosition} from '../../models/board-position';
import {ChessPiece} from '../../models/chess-piece';
import {ChessPieceComponent} from '../chess-piece/chess-piece.component';

/**
 * Component for rendering a single square on the chess board
 */
@Component({
  selector: 'app-board-square',
  standalone: true,
  imports: [CommonModule, ChessPieceComponent],
  template: `
    <div
      class="board-square"
      [class.light]="isLight"
      [class.dark]="!isLight"
      [class.selected]="isSelected"
      [class.valid-move]="isValidMove"
      [class.highlighted]="isHighlighted"
      (click)="onSquareClick()"
      [attr.aria-label]="getAriaLabel()"
      role="button"
      tabindex="0"
      (keydown.enter)="onSquareClick()"
      (keydown.space)="onSquareClick()"
    >
      @if (piece) {
        <app-chess-piece [piece]="piece"/>
      }
      @if (isValidMove) {
        <div class="valid-move-indicator"></div>
      }
    </div>
  `,
  styles: [`
    .board-square {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .board-square.light {
      background-color: #f0d9b5;
    }

    .board-square.dark {
      background-color: #b58863;
    }

    .board-square.selected {
      background-color: #baca44 !important;
      box-shadow: inset 0 0 0 3px #829769;
    }

    .board-square.valid-move {
      cursor: pointer;
    }

    .board-square.highlighted {
      background-color: #cdd26a !important;
    }

    .board-square:hover {
      filter: brightness(0.95);
    }

    .valid-move-indicator {
      position: absolute;
      width: 30%;
      height: 30%;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      pointer-events: none;
    }

    .board-square:has(app-chess-piece) .valid-move-indicator {
      width: 100%;
      height: 100%;
      border-radius: 0;
      background-color: transparent;
      border: 4px solid rgba(0, 0, 0, 0.4);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardSquareComponent {
  @Input({required: true}) position!: BoardPosition;
  @Input() piece: ChessPiece | null = null;
  @Input() isLight: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isValidMove: boolean = false;
  @Input() isHighlighted: boolean = false;

  @Output() squareClicked = new EventEmitter<BoardPosition>();

  onSquareClick(): void {
    this.squareClicked.emit(this.position);
  }

  getAriaLabel(): string {
    const file = String.fromCharCode('a'.charCodeAt(0) + this.position.col);
    const rank = (8 - this.position.row).toString();
    const square = file + rank;

    if (this.piece) {
      return `${square}: ${this.piece.color} ${this.piece.type}`;
    }
    return `${square}: empty`;
  }
}

