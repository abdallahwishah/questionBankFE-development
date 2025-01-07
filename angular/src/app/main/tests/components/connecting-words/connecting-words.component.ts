import { Component, Injector, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-connecting-words',
  standalone: true,
  imports: [TableModule],
  templateUrl: './connecting-words.component.html',
  styleUrl: './connecting-words.component.css'
})
export class ConnectingWordsComponent extends AppComponentBase implements OnInit {
    value3:number = 0 ;
    constructor(private _injector: Injector,
      ) { super(_injector);}
    ngOnInit(): void {
    }

}
