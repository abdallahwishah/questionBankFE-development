import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@node_modules/@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from '../../../../shared/components/editor/editor.component';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    standalone: true,
    imports: [InputNumberModule, FormsModule, ButtonModule, EditorComponent],
    selector: 'app-multiple-choice-one-option',
    templateUrl: './multiple-choice-one-option.component.html',
    styleUrls: ['./multiple-choice-one-option.component.css'],
})
export class MultipleChoiceOneOptionComponent extends AppComponentBase implements OnInit {
    value3: number = 0;
    constructor(private _injector: Injector) {
        super(_injector);
    }
    ngOnInit(): void {}
}
