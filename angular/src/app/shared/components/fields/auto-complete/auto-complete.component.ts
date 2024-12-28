import { Component, Input } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-auto-complete',
  standalone: true,
  imports: [AutoCompleteModule , FormsModule],
  templateUrl: './auto-complete.component.html',
  styleUrl: './auto-complete.component.css'
})
export class AutoCompleteComponent {
    @Input() label: string;
    @Input() placeholder: string = 'Search';

    search($event){

    }
}
