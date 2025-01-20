import { Component, Input, forwardRef, OnChanges, SimpleChanges, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DragDropModule } from '@angular/cdk/drag-drop';

interface WordItem {
  word: string;
  order: string;
}

@Component({
  selector: 'app-words-order',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './words-order.component.html',
  styleUrls: ['./words-order.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WordsOrderComponent),
      multi: true
    }
  ]
})
export class WordsOrderComponent extends AppComponentBase implements ControlValueAccessor, OnChanges {
  @Input() config: any;

  items: WordItem[] = [];
  questionBody: string = '';
  disabled = false;
  draggedIndex: number = -1;
  dropIndex: number = -1;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']?.currentValue) {
      this.initializeQuestion();
    }
  }

  private initializeQuestion() {
    if (this.config) {
      this.questionBody = this.config.question?.body || '';

      if (this.config.questionPayload?.rearrange) {
        this.items = this.config.questionPayload.rearrange.map((word: string, index: number) => ({
          word,
          order: (index + 1).toString()
        }));
      }
    }
  }

  onDragStart(index: number) {
    if (this.disabled) return;
    this.draggedIndex = index;
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (this.draggedIndex === index || this.disabled) return;
    this.dropIndex = index;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (this.disabled || this.draggedIndex === -1 || this.dropIndex === -1) return;

    const itemsCopy = [...this.items];
    const [movedItem] = itemsCopy.splice(this.draggedIndex, 1);
    itemsCopy.splice(this.dropIndex, 0, movedItem);

    this.items = itemsCopy;
    this.emitChange();

    this.draggedIndex = -1;
    this.dropIndex = -1;
  }

  private emitChange() {
    const orderedIndices = this.items.map(item => item.order);
    this.onChange(orderedIndices);
    this.onTouched();
  }

  writeValue(value: string[]): void {
    if (value && Array.isArray(value)) {
      const newItems: WordItem[] = [];

      value.forEach((index, position) => {
        const originalIndex = parseInt(index) - 1;
        if (this.items[originalIndex]) {
          newItems[position] = {
            word: this.items[originalIndex].word,
            order: index
          };
        }
      });

      if (newItems.length === this.items.length) {
        this.items = newItems;
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  trackByFn(index: number, item: WordItem): string {
    return item.word;
  }
}
