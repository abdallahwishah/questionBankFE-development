import { Component, Injector, forwardRef, ViewChildren, QueryList } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AppComponentBase } from '@shared/common/app-component-base';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

 import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuillInputEditorComponent } from '@app/shared/components/quill-editor/quill-editor.component';
import { CreateOrEditDragFormQuestionDto } from '@shared/service-proxies/service-proxies';



@Component({
  selector: 'app-drag-drop-words',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    ButtonModule,
    QuillInputEditorComponent, // Use our new Quill component
    DragDropModule
  ],
  templateUrl: './drag-drop-words.component.html',
  styleUrls: ['./drag-drop-words.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DragDropWordsComponent),
      multi: true,
    },
  ],
})
export class DragDropWordsComponent
  extends AppComponentBase
  implements ControlValueAccessor
{
  // The array of question blocks
  value: CreateOrEditDragFormQuestionDto[] = [];
  private correctCounterMap = new Map<number, number>();

  // So we can call child methods like `insertInputAtCursor(...)`
  @ViewChildren(QuillInputEditorComponent) editors!: QueryList<QuillInputEditorComponent>;

  private onChange: (val: CreateOrEditDragFormQuestionDto[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(injector: Injector) {
    super(injector);
  }

  // ControlValueAccessor
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

  notifyChange(): void {
    this.onChange(this.value);
    this.onTouched();
  }

  // Reorder with drag-drop
  dropReorder(event: CdkDragDrop<CreateOrEditDragFormQuestionDto[]>): void {
    moveItemInArray(this.value, event.previousIndex, event.currentIndex);
    this.notifyChange();
  }

  // Add/Remove question blocks
  addNewText(): void {
    const item = new CreateOrEditDragFormQuestionDto();
    item.type = 0;
    item.value = '';
    item.inputs = [];
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

  // Insert a correct input at the *current cursor* in Quill
  insertCorrectInputField(question: CreateOrEditDragFormQuestionDto, questionIndex: number): void {
    const currentCount = this.correctCounterMap.get(questionIndex) || 0;
    const newIndex = currentCount;
    this.correctCounterMap.set(questionIndex, currentCount + 1);

    const name = `DragForm[${questionIndex}][Inputs][${newIndex}]`;
    const val = 'Initial text';

    // We find the Quill editor for this question block:
    // The nth question => nth editor in @ViewChildren
    const editorInstance = this.editors.toArray()[questionIndex];
    if (editorInstance) {
      // insert at cursor
      editorInstance.insertInputAtCursor(name, val);
    }

    this.notifyChange();
  }

  // Manage FAKE words
  addFakeWord(question: CreateOrEditDragFormQuestionDto, newWord: string): void {
    if (!newWord) return;
    if (!question.fakeInputs) question.fakeInputs = [];
    question.fakeInputs.push(newWord);
    this.notifyChange();
  }
  removeFakeWord(question: CreateOrEditDragFormQuestionDto, index: number): void {
    if (question.fakeInputs && index >= 0 && index < question.fakeInputs.length) {
      question.fakeInputs.splice(index, 1);
      this.notifyChange();
    }
  }

  // Called whenever Quill editor changes => parse <input>
  onEditorChanged(
    htmlValue: string,
    question: CreateOrEditDragFormQuestionDto,
    questionIndex: number
  ): void {
    question.value = htmlValue;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlValue, 'text/html');

    // correct inputs => name="DragForm[i][Inputs][x]"
    const correctSelector = `input[name^="DragForm[${questionIndex}][Inputs]"]`;
    const correctEls = Array.from(doc.querySelectorAll(correctSelector)) as HTMLInputElement[];

    question.inputs = correctEls.map(el => el.value || '');
    this.notifyChange();
  }
}
