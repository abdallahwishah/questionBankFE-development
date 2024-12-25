import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TrueFaseQuestionComponent } from '../true-fase-question/true-fase-question.component';
import { MultipleChoiceOneOptionComponent } from "../multiple-choice-one-option/multiple-choice-one-option.component";
import { MultipleChoiceMoreThanOptionComponent } from "../multiple-choice-more-than-option/multiple-choice-more-than-option.component";
import { ConnectingSentencesComponent } from "../connecting-sentences/connecting-sentences.component";
import { ConnectingQuestionsComponent } from "../connecting-questions/connecting-questions.component";
import { ReOrderComponent } from "../re-order/re-order.component";
import { DragDropWordsComponent } from "../drag-drop-words/drag-drop-words.component";
import { DragDropTableComponent } from "../drag-drop-table/drag-drop-table.component";

@Component({
    selector: 'app-dynamic-question',
    standalone: true,
    imports: [CommonModule, TrueFaseQuestionComponent, MultipleChoiceOneOptionComponent, MultipleChoiceMoreThanOptionComponent, ConnectingSentencesComponent, ConnectingQuestionsComponent, ReOrderComponent, DragDropWordsComponent, DragDropTableComponent],
    templateUrl: './dynamic-question.component.html',
    styleUrl: './dynamic-question.component.css',
})
export class DynamicQuestionComponent {
    @Input() questionType: any;
}
