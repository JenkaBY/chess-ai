import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

/**
 * Help modal for the AI Game Control section.
 * Explains how to use the Lap ID input, Start/Stop AI buttons
 * and the Replay feature.
 */
@Component({
  selector: 'app-ai-game-help-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-game-help-modal.component.html',
  styleUrls: ['./ai-game-help-modal.component.css'],
})
export class AiGameHelpModalComponent {
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}

