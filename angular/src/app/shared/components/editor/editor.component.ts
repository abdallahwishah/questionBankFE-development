import { Component, AfterViewInit, OnDestroy, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

declare var CKEDITOR: any;

@Component({
  standalone: true,
  selector: 'app-editor',
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
  template: `
    <textarea [attr.id]="editorId"></textarea>
  `,
})
export class EditorComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor
{
  editorId: string = 'ckeditor-' + Math.random().toString(36).substring(2, 10);
  @Input() simple = false;

  private editorInstance: any;
  private _value = '';
  private _disabled = false;

  writeValue(value: string): void {
    this._value = value || '';
    if (this.editorInstance) {
      this.editorInstance.setData(this._value);
    }
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }
  private onChange: (val: string) => void = () => {};

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  private onTouched: () => void = () => {};

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
    if (this.editorInstance) {
      this.editorInstance.setReadOnly(isDisabled);
    }
  }

  ngAfterViewInit(): void {
    this.editorInstance = CKEDITOR.replace(this.editorId, {
      extraPlugins: 'inlineinput',
      allowedContent: true,
    });

    // If "simple" is true, remove or simplify the toolbar
    if (this.simple) {
      this.editorInstance.config.toolbar = [];
    }

    this.editorInstance.on('instanceReady', () => {
      this.editorInstance.setData(this._value);
      this.editorInstance.setReadOnly(this._disabled);
    });

    this.editorInstance.on('change', () => {
      const data = this.editorInstance.getData();
      this._value = data;
      this.onChange(data);
    });

    this.editorInstance.on('blur', () => {
      this.onTouched();
    });
  }

  /**
   * Make sure to destroy the CKEditor instance on component destroy.
   */
  ngOnDestroy(): void {
    if (this.editorInstance) {
      this.editorInstance.destroy();
      this.editorInstance = null;
    }
  }
}
