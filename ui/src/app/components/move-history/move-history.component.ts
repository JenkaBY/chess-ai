import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-move-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './move-history.component.html',
  styleUrls: ['./move-history.component.css']
})
export class MoveHistoryComponent {
  @Input() moves: any[] = [];
  @Input() getMoveDescription!: (move: any) => string;
}
