import { Component } from '@angular/core';
import { EditorComponent } from "../../../../shared/components/editor/editor.component";

@Component({
  selector: 'app-article-questions',
  standalone: true,
  imports: [EditorComponent],
  templateUrl: './article-questions.component.html',
  styleUrl: './article-questions.component.css'
})
export class ArticleQuestionsComponent {

}
