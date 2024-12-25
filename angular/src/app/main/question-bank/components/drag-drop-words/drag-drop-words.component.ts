import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from "../editor/editor.component";

@Component({
  selector: 'app-drag-drop-words',
  standalone: true,
  imports: [InputNumberModule, FormsModule, ButtonModule, EditorComponent],
  templateUrl: './drag-drop-words.component.html',
  styleUrl: './drag-drop-words.component.css'
})
export class DragDropWordsComponent {
    value3:number = 0 ;
}
