import { Component, Injector, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

import { AppComponentBase } from '@shared/common/app-component-base';
import { EditorComponent } from '@app/shared/components/editor/editor.component';
import { CreateOrEditChoiceQuestionDto, QuestionOptionTypeEnum } from '@shared/service-proxies/service-proxies';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-multiple-choice-more-than-option',
    standalone: true,
    imports: [CommonModule, FormsModule, InputNumberModule, ButtonModule, CheckboxModule, EditorComponent],
    templateUrl: './multiple-choice-more-than-option.component.html',
    styleUrls: ['./multiple-choice-more-than-option.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultipleChoiceMoreThanOptionComponent),
            multi: true,
        },
    ],
})
export class MultipleChoiceMoreThanOptionComponent extends AppComponentBase implements OnInit, ControlValueAccessor {
    /**
     * In a ControlValueAccessor, we store the array of choices here.
     * The parent form will set this via `writeValue()`.
     */
    value: CreateOrEditChoiceQuestionDto[] = [];

    /** If you need the enum in the template: */
    QuestionOptionTypeEnum = QuestionOptionTypeEnum;

    /** ControlValueAccessor callbacks */
    private onChange: (val: CreateOrEditChoiceQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        // If you want at least one choice by default:
    }

    // ------------------------------------------
    // ControlValueAccessor implementation
    // ------------------------------------------
    writeValue(obj: CreateOrEditChoiceQuestionDto[]): void {
        // Called by Angular when parent sets the value
        this.value = obj || [];
        if (!this.value.length) {
            const defaultChoice = new CreateOrEditChoiceQuestionDto();
            defaultChoice.name = '';
            defaultChoice.point = 1;
            (defaultChoice as any).isEdit = true;
            defaultChoice.optionType = QuestionOptionTypeEnum.Normal;
            this.value.push(defaultChoice);
        }
    }

    registerOnChange(fn: (val: CreateOrEditChoiceQuestionDto[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        // If the form wants to disable this component, handle it here
    }

    /**
     * Helper method: call this whenever `this.value` changes
     * so the parent form knows about the new array.
     */
    notifyValueChange(): void {
        this.onChange(this.value);
        this.onTouched();
    }

    // ------------------------------------------
    // Component logic
    // ------------------------------------------

    /**
     * Toggle "correct" status if using `Pinned` to represent correctness.
     * For multiple correct answers, you can have multiple pinned items.
     */
    toggleCorrect(choice: CreateOrEditChoiceQuestionDto): void {
        if (choice.optionType === QuestionOptionTypeEnum.Pinned) {
            choice.optionType = QuestionOptionTypeEnum.Normal;
        } else {
            choice.optionType = QuestionOptionTypeEnum.Pinned;
        }
        this.notifyValueChange();
    }

    /**
     * Add a new choice
     */
    addChoice(): void {
        const newChoice = new CreateOrEditChoiceQuestionDto();
        newChoice.name = '';
        newChoice.point = 1;
        (newChoice as any).isEdit = true;
        newChoice.optionType = QuestionOptionTypeEnum.Normal;
        this.value.push(newChoice);

        this.notifyValueChange();
    }

    /**
     * Remove a choice by index
     */
    removeChoice(index: number): void {
        if (index >= 0 && index < this.value.length) {
            this.value.splice(index, 1);
            this.notifyValueChange();
        }
    }
}
