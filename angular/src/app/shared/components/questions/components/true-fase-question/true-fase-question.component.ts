import { Component, Injector, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditChoiceQuestionDto } from '@shared/service-proxies/service-proxies';
import { QuestionOptionTypeEnum } from '@shared/service-proxies/service-proxies';
import { CommonModule } from '@node_modules/@angular/common';

@Component({
    selector: 'app-true-fase-question',
    standalone: true,
    imports: [FormsModule, InputNumberModule, ButtonModule, CommonModule],
    templateUrl: './true-fase-question.component.html',
    styleUrls: ['./true-fase-question.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TrueFaseQuestionComponent),
            multi: true,
        },
    ],
})
export class TrueFaseQuestionComponent extends AppComponentBase implements OnInit, ControlValueAccessor {
    /**
     * We'll keep exactly 2 items in this array:
     * [0] => True
     * [1] => False
     */
    value: CreateOrEditChoiceQuestionDto[] = [];

    /** Expose this enum if you need to check 'Pinned' or 'Normal' in the template */
    QuestionOptionTypeEnum = QuestionOptionTypeEnum;

    /** ControlValueAccessor callbacks */
    private onChange: (val: CreateOrEditChoiceQuestionDto[]) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(injector: Injector) {
        super(injector);
    }

    // -----------------------------------
    // ControlValueAccessor implementation
    // -----------------------------------
    writeValue(value: CreateOrEditChoiceQuestionDto[]): void {
        this.value = value || [];

        // Once we have the array, ensure it's exactly 2 items for True/False
        this.ensureTrueFalse();
    }

    registerOnChange(fn: (value: CreateOrEditChoiceQuestionDto[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        // If you need to disable the component, handle that logic here
    }

    /**
     * Whenever the internal array changes, call `onChange` and `onTouched`
     * so Angular knows the form value changed.
     */
    notifyValueChange(): void {
        this.value?.forEach((ch) => {
            if (ch.optionType != QuestionOptionTypeEnum.Pinned) {
                ch.point = 0;
            }
        });
        this.onChange(this.value);
        this.onTouched();
    }

    // -----------------------------------
    // Lifecycle + Business Logic
    // -----------------------------------
    ngOnInit(): void {
        // If the parent hasn’t provided an array before OnInit,
        // initialize or fix it now
        this.ensureTrueFalse();
    }

    /**
     * Ensure we have exactly 2 items: True + False
     */
    private ensureTrueFalse(): void {
        if (!this.value || this.value.length === 0) {
            this.value = [this.createChoice(this.l('True')), this.createChoice(this.l('False'))];
        } else {
            this.value = this.value.slice(0, 2);
        }
    }

    /**
     * Helper to create a new choice with default OptionType = Normal.
     */
    private createChoice(name: string): CreateOrEditChoiceQuestionDto {
        const c = new CreateOrEditChoiceQuestionDto();
        c.name = name;
        c.point = 1;
        c.optionType = QuestionOptionTypeEnum.Normal;
        return c;
    }

    /**
     * Mark one of the items as correct (Pinned) and the other as Normal.
     */
    markCorrect(index: number): void {
        this.value.forEach((choice, i) => {
            choice.optionType = i === index ? QuestionOptionTypeEnum.Pinned : QuestionOptionTypeEnum.Normal;
        });
        this.notifyValueChange();
    }
}
