import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ChessBoardComponent} from './components/chess-board/chess-board.component';
import {GameInfoComponent} from './components/game-info/game-info.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChessBoardComponent, GameInfoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Chess AI vs AI');
}
