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

@Component({
    selector: 'app-drag-drop-table',
    standalone: true,
    imports: [
        FormsModule,
        InputNumberModule,
        ButtonModule,
        TableModule,
        CommonModule
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
     * The array of rows, each containing a list of cells.
     * The first row (index=0) is "header" => pinned = true, titled "Header" by default.
     * Later rows => data => pinned can be toggled by user.
     */
    value: CreateOrEditTableDragQuestionDto[] = [];

    /**
     * User inputs for how many total rows & columns
     * (including the header row).
     */
    tableHeight = 3; // default = 3
    tableWidth = 3;  // default = 3

    // ControlValueAccessor callbacks
    private onChange: (val: CreateOrEditTableDragQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
        super(injector);
    }

    // ----------------------------------------------------------------
    // ControlValueAccessor
    // ----------------------------------------------------------------
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
        // If you need to disable the entire table or some controls, do it here
    }

    /**
     * Notify the parent form any time `this.value` changes.
     */
    notifyValueChange(): void {
        this.onChange(this.value);
        this.onTouched();
    }

    // ----------------------------------------------------------------
    // Build or Update Table
    // ----------------------------------------------------------------

    /**
     * Called by a button in the template to (re-)generate the table
     * according to `tableHeight` & `tableWidth`.
     *
     * If the new size is smaller than existing, confirm before truncating.
     */
    buildOrUpdateTable(): void {
        const newRowCount = Math.max(1, this.tableHeight);
        const newColCount = Math.max(1, this.tableWidth);

        // If no existing table data, build from scratch
        if (!this.value || this.value.length === 0) {
            this.value = this.buildNewTable(newRowCount, newColCount);
            this.notifyValueChange();
            return;
        }

        // If we already have data, preserve it while adjusting size
        const oldRowCount = this.value.length;
        const oldColCount = oldRowCount > 0
            ? (this.value[0].dragDropTableItems?.length || 0)
            : 0;

        // 1) Confirm before removing rows/columns
        if (newRowCount < oldRowCount || newColCount < oldColCount) {
            const confirmMsg = this.l('YouAreAboutToRemoveRowsOrColumns');
            if (!confirm(confirmMsg)) {
                // Revert to old values if user cancels
                this.tableHeight = oldRowCount;
                this.tableWidth = oldColCount;
                return;
            }
        }

        // 2) Adjust row count
        // If newRowCount < oldRowCount => remove extra rows
        if (newRowCount < oldRowCount) {
            this.value.splice(newRowCount, oldRowCount - newRowCount);
        }
        // If newRowCount > oldRowCount => add new rows
        else if (newRowCount > oldRowCount) {
            for (let r = oldRowCount; r < newRowCount; r++) {
                const newRow = this.buildRow(r, newColCount);
                this.value.push(newRow);
            }
        }

        // 3) Adjust column count for each row
        this.value.forEach((rowDto, rowIndex) => {
            const items = rowDto.dragDropTableItems || [];
            const currentCols = items.length;

            // If fewer columns => remove extras
            if (newColCount < currentCols) {
                items.splice(newColCount, currentCols - newColCount);
            }
            // If more columns => add new
            else if (newColCount > currentCols) {
                for (let c = currentCols; c < newColCount; c++) {
                    const cell = new CreateOrEditTableDragItemDto();
                    cell.order = c;
                    // If header row => pinned + default "Header"
                    if (rowIndex === 0) {
                        cell.isPinned = true;
                        cell.title = 'Header';
                    } else {
                        // Data row => pinned false by default, user can toggle
                        cell.isPinned = false;
                        cell.title = '';
                    }
                    items.push(cell);
                }
            }

            // Force pinned in header row, data row pinned is user-defined
            if (rowIndex === 0) {
                items.forEach(cell => {
                    cell.isPinned = true;
                    if (!cell.title) {
                        cell.title = 'Header';
                    }
                });
            }

            rowDto.dragDropTableItems = items;
            rowDto.dragDropTableColumnIndex = rowIndex;
        });

        // 4) Notify the parent form
        this.notifyValueChange();
    }

    /**
     * Build a brand-new table with the given row & column count.
     */
    private buildNewTable(rowCount: number, colCount: number): CreateOrEditTableDragQuestionDto[] {
        const newValue: CreateOrEditTableDragQuestionDto[] = [];
        for (let r = 0; r < rowCount; r++) {
            newValue.push(this.buildRow(r, colCount));
        }
        return newValue;
    }

    /**
     * Build a single row. The 0th row is the header row => pinned = true, "Header" title.
     */
    private buildRow(rowIndex: number, colCount: number): CreateOrEditTableDragQuestionDto {
        const rowDto = new CreateOrEditTableDragQuestionDto();
        rowDto.dragDropTableColumnIndex = rowIndex;
        // For convenience, set dragDropTableHeaders to identify row
        rowDto.dragDropTableHeaders =
            rowIndex === 0
                ? this.l('HeaderRow') + ' ' + (rowIndex + 1)
                : this.l('DataRow')   + ' ' + (rowIndex + 1);

        rowDto.dragDropTableItems = [];

        for (let c = 0; c < colCount; c++) {
            const cell = new CreateOrEditTableDragItemDto();
            cell.order = c;

            if (rowIndex === 0) {
                // Header row => pinned, default "Header"
                cell.isPinned = true;
                cell.title = 'Header';
            } else {
                // Data row => pinned can be toggled by user
                cell.isPinned = false;
                cell.title = '';
            }

            rowDto.dragDropTableItems.push(cell);
        }

        return rowDto;
    }
}
