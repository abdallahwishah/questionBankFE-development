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
    CdkDragDrop,
    DragDropModule
  } from '@angular/cdk/drag-drop';

  /** Draggable item model */
  interface DragDropItem {
    title: string;
    isPinned: boolean;
    order: number;
    id: string;
  }

  /** One cell in the table */
  export interface TableCell {
    value: string | null;
    pinned: boolean;
    checked: boolean;
    order?: number;
    id?: string;
    isDropTarget?: boolean;
  }

  /** The config shape from questionPayload.dragDropTableView */
  export interface DragDropTableView {
    rows: number;
    columns: number;
    headers: string[]; // e.g. ["إن واخواتها", "كان واخواتها"]
    // If you have subQuestionIds, you can store them here
    // subQuestionIds?: number[];
    allColumns: {
      dragDropTableHeaders: string;
      dragDropTableColmunIndex: number;
      dargDropTableItems: DragDropItem[];
    };
    cells: Array<{
      dragDropTableHeaders: string | null;
      dragDropTableColmunIndex: number;
      dargDropTableItems: DragDropItem[];
    }>;
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
        multi: true
      }
    ],
    encapsulation: ViewEncapsulation.None
  })
  export class DragDropTableComponent
    implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor
  {
    @Input() config: any | null = null;

    @ViewChild('sourceList') sourceList!: CdkDropList;
    @ViewChildren('dropList') dropLists!: QueryList<CdkDropList>;

    /**
     * Final value shape that we emit to the parent form:
     * [
     *   { subQuestionId: 601, value: ["أنَّ", "ليت", "بات", "كأن"] },
     *   { subQuestionId: 602, value: ["اصبح", "لعل", "صار", "ظلّ"] }
     * ]
     */
    value: Array<{ subQuestionId: number; value: string[] }> = [];

    /** 2D table array: [rowIndex][colIndex] => TableCell */
    internalValue: TableCell[][] = [];

    /** Source list of unpinned items (not in any cell) */
    draggableItems: DragDropItem[] = [];

    isDisabled = false;
    dragInProgress = false;
    private connectedLists: CdkDropList[] = [];

    // ControlValueAccessor callbacks
    private onChangeFn: (val: any) => void = () => {};
    private onTouchedFn: () => void = () => {};

    // ----------------------------------------------------
    // Quick accessors
    // ----------------------------------------------------
    get tableView(): DragDropTableView | undefined {
      return this.config?.questionPayload?.dragDropTableView;
    }

    get actualRows(): number {
      return this.tableView?.rows || 1;
    }

    get actualColumns(): number {
      return this.tableView?.columns || 1;
    }

    constructor(private cdr: ChangeDetectorRef) {}

    // ----------------------------------------------------
    // Lifecycle
    // ----------------------------------------------------
    ngOnInit(): void {
      // OPTIONAL: If you want to show pinned items from config
      // before the form calls writeValue, do:
      this.buildTableFromConfig();

      // Also initialize the unpinned items in the source
      this.initializeDraggableItems();
    }

    ngAfterViewInit(): void {
      setTimeout(() => this.setupDropLists());
    }

    ngOnDestroy(): void {
      this.connectedLists = [];
    }

    // ----------------------------------------------------
    // Build from config (pinned items)
    // ----------------------------------------------------
    private buildTableFromConfig(): void {
      const tv = this.tableView;
      if (!tv) {
        this.internalValue = [];
        return;
      }

      // Create an empty table
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
            }))
        );

      // Place pinned items
      const rowCount = Math.min(tv.cells.length, this.actualRows);
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const cellConfig = tv.cells[rowIndex];
        if (!cellConfig?.dargDropTableItems?.length) continue;

        cellConfig.dargDropTableItems.forEach((item) => {
          if (!item.isPinned) return;
          const colIndex = item.order; // "order" used as column index
          if (colIndex >= 0 && colIndex < this.actualColumns) {
            this.internalValue[rowIndex][colIndex] = {
              value: item.title,
              pinned: true,
              checked: true,
              order: colIndex,
              id: this.generateUniqueId(),
              isDropTarget: false
            };
          }
        });
      }
    }

    /** Populate `draggableItems` with unpinned items from config. */
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
          isPinned: false,
          order: item.order,
          id: this.generateUniqueId()
        }));
    }

    // ----------------------------------------------------
    // Setup cdkDropList connections
    // ----------------------------------------------------
    private setupDropLists(): void {
      if (!this.sourceList || !this.dropLists) return;

      this.connectedLists = [];
      const dropListsArray = this.dropLists.toArray();

      // Only allow dropping into unpinned + empty cells
      const availableDropLists = dropListsArray.filter((_, index) => {
        const rowIndex = Math.floor(index / this.actualColumns);
        const colIndex = index % this.actualColumns;
        const cell = this.internalValue[rowIndex][colIndex];
        return !cell.pinned && cell.value === null;
      });

      // Source => can drop into these empty cells
      this.sourceList.connectedTo = availableDropLists;
      availableDropLists.forEach((dl) => (dl.connectedTo = [this.sourceList]));

      this.connectedLists = [this.sourceList, ...availableDropLists];
      this.cdr.detectChanges();
    }

    // ----------------------------------------------------
    // Drag & Drop Handlers
    // ----------------------------------------------------
    onDragStarted(): void {
      this.dragInProgress = true;
      this.cdr.detectChanges();
    }

    onDragEnded(): void {
      this.dragInProgress = false;
      // Clear dropTarget flags
      this.internalValue.forEach((row) =>
        row.forEach((cell) => {
          cell.isDropTarget = false;
        })
      );
      this.cdr.detectChanges();
    }

    handleDrop(event: CdkDragDrop<any>): void {
      if (this.isDisabled) return;
      try {
        const draggedItem = event.item.data as DragDropItem;
        if (!draggedItem) return;

        const containerData = event.container.data;
        const previousContainerData = event.previousContainer.data;

        if (this.isCellData(containerData)) {
          const { rowIndex, colIndex } = containerData;
          if (!this.validateCellIndices(rowIndex, colIndex)) return;
          if (!this.isCellAvailable(rowIndex, colIndex)) return;

          // Source => cell
          if (Array.isArray(previousContainerData)) {
            this.handleDropFromSource(draggedItem, rowIndex, colIndex);
          }
          // If you allow cell => cell moves, handle that here
          else if (this.isCellData(previousContainerData)) {
            this.handleDropBetweenCells(previousContainerData, rowIndex, colIndex, draggedItem);
          }

          this.updateFormValue();
          this.onTouchedFn();
          setTimeout(() => this.setupDropLists());
          this.cdr.detectChanges();
        }
        // Dropping back to source
        else if (Array.isArray(containerData) && this.isCellData(previousContainerData)) {
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

    private isCellData(data: any): data is { rowIndex: number; colIndex: number } {
      return data && typeof data === 'object' && 'rowIndex' in data && 'colIndex' in data;
    }

    private validateCellIndices(rowIndex: number, colIndex: number): boolean {
      return (
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

    private handleDropFromSource(item: DragDropItem, rowIndex: number, colIndex: number): void {
      const idx = this.draggableItems.findIndex((x) => x.id === item.id);
      if (idx !== -1) {
        this.draggableItems.splice(idx, 1);
        this.updateCell(rowIndex, colIndex, item);
      }
    }

    private handleDropBetweenCells(
      prevData: { rowIndex: number; colIndex: number },
      newRow: number,
      newCol: number,
      item: DragDropItem
    ): void {
      const { rowIndex: oldRow, colIndex: oldCol } = prevData;
      if (this.validateCellIndices(oldRow, oldCol)) {
        this.clearCell(oldRow, oldCol);
        this.updateCell(newRow, newCol, item);
      }
    }

    private handleDropToSource(
      prevData: { rowIndex: number; colIndex: number },
      item: DragDropItem
    ): void {
      const { rowIndex, colIndex } = prevData;
      if (this.validateCellIndices(rowIndex, colIndex)) {
        const cell = this.internalValue[rowIndex][colIndex];
        if (cell && !cell.pinned) {
          this.clearCell(rowIndex, colIndex);
          this.addToSource(item);
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
      this.draggableItems.push({
        ...item,
        isPinned: false,
        id: this.generateUniqueId()
      });
    }

    /** Remove button inside each cell => unpin back to source. */
    removeItem(rowIndex: number, colIndex: number, event?: MouseEvent): void {
      if (this.isDisabled) return;
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      if (!this.validateCellIndices(rowIndex, colIndex)) return;

      const cell = this.internalValue[rowIndex][colIndex];
      if (!cell || cell.pinned || !cell.value) return;

      const removedItem: DragDropItem = {
        title: cell.value,
        isPinned: false,
        order: cell.order || 0,
        id: this.generateUniqueId()
      };

      this.addToSource(removedItem);
      this.clearCell(rowIndex, colIndex);

      setTimeout(() => this.setupDropLists());
      this.updateFormValue();
      this.onTouchedFn();
      this.cdr.detectChanges();
    }

    // ----------------------------------------------------
    // ControlValueAccessor
    // ----------------------------------------------------
    writeValue(obj: any): void {
      /**
       * The form calls writeValue with e.g.:
       * [
       *   { subQuestionId: 601, value: ["أنَّ","ليت","بات","كأن"] },
       *   { subQuestionId: 602, value: ["اصبح","لعل","صار","ظلّ"] }
       * ]
       */
      if (Array.isArray(obj)) {
        this.buildTableFromWriteValue(obj);
      } else {
        // fallback if something else is passed
        // or do nothing
      }
      this.cdr.markForCheck();
    }

    registerOnChange(fn: (val: any) => void): void {
      this.onChangeFn = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.onTouchedFn = fn;
    }

    setDisabledState(isDisabled: boolean): void {
      this.isDisabled = isDisabled;
    }

    /**
     * Instead of building from config (pinned items), we create
     * a fresh blank table, then place each subQuestionId's words
     * in top-to-bottom order. This ensures the final arrangement
     * matches exactly the data from `obj`.
     */
    private buildTableFromWriteValue(
      newValue: Array<{ subQuestionId: number; value: string[] }>
    ): void {
      // 1) Create an EMPTY table with the correct # of rows & columns
      this.internalValue = Array(this.actualRows)
        .fill(null)
        .map(() =>
          Array(this.actualColumns)
            .fill(null)
            .map(() => ({
              value: null,
              pinned: false,
              checked: false,
              order: 0,
              id: undefined,
              isDropTarget: false
            }))
        );

      // 2) For each block => figure out which column to place them in
      //    We assume subQuestionId=601 => column=0, 602 => column=1, etc.
      //    If your config has a different approach, adapt it here.

      // We'll do something simple: if tableView.headers is ["إن واخواتها","كان واخواتها"]
      // we might guess subQuestionId=601 => col0, 602 => col1, etc.
      // But you can also just do "first block => col0, second => col1" if that suits you.

      newValue.forEach((block, blockIndex) => {
        // We'll assume "blockIndex" = columnIndex.
        // i.e. the first object in newValue => column0, second => column1, etc.
        // If you have a different rule, do it here:
        const columnIndex = blockIndex;

        // Now place each word in the next empty row
        block.value.forEach((word) => {
          for (let rowIndex = 0; rowIndex < this.actualRows; rowIndex++) {
            if (!this.internalValue[rowIndex][columnIndex].value) {
              this.internalValue[rowIndex][columnIndex] = {
                value: word,
                pinned: false,
                checked: true,
                order: 0,
                id: this.generateUniqueId(),
                isDropTarget: false
              };
              break; // next word
            }
          }
        });
      });

      // 3) Remove these placed words from the source list
      this.removeUsedItemsFromSource(newValue);

      // 4) Re-setup droplists
      this.setupDropLists();

      // 5) Update final value & notify form
      this.updateFormValue();
      this.cdr.detectChanges();
    }

    /** Remove any newly placed words from `draggableItems`. */
    private removeUsedItemsFromSource(
      newValue: Array<{ subQuestionId: number; value: string[] }>
    ): void {
      const allWords = newValue.flatMap((b) => b.value);
      this.draggableItems = this.draggableItems.filter(
        (item) => !allWords.includes(item.title)
      );
    }

    /** Recompute the final array and emit via onChangeFn. */
    private updateFormValue(): void {
      // We'll build the same shape: [ { subQuestionId, value: string[] }, ... ]

      // In this example, we'll just do one object per column in the final result.
      // subQuestionId is not specified, so let's guess the first column => subQuestionId=601,
      // second => subQuestionId=602, etc.  Or we can just store blockIndex.

      // For your actual code, adapt as needed.
      const result: Array<{ subQuestionId: number; value: string[] }> = [];

      for (let colIndex = 0; colIndex < this.actualColumns; colIndex++) {
        // subQuestionId = 601 + colIndex, or read from somewhere else
        const subQuestionId = 601 + colIndex;
        const words: string[] = [];
        for (let rowIndex = 0; rowIndex < this.actualRows; rowIndex++) {
          const cellVal = this.internalValue[rowIndex][colIndex].value;
          if (cellVal) {
            words.push(cellVal);
          }
        }
        result.push({ subQuestionId, value: words });
      }

      this.value = result;
      this.onChangeFn(this.value);
    }

    // ----------------------------------------------------
    // Utils
    // ----------------------------------------------------
    private generateUniqueId(): string {
      return 'item-' + Math.random().toString(36).substr(2, 9);
    }

    trackById(index: number, item: DragDropItem): string {
      return item.id;
    }
  }
