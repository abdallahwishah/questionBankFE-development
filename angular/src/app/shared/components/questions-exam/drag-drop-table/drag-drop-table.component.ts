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
  import { DragTableAnswer } from '@shared/service-proxies/service-proxies';

  /** Data model for draggable items */
  interface DragDropItem {
    title: string;
    isPinned: boolean;
    order: number; // Interpreted as column index when pinned
    id: string;
  }

  /** Data model for how each cell is configured in tableView.cells */
  interface DragDropCell {
    dragDropTableHeaders: string | null;
    dragDropTableColmunIndex: number;
    dargDropTableItems: DragDropItem[];
  }

  /**
   * The structure of your overall table data object.
   * - rows, columns => the table dimensions
   * - headers => array of column headers
   * - allColumns => the "un-pinned" items storage
   * - cells => an array, each representing pinned items for row i
   */
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
  export class DragDropTableComponent
    implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor
  {
    @Input() config: any | null = null;
    @ViewChild('sourceList') sourceList!: CdkDropList;
    @ViewChildren('dropList') dropLists!: QueryList<CdkDropList>;

    value: TableValue[] = [];
    internalValue: Array<Array<TableCell>> = []; // 2D array [row][col]
    draggableItems: DragDropItem[] = [];
    isDisabled = false;
    dragInProgress = false;

    private connectedLists: CdkDropList[] = [];
    private isDragging = false;

    /** For ControlValueAccessor: callbacks */
    private onChangeFn: (val: TableValue[]) => void = () => {};
    private onTouchedFn: () => void = () => {};

    // --------------------------------------------
    // Quick accessors
    // --------------------------------------------
    get tableView(): DragDropTableView | undefined {
      return this.config?.questionPayload?.dragDropTableView || undefined;
    }

    get actualRows(): number {
      return this.tableView?.rows || 1;
    }

    get actualColumns(): number {
      return this.tableView?.columns || 1;
    }

    // --------------------------------------------
    // Lifecycle
    // --------------------------------------------
    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
      this.buildTableFromConfig();
      this.initializeDraggableItems(); // un-pinned items
    }

    ngAfterViewInit(): void {
      setTimeout(() => {
        this.setupDropLists();
      });
    }

    ngOnDestroy(): void {
      this.connectedLists = [];
    }

    // --------------------------------------------
    // Build the internal table from config
    // --------------------------------------------
    private buildTableFromConfig(): void {
      const tv = this.tableView;
      if (!tv) {
        this.internalValue = [];
        return;
      }

      // 1) Initialize empty 2D array: [rows x columns]
      this.internalValue = Array(this.actualRows).fill(null).map(() =>
        Array(tv.columns).fill(null).map(() => ({
          value: null,
          pinned: false,
          checked: false,
          order: 0,
          id: undefined,
          isDropTarget: false,
        }))
      );

      // 2) For each row i, check its pinned items in tv.cells[i]
      //    Each pinned item => goes to row i, column = item.order
      const totalRows = Math.min(tv.cells.length, this.actualRows);

      for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
        const cellConfig = tv.cells[rowIndex];
        if (!cellConfig?.dargDropTableItems?.length) {
          continue;
        }

        // Place pinned items
        cellConfig.dargDropTableItems.forEach((item) => {
          if (!item.isPinned) return; // skip unpinned
          const colIndex = item.order; // treat 'order' as column index
          // Ensure valid col index
          if (colIndex >= 0 && colIndex < this.actualColumns) {
            this.internalValue[rowIndex][colIndex] = {
              value: item.title,
              pinned: true,
              checked: true,
              order: colIndex,
              id: this.generateUniqueId(),
              isDropTarget: false,
            };
          }
        });
      }

      // 3) Done; table is set. Let the form know
      this.updateFormValue();
    }

    /**
     * Fill up the list of UNPINNED items from `tableView.allColumns.dargDropTableItems`
     */
    private initializeDraggableItems(): void {
      const tv = this.tableView;
      if (!tv?.allColumns?.dargDropTableItems) {
        this.draggableItems = [];
        return;
      }

      // Keep only items that are NOT pinned => they belong in the source
      this.draggableItems = tv.allColumns.dargDropTableItems
        .filter((item) => !item.isPinned)
        .map((item) => ({
          title: item.title,
          isPinned: item.isPinned,
          order: item.order,
          id: this.generateUniqueId(),
        }));

      // If you'd like a particular sort, do so here:
      // this.draggableItems.sort((a, b) => a.order - b.order);
    }

    /**
     * Create cdkDropList connections: the source list + any unfilled table cells.
     */
    private setupDropLists(): void {
      if (!this.sourceList || !this.dropLists) return;

      // Reset connections
      this.connectedLists = [];

      const dropListsArray = this.dropLists.toArray();

      // We'll allow dropping from the source to each empty cell
      const availableDropLists = dropListsArray.filter((_, index) => {
        const [rowIndex, colIndex] = this.getIndicesFromDropList(index);
        // Only connect if cell is NOT pinned and doesn't have a value
        const cell = this.internalValue[rowIndex][colIndex];
        return !cell.pinned && cell.value === null;
      });

      // Connect them all to the source
      this.connectedLists = [this.sourceList, ...availableDropLists];

      // Source list can drop to each empty cell
      this.sourceList.connectedTo = availableDropLists;

      // Each empty cell can only receive from the source
      availableDropLists.forEach((dropList) => {
        dropList.connectedTo = [this.sourceList];
      });

      this.cdr.detectChanges();
    }

    private getIndicesFromDropList(index: number): [number, number] {
      const rowIndex = Math.floor(index / this.actualColumns);
      const colIndex = index % this.actualColumns;
      return [rowIndex, colIndex];
    }

    // --------------------------------------------
    // Drag & drop event handlers
    // --------------------------------------------
    onDragStarted(): void {
      this.isDragging = true;
      this.dragInProgress = true;
      this.cdr.detectChanges();
    }

    onDragEnded(): void {
      this.isDragging = false;
      this.dragInProgress = false;
      // Clear dropTarget flags
      this.internalValue.forEach((row) => {
        row.forEach((cell) => {
          cell.isDropTarget = false;
        });
      });
      this.cdr.detectChanges();
    }

    handleDrop(event: CdkDragDrop<any>): void {
      if (this.isDisabled) return;
      try {
        const draggedItem = event.item.data as DragDropItem;
        if (!draggedItem) return;

        const containerData = event.container.data;
        const previousContainerData = event.previousContainer.data;

        // (A) Dropping onto a cell
        if (containerData && typeof containerData === 'object' && 'rowIndex' in containerData) {
          const { rowIndex, colIndex } = containerData;
          if (!this.validateCellIndices(rowIndex, colIndex)) return;
          if (!this.isCellAvailable(rowIndex, colIndex)) return;

          // (A1) If source => cell
          if (Array.isArray(previousContainerData)) {
            this.handleDropFromSource(draggedItem, rowIndex, colIndex);
          }
          // (A2) If cell => different cell (not pinned?)
          else if (this.isValidCellData(previousContainerData)) {
            this.handleDropBetweenCells(previousContainerData, rowIndex, colIndex, draggedItem);
          }

          this.updateFormValue();
          this.onTouchedFn();
          setTimeout(() => this.setupDropLists());
          this.cdr.detectChanges();
        }
        // (B) Dropping back to source
        else if (Array.isArray(containerData) && this.isValidCellData(previousContainerData)) {
          this.handleDropToSource(previousContainerData, draggedItem);
          setTimeout(() => this.setupDropLists());
          this.updateFormValue();
          this.onTouchedFn();
          this.cdr.detectChanges();
        }
      } catch (error) {
        console.error('Error in handleDrop:', error);
      }
    }

    private validateCellIndices(rowIndex: number, colIndex: number): boolean {
      return (
        typeof rowIndex === 'number' &&
        typeof colIndex === 'number' &&
        rowIndex >= 0 &&
        colIndex >= 0 &&
        rowIndex < this.internalValue.length &&
        colIndex < this.internalValue[rowIndex].length
      );
    }

    private isCellAvailable(rowIndex: number, colIndex: number): boolean {
      const cell = this.internalValue[rowIndex][colIndex];
      return !cell.pinned && cell.value === null;
    }

    private isValidCellData(data: any): boolean {
      return data && typeof data === 'object' && 'rowIndex' in data && 'colIndex' in data;
    }

    private handleDropFromSource(
      draggedItem: DragDropItem,
      rowIndex: number,
      colIndex: number
    ): void {
      const itemIndex = this.draggableItems.findIndex((item) => item.id === draggedItem.id);
      if (itemIndex !== -1) {
        // Remove from source
        this.draggableItems.splice(itemIndex, 1);
        // Put into cell
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
        order: item.order,
        id: item.id,
        isDropTarget: false,
      };
    }

    private clearCell(rowIndex: number, colIndex: number): void {
      this.internalValue[rowIndex][colIndex] = {
        value: null,
        pinned: false,
        checked: false,
        order: 0,
        id: undefined,
        isDropTarget: false,
      };
    }

    private addToSource(item: DragDropItem): void {
      const newId = this.generateUniqueId();
      this.draggableItems.push({
        ...item,
        isPinned: false,
        id: newId,
      });
    }

    /** Removes an item from the cell, placing it back into the source list. */
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
        id: newId,
      };

      this.addToSource(removedItem);
      this.clearCell(rowIndex, colIndex);

      setTimeout(() => this.setupDropLists());
      this.updateFormValue();
      this.onTouchedFn();
      this.cdr.detectChanges();
    }

    // --------------------------------------------
    // ControlValueAccessor
    // --------------------------------------------
    writeValue(obj: TableValue[]): void {
      if (Array.isArray(obj)) {
        this.value = [...obj];
        this.updateInternalValue();
      } else {
        // fallback: rebuild from config
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

    private updateInternalValue(): void {
      // (Optional) If your form expects to rebuild pinned items from "value",
      // implement logic here or just fallback to build from config.
      this.buildTableFromConfig();
    }

    /** Recompute this.value from internalValue and notify onChange. */
    private updateFormValue(): void {
      const tv = this.tableView;
      if (!tv) return;

      // Build array of DragTableAnswer (like your original code) for each column
      this.value = tv.headers.map(
        (header, columnIndex) =>
          new DragTableAnswer({
            title: header,
            words: this.internalValue
              .map((row) => row[columnIndex].value)
              .filter((word): word is string => word !== null),
          })
      );

      this.onChangeFn(this.value);
    }

    // --------------------------------------------
    // Utils
    // --------------------------------------------
    private generateUniqueId(): string {
      return `item-${Math.random().toString(36).substr(2, 9)}`;
    }

    trackById(index: number, item: DragDropItem): string {
      return item.id;
    }
  }
