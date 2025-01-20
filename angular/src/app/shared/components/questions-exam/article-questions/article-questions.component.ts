import { Component, Input, forwardRef } from '@angular/core';
import { EditorComponent } from '../../../../shared/components/editor/editor.component';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-article-questions',
    standalone: true,
    imports: [EditorComponent, FormsModule],
    templateUrl: './article-questions.component.html',
    styleUrls: ['./article-questions.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ArticleQuestionsComponent),
            multi: true,
        },
    ],
})
export class ArticleQuestionsComponent implements ControlValueAccessor {
    @Input() config: any;

    editorContent: string = '';
    disabled = false;

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    onEditorChange(value: string) {
        this.editorContent = value;
        this.onChange(value);
        this.onTouched();
    }

    // ControlValueAccessor Implementation
    writeValue(value: string): void {
        this.editorContent = value || '';
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
}
