import { Component, Injector, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AppComponentBase } from '@shared/common/app-component-base';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@node_modules/@angular/common';

// Example DTOs (adjust import paths if necessary)
import {
    CreateOrEditTableDragItemDto,
    CreateOrEditTableDragQuestionDto,
} from '@shared/service-proxies/service-proxies';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-drag-drop-table',
    standalone: true,
    imports: [
        FormsModule,
        InputNumberModule,
        ButtonModule,
        TableModule,
        CommonModule,
        CheckboxModule
    ],
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
     * "value" is an array of columns, not rows.
     * Each item in `value` => one column.
     * `dragDropTableItems[]` => the rows in that column (vertical).
     */
    value: CreateOrEditTableDragQuestionDto[] = [];

    /**
     * We'll interpret:
     *  - tableHeight => how many columns
     *  - tableWidth  => how many rows (each column has these many rows)
     */
    tableHeight = 3; // # of columns
    tableWidth = 3;  // # of rows

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

    setDisabledState?(isDisabled: boolean): void {}

    /** Whenever our data changes, notify the parent form. */
    notifyValueChange(): void {
        this.onChange(this.value);
        this.onTouched();
    }

    // ---------------------------------------------
    // Build or Update the "columns-based" table
    // ---------------------------------------------
    buildOrUpdateTable(): void {
        const newColCount = Math.max(1, this.tableHeight); // columns
        const newRowCount = Math.max(1, this.tableWidth);  // rows

        if (!this.value || this.value.length === 0) {
            // Build from scratch
            this.value = this.buildNewTable(newColCount, newRowCount);
            this.notifyValueChange();
            return;
        }

        // Already have data => preserve as best we can
        const oldColCount = this.value.length;
        const oldRowCount = oldColCount > 0 ? (this.value[0].dragDropTableItems?.length || 0) : 0;

        // If removing columns/rows, confirm
        if (newColCount < oldColCount || newRowCount < oldRowCount) {
            const confirmMsg = this.l('YouAreAboutToRemoveRowsOrColumns');
            if (!confirm(confirmMsg)) {
                // revert
                this.tableHeight = oldColCount;
                this.tableWidth = oldRowCount;
                return;
            }
        }

        // Adjust column count
        if (newColCount < oldColCount) {
            // remove extra columns
            this.value.splice(newColCount, oldColCount - newColCount);
        } else if (newColCount > oldColCount) {
            // add new columns
            for (let c = oldColCount; c < newColCount; c++) {
                const newCol = this.buildColumn(c, newRowCount);
                this.value.push(newCol);
            }
        }

        // Adjust row count in each column
        this.value.forEach((colDto, colIndex) => {
            const items = colDto.dragDropTableItems || [];
            const currentRowCount = items.length;

            // remove extra rows
            if (newRowCount < currentRowCount) {
                items.splice(newRowCount, currentRowCount - newRowCount);
            }
            // add new rows
            else if (newRowCount > currentRowCount) {
                for (let r = currentRowCount; r < newRowCount; r++) {
                    const cell = new CreateOrEditTableDragItemDto();
                    cell.order = r;
                    // If row = 0 => pinned & title=Header
                    if (r === 0) {
                        cell.isPinned = true;
                        cell.title = 'Header';
                    } else {
                        cell.isPinned = false;
                        cell.title = '';
                    }
                    items.push(cell);
                }
            }

            // Also, ensure that rowIndex=0 is pinned & titled "Header"
            // in case we had existing data that changed, just reaffirm that rule:
            if (items.length > 0) {
                items[0].isPinned = true;
                if (!items[0].title) {
                    items[0].title = 'Header';
                }
            }

            colDto.dragDropTableColumnIndex = colIndex;
            colDto.dragDropTableItems = items;
        });

        this.notifyValueChange();
    }

    /** Build an entirely new table => an array of columns. */
    private buildNewTable(colCount: number, rowCount: number): CreateOrEditTableDragQuestionDto[] {
        const newValue: CreateOrEditTableDragQuestionDto[] = [];
        for (let c = 0; c < colCount; c++) {
            newValue.push(this.buildColumn(c, rowCount));
        }
        return newValue;
    }

    /**
     * Build one column => `CreateOrEditTableDragQuestionDto`.
     * That column has rowCount items. The top item (row=0) is pinned & titled "Header".
     */
    private buildColumn(colIndex: number, rowCount: number): CreateOrEditTableDragQuestionDto {
        const colDto = new CreateOrEditTableDragQuestionDto();
        colDto.dragDropTableColumnIndex = colIndex;
        colDto.dragDropTableItems = [];

        for (let r = 0; r < rowCount; r++) {
            const cell = new CreateOrEditTableDragItemDto();
            cell.order = r;

            // row=0 => pinned
            if (r === 0) {
                cell.isPinned = true;
                cell.title = 'Header';
            } else {
                cell.isPinned = false;
                cell.title = '';
            }

            colDto.dragDropTableItems.push(cell);
        }

        return colDto;
    }
}
