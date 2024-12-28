import { Component, Input } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-date',
  standalone: true,
  imports: [CalendarModule],
  templateUrl: './date.component.html',
  styleUrl: './date.component.css'
})
export class DateComponent {
    @Input() label: string;

}
