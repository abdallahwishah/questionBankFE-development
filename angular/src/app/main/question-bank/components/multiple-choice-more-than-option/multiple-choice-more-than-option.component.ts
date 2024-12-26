import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from "../editor/editor.component";
import { CheckboxModule } from 'primeng/checkbox';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-multiple-choice-more-than-option',
  standalone: true,
  imports: [InputNumberModule, FormsModule, ButtonModule, EditorComponent , CheckboxModule],
  templateUrl: './multiple-choice-more-than-option.component.html',
  styleUrl: './multiple-choice-more-than-option.component.css'
})
export class MultipleChoiceMoreThanOptionComponent extends AppComponentBase implements OnInit {
    value3: number = 0;
    constructor(private _injector: Injector) {
        super(_injector);
    }
    ngOnInit(): void {}
}
