import { Component, Injector, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@node_modules/@angular/common';
import { CreateOrEditRearrangeQuestionDto } from '@shared/service-proxies/service-proxies';



@Component({
    selector: 'app-re-order',
    standalone: true,
    imports: [
        FormsModule,
        InputNumberModule,
        ButtonModule,
        CheckboxModule,
        DragDropModule,
        CommonModule
    ],
    templateUrl: './re-order.component.html',
    styleUrls: ['./re-order.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ReOrderComponent),
            multi: true,
        },
    ],
})
export class ReOrderComponent extends AppComponentBase implements ControlValueAccessor {
    value: CreateOrEditRearrangeQuestionDto[] = [];

    // ControlValueAccessor callbacks
    private onChange: (val: CreateOrEditRearrangeQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
        super(injector);
    }

    writeValue(obj: CreateOrEditRearrangeQuestionDto[]): void {
        this.value = obj || [];
        this.setOrderIndexes(); // Make sure orders are synced on initial load
    }

    registerOnChange(fn: (val: CreateOrEditRearrangeQuestionDto[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {}

    // Make sure each item has the correct order according to its position.
    private setOrderIndexes(): void {
        this.value.forEach((item, index) => {
            item.order = index + 1; // or index if you prefer zero-based
        });
    }

    notifyValueChange(): void {
        // Re-sync order => index
        this.setOrderIndexes();
        // Let parent form know of changes
        this.onChange(this.value);
        this.onTouched();
    }

    // -----------------------------------
    // Business Logic
    // -----------------------------------

    addRearrangeItem(): void {
        const newItem = new CreateOrEditRearrangeQuestionDto();
        newItem.word = '';
        newItem.point = 1;
        // We'll call notifyValueChange() which sets item.order later
        this.value.push(newItem);
        this.notifyValueChange();
    }

    removeRearrangeItem(index: number): void {
        if (index >= 0 && index < this.value.length) {
            this.value.splice(index, 1);
            this.notifyValueChange();
        }
    }

    dropReorder(event: CdkDragDrop<CreateOrEditRearrangeQuestionDto[]>): void {
        moveItemInArray(this.value, event.previousIndex, event.currentIndex);
        // Re-sync orders & notify
        this.notifyValueChange();
    }
}
