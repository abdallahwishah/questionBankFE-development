import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { Component, forwardRef, Injector } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorComponent } from '@app/shared/components/editor/editor.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';

import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditChoiceQuestionDto, QuestionOptionTypeEnum } from '@shared/service-proxies/service-proxies';
import { CommonModule } from '@node_modules/@angular/common';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputNumberModule,
        ButtonModule,
        EditorComponent,
        DropdownFieldComponent, // The custom dropdown component
    ],
    selector: 'app-multiple-choice-one-option',
    templateUrl: './multiple-choice-one-option.component.html',
    styleUrls: ['./multiple-choice-one-option.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultipleChoiceOneOptionComponent),
            multi: true,
        },
    ],
})
export class MultipleChoiceOneOptionComponent extends AppComponentBase implements ControlValueAccessor {
    /**
     * The array of choices. "Single choice" implies
     * exactly one choice can be "correct" (optionType = Pinned).
     */
    value: CreateOrEditChoiceQuestionDto[] = [];
     randomNumber= Math.floor(Math.random() * 1000);
    /** Callbacks from the Angular Forms API */
    private onChange: (value: CreateOrEditChoiceQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    /** Expose your enum to the template for checking states. */
    QuestionOptionTypeEnum = QuestionOptionTypeEnum;

    constructor(injector: Injector) {
        super(injector);
    }

    // ---------------------------------------------------
    // ControlValueAccessor interface methods
    // ---------------------------------------------------

    /**
     * Write a new value to the component (model -> view).
     */
    writeValue(value: CreateOrEditChoiceQuestionDto[]): void {
        this.value = value || [];
        if (!this.value.length) {
            const defaultChoice = new CreateOrEditChoiceQuestionDto();
            defaultChoice.name = '';
            defaultChoice.point = 0;
            (defaultChoice as any).isEdit = true;
            defaultChoice.optionType = QuestionOptionTypeEnum.Normal;
            this.value.push(defaultChoice);
        }
    }

    /**
     * Register a callback function to call when the value changes (view -> model).
     */
    registerOnChange(fn: (value: CreateOrEditChoiceQuestionDto[]) => void): void {
        this.onChange = fn;
    }

    /**
     * Register a callback function to call when the control is touched.
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Optional method if you want to handle disable/enable at the component level.
     */
    setDisabledState?(isDisabled: boolean): void {
        // If you want to disable child controls, do it here
    }

    /**
     * Call this whenever your component’s value changes
     * so that the parent form is notified.
     */
    notifyChange(): void {
        this.value?.forEach((ch) => {
            if (ch.optionType != QuestionOptionTypeEnum.Pinned) {
                ch.point = 0;
            }
        });
        this.onChange(this.value);
        this.onTouched();
    }

    // ---------------------------------------------------
    // Business Logic
    // ---------------------------------------------------

    /**
     * Mark exactly one choice as correct (Pinned).
     * Reset all others to Normal.
     */
    markAsCorrect(choice: CreateOrEditChoiceQuestionDto): void {
        this.value.forEach((ch) => (ch.optionType = QuestionOptionTypeEnum.Normal));
        choice.optionType = QuestionOptionTypeEnum.Pinned;
        this.notifyChange();
    }

    /**
     * Add a new blank choice to the array.
     */
    addChoice(): void {
        const newChoice = new CreateOrEditChoiceQuestionDto();
        newChoice.name = '';
        newChoice.point = 0;
        (newChoice as any).isEdit = true;
        newChoice.optionType = QuestionOptionTypeEnum.Normal;
        this.value.push(newChoice);
        this.notifyChange();
    }

    /**
     * Remove a choice by array index.
     */
    removeChoice(index: number): void {
        if (index >= 0 && index < this.value.length) {
            this.value.splice(index, 1);
            this.notifyChange();
        }
    }
}
