import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from "../editor/editor.component";
import { AppComponentBase } from '@shared/common/app-component-base';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-connecting-questions',
  standalone: true,
  imports: [InputNumberModule, FormsModule, ButtonModule,EditorComponent , DropdownFieldComponent , InputSwitchModule],
  templateUrl: './connecting-questions.component.html',
  styleUrl: './connecting-questions.component.css'
})
export class ConnectingQuestionsComponent extends AppComponentBase implements OnInit {
    value3:number = 0 ;
    checked:boolean = true;
    constructor(private _injector: Injector,
    ) { super(_injector);}
    ngOnInit(): void {
    }

}
