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
    value: SubQuestionAnswer[] = [];

    private onChange: (value: SubQuestionAnswer[]) => void = () => {};
    private onTouched: () => void = () => {};
    disabled = false;

    writeValue(value: SubQuestionAnswer[]): void {
        if (value) {
            this.value = value;
        } else {
            this.value = Array(this.config?.linkedQuestions?.length || 0)
                .fill(null)
                .map(
                    (item,index) =>
                        new SubQuestionAnswer({
                            ...new SubQuestionAnswer(),
                            questionId: this.config?.linkedQuestions[index]?.question?.id,
                        }),
                );
        }
    }

    registerOnChange(fn: (value: SubQuestionAnswer[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onQuestionValueChange(): void {
        this.onChange(this.value);
        this.onTouched();
    }
}
