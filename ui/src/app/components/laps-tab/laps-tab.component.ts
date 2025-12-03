import {Component, EventEmitter, OnInit, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LapService} from '../../services/lap.service';
import {LapDto} from '../../models/lap.model';

/**
 * Component for displaying latest chess laps
 */
@Component({
  selector: 'app-laps-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './laps-tab.component.html',
  styleUrls: ['./laps-tab.component.css']
})
export class LapsTabComponent implements OnInit {
  laps = signal<LapDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');

  @Output() replayRequested = new EventEmitter<string>();

  constructor(private lapService: LapService) {
  }

  ngOnInit(): void {
    this.loadLaps();
  }

  loadLaps(): void {
    this.loading.set(true);
    this.error.set('');

    this.lapService.getLaps(0, 10).subscribe({
      next: (laps: LapDto[]) => {
        this.laps.set(laps);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load laps:', err);
        this.error.set('Failed to load laps. Please try again.');
        this.loading.set(false);
      }
    });
  }

  getLapSummary(lap: LapDto): string {
    const white = lap.whitePlayerSetting?.modelName || 'gpt5-nano';
    const black = lap.blackPlayerSetting?.modelName || 'gpt5-nano';
    const winner = lap.winner || '-';
    const status = lap.status;
    return `${white} vs ${black} | Winner: ${winner} | Status: ${status}`;
  }

  getFormattedLapData(lap: LapDto): string {
    return JSON.stringify({
      'Lap ID': lap.lapId,
      'White model': lap.whitePlayerSetting?.modelName,
      'White Prompt': lap.whitePlayerSetting?.systemPrompt,
      'Black model': lap.blackPlayerSetting?.modelName,
      'Black Prompt': lap.blackPlayerSetting?.systemPrompt,
      'Status': lap.status,
      'Winner': lap.winner || '-',
      'Updated At': new Date(lap.updatedAt).toLocaleString()
    }, null, 2);
  }

  refresh(): void {
    this.loadLaps();
  }

  replayLap(lapId: string): void {
    console.log('🎬 LapsTabComponent.replayLap() - emitting replay request for lapId:', lapId);
    this.replayRequested.emit(lapId);
  }
}

