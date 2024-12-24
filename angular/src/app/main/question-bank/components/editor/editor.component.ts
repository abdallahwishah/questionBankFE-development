import { Component } from '@angular/core';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [InputTextareaModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {

}
