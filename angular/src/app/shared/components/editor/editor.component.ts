// editor.component.ts (standalone, with ControlValueAccessor)
import { Component, AfterViewInit, forwardRef, Input } from '@angular/core';
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
        <!-- Use [attr.id]="editorId" so each editor is unique -->
        <textarea [attr.id]="editorId"></textarea>
    `,
})
export class EditorComponent implements AfterViewInit, ControlValueAccessor {
    // Generate a unique ID for this editor instance
    editorId: string = 'ckeditor-' + Math.random().toString(36).substring(2, 10);
    @Input() simple = false;
    private editorInstance: any;
    private _value: string = '';
    private _disabled: boolean = false;

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
        // Replace the <textarea> with the ID that's unique to this instance
        this.editorInstance = CKEDITOR.replace(this.editorId, {
            // Optional config
        });
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
}
