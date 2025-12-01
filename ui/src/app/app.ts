import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ChessBoardComponent} from './components/chess-board/chess-board.component';
import {GameInfoComponent} from './components/game-info/game-info.component';
import {ToastContainerComponent} from './components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChessBoardComponent, GameInfoComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Chess AI vs AI');
}
