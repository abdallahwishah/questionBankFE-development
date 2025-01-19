import { Component, Injector, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AppComponentBase } from '@shared/common/app-component-base';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';

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
   * "value" is an array of columns (not rows).
   * Each item => one column.
   * `dragDropTableItems` => rows within that column.
   */
  value: CreateOrEditTableDragQuestionDto[] = [];

  /**
   * We'll interpret:
   *  tableHeight => how many columns
   *  tableWidth  => how many rows (for each column)
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

  setDisabledState?(isDisabled: boolean): void {
    // If needed, disable inputs here
  }

  /**
   * Whenever our data changes, notify the parent form.
   */
  notifyValueChange(): void {
    this.onChange(this.value);
    this.onTouched();
  }

  // ---------------------------------------------
  // Build or Update the table (columns-based)
  // ---------------------------------------------
  buildOrUpdateTable(): void {
    const newColCount = Math.max(1, this.tableHeight); // columns
    const newRowCount = Math.max(1, this.tableWidth);  // rows

    // If no existing data, build from scratch
    if (!this.value || this.value.length === 0) {
      this.value = this.buildNewTable(newColCount, newRowCount);
      // Recalculate orders so each cell has a unique order (column-by-column)
      this.recalcItemOrdersColumnMajor();
      // Notify parent form
      this.notifyValueChange();
      return;
    }

    // If we already have data, preserve as best we can
    const oldColCount = this.value.length;
    const oldRowCount = oldColCount > 0
      ? this.value[0].dragDropTableItems?.length || 0
      : 0;

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
          cell.isPinned = false;
          cell.title = '';
          items.push(cell);
        }
      }

      colDto.dragDropTableColumnIndex = colIndex;
      colDto.dragDropTableItems = items;
    });

    // Recalculate orders so each cell has a unique order (column-by-column)
    this.recalcItemOrdersColumnMajor();

    // Notify parent form
    this.notifyValueChange();
  }

  /**
   * Build a brand new table => array of columns
   */
  private buildNewTable(colCount: number, rowCount: number): CreateOrEditTableDragQuestionDto[] {
    const newCols: CreateOrEditTableDragQuestionDto[] = [];
    for (let c = 0; c < colCount; c++) {
      newCols.push(this.buildColumn(c, rowCount));
    }
    return newCols;
  }

  /**
   * Build one column => `CreateOrEditTableDragQuestionDto`.
   * That column has rowCount items; each is just a blank cell initially.
   */
  private buildColumn(colIndex: number, rowCount: number): CreateOrEditTableDragQuestionDto {
    const colDto = new CreateOrEditTableDragQuestionDto();
    colDto.dragDropTableColumnIndex = colIndex;
    colDto.dragDropTableHeader = `Column ${colIndex + 1}`;

    const items: CreateOrEditTableDragItemDto[] = [];
    for (let r = 0; r < rowCount; r++) {
      const cell = new CreateOrEditTableDragItemDto();
      cell.isPinned = false;
      cell.title = '';
      items.push(cell);
    }

    colDto.dragDropTableItems = items;
    return colDto;
  }

  /**
   * Recalculate the `order` for each cell in a **column-major** order:
   * - Column #1 (rows 1..N) => order 1..N
   * - Column #2 (rows 1..N) => order N+1..2N
   * - and so on...
   *
   * For a 3×3 table:
   *   col1 => row1 => order=1, row2 => order=2, row3 => order=3
   *   col2 => row1 => order=4, row2 => order=5, row3 => order=6
   *   col3 => row1 => order=7, row2 => order=8, row3 => order=9
   */
  private recalcItemOrdersColumnMajor(): void {
    let runningOrder = 1;

    const colCount = this.value.length;
    if (colCount === 0) {
      return;
    }

    // Assume each column has the same number of rows
    const rowCount = this.value[0].dragDropTableItems?.length || 0;

    // Loop columns first, then rows inside each column
    for (let c = 0; c < colCount; c++) {
      for (let r = 0; r < rowCount; r++) {
        const item = this.value[c].dragDropTableItems?.[r];
        if (!item) {
          continue;
        }
        item.order = runningOrder;
        runningOrder++;
      }
    }
  }
}
