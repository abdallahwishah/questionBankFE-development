import { Component, Input } from '@angular/core';
import { ArticleQuestionsComponent } from "../article-questions/article-questions.component";
import { TrueFaseComponent } from "../true-fase/true-fase.component";
import { MultipleChoiceOneOptionComponent } from '../multiple-choice-one-option/multiple-choice-one-option.component';
import { MultipleChoiceMoreThanOptionComponent } from '../multiple-choice-more-than-option/multiple-choice-more-than-option.component';
import { ConnectingWordsComponent } from "../connecting-words/connecting-words.component";
import { RelatedQuestionsComponent } from "../related-questions/related-questions.component";
import { WordsOrderComponent } from "../words-order/words-order.component";

@Component({
  selector: 'app-dynamic-exam-question',
  standalone: true,
  imports: [ArticleQuestionsComponent, TrueFaseComponent, MultipleChoiceOneOptionComponent, MultipleChoiceMoreThanOptionComponent, ConnectingWordsComponent, RelatedQuestionsComponent, WordsOrderComponent],
  templateUrl: './dynamic-exam-question.component.html',
  styleUrl: './dynamic-exam-question.component.css'
})
export class DynamicExamQuestionComponent {
    @Input() questionType: any;
}
