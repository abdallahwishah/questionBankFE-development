import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from "../../../../shared/components/editor/editor.component";
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-drag-drop-words',
  standalone: true,
  imports: [InputNumberModule, FormsModule, ButtonModule, EditorComponent],
  templateUrl: './drag-drop-words.component.html',
  styleUrl: './drag-drop-words.component.css'
})
export class DragDropWordsComponent extends AppComponentBase implements OnInit {
    value3:number = 0 ;
    constructor(private _injector: Injector,
    ) { super(_injector);}
    ngOnInit(): void {

    }
}
