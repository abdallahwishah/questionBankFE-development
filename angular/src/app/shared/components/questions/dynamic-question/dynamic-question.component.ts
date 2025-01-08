import { Component, Input, forwardRef } from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    NG_VALIDATORS,
    ControlValueAccessor,
    Validator,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { QuestionTypeEnum, QuestionPayloadDto } from '@shared/service-proxies/service-proxies';
// Import your child question components:
import { TrueFaseQuestionComponent } from '../components/true-fase-question/true-fase-question.component';
import { MultipleChoiceOneOptionComponent } from '../components/multiple-choice-one-option/multiple-choice-one-option.component';
import { MultipleChoiceMoreThanOptionComponent } from '../components/multiple-choice-more-than-option/multiple-choice-more-than-option.component';
import { ConnectingSentencesComponent } from '../components/connecting-sentences/connecting-sentences.component';
import { ReOrderComponent } from '../components/re-order/re-order.component';
import { DragDropWordsComponent } from '../components/drag-drop-words/drag-drop-words.component';
import { DragDropTableComponent } from '../components/drag-drop-table/drag-drop-table.component';
import { ConnectingQuestionsComponent } from '../components/connecting-questions/connecting-questions.component';

@Component({
    selector: 'app-dynamic-question',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        // Child question components
        TrueFaseQuestionComponent,
        MultipleChoiceOneOptionComponent,
        MultipleChoiceMoreThanOptionComponent,
        ConnectingSentencesComponent,
        ReOrderComponent,
        DragDropWordsComponent,
        DragDropTableComponent,
        ConnectingQuestionsComponent,
    ],
    templateUrl: './dynamic-question.component.html',
    styleUrls: ['./dynamic-question.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DynamicQuestionComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => DynamicQuestionComponent),
            multi: true,
        },
    ],
})
export class DynamicQuestionComponent implements ControlValueAccessor, Validator {
    @Input() questionType: QuestionTypeEnum | null = null;
    QuestionTypeEnum = QuestionTypeEnum;

    // This is our model. Subcomponents bind to specific properties of `value`.
    value: QuestionPayloadDto = new QuestionPayloadDto();

    // Provided by Angular forms
    onChange: (val: QuestionPayloadDto) => void = () => {};
    onTouched: () => void = () => {};

    // CONTROL VALUE ACCESSOR METHODS ------------------------------------

    writeValue(obj: QuestionPayloadDto): void {
        this.value = obj || new QuestionPayloadDto();
    }

    registerOnChange(fn: (val: QuestionPayloadDto) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        // Handle if you need to disable child components
    }

    // VALIDATOR METHOD (Optional) ---------------------------------------

    validate(control: AbstractControl): ValidationErrors | null {
        // Example: require at least one choice to be present
        if (
            this.questionType === QuestionTypeEnum.SinglChoice &&
            (!this.value.choices || this.value.choices.length === 0)
        ) {
            return { required: 'At least one choice is required.' };
        }
        return null; // Return null if valid
    }
}
