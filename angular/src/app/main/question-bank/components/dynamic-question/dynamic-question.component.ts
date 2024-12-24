import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TrueFaseQuestionComponent } from '../true-fase-question/true-fase-question.component';

@Component({
    selector: 'app-dynamic-question',
    standalone: true,
    imports: [CommonModule, TrueFaseQuestionComponent],
    templateUrl: './dynamic-question.component.html',
    styleUrl: './dynamic-question.component.css',
})
export class DynamicQuestionComponent {
    @Input() questionType: any;
}
