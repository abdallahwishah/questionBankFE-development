import { Component, Input, forwardRef } from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    NG_VALIDATORS,
    Validator,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@node_modules/@angular/common';

/**
 * This component will store a numeric ID
 * representing the user’s selected choice.
 */
@Component({
    selector: 'app-multiple-choice-one-option',
    imports: [CommonModule],
    standalone: true, // Using Angular standalone components (optional)
    templateUrl: './multiple-choice-one-option.component.html',
    styleUrls: ['./multiple-choice-one-option.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultipleChoiceOneOptionComponent),
            multi: true,
        },
        {
            // If you want to also provide validation hooks
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => MultipleChoiceOneOptionComponent),
            multi: true,
        },
    ],
})
export class MultipleChoiceOneOptionComponent implements ControlValueAccessor, Validator {
    /**
     * Input config from the outside.
     * This object contains question body, helper, choices, etc.
     */
    @Input() config!: any;

    /**
     * Internal numeric value storing the selected choice.
     * For example: 1, 2, 3, or 4.
     * If 0 => no selection yet (or "none" if your logic allows).
     */
    value = 0; // "singleChoiceAnswer"

    // For ControlValueAccessor
    private onChangeFn: (val: number) => void = () => {};
    private onTouchedFn: () => void = () => {};

    // For disabling the component
    isDisabled = false;

    /**
     * When user picks a radio button, we update "value"
     * and call onChangeFn to notify Angular forms.
     */
    onRadioChange(selectedId: number) {
        if (!this.isDisabled) {
            this.value = selectedId;
            this.onChangeFn(this.value);
            this.onTouchedFn();
        }
    }

    /**
     * ControlValueAccessor #1: Write a new value from the form model
     * into the component’s view.
     */
    writeValue(val: number): void {
        if (val !== undefined && val !== null) {
            this.value = val;
        } else {
            this.value = 0;
        }
    }

    /**
     * ControlValueAccessor #2: Save the function to call
     * when the internal value changes.
     */
    registerOnChange(fn: (val: number) => void): void {
        this.onChangeFn = fn;
    }

    /**
     * ControlValueAccessor #3: Save the function to call
     * when the component is touched (blur, etc.).
     */
    registerOnTouched(fn: () => void): void {
        this.onTouchedFn = fn;
    }

    /**
     * ControlValueAccessor #4: Set the component’s disabled state.
     */
    setDisabledState(disabled: boolean) {
        this.isDisabled = disabled;
    }

    /**
     * Validator: Implement if you want to provide custom validation
     * to the parent form. For example, require a selection (value > 0).
     */
    validate(control: AbstractControl): ValidationErrors | null {
        // If you want to force the user to pick something:
        if (this.value === 0) {
            return { required: true };
        }
        return null;
    }
}
