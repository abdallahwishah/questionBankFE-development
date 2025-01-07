import { Component } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-related-questions',
  standalone: true,
  imports: [CheckboxModule],
  templateUrl: './related-questions.component.html',
  styleUrl: './related-questions.component.css'
})
export class RelatedQuestionsComponent {

}
