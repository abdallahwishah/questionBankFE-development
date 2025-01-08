import { Component, Injector, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AppComponentBase } from '@shared/common/app-component-base';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    CreateOrEditTableDragItemDto,
    CreateOrEditTableDragQuestionDto,
} from '@shared/service-proxies/service-proxies';
import { CommonModule } from '@node_modules/@angular/common';

@Component({
    selector: 'app-drag-drop-table',
    standalone: true,
    imports: [FormsModule, InputNumberModule, ButtonModule, TableModule, DragDropModule, CommonModule],
    templateUrl: './drag-drop-table.component.html',
    styleUrls: ['./drag-drop-table.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DragDropTableComponent),
            multi: true,
        },
    ],
})
export class DragDropTableComponent extends AppComponentBase implements ControlValueAccessor {
    /**
     * The array of rows, each containing a list of cells.
     * Bound from the parent form with:
     *   <app-drag-drop-table [(ngModel)]="value.tableDragQuestions"></app-drag-drop-table>
     */
    value: CreateOrEditTableDragQuestionDto[] = [];

    /**
     * User inputs for how many rows & columns to generate
     * when "Generate" is clicked.
     */
    tableHeight = 2; // default 2 rows
    tableWidth = 2; // default 2 columns

    // ControlValueAccessor callbacks
    private onChange: (val: CreateOrEditTableDragQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
        super(injector);
    }

    // ---------------------------------------------
    // ControlValueAccessor
    // ---------------------------------------------
    writeValue(obj: CreateOrEditTableDragQuestionDto[]): void {
        this.value = obj || [];
    }

    registerOnChange(fn: (val: CreateOrEditTableDragQuestionDto[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        // If you need to disable the entire table, handle it here
    }

    /**
     * Call whenever we modify this.value
     * so the parent form knows about the changes.
     */
    notifyValueChange(): void {
        this.onChange(this.value);
        this.onTouched();
    }

    // ---------------------------------------------
    // Generate the table once from row/col inputs
    // ---------------------------------------------
    buildTable(): void {
        const rowCount = Math.max(1, this.tableHeight); // ensure at least 1
        const colCount = Math.max(1, this.tableWidth);

        // Clear existing data
        this.value = [];

        for (let r = 0; r < rowCount; r++) {
            const rowDto = new CreateOrEditTableDragQuestionDto();
            rowDto.dragDropTableColumnIndex = r;
            // Optional row label
            rowDto.dragDropTableHeaders = `${this.l('Row')} ${r + 1}`;
            rowDto.dragDropTableItems = [];

            for (let c = 0; c < colCount; c++) {
                const cell = new CreateOrEditTableDragItemDto();
                cell.title = ''; // user will fill
                cell.isPinned = false; // user can toggle
                cell.order = c; // optional
                rowDto.dragDropTableItems.push(cell);
            }

            this.value.push(rowDto);
        }

        // Notify the parent that we have a fresh table
        this.notifyValueChange();
    }

    // ---------------------------------------------
    // Reorder entire rows by dragging the handle
    // ---------------------------------------------
    dropRow(event: CdkDragDrop<CreateOrEditTableDragQuestionDto[]>): void {
        moveItemInArray(this.value, event.previousIndex, event.currentIndex);
        this.notifyValueChange();
    }
}
