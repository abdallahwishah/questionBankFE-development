import { Component, Input } from '@angular/core';
import { ArticleQuestionsComponent } from "../article-questions/article-questions.component";
import { TrueFaseComponent } from "../true-fase/true-fase.component";

@Component({
  selector: 'app-dynamic-exam-question',
  standalone: true,
  imports: [ArticleQuestionsComponent, TrueFaseComponent],
  templateUrl: './dynamic-exam-question.component.html',
  styleUrl: './dynamic-exam-question.component.css'
})
export class DynamicExamQuestionComponent {
    @Input() questionType: any;
}
