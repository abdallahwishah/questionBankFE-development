import { Component, Input, forwardRef, OnInit, ViewEncapsulation, ViewChild, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    CdkDropList,
    CdkDrag,
    CdkDragDrop,
    DragDropModule,
} from '@angular/cdk/drag-drop';

interface DragDropItem {
    title: string;
    isPinned: boolean;
    order: number;
}

interface DragDropCell {
    dragDropTableHeaders: string | null;
    dragDropTableColmunIndex: number;
    dargDropTableItems: DragDropItem[];
}

export interface DragDropTableView {
    rows: number;
    columns: number;
    headers: string[];
    allColumns: {
        dragDropTableHeaders: string;
        dragDropTableColmunIndex: number;
        dargDropTableItems: DragDropItem[];
    };
    cells: DragDropCell[];
}

export interface TableValue {
    title: string;
    words: string[];
}

export interface TableCell {
    value: string | null;
    pinned: boolean;
    checked: boolean;
}

@Component({
    selector: 'app-drag-drop-table',
    standalone: true,
    imports: [CommonModule, DragDropModule],
    templateUrl: './drag-drop-table.component.html',
    styleUrls: ['./drag-drop-table.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DragDropTableComponent),
            multi: true,
        },
    ],
    encapsulation: ViewEncapsulation.None,
})
export class DragDropTableComponent implements OnInit, AfterViewInit, ControlValueAccessor {
    @Input() config: any | null = null;
    @ViewChild('sourceList') sourceList!: CdkDropList;
    @ViewChildren('dropList') dropLists!: QueryList<CdkDropList>;

    value: TableValue[] = [];
    internalValue: Array<Array<TableCell>> = [];
    draggableItems: DragDropItem[] = [];
    isDisabled = false;

    get tableView(): DragDropTableView | undefined {
        return this.config?.questionPayload?.dragDropTableView || undefined;
    }

    get actualRows(): number {
        return (this.tableView?.rows || 1) - 1;
    }

    private onChangeFn: (val: TableValue[]) => void = () => {};
    private onTouchedFn: () => void = () => {};

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.buildTableFromConfig();
        this.initializeDraggableItems();
    }

    ngAfterViewInit(): void {
        this.setupDropLists();
    }

    private setupDropLists(): void {
        if (!this.sourceList || !this.dropLists) return;

        // Get all drop lists including the source
        const dropListsArray = this.dropLists.toArray();

        // Connect all lists together
        const allLists = [this.sourceList, ...dropListsArray];
        allLists.forEach(list => {
            const otherLists = allLists.filter(l => l !== list);
            list.connectedTo = otherLists;
        });

        this.cdr.detectChanges();
    }

    writeValue(obj: TableValue[]): void {
        if (Array.isArray(obj)) {
            this.value = [...obj];
            this.updateInternalValue();
        } else {
            this.buildTableFromConfig();
        }
        this.cdr.markForCheck();
    }

    registerOnChange(fn: (val: TableValue[]) => void): void {
        this.onChangeFn = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouchedFn = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    handleDrop(event: CdkDragDrop<any>): void {
        if (this.isDisabled) return;

        const draggedItem = event.item.data;
        const { container } = event;

        if (!draggedItem || !container.data) return;

        const { rowIndex, colIndex } = container.data;

        if (!this.internalValue[rowIndex]?.[colIndex].pinned) {
            // Remove from draggable items if coming from source list
            if (event.previousContainer === this.sourceList) {
                const itemIndex = this.draggableItems.findIndex(item => item.title === draggedItem.title);
                if (itemIndex !== -1) {
                    this.draggableItems.splice(itemIndex, 1);
                }
            }

            // Update the target cell
            this.internalValue[rowIndex][colIndex] = {
                value: draggedItem.title,
                pinned: false,
                checked: false
            };

            this.updateFormValue();
            this.onTouchedFn();
            this.cdr.detectChanges();
        }
    }

    removeItem(rowIndex: number, colIndex: number, event?: MouseEvent): void {
        if (this.isDisabled) return;
        if (event) {
            event.stopPropagation();
        }

        const cell = this.internalValue[rowIndex]?.[colIndex];
        if (!cell || cell.pinned || !cell.value) return;

        // Add back to draggable items
        const removedItem: DragDropItem = {
            title: cell.value,
            isPinned: false,
            order: 0
        };
        this.draggableItems.push(removedItem);

        // Reset the cell completely
        this.internalValue[rowIndex][colIndex] = {
            value: null,
            pinned: false,
            checked: false
        };

        // Ensure drop lists are properly connected
        this.setupDropLists();

        this.updateFormValue();
        this.onTouchedFn();
        this.cdr.detectChanges();
    }

    private buildTableFromConfig(): void {
        const tv = this.tableView;
        if (!tv) {
            this.internalValue = [];
            return;
        }

        // Initialize empty table
        this.internalValue = Array(this.actualRows).fill(null).map(() =>
            Array(tv.columns).fill(null).map(() => ({
                value: null,
                pinned: false,
                checked: false
            }))
        );

        // Process each row from cells array
        for (let rowIndex = 0; rowIndex < this.actualRows; rowIndex++) {
            const rowData = tv.cells[rowIndex];
            if (!rowData?.dargDropTableItems) continue;

            // Process each column in the row
            rowData.dargDropTableItems.forEach((item, colIndex) => {
                if (item?.isPinned && colIndex < tv.columns) {
                    this.internalValue[rowIndex][colIndex] = {
                        value: item.title,
                        pinned: true,
                        checked: true
                    };
                }
            });
        }

        this.updateFormValue();
    }

    private initializeDraggableItems(): void {
        const tv = this.tableView;
        if (!tv?.allColumns?.dargDropTableItems) {
            this.draggableItems = [];
            return;
        }

        this.draggableItems = tv.allColumns.dargDropTableItems
            .filter(item => !item.isPinned)
            .map(item => ({
                title: item.title,
                isPinned: item.isPinned,
                order: item.order
            }));
    }

    private updateInternalValue(): void {
        const tv = this.tableView;
        if (!tv) return;

        this.internalValue = Array(this.actualRows).fill(null).map(() =>
            Array(tv.columns).fill(null).map(() => ({
                value: null,
                pinned: false,
                checked: false
            }))
        );

        // Fill from value maintaining pinned status
        this.value.forEach((columnValue, colIndex) => {
            columnValue.words.forEach((word, rowIndex) => {
                if (this.internalValue[rowIndex]?.[colIndex]) {
                    const isPinned = this.isPinnedCell(rowIndex, colIndex);
                    this.internalValue[rowIndex][colIndex] = {
                        value: word,
                        pinned: isPinned,
                        checked: isPinned
                    };
                }
            });
        });
    }

    private updateFormValue(): void {
        const tv = this.tableView;
        if (!tv) return;

        this.value = tv.headers.map((header, columnIndex) => ({
            title: header,
            words: this.internalValue
                .map(row => row[columnIndex].value)
                .filter((word): word is string => word !== null)
        }));

        this.onChangeFn(this.value);
    }

    private isPinnedCell(rowIndex: number, colIndex: number): boolean {
        const tv = this.tableView;
        if (!tv || rowIndex >= this.actualRows) return false;

        const rowData = tv.cells[rowIndex];
        if (!rowData?.dargDropTableItems) return false;

        return rowData.dargDropTableItems[colIndex]?.isPinned || false;
    }
}
