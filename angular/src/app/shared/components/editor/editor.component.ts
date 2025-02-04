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
        <textarea [attr.id]="editorId"></textarea>
    `,
})
export class EditorComponent implements AfterViewInit, ControlValueAccessor {
    editorId: string;
    @Input() simple = false;

    private editorInstance: any;
    private _value = '';
    private _disabled = false;
    constructor() {
        this.editorId = 'ckeditor-' + Math.random().toString(36).substring(2, 10);
    }
    // ------------------------------------------------------------------
    // CVA: writeValue, registerOnChange, registerOnTouched, setDisabledState
    // ------------------------------------------------------------------
    writeValue(value: string): void {
        this._value = value || '';
        setTimeout(() => {
            this.editorInstance.setData(this._value);
        }, 10);
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

    // ------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------
    ngAfterViewInit(): void {
        // If needed, addExternal if your plugin is not in the default location:
        // CKEDITOR.plugins.addExternal('inlineinput', '/assets/ckeditor/plugins/inlineinput/', 'plugin.js');
        setTimeout(() => {
            this.editorInstance = CKEDITOR.replace(this.editorId);
        }, 0);
        if (this.simple) {
            this.editorInstance.config.toolbar = [];
        }

        this.editorInstance.on('instanceReady', () => {
            // Set initial content & read-only state
            this.editorInstance.setData(this._value);
            this.editorInstance.setReadOnly(this._disabled);
        });
        setTimeout(() => {
            this.processOnEditor();
        }, 100);
    }
    processOnEditor() {
        // If "simple" input is true, remove the toolbar
        if (this.simple) {
            this.editorInstance.config.toolbar = [];
        }

        this.editorInstance.on('instanceReady', () => {
            // Set initial content & read-only state
            this.editorInstance.setData(this._value);
            this.editorInstance.setReadOnly(this._disabled);
        });

        //    propagate to parent (CVA)
        this.editorInstance.on('change', () => {
            const data = this.editorInstance.getData();
            this._value = data;
            this.onChange(data);
        });

        // Mark as touched on blur
        this.editorInstance.on('blur', () => {
            this.onTouched();
        });
    }
}
