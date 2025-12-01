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
  templateUrl: './board-square.component.html',
  styleUrls: ['./board-square.component.css'],
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
