import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MoveHistoryComponent} from '../move-history/move-history.component';

@Component({
  selector: 'app-history-tab',
  standalone: true,
  imports: [CommonModule, MoveHistoryComponent],
  templateUrl: './history-tab.component.html',
  styleUrls: ['./history-tab.component.css']
})
export class HistoryTabComponent {
  @Input() moves: any[] = [];
  @Input() getMoveDescription!: (move: any) => string;
}

