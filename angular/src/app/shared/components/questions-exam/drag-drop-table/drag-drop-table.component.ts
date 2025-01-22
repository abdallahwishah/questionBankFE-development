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
    OnDestroy
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    CdkDropList,
    CdkDrag,
    CdkDragDrop,
    DragDropModule,
    moveItemInArray,
    transferArrayItem
} from '@angular/cdk/drag-drop';

interface DragDropItem {
    title: string;
    isPinned: boolean;
    order: number;
    id: string;
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
    id?: string;
    isDropTarget?: boolean;
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
export class DragDropTableComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
    @Input() config: any | null = null;
    @ViewChild('sourceList') sourceList!: CdkDropList;
    @ViewChildren('dropList') dropLists!: QueryList<CdkDropList>;

    value: TableValue[] = [];
    internalValue: Array<Array<TableCell>> = [];
    draggableItems: DragDropItem[] = [];
    isDisabled = false;
    dragInProgress = false;

    private connectedLists: CdkDropList[] = [];
    private isDragging = false;

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
        setTimeout(() => {
            this.setupDropLists();
        });
    }

    ngOnDestroy(): void {
        this.connectedLists = [];
    }

    private generateUniqueId(): string {
        return `item-${Math.random().toString(36).substr(2, 9)}`;
    }

    private setupDropLists(): void {
        if (!this.sourceList || !this.dropLists) return;

        // Reset connections
        this.connectedLists = [];

        const dropListsArray = this.dropLists.toArray();

        // Filter out drop lists that already have items
        const availableDropLists = dropListsArray.filter((_, index) => {
            const [rowIndex, colIndex] = this.getIndicesFromDropList(index);
            return !this.internalValue[rowIndex][colIndex].value;
        });

        this.connectedLists = [this.sourceList, ...availableDropLists];

        // Set up connections for source list
        this.sourceList.connectedTo = availableDropLists;

        // Set up connections for each drop list
        availableDropLists.forEach(dropList => {
            dropList.connectedTo = [this.sourceList];
        });

        this.cdr.detectChanges();
    }

    private getIndicesFromDropList(index: number): [number, number] {
        const rowIndex = Math.floor(index / this.actualColumns);
        const colIndex = index % this.actualColumns;
        return [rowIndex, colIndex];
    }

    onDragStarted(): void {
        this.isDragging = true;
        this.dragInProgress = true;
        this.cdr.detectChanges();
    }

    onDragEnded(): void {
        this.isDragging = false;
        this.dragInProgress = false;
        // Reset all drop targets
        this.internalValue.forEach(row => {
            row.forEach(cell => {
                cell.isDropTarget = false;
            });
        });
        this.cdr.detectChanges();
    }

    handleDrop(event: CdkDragDrop<any>): void {
        if (this.isDisabled) return;

        try {
            const draggedItem = event.item.data;
            if (!draggedItem) return;

            const containerData = event.container.data;
            const previousContainerData = event.previousContainer.data;

            // If dropping into a cell
            if (containerData && typeof containerData === 'object' && 'rowIndex' in containerData) {
                const { rowIndex, colIndex } = containerData;

                // Validate indices and cell
                if (!this.validateCellIndices(rowIndex, colIndex)) return;
                if (!this.isCellAvailable(rowIndex, colIndex)) return;

                // Handle drop from source list
                if (Array.isArray(previousContainerData)) {
                    this.handleDropFromSource(draggedItem, rowIndex, colIndex);
                }
                // Handle drop between cells
                else if (this.isValidCellData(previousContainerData)) {
                    this.handleDropBetweenCells(previousContainerData, rowIndex, colIndex, draggedItem);
                }

                this.updateFormValue();
                this.onTouchedFn();
                setTimeout(() => {
                    this.setupDropLists(); // Refresh connections after drop
                });
                this.cdr.detectChanges();
            }
            // If dropping back to source list
            else if (Array.isArray(containerData) && this.isValidCellData(previousContainerData)) {
                this.handleDropToSource(previousContainerData, draggedItem);
                setTimeout(() => {
                    this.setupDropLists(); // Refresh connections after drop
                });
                this.updateFormValue();
                this.onTouchedFn();
                this.cdr.detectChanges();
            }
        } catch (error) {
            console.error('Error in handleDrop:', error);
        }
    }

    private validateCellIndices(rowIndex: number, colIndex: number): boolean {
        return typeof rowIndex === 'number' &&
               typeof colIndex === 'number' &&
               rowIndex >= 0 &&
               colIndex >= 0 &&
               rowIndex < this.internalValue.length &&
               colIndex < this.internalValue[rowIndex].length;
    }

    private isCellAvailable(rowIndex: number, colIndex: number): boolean {
        const cell = this.internalValue[rowIndex][colIndex];
        return !cell.pinned && cell.value === null;
    }

    private isValidCellData(data: any): boolean {
        return data &&
               typeof data === 'object' &&
               'rowIndex' in data &&
               'colIndex' in data;
    }

    private handleDropFromSource(draggedItem: DragDropItem, rowIndex: number, colIndex: number): void {
        const itemIndex = this.draggableItems.findIndex(item => item.id === draggedItem.id);
        if (itemIndex !== -1) {
            this.draggableItems.splice(itemIndex, 1);
            this.updateCell(rowIndex, colIndex, draggedItem);
        }
    }

    private handleDropBetweenCells(
        previousData: any,
        newRowIndex: number,
        newColIndex: number,
        draggedItem: DragDropItem
    ): void {
        const { rowIndex: prevRow, colIndex: prevCol } = previousData;
        if (this.validateCellIndices(prevRow, prevCol)) {
            this.clearCell(prevRow, prevCol);
            this.updateCell(newRowIndex, newColIndex, draggedItem);
        }
    }

    private handleDropToSource(previousData: any, draggedItem: DragDropItem): void {
        const { rowIndex, colIndex } = previousData;
        if (this.validateCellIndices(rowIndex, colIndex)) {
            const cell = this.internalValue[rowIndex][colIndex];
            if (cell && !cell.pinned) {
                this.clearCell(rowIndex, colIndex);
                this.addToSource(draggedItem);
            }
        }
    }

    private updateCell(rowIndex: number, colIndex: number, item: DragDropItem): void {
        this.internalValue[rowIndex][colIndex] = {
            value: item.title,
            pinned: false,
            checked: false,
            order: this.calculateOrder(rowIndex, colIndex),
            id: item.id,
            isDropTarget: false
        };
    }

    private clearCell(rowIndex: number, colIndex: number): void {
        this.internalValue[rowIndex][colIndex] = {
            value: null,
            pinned: false,
            checked: false,
            order: 0,
            id: undefined,
            isDropTarget: false
        };
    }

    private addToSource(item: DragDropItem): void {
        const newId = this.generateUniqueId();
        this.draggableItems.push({
            ...item,
            isPinned: false,
            id: newId
        });
    }

    removeItem(rowIndex: number, colIndex: number, event?: MouseEvent): void {
        if (this.isDisabled) return;
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (!this.validateCellIndices(rowIndex, colIndex)) return;

        const cell = this.internalValue[rowIndex][colIndex];
        if (!cell || cell.pinned || !cell.value) return;

        const newId = this.generateUniqueId();
        const removedItem: DragDropItem = {
            title: cell.value,
            isPinned: false,
            order: cell.order || 0,
            id: newId
        };

        this.addToSource(removedItem);
        this.clearCell(rowIndex, colIndex);

        setTimeout(() => {
            this.setupDropLists(); // Refresh connections after removal
        });
        this.updateFormValue();
        this.onTouchedFn();
        this.cdr.detectChanges();
    }

    private calculateOrder(rowIndex: number, colIndex: number): number {
        return (colIndex * this.actualRows) + rowIndex + 1;
    }

    private buildTableFromConfig(): void {
        const tv = this.tableView;
        if (!tv) {
            this.internalValue = [];
            return;
        }

        this.internalValue = Array(this.actualRows)
            .fill(null)
            .map(() =>
                Array(tv.columns)
                    .fill(null)
                    .map(() => ({
                        value: null,
                        pinned: false,
                        checked: false,
                        order: 0,
                        id: undefined,
                        isDropTarget: false
                    })),
            );

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
                            order: item.order,
                            id: this.generateUniqueId(),
                            isDropTarget: false
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
                id: this.generateUniqueId()
            }));

        this.draggableItems.sort((a, b) => a.order - b.order);
    }

    private updateInternalValue(): void {
        const tv = this.tableView;
        if (!tv) return;

        const existingOrders = this.internalValue.map(row =>
            row.map(cell => ({
                value: cell.value,
                order: cell.order,
                id: cell.id
            }))
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
                            order: existingCell?.order || this.calculateOrder(rowIndex, colIndex),
                            id: existingCell?.id,
                            isDropTarget: false
                        };
                    }),
            );

        this.value.forEach((columnValue, colIndex) => {
            columnValue.words.forEach((word, rowIndex) => {
                if (this.internalValue[rowIndex]?.[colIndex]) {
                    const isPinned = this.isPinnedCell(rowIndex, colIndex);
                    const order = existingOrders[rowIndex]?.[colIndex]?.order ||
                                this.calculateOrder(rowIndex, colIndex);
                    const id = existingOrders[rowIndex]?.[colIndex]?.id ||
                              this.generateUniqueId();

                    this.internalValue[rowIndex][colIndex] = {
                        value: word,
                        pinned: isPinned,
                        checked: isPinned,
                        order,
                        id,
                        isDropTarget: false
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

    trackById(index: number, item: DragDropItem): string {
        return item.id;
    }
}
