import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CKEditorModule } from 'ckeditor4-angular';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,        // <-- Needed for [(ngModel)]
    CKEditorModule,     // <-- CKEditor Module
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
})
export class EditorComponent implements ControlValueAccessor {
  /** The value stored in the editor */
  public editorValue: string = '';

  /** Very advanced config (example). See below for details. */
  public editorConfig: any = {
    // Basic sample — add any advanced plugins/features in extraPlugins
    extraPlugins: 'autogrow,image2,uploadimage,justify',
    removePlugins: 'elementspath',
    toolbar: [
      { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'Undo', 'Redo'] },
      { name: 'editing', items: ['Scayt'] },
      { name: 'links', items: ['Link', 'Unlink'] },
      { name: 'insert', items: ['Image', 'Table'] },
      { name: 'tools', items: ['Maximize'] },
      { name: 'document', items: ['Source'] },
      '/',
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
      { name: 'paragraph', items: ['BulletedList', 'NumberedList'] },
      { name: 'styles', items: ['Styles', 'Format'] },
    ],
    // Additional advanced settings:
    autoGrow_minHeight: 300,
    autoGrow_maxHeight: 600,
    filebrowserUploadUrl: '/your-upload-endpoint', // for image upload
    // ... more advanced configs can go here ...
  };

  // --- ControlValueAccessor methods ---

  writeValue(value: string | null): void {
    this.editorValue = value || '';
  }

  private onChange: (value: string) => void = () => {};
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  private onTouched: () => void = () => {};
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // If needed, set the CKEditor to read-only here
  }

  onEditorChange(event: any): void {
    const newValue = event.editor.getData();
    this.editorValue = newValue;
    this.onChange(newValue);
  }

  onEditorFocus(): void {
    this.onTouched();
  }
}
