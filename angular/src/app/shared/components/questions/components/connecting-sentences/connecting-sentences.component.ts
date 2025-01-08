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

  import {
    CdkDragDrop,
    moveItemInArray
  } from '@angular/cdk/drag-drop';
  import { FormsModule } from '@angular/forms';
  import { InputNumberModule } from 'primeng/inputnumber';
  import { ButtonModule } from 'primeng/button';
  import { CheckboxModule } from 'primeng/checkbox';
  import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@node_modules/@angular/common';

  /** DTO for each match item */
  export class CreateOrEditMatchQuestionDto {
    word!: string | undefined;          // left word
    matchedWord!: string | undefined;   // right word
    matchedFakeWord!: string | undefined; // optional fake word
    point!: number;
  }

  @Component({
    selector: 'app-connecting-sentences',
    standalone: true,
    imports: [
      FormsModule,
      InputNumberModule,
      ButtonModule,
      CheckboxModule,
      DragDropModule,
      CommonModule
    ],
    templateUrl: './connecting-sentences.component.html',
    styleUrls: ['./connecting-sentences.component.css'],
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ConnectingSentencesComponent),
        multi: true
      }
    ]
  })
  export class ConnectingSentencesComponent
    extends AppComponentBase
    implements ControlValueAccessor
  {
    /** The entire array from the parent. We separate real vs fake in getters below. */
    value: CreateOrEditMatchQuestionDto[] = [];

    /** Toggle for showing/hiding fake answers. */
    addFakeAnswers = false;

    // ControlValueAccessor callbacks
    private onChange: (val: CreateOrEditMatchQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
      super(injector);
    }

    // --------------------------------
    // ControlValueAccessor
    // --------------------------------
    writeValue(obj: CreateOrEditMatchQuestionDto[]): void {
      this.value = obj || [];
    }

    registerOnChange(fn: (val: CreateOrEditMatchQuestionDto[]) => void): void {
      this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
      // Handle disabling logic if needed
    }

    notifyValueChange(): void {
      this.onChange(this.value);
      this.onTouched();
    }

    // --------------------------------
    // Real vs Fake separation
    // --------------------------------
    /** Real items: no 'matchedFakeWord' */
    get realPairs(): CreateOrEditMatchQuestionDto[] {
      return this.value.filter(item => !item.matchedFakeWord);
    }

    /** Fake items: 'matchedFakeWord' is set */
    get fakeAnswersList(): CreateOrEditMatchQuestionDto[] {
      return this.value.filter(item => item.matchedFakeWord !== undefined);
    }

    // --------------------------------
    // Real pairs logic
    // --------------------------------
    addRealPair(): void {
      const pair = new CreateOrEditMatchQuestionDto();
      pair.point = 1;
      pair.word = '';
      pair.matchedWord = '';
      this.value.push(pair);
      this.notifyValueChange();
    }

    removeRealPair(item: CreateOrEditMatchQuestionDto): void {
      const index = this.value.indexOf(item);
      if (index !== -1) {
        this.value.splice(index, 1);
        this.notifyValueChange();
      }
    }

    /** Reorder real pairs array via drag-drop event. */
    dropReal(event: CdkDragDrop<CreateOrEditMatchQuestionDto[]>): void {
      const realItems = this.realPairs; // a filtered array
      moveItemInArray(realItems, event.previousIndex, event.currentIndex);

      // Because `this.realPairs` is derived from `this.value`,
      // we need to reorder them in the base array as well.
      // Easiest way: reconstruct the new order in `this.value`.
      const newOrdered = [
        ...realItems,
        ...this.fakeAnswersList
      ];
      this.value = newOrdered;
      this.notifyValueChange();
    }

    // --------------------------------
    // Fake answers logic

    addFake(): void {
      const fake = new CreateOrEditMatchQuestionDto();
      fake.matchedFakeWord = ' ';
      fake.point = 1;
      this.value.push(fake);
      this.notifyValueChange();
    }

    removeFakeAnswer(item: CreateOrEditMatchQuestionDto): void {
      const index = this.value.indexOf(item);
      if (index !== -1) {
        this.value.splice(index, 1);
        this.notifyValueChange();
      }
    }

    /** Reorder fake items array via drag-drop event. */
    dropFake(event: CdkDragDrop<CreateOrEditMatchQuestionDto[]>): void {
      const fakeItems = this.fakeAnswersList;
      moveItemInArray(fakeItems, event.previousIndex, event.currentIndex);

      // Merge them back into the main array in the new order
      const newOrdered = [
        ...this.realPairs,
        ...fakeItems
      ];
      this.value = newOrdered;
      this.notifyValueChange();
    }
  }
