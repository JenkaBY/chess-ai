import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.css']
})
export class HelpModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
