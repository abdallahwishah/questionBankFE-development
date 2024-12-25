import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-re-order',
  standalone: true,
  imports: [InputNumberModule, FormsModule, ButtonModule , CheckboxModule],
  templateUrl: './re-order.component.html',
  styleUrl: './re-order.component.css'
})
export class ReOrderComponent extends AppComponentBase implements OnInit {
    value3:number = 0 ;
    constructor(private _injector: Injector,
    ) { super(_injector);}
    ngOnInit(): void {

    }
    getIsFakeAnswer($event){
        console.log("$event" , $event)
    }
}

