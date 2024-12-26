import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-true-fase-question',
  standalone: true,
  imports: [InputNumberModule, FormsModule, ButtonModule],
  templateUrl: './true-fase-question.component.html',
  styleUrl: './true-fase-question.component.css'
})
export class TrueFaseQuestionComponent  extends AppComponentBase implements OnInit {
    value3: number = 0;
    constructor(private _injector: Injector) {
        super(_injector);
    }
    ngOnInit(): void {}
}
