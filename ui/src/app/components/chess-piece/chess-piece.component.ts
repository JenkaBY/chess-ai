import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ChessPiece} from '../../models/chess-piece';
import {PieceType} from '../../models/piece-type.enum';
import {PieceColor} from '../../models/piece-color.enum';
import {CommonModule} from '@angular/common';

/**
 * Component for rendering a chess piece
 * Uses OnPush for performance optimization
 */
@Component({
  selector: 'app-chess-piece',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chess-piece" [attr.aria-label]="getAriaLabel()">
      {{ getPieceSymbol() }}
    </div>
  `,
  styles: [`
    .chess-piece {
      font-size: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessPieceComponent {
  @Input({required: true}) piece!: ChessPiece;

  getPieceSymbol(): string {
    const symbols = {
      [PieceColor.WHITE]: {
        [PieceType.KING]: '♔',
        [PieceType.QUEEN]: '♕',
        [PieceType.ROOK]: '♖',
        [PieceType.BISHOP]: '♗',
        [PieceType.KNIGHT]: '♘',
        [PieceType.PAWN]: '♙'
      },
      [PieceColor.BLACK]: {
        [PieceType.KING]: '♚',
        [PieceType.QUEEN]: '♛',
        [PieceType.ROOK]: '♜',
        [PieceType.BISHOP]: '♝',
        [PieceType.KNIGHT]: '♞',
        [PieceType.PAWN]: '♟'
      }
    };

    return symbols[this.piece.color][this.piece.type];
  }

  getAriaLabel(): string {
    return `${this.piece.color} ${this.piece.type}`;
  }
}



