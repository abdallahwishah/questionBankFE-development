import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    retry,
    startWith,
    switchMap,
    tap,
} from 'rxjs/operators';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { AutoCompleteFeildService } from './auto-complete-feild.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EnterInPathObj } from '@app/shared/Functions/FunctionsForHandelObj';

@Component({
    selector: 'app-auto-complete-feild',
    templateUrl: './auto-complete-feild.component.html',
    styleUrls: ['./auto-complete-feild.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutoCompleteFeildComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: AutoCompleteFeildComponent,
            multi: true,
        },
    ],
})
export class AutoCompleteFeildComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() isLabel: boolean = true;
    @Input() field: string = 'displayName';
    @Input() label: string = '';
    @Input() deleteAfterSelect: boolean = false;
    @Input() multiple: boolean = false;
    @Input() withoutBaseUrl: boolean = false;
    @Input() type: 'default' | 'sendEmail' = 'default';

    disabled: boolean = false;
    required: boolean = false;
    emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    @Input() ConfigCustomSearch: {
        api: string;
        keySearch?: any;
        customParams?: any;
        PathObj?: any;
    } = { api: '' };

    @Input() searchByThisValueWhenStart: any = null;
    @Output() onSelectionChange = new EventEmitter();
    Filter$: Observable<any> = of([]);
    valueChangesSubscription!: Subscription;

    constructor(private _autoCompleteFeildService: AutoCompleteFeildService) {}

    onChange: any = () => {};
    onTouch: any = () => {};
    autoCompleteControl = new FormControl();
    autoCompleteControlChangeSub = new Subject();

    set value(val: any) {
        this.onChange(this.autoCompleteControl.value);
        this.onTouch(val);
    }

    writeValue(value: any) {
        this.autoCompleteControl.setValue(value);
        if (!value && value != 0) {
            this.autoCompleteControl.reset();
        }
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouch = fn;
    }

    validate(control: any): ValidationErrors | null {
        Object.keys(control.errors! || {}).forEach((key) => {
            if (key == 'required') {
                this.required = true;
                this.autoCompleteControl.setValidators(Validators.required);
            }
        });
        return null;
    }

    setDisabledState(isDisabled: boolean) {
        if (isDisabled) {
            this.autoCompleteControl.disable();
        } else {
            this.autoCompleteControl.enable();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {}

    ngOnInit() {
        this.valueChangesSubscription = this.autoCompleteControl.valueChanges.subscribe((value) => {
            this.onChange(this.autoCompleteControl.value);
        });

        this.filter();
    }

    ngOnDestroy() {
        this.valueChangesSubscription.unsubscribe();
    }

    filter() {
        this.Filter$ = this.autoCompleteControlChangeSub.pipe(
            startWith(this.searchByThisValueWhenStart),
            filter((search) => typeof search == 'string'),
            tap((_) => {
                this.value = null;
            }),
            map((search) => search.trim()),
            debounceTime(200),
            filter((search) => search !== ''),
            switchMap((search) => {
                return this._autoCompleteFeildService
                    .searchCustom(
                        this.ConfigCustomSearch?.api,
                        search == 'empty' ? '' : search,
                        this.ConfigCustomSearch?.keySearch,
                        this.ConfigCustomSearch?.customParams,
                        this.withoutBaseUrl,
                    )
                    .pipe(
                        map((value) => {
                          let a =    value.map((item: any) => item.studySubject) || [];

                             return EnterInPathObj(a, this?.ConfigCustomSearch?.PathObj || ['result', 'items']);
                        }),
                        catchError((error) => {
                            console.error('Search error:', error);
                            return of([]);
                        }),
                        startWith([]),
                    );
            }),
        );
    }

    onSelect(value: any) {
        this.value = value;
        if (this.multiple) {
            this.onSelectionChange.emit(this.autoCompleteControl.value);
        } else {
            this.onSelectionChange.emit(value);
        }
        if (this.deleteAfterSelect) {
            this.autoCompleteControl.reset();
        }
    }

    private addEmailToList(email: string) {
        if (this.multiple) {
            const currentValue = this.autoCompleteControl.value || [];
            if (!currentValue.includes(email)) {
                const newValue = [...currentValue, { [this.field]: email }];
                this.autoCompleteControl.setValue(newValue);
                this.onSelectionChange.emit(newValue);
            }
        } else {
            this.autoCompleteControl.setValue(email);
            this.onSelectionChange.emit(email);
        }
    }

    completeMethod($event: any) {
        if (this.type === 'sendEmail') {
            // Check if it's a keydown event with Enter key
            if ($event.originalEvent?.type === 'keydown' && $event.originalEvent?.key === 'Enter') {
                const email = $event.query?.trim();
                if (email && this.emailRegex.test(email)) {
                    this.addEmailToList(email);
                    return;
                }
            }
        }

        if ($event.query || $event.originalEvent?.type === 'click') {
            this.autoCompleteControlChangeSub.next($event.query || 'empty');
        }
    }
    handleKeyUp(event: KeyboardEvent, autoComplete: any) {
        if (this.type === 'sendEmail' && event.key === 'Enter') {
            const email = autoComplete.inputEL.nativeElement.value?.trim();
            if (email && this.emailRegex.test(email)) {
                this.addEmailToList(email);
                autoComplete.inputEL.nativeElement.value = '';
            }
        }
    }

    getInitials(text: string): string {
        if (!text) return '';
        const parts = text.split('@')[0].split(/[\s._-]/);
        return parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : text.substring(0, 2).toUpperCase();
    }

    formatEmailForDisplay(email: string): string {
        return email.split('@')[0].replace(/[._-]/g, ' ');
    }
}
