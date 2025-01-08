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

  import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
  import { FormsModule } from '@angular/forms';
  import { InputNumberModule } from 'primeng/inputnumber';
  import { ButtonModule } from 'primeng/button';
  import { CheckboxModule } from 'primeng/checkbox';
  import { DragDropModule } from '@angular/cdk/drag-drop';

  /** Example DTO for rearranging items */
  export class CreateOrEditRearrangeQuestionDto {
    order!: number;
    point!: number;
    word!: string | undefined;
  }

  @Component({
    selector: 'app-re-order',
    standalone: true,
    imports: [
      FormsModule,
      InputNumberModule,
      ButtonModule,
      CheckboxModule,
      DragDropModule
    ],
    templateUrl: './re-order.component.html',
    styleUrls: ['./re-order.component.css'],
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ReOrderComponent),
        multi: true
      }
    ]
  })
  export class ReOrderComponent
    extends AppComponentBase
    implements ControlValueAccessor
  {
    /**
     * The array of items to reorder,
     * bound from the parent via [(ngModel)]="value.rearrangeQuestions"
     */
    value: CreateOrEditRearrangeQuestionDto[] = [];

    // ControlValueAccessor callbacks
    private onChange: (val: CreateOrEditRearrangeQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
      super(injector);
    }

    // -----------------------------------
    // ControlValueAccessor Implementation
    // -----------------------------------
    writeValue(obj: CreateOrEditRearrangeQuestionDto[]): void {
      this.value = obj || [];
    }

    registerOnChange(fn: (val: CreateOrEditRearrangeQuestionDto[]) => void): void {
      this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
      // If you need to disable child controls, handle it here
    }

    /**
     * Whenever we modify `this.value`, call these
     * so the parent form knows the value changed.
     */
    notifyValueChange(): void {
      this.onChange(this.value);
      this.onTouched();
    }

    // -----------------------------------
    // Business Logic
    // -----------------------------------

    /** Add a new blank item */
    addRearrangeItem(): void {
      const newItem = new CreateOrEditRearrangeQuestionDto();
      newItem.word = '';
      newItem.order = 1;
      newItem.point = 1;
      this.value.push(newItem);
      this.notifyValueChange();
    }

    /** Remove an item from the array */
    removeRearrangeItem(index: number): void {
      if (index >= 0 && index < this.value.length) {
        this.value.splice(index, 1);
        this.notifyValueChange();
      }
    }

    /**
     * Handle drag-and-drop reorder
     * via Angular CDK events
     */
    dropReorder(event: CdkDragDrop<CreateOrEditRearrangeQuestionDto[]>): void {
      moveItemInArray(this.value, event.previousIndex, event.currentIndex);
      this.notifyValueChange();
    }
  }
