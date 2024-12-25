import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from "../editor/editor.component";
import { AppComponentBase } from '@shared/common/app-component-base';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-drag-drop-table',
  standalone: true,
  imports: [InputNumberModule, FormsModule, ButtonModule, EditorComponent , TableModule],
  templateUrl: './drag-drop-table.component.html',
  styleUrl: './drag-drop-table.component.css'
})
export class DragDropTableComponent extends AppComponentBase implements OnInit {
    value3:number = 0 ;
    constructor(private _injector: Injector,
      ) { super(_injector);}
    ngOnInit(): void {
    }

}
