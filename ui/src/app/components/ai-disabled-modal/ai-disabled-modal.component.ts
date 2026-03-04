import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

/**
 * Modal shown when a user tries to start a live AI game but the feature is disabled.
 * Guides the user toward the Replay tab as the recommended alternative.
 */
@Component({
  selector: 'app-ai-disabled-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-disabled-modal.component.html',
  styleUrls: ['./ai-disabled-modal.component.css'],
})
export class AiDisabledModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() openReplay = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onOpenReplay(): void {
    this.openReplay.emit();
    this.close.emit();
  }
}

