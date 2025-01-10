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
import { CommonModule } from '@node_modules/@angular/common';

// For drag-drop
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

/**
 * Example DTO.
 *  - 'value' => the HTML content with <input> tags for correct answers.
 *  - 'inputs' => array of correct answers parsed from the editor.
 *  - 'fakeInputs' => array of "fake words" managed outside the editor.
 */
export class CreateOrEditDragFormQuestionDto {
    type!: number;
    value!: string | undefined;
    inputs!: string[] | undefined;
    fakeInputs!: string[] | undefined;
    point!: number;
}

@Component({
    selector: 'app-drag-drop-words',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputNumberModule,
        ButtonModule,
        EditorComponent,
        DragDropModule
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
     * An array of question blocks (each can be drag-dropped).
     */
    value: CreateOrEditDragFormQuestionDto[] = [];

    /**
     * For inserting correct inputs inside the editor, we track how many so far
     * to build a unique index for each input name: "DragForm[i][Inputs][X]".
     */
    private correctCounterMap = new Map<number, number>();

    // ControlValueAccessor
    private onChange: (val: CreateOrEditDragFormQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
        super(injector);
    }

    writeValue(obj: CreateOrEditDragFormQuestionDto[]): void {
        this.value = obj || [];
    }

    registerOnChange(fn: (val: CreateOrEditDragFormQuestionDto[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {}

    /** Notify parent form that our data changed */
    notifyChange(): void {
        this.onChange(this.value);
        this.onTouched();
    }

    // ---------------------------
    // Drag & Drop to reorder
    // ---------------------------
    dropReorder(event: CdkDragDrop<CreateOrEditDragFormQuestionDto[]>): void {
        moveItemInArray(this.value, event.previousIndex, event.currentIndex);
        this.notifyChange();
    }

    // ---------------------------
    // Add/Remove question blocks
    // ---------------------------
    addNewText(): void {
        const item = new CreateOrEditDragFormQuestionDto();
        item.type = 0;
        item.value = '';       // Editor starts blank
        item.inputs = [];      // correct answers
        item.fakeInputs = [];  // fake answers
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

    // ---------------------------
    // Insert CORRECT inputs into editor
    // ---------------------------
    insertCorrectInputField(
        question: CreateOrEditDragFormQuestionDto,
        questionIndex: number
    ): void {
        const currentCount = this.correctCounterMap.get(questionIndex) || 0;
        const newIndex = currentCount;
        this.correctCounterMap.set(questionIndex, currentCount + 1);

        // Build snippet with a unique name for the correct input
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

        // Append to the existing HTML
        const oldHtml = question.value || '';
        question.value = oldHtml + snippet;
        this.notifyChange();
    }

    // ---------------------------
    // Manage FAKE words (outside the editor)
    // ---------------------------
    addFakeWord(question: CreateOrEditDragFormQuestionDto, newWord: string): void {
        if (!newWord) { return; }
        if (!question.fakeInputs) {
            question.fakeInputs = [];
        }
        question.fakeInputs.push(newWord);
        this.notifyChange();
    }

    removeFakeWord(question: CreateOrEditDragFormQuestionDto, index: number): void {
        if (question.fakeInputs && index >= 0 && index < question.fakeInputs.length) {
            question.fakeInputs.splice(index, 1);
            this.notifyChange();
        }
    }

    // ---------------------------
    // On editor change => parse correct inputs
    // ---------------------------
    onEditorChanged(
        htmlValue: string,
        question: CreateOrEditDragFormQuestionDto,
        questionIndex: number
    ): void {
        question.value = htmlValue;

        // Parse out correct inputs only
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlValue, 'text/html');

        // correct inputs => name="DragForm[i][Inputs][x]"
        const correctSelector = `input[name^="DragForm[${questionIndex}][Inputs]"]`;
        const correctEls = Array.from(doc.querySelectorAll(correctSelector)) as HTMLInputElement[];

        question.inputs = correctEls.map(el => el.value || '');
        this.notifyChange();
    }
}
