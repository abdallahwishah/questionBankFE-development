import { Component } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from "../editor/editor.component";

@Component({
  selector: 'app-true-fase-question',
  standalone: true,
  imports: [InputNumberModule, FormsModule, ButtonModule, EditorComponent],
  templateUrl: './true-fase-question.component.html',
  styleUrl: './true-fase-question.component.css'
})
export class TrueFaseQuestionComponent {
    value3:number = 0 ;

}
