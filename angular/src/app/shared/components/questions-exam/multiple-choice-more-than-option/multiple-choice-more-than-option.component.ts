import { Component, Input, forwardRef, OnInit } from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    NG_VALIDATORS,
    Validator,
    AbstractControl,
    ValidationErrors,
    FormsModule,
} from '@angular/forms';
import { CommonModule } from '@node_modules/@angular/common';
// PrimeNG
import { CheckboxModule } from 'primeng/checkbox';

/**
 * We will store the user’s selected answers in an array of numbers
 * e.g. [1, 3] means the user selected choice #1 and #3.
 */
@Component({
    selector: 'app-multiple-choice-more-than-option',
    standalone: true,
    imports: [CheckboxModule, CommonModule, FormsModule],
    templateUrl: './multiple-choice-more-than-option.component.html',
    styleUrls: ['./multiple-choice-more-than-option.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultipleChoiceMoreThanOptionComponent),
            multi: true,
        },
        {
            // If you also want this component to provide validation:
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => MultipleChoiceMoreThanOptionComponent),
            multi: true,
        },
    ],
})
export class MultipleChoiceMoreThanOptionComponent implements OnInit, ControlValueAccessor, Validator {
    /**
     * Input config from outside. Contains question text, choices, etc.
     */
    @Input() config!: any;

    /**
     * Example: if you want to show "1)" or "2)" next to the question.
     */
    @Input() questionNumber: number | null = null;

    /**
     * Internally store an array of selected choice IDs.
     * For example: [1, 3] if user picked choice #1 and #3.
     */
    selectedChoices: number[] = [];

    // C.V.A. (ControlValueAccessor) boilerplate
    private onChangeFn: (val: number[]) => void = () => {};
    private onTouchedFn: () => void = () => {};
    isDisabled = false;

    constructor() {}

    ngOnInit(): void {
        // any initialization if needed
    }

    /**
     * Helper method: returns true if 'choiceId' is currently in 'selectedChoices'.
     */
    isSelected(choiceId: number): boolean {
        return this.selectedChoices.includes(choiceId);
    }

    /**
     * Called whenever user toggles a checkbox in the template.
     * We either add or remove 'choiceId' from 'selectedChoices'.
     * Then we notify Angular forms about the updated value.
     */
    onCheckboxChange(checked: boolean, choiceId: number): void {
        if (checked) {
            // If newly checked, add it (only if not already present)
            if (!this.selectedChoices.includes(choiceId)) {
                this.selectedChoices = [...this.selectedChoices, choiceId];
            }
        } else {
            // If unchecked, remove it
            this.selectedChoices = this.selectedChoices.filter((id) => id !== choiceId);
        }
        this.onChangeFn(this.selectedChoices);
        this.onTouchedFn();
    }

    /* =========================
     * ControlValueAccessor
     * ========================= */

    /**
     * 1) Called by Angular when writing a new value from the form model
     *    into the component. E.g. patchValue, form reset, etc.
     */
    writeValue(value: number[]): void {
        if (Array.isArray(value)) {
            this.selectedChoices = value;
        } else {
            this.selectedChoices = [];
        }
    }

    /**
     * 2) Save the function to call when the internal value changes
     */
    registerOnChange(fn: (value: number[]) => void): void {
        this.onChangeFn = fn;
    }

    /**
     * 3) Save the function to call when the control is touched/blur
     */
    registerOnTouched(fn: () => void): void {
        this.onTouchedFn = fn;
    }

    /**
     * 4) Set the component’s disabled state
     */
    setDisabledState(disabled: boolean): void {
        this.isDisabled = disabled;
    }

    /* =========================
     * Validator (Optional)
     * ========================= */

    /**
     * If you want to force at least one choice, or any custom rule:
     * Return {required: true} if it fails, or null if valid.
     */
    validate(control: AbstractControl): ValidationErrors | null {
        // Example: require the user select at least one choice
        if (this.selectedChoices.length === 0) {
            return { required: true };
        }
        return null;
    }
}
