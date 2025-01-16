/* drag-drop-table.component.ts */

import { Component, Input, forwardRef, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/*
    Example:
      - DragDropTableView holds the metadata: rows, columns, headers, items, etc.
      - DragTableConfig: top-level config with a questionPayload having dragDropTableView.
  */
export interface DragDropTableView {
    rows: number;
    columns: number;
    headers: string[];
    // other fields, e.g. allColumns, cells, etc.
    // purely for example:
    allColumns?: {
        dargDropTableItems: Array<{
            title: string;
            isPinned?: boolean;
            order?: number; // which col or row they belong to
        }>;
    };
}


/*
    Our internal "cell" model for the user's arrangement or answer.
    You might store pinned vs. non-pinned, or the text, etc.
  */
export interface DragTableCell {
    content: string; // user text
    pinned: boolean; // is it a header or pinned cell?
}

/*
    Our final "value" is a 2D array [row][col].
    Each cell is a DragTableCell.
  */
type DragTableValue = DragTableCell[][];

/*
    Standalone component
    - We import CommonModule for *ngIf, *ngFor, etc.
    - We import FormsModule for two-way binding [(ngModel)].
  */
@Component({
    selector: 'app-drag-drop-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './drag-drop-table.component.html',
    styleUrls: ['./drag-drop-table.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DragDropTableComponent),
            multi: true,
        },
    ],
    encapsulation: ViewEncapsulation.None, // optional if you want your .scss to affect children
})
export class DragDropTableComponent implements OnInit, ControlValueAccessor {
    /* The parent (container) will pass in a config object with questionPayload, etc. */
    @Input() config: any | null = null;

    /*
      "value" = 2D array.
      We'll store the user's table in memory.
      The parent form can read/write it via CVA (ControlValueAccessor).
    */
    value: DragTableValue = [];

    /*
      If the config has questionPayload.dragDropTableView, we store it for easy usage.
      Example: this might have 'rows', 'columns', 'headers', etc.
    */
    get tableView(): DragDropTableView | undefined {
        return this.config?.questionPayload?.dragDropTableView || undefined;
    }

    /* ControlValueAccessor callbacks */
    private onChangeFn: (val: DragTableValue) => void = () => {};
    private onTouchedFn: () => void = () => {};

    constructor() {}

    ngOnInit(): void {
        // If we want to build an initial table from config, we could do it here.
        // But typically, the form might call writeValue() with an existing value.
        // Or we can create a default table if "value" is empty.
        this.buildTableFromConfig();
    }

    /* ---------------------
     * ControlValueAccessor
     * --------------------- */

    writeValue(obj: DragTableValue): void {
        if (Array.isArray(obj)) {
            this.value = obj;
        } else {
            // if no object is given, we can build a default table if we want
            this.buildTableFromConfig();
        }
    }

    registerOnChange(fn: (val: DragTableValue) => void): void {
        this.onChangeFn = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouchedFn = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        // If needed, disable inputs
    }

    /*
      Called whenever user edits a cell (content or pinned).
      We'll propagate the new "value" array upward via onChangeFn.
    */
    onCellChanged(): void {
        this.onChangeFn(this.value);
        this.onTouchedFn();
    }

    /* ---------------------
     * Utility
     * --------------------- */

    /**
     * Build an initial empty table from the config (rows × columns)
     * if "value" isn't already set.
     */
    private buildTableFromConfig(): void {
        const tv = this.tableView;
        if (!tv) {
            this.value = [];
            return;
        }

        // number of rows & columns from config
        const rowCount = tv.rows;
        const colCount = tv.columns;

        // Initialize 2D array if empty
        if (!this.value || this.value.length === 0) {
            const newTable: DragTableValue = [];
            for (let r = 0; r < rowCount; r++) {
                const rowArr: DragTableCell[] = [];
                for (let c = 0; c < colCount; c++) {
                    rowArr.push({
                        content: '', // empty text
                        pinned: false, // not pinned by default
                    });
                }
                newTable.push(rowArr);
            }
            this.value = newTable;
        }
    }
}
