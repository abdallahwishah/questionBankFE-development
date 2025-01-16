import { Component, Input } from '@angular/core';
 import { MultipleChoiceOneOptionComponent } from '../multiple-choice-one-option/multiple-choice-one-option.component';
import { MultipleChoiceMoreThanOptionComponent } from '../multiple-choice-more-than-option/multiple-choice-more-than-option.component';
import { ConnectingWordsComponent } from '../connecting-words/connecting-words.component';
import { RelatedQuestionsComponent } from '../related-questions/related-questions.component';
import { WordsOrderComponent } from '../words-order/words-order.component';
import { CartesianLevelComponent } from '../cartesian-level/cartesian-level.component';
import { QuestionTypeEnum } from '@shared/service-proxies/service-proxies';
import { ArticleQuestionsComponent } from '../article-questions/article-questions.component';
import { DragDropTableComponent } from '../drag-drop-table/drag-drop-table.component';

@Component({
    selector: 'app-dynamic-exam-question',
    standalone: true,
    imports: [
        ArticleQuestionsComponent,
         MultipleChoiceOneOptionComponent,
        MultipleChoiceMoreThanOptionComponent,
        ConnectingWordsComponent,
        RelatedQuestionsComponent,
        WordsOrderComponent,
        CartesianLevelComponent,
        DragDropTableComponent
    ],
    templateUrl: './dynamic-exam-question.component.html',
    styleUrl: './dynamic-exam-question.component.css',
})
export class DynamicExamQuestionComponent {
    @Input() questionType: any;
    @Input() question: any;
    QuestionTypeEnum = QuestionTypeEnum;
}
