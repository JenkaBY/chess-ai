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
  templateUrl: './chess-piece.component.html',
  styleUrls: ['./chess-piece.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessPieceComponent {
  @Input({required: true}) piece!: ChessPiece;

  // Expose enum to template
  public PieceColor = PieceColor;

  get symbol(): string {
    return this.getPieceSymbol();
  }

  get ariaLabel(): string {
    return this.getAriaLabel();
  }

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
