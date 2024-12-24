import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TrueFaseQuestionComponent } from '../true-fase-question/true-fase-question.component';
import { MultipleChoiceOneOptionComponent } from "../multiple-choice-one-option/multiple-choice-one-option.component";
import { MultipleChoiceMoreThanOptionComponent } from "../multiple-choice-more-than-option/multiple-choice-more-than-option.component";

@Component({
    selector: 'app-dynamic-question',
    standalone: true,
    imports: [CommonModule, TrueFaseQuestionComponent, MultipleChoiceOneOptionComponent, MultipleChoiceMoreThanOptionComponent],
    templateUrl: './dynamic-question.component.html',
    styleUrl: './dynamic-question.component.css',
})
export class DynamicQuestionComponent {
    @Input() questionType: any;
}
