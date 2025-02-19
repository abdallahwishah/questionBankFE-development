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
      // Set question body
      this.questionBody = this.config.question?.body || '';

      // Initialize items from question payload (if provided)
      if (this.config.questionPayload?.rearrange) {
        this.items = this.config.questionPayload.rearrange.map(
          (word: string, index: number) => ({
            word,
            order: (index + 1).toString()
          })
        );
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

    // Reorder items
    const itemsCopy = [...this.items];
    const [movedItem] = itemsCopy.splice(this.draggedIndex, 1);
    itemsCopy.splice(this.dropIndex, 0, movedItem);

    this.items = itemsCopy;
    this.emitChange();

    // Reset indices
    this.draggedIndex = -1;
    this.dropIndex = -1;
  }

  /**
   * Emit the new order of words (as an array of strings).
   */
  private emitChange() {
    const orderedWords = this.items.map(item => item.word);
    this.onChange(orderedWords);
    this.onTouched();
  }

  /**
   * Called by the forms API to write a new value to the component.
   * Expects an array of words in the desired order.
   */
  writeValue(value: string[]): void {
    if (value && Array.isArray(value)) {
      // Reorder 'items' based on the new array of words
      const newItems: WordItem[] = [];

      value.forEach((word, index) => {
        // Find matching item by its word
        const matchingItem = this.items.find(i => i.word === word);

        // If found, place it in the correct position
        if (matchingItem) {
          newItems[index] = {
            word: matchingItem.word,
            order: (index + 1).toString()
          };
        } else {
          // If not found, create a new item (handles edge cases)
          newItems[index] = {
            word,
            order: (index + 1).toString()
          };
        }
      });

      // Update if the length matches or if you simply want to override
      if (newItems.length === this.items.length) {
        this.items = newItems;
      } else {
        // Or you can choose to override no matter what, depending on your needs
        this.items = newItems;
      }
    }
    setTimeout(() => {
        this.emitChange()
    }, 5);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  trackByFn(index: number, item: WordItem): string {
    // If words might be duplicated, you can adjust the track key. For now, just use 'word'.
    return item.word;
  }
}
