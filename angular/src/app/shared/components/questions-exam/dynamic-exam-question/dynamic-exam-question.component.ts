import {
    ChangeDetectorRef,
    Component,
    Injector,
    Input,
    ViewChild,
    ViewContainerRef,
    forwardRef,
    OnInit
  } from '@angular/core';
  import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR
  } from '@angular/forms';

  import { MultipleChoiceOneOptionComponent } from '../multiple-choice-one-option/multiple-choice-one-option.component';
  import { MultipleChoiceMoreThanOptionComponent } from '../multiple-choice-more-than-option/multiple-choice-more-than-option.component';
  import { ConnectingWordsComponent } from '../connecting-words/connecting-words.component';
  import { WordsOrderComponent } from '../words-order/words-order.component';
  import { CartesianLevelComponent } from '../cartesian-level/cartesian-level.component';
  import { QuestionTypeEnum } from '@shared/service-proxies/service-proxies';
  import { ArticleQuestionsComponent } from '../article-questions/article-questions.component';
  import { DragDropTableComponent } from '../drag-drop-table/drag-drop-table.component';

  /**
   * If you have an interface or type that reflects the structure of `value`,
   * you can define it for clarity. For example:
   *
   * export interface DynamicExamAnswers {
   *   saAnswer?: any;
   *   trueFalseAnswer?: any;
   *   singleChoiceAnswer?: any;
   *   multipleChoiceAnswer?: any;
   *   matchAnswer?: any;
   *   linkedQuestionAnswer?: any;  // e.g., SubQuestionAnswer[] | undefined
   *   rearrangeAnswer?: any;
   *   drawingAnswer?: any;
   *   dragTableAnswer?: any;
   * }
   *
   * Then use: public value: DynamicExamAnswers = {};
   */

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
      FormsModule
    ],
    templateUrl: './dynamic-exam-question.component.html',
    styleUrls: ['./dynamic-exam-question.component.css'],
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DynamicExamQuestionComponent),
        multi: true,
      },
    ],
  })
  export class DynamicExamQuestionComponent implements OnInit, ControlValueAccessor {
    @ViewChild('RelatedQuestion', { read: ViewContainerRef, static: false })
    dynamicHost!: ViewContainerRef;

    @Input() questionType: QuestionTypeEnum | undefined;
    @Input() question: any;
    @Input() order: any;

    /**
     * The overall "value" of this component, which is
     * an object with separate properties for each type's answer.
     */
    public value: any = {
      saAnswer: null,
      trueFalseAnswer: null,
      singleChoiceAnswer: null,
      multipleChoiceAnswer: null,
      matchAnswer: null,
      linkedQuestionAnswer: null, // For LinkedQuestions
      rearrangeAnswer: null,
      drawingAnswer: null,
      dragTableAnswer: null,
    };

    //  ControlValueAccessor Callbacks
    private onChange: (value: any) => void = () => {};
    private onTouched: () => void = () => {};
    private isDisabled = false;

    QuestionTypeEnum = QuestionTypeEnum;
    dynamicListInstance: any;

    constructor(
      private injector: Injector,
      private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
      if (this.questionType === QuestionTypeEnum.LinkedQuestions) {
        // Dynamically import the component for LinkedQuestions
        import('../related-questions/related-questions.component').then((m) => {
          this.dynamicHost.clear();
          const compRef = this.dynamicHost.createComponent(
            m.RelatedQuestionsComponent,
            { injector: this.injector }
          );
          this.dynamicListInstance = compRef.instance;

          // Set up the new dynamic component's inputs & ControlValueAccessor
          this.initializeDynamicListInstance();
          this.cdr.markForCheck();
        });
      }
    }

    /**
     * If the child implements ControlValueAccessor, we register
     * so it can propagate changes back to `this.value.linkedQuestionAnswer`.
     */
    private initializeDynamicListInstance() {
      if (this.dynamicListInstance) {
        // Pass question config to dynamically loaded component
        this.dynamicListInstance.config = this.question;

        // The child is presumably a ControlValueAccessor: pass the existing answer
        if (this.dynamicListInstance.writeValue) {
          this.dynamicListInstance.writeValue(this.value.linkedQuestionAnswer);
        }

        // Child can notify us of changes
        if (this.dynamicListInstance.registerOnChange) {
          this.dynamicListInstance.registerOnChange((childVal: any) => {
             this.value.linkedQuestionAnswer = childVal;
            // Notify forms that the overall value changed
            this.onChange(this.value);
          });
        }

        // Child can notify us of "touched"
        if (this.dynamicListInstance.registerOnTouched) {
          this.dynamicListInstance.registerOnTouched(() => {
            this.onTouched();
          });
        }

        // Child can be disabled if needed
        if (this.dynamicListInstance.setDisabledState) {
          this.dynamicListInstance.setDisabledState(this.isDisabled);
        }
      }
    }

    // ================== ControlValueAccessor ==================

    writeValue(obj: any): void {
      // Expecting 'obj' to be the entire answer object.
      // If it's null or undefined, initialize it to avoid undefined references.
      console.log('objobjobjobjobj',obj)
      this.value = obj || {
        saAnswer: null,
        trueFalseAnswer: null,
        singleChoiceAnswer: null,
        multipleChoiceAnswer: null,
        matchAnswer: null,
        linkedQuestionAnswer: null,
        rearrangeAnswer: null,
        drawingAnswer: null,
        dragTableAnswer: null,
      };

      // If the dynamic linked question component is loaded, pass the relevant portion
      if (this.dynamicListInstance && this.dynamicListInstance.writeValue) {
        this.dynamicListInstance.writeValue(this.value.linkedQuestionAnswer);
      }
    }

    registerOnChange(fn: (value: any) => void): void {
      this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
      this.isDisabled = isDisabled;

      // If the dynamic child is loaded, pass along the disabled state
      if (this.dynamicListInstance && this.dynamicListInstance.setDisabledState) {
        this.dynamicListInstance.setDisabledState(isDisabled);
      }
    }
   notifyChange(){

        this.onChange(this.value);
   }
    // If needed, you can call this method on blur events in the template
    markAsTouched() {
      this.onTouched();
    }
  }
