import { ChangeDetectorRef, Component, Injector, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { MultipleChoiceOneOptionComponent } from '../multiple-choice-one-option/multiple-choice-one-option.component';
import { MultipleChoiceMoreThanOptionComponent } from '../multiple-choice-more-than-option/multiple-choice-more-than-option.component';
import { ConnectingWordsComponent } from '../connecting-words/connecting-words.component';
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
        WordsOrderComponent,
        CartesianLevelComponent,
        DragDropTableComponent,
    ],
    templateUrl: './dynamic-exam-question.component.html',
    styleUrl: './dynamic-exam-question.component.css',
})
export class DynamicExamQuestionComponent {
    @ViewChild('RelatedQuestion', { read: ViewContainerRef, static: false }) dynamicHost!: ViewContainerRef;
    constructor(
        private injector: Injector,
        private cdr: ChangeDetectorRef,
    ) {}
    @Input() questionType: any;
    @Input() question: any;
    @Input() order: any;

    QuestionTypeEnum = QuestionTypeEnum;
    dynamicListInstance: any;
    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        if (this.questionType === QuestionTypeEnum.LinkedQuestions) {
            import('../related-questions/related-questions.component').then((m) => {
                this.dynamicHost.clear();
                const compRef = this.dynamicHost.createComponent(m.RelatedQuestionsComponent, {
                    injector: this.injector,
                });
                this.dynamicListInstance = compRef.instance;
                this.initializeDynamicListInstance();
                this.cdr.markForCheck();
            });
        }
    }
    initializeDynamicListInstance() {
        if (this.dynamicListInstance) {
            this.dynamicListInstance.config = this.question;
        }
    }
}
