import { Component, Input } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicExamQuestionComponent } from '../dynamic-exam-question/dynamic-exam-question.component';
import { CommonModule } from '@node_modules/@angular/common';

@Component({
    selector: 'app-related-questions',
    standalone: true,
    imports: [DynamicExamQuestionComponent, CommonModule],
    templateUrl: './related-questions.component.html',
    styleUrl: './related-questions.component.css',
})
export class RelatedQuestionsComponent {
    @Input() config!: any;
}
