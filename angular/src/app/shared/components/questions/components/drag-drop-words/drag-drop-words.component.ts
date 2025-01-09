import {
    Component,
    Injector,
    forwardRef
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';

import { AppComponentBase } from '@shared/common/app-component-base';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { EditorComponent } from '@app/shared/components/editor/editor.component';

import { CreateOrEditDragFormQuestionDto } from '@shared/service-proxies/service-proxies';
import { CommonModule } from '@node_modules/@angular/common';

// For drag-drop
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-drag-drop-words',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputNumberModule,
        ButtonModule,
        EditorComponent,
        DragDropModule  // <-- import the Angular CDK drag-drop module
    ],
    templateUrl: './drag-drop-words.component.html',
    styleUrls: ['./drag-drop-words.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DragDropWordsComponent),
            multi: true
        }
    ]
})
export class DragDropWordsComponent
  extends AppComponentBase
  implements ControlValueAccessor
{
    /**
     * The array of "drag form questions", bound from the parent via:
     *    <app-drag-drop-words [(ngModel)]="value.dragFormQuestions"></app-drag-drop-words>
     */
    value: CreateOrEditDragFormQuestionDto[] = [];

    // For generating unique input names: DragForm[questionIndex][Inputs][inputIndex]
    // We can track how many inputs we've added so far per question.
    // Alternatively, parse the editor each time to discover the next index.
    private inputCounterMap = new Map<number, number>();

    // ControlValueAccessor callbacks
    private onChange: (val: CreateOrEditDragFormQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
      super(injector);
    }

    // ----------------------------
    // ControlValueAccessor
    // ----------------------------
    writeValue(obj: CreateOrEditDragFormQuestionDto[]): void {
      this.value = obj || [];
    }

    registerOnChange(fn: (val: CreateOrEditDragFormQuestionDto[]) => void): void {
      this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
      // If you want to disable child elements, do that here
    }

    /** Notify the parent form that the value changed */
    notifyChange(): void {
      this.onChange(this.value);
      this.onTouched();
    }

    // ----------------------------
    // Drag & Drop for entire questions
    // ----------------------------
    dropReorder(event: CdkDragDrop<CreateOrEditDragFormQuestionDto[]>): void {
      moveItemInArray(this.value, event.previousIndex, event.currentIndex);
      this.notifyChange();
    }

    // ----------------------------
    // Business Logic
    // ----------------------------

    addNewText(): void {
      const item = new CreateOrEditDragFormQuestionDto();
      item.type = 0;
      item.value = '';        // Editor starts blank
      item.inputs = [];       // We'll keep it if we need to parse them
      item.fakeInputs = [];
      item.point = 1;

      this.value.push(item);
      this.notifyChange();
    }

    removeText(index: number): void {
      if (index >= 0 && index < this.value.length) {
        this.value.splice(index, 1);
        this.notifyChange();
      }
    }

    /**
     * Insert an <input> field (wrapped in a <span>), at the end of the editor content
     * for a given question. The `name` attribute will be something like:
     *   DragForm[questionIndex][Inputs][X]
     * to match your existing structure.
     */
    insertInputField(question: CreateOrEditDragFormQuestionDto, questionIndex: number): void {
      // 1) Figure out how many inputs we've created so far for this question
      const currentCount = this.inputCounterMap.get(questionIndex) || 0;
      const newIndex = currentCount;
      // Increment for next time
      this.inputCounterMap.set(questionIndex, currentCount + 1);

      // 2) Construct the snippet
      // We’ll keep the same classes you gave: .inputsTracker0 .dragDropTextContainer
      // You can also add a unique class if you want, e.g. inputsTracker{questionIndex}
      const snippet = `
        <span class="inputsTracker${questionIndex} dragDropTextContainer">
          <input
            name="DragForm[${questionIndex}][Inputs][${newIndex}]"
            type="text"
            class="form-control"
            style="display: inline; width: fit-content"
          />
        </span>&nbsp;
      `;

      // 3) Insert the snippet at the *end* of the current editor content
      //    (Or at the caret position, if your EditorComponent supports it.)
      const currentHtml = question.value || '';
      const updatedHtml = currentHtml + snippet;

      // 4) Assign back to the question and notify
      question.value = updatedHtml;
      this.notifyChange();
    }

    /**
     * Called each time the editor’s (ngModelChange) fires
     * (i.e., user typed something). We parse the <input> fields from the HTML
     * to keep question.inputs[] in sync, if desired.
     *
     * If you prefer to store them only in the HTML, skip this step.
     */
    onEditorChanged(htmlValue: string, question: CreateOrEditDragFormQuestionDto, questionIndex: number): void {
      question.value = htmlValue;

      // Parse out any <input name="DragForm[questionIndex][Inputs][X]" ... >
      // We'll store them in question.inputs to see what the user typed.
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlValue, 'text/html');

      const inputSelector = `input[name^="DragForm[${questionIndex}][Inputs]"]`;
      const inputElements = Array.from(doc.querySelectorAll(inputSelector)) as HTMLInputElement[];

      question.inputs = inputElements.map((el) => el.value || '');

      // If you also want to track the next "X" index from the parsed inputs,
      // you could do so by comparing the highest X found in the `name` attribute, etc.

      this.notifyChange();
    }
}
