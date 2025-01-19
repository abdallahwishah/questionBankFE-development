import { Component, Injector, OnInit, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

interface MatchItem {
  value: string;  // This will be the opposite number
  index: number;  // To maintain original position
}

@Component({
  selector: 'app-connecting-words',
  standalone: true,
  imports: [TableModule, DragDropModule, CommonModule],
  templateUrl: './connecting-words.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ConnectingWordsComponent),
      multi: true
    }
  ]
})
export class ConnectingWordsComponent extends AppComponentBase implements OnInit, OnChanges, ControlValueAccessor {
  @Input() config: any;

  words: string[] = [];
  matchItems: MatchItem[] = [];
  questionBody: string = '';
  disabled = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private _injector: Injector) {
    super(_injector);
  }

  ngOnInit(): void {
    this.initializeFromConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && changes['config'].currentValue) {
      this.initializeFromConfig();
    }
  }

  private initializeFromConfig(): void {
    if (this.config?.questionPayload?.match) {
      const { words, opposites } = this.config.questionPayload.match;
      this.questionBody = this.config.question.body;
      this.words = words || [];
      this.matchItems = opposites.map((value, index) => ({
        value,
        index
      }));
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string[]): void {
    if (value && Array.isArray(value)) {
      // Recreate matchItems based on the provided value
      this.matchItems = value.map((v, index) => ({
        value: v,
        index
      }));
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

  onDrop(event: CdkDragDrop<MatchItem[]>) {
    if (!this.disabled) {
      moveItemInArray(this.matchItems, event.previousIndex, event.currentIndex);
      const orderedValues = this.matchItems.map(item => item.value);
      this.onChange(orderedValues);
      this.onTouched();
    }
  }
}
