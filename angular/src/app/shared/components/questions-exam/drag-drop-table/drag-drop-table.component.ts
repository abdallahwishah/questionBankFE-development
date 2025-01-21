// drag-drop-table.component.ts
import {
    Component,
    Input,
    forwardRef,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ViewChildren,
    QueryList,
    AfterViewInit,
    ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

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
    order?: number;
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
        return this.tableView?.rows || 1;
    }

    get actualColumns(): number {
        return this.tableView?.columns || 1;
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

        const dropListsArray = this.dropLists.toArray();
        const allLists = [this.sourceList, ...dropListsArray];
        allLists.forEach((list) => {
            const otherLists = allLists.filter((l) => l !== list);
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
        const calculatedOrder = this.calculateOrder(rowIndex, colIndex);

        if (!this.internalValue[rowIndex]?.[colIndex].pinned) {
            if (event.previousContainer === this.sourceList) {
                const itemIndex = this.draggableItems.findIndex((item) => item.title === draggedItem.title);
                if (itemIndex !== -1) {
                    this.draggableItems.splice(itemIndex, 1);
                }
            }

            this.internalValue[rowIndex][colIndex] = {
                value: draggedItem.title,
                pinned: false,
                checked: false,
                order: calculatedOrder
            };

            this.updateFormValue();
            this.onTouchedFn();
            this.cdr.detectChanges();
        }
    }

    private calculateOrder(rowIndex: number, colIndex: number): number {
        return (colIndex * this.actualRows) + rowIndex + 1;
    }

    removeItem(rowIndex: number, colIndex: number, event?: MouseEvent): void {
        if (this.isDisabled) return;
        if (event) {
            event.stopPropagation();
        }

        const cell = this.internalValue[rowIndex]?.[colIndex];
        if (!cell || cell.pinned || !cell.value) return;

        const removedItem: DragDropItem = {
            title: cell.value,
            isPinned: false,
            order: cell.order || 0
        };
        this.draggableItems.push(removedItem);

        this.internalValue[rowIndex][colIndex] = {
            value: null,
            pinned: false,
            checked: false,
            order: 0
        };

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
        this.internalValue = Array(this.actualRows)
            .fill(null)
            .map(() =>
                Array(tv.columns)
                    .fill(null)
                    .map(() => ({
                        value: null,
                        pinned: false,
                        checked: false,
                        order: 0
                    })),
            );

        // Process pinned items from cells array
        tv.cells.forEach((cell) => {
            if (!cell?.dargDropTableItems) return;

            cell.dargDropTableItems.forEach((item) => {
                if (item.isPinned) {
                    const { rowIndex, colIndex } = this.findCellPositionByOrder(item.order);
                    if (rowIndex !== -1 && colIndex !== -1) {
                        this.internalValue[rowIndex][colIndex] = {
                            value: item.title,
                            pinned: true,
                            checked: true,
                            order: item.order
                        };
                    }
                }
            });
        });

        this.updateFormValue();
    }

    private findCellPositionByOrder(order: number): { rowIndex: number; colIndex: number } {
        const rowIndex = (order - 1) % this.actualRows;
        const colIndex = Math.floor((order - 1) / this.actualRows);

        if (colIndex >= this.actualColumns) {
            return { rowIndex: -1, colIndex: -1 };
        }

        return { rowIndex, colIndex };
    }

    private initializeDraggableItems(): void {
        const tv = this.tableView;
        if (!tv?.allColumns?.dargDropTableItems) {
            this.draggableItems = [];
            return;
        }

        this.draggableItems = tv.allColumns.dargDropTableItems
            .filter((item) => !item.isPinned)
            .map((item) => ({
                title: item.title,
                isPinned: item.isPinned,
                order: item.order,
            }));

        // Sort draggable items by order
        this.draggableItems.sort((a, b) => a.order - b.order);
    }

    private updateInternalValue(): void {
        const tv = this.tableView;
        if (!tv) return;

        // Preserve existing order values when updating
        const existingOrders = this.internalValue.map(row =>
            row.map(cell => ({ value: cell.value, order: cell.order }))
        );

        this.internalValue = Array(this.actualRows)
            .fill(null)
            .map((_, rowIndex) =>
                Array(tv.columns)
                    .fill(null)
                    .map((__, colIndex) => {
                        const existingCell = existingOrders[rowIndex]?.[colIndex];
                        return {
                            value: null,
                            pinned: false,
                            checked: false,
                            order: existingCell?.order || this.calculateOrder(rowIndex, colIndex)
                        };
                    }),
            );

        this.value.forEach((columnValue, colIndex) => {
            columnValue.words.forEach((word, rowIndex) => {
                if (this.internalValue[rowIndex]?.[colIndex]) {
                    const isPinned = this.isPinnedCell(rowIndex, colIndex);
                    const order = existingOrders[rowIndex]?.[colIndex]?.order ||
                                this.calculateOrder(rowIndex, colIndex);

                    this.internalValue[rowIndex][colIndex] = {
                        value: word,
                        pinned: isPinned,
                        checked: isPinned,
                        order
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
                .map((row) => row[columnIndex].value)
                .filter((word): word is string => word !== null),
        }));

        this.onChangeFn(this.value);
    }

    private isPinnedCell(rowIndex: number, colIndex: number): boolean {
        const tv = this.tableView;
        if (!tv || rowIndex >= this.actualRows) return false;

        const cell = tv.cells[rowIndex];
        if (!cell?.dargDropTableItems) return false;

        return cell.dargDropTableItems.some(item =>
            item.isPinned &&
            this.findCellPositionByOrder(item.order).colIndex === colIndex
        );
    }
}
