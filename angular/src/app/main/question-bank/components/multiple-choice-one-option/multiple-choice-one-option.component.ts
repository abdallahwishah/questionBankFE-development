import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from "../editor/editor.component";

@Component({
  standalone :true,
  imports: [InputNumberModule, FormsModule, ButtonModule, EditorComponent],
  selector: 'app-multiple-choice-one-option',
  templateUrl: './multiple-choice-one-option.component.html',
  styleUrls: ['./multiple-choice-one-option.component.css']
})
export class MultipleChoiceOneOptionComponent implements OnInit {
    value3:number = 0 ;
  constructor() { }

  ngOnInit() {
  }

}
