import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DynamicExamQuestionComponent } from '../dynamic-exam-question/dynamic-exam-question.component';
import { SubQuestionAnswer } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-related-questions',
    standalone: true,
    imports: [DynamicExamQuestionComponent, CommonModule, FormsModule],
    templateUrl: './related-questions.component.html',
    styleUrls: ['./related-questions.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RelatedQuestionsComponent),
            multi: true,
        },
    ],
})
export class RelatedQuestionsComponent implements ControlValueAccessor {
    @Input() config: any;
    value: SubQuestionAnswer[];
    // Track whether the component is disabled
    disabled = false;

    // Functions to call for onChange and onTouch
    private onChange: (value: any) => void = () => {};
    private onTouched: () => void = () => {};

    /**
     * Called by the forms API to write a new value to the element.
     */
    writeValue(value: any): void {
        if (value) {
            this.value = value;
        } else {
            // this.value = new SubQuestionAnswer();
        }
    }

    /**
     * Save the function to be called when the value changes
     */
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    /**
     * Save the function to be called when the control is touched
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Called by the forms API when the control status changes to or from DISABLED
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * Custom handler when one of the child questions changes its value.
     * We can re-emit the entire "config" or a subset of it if desired.
     */
    onQuestionValueChange(): void {
        this.onChange(this.config);
        this.onTouched();
    }
}
