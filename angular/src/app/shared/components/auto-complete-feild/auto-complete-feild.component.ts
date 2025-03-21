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
    @Input() placeholder: string = 'Search';

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

    // Add this property to track selected items
    selectedItems: any[] = [];

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

        if (!value && value !== 0) {
            this.autoCompleteControl.reset();
            this.selectedItems = [];
        } else if (Array.isArray(value)) {
            // For multiple selection
            this.selectedItems = [...value];
        } else {
            // For single selection
            this.selectedItems = [value];
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
                if (!this.multiple) {
                    this.value = null;
                }
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
                            const items = EnterInPathObj(
                                value,
                                this?.ConfigCustomSearch?.PathObj || ['result', 'items'],
                            );

                            // Mark items as checked if they are already selected
                            return items.map((item: any) => ({
                                ...item,
                                checked: this.isItemSelected(item),
                            }));
                        }),
                        catchError((error) => {
                            console.error('Search error:', error);
                            return of([]);
                        }),
                    );
            }),
            tap((valistlue) => {
                console.log('valistlue', valistlue);
            }),
        );
    }

    // Modify your existing onSelect method to work with checkboxes
    onSelect(value: any) {
        // When selecting an item from the dropdown directly (not via checkbox)
        // we want to mark it as checked
        if (value && !value.checked) {
            value.checked = true;
        }

        this.value = value;

        if (this.multiple) {
            // For multiple selection, update the selectedItems array
            if (!this.isItemSelected(value)) {
                this.selectedItems.push(value);
            }
            this.onSelectionChange.emit(this.autoCompleteControl.value);
        } else {
            this.selectedItems = [value];
            this.onSelectionChange.emit(value);
        }

        if (this.deleteAfterSelect) {
            this.autoCompleteControl.reset();
            this.selectedItems = [];
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
        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : text.substring(0, 2).toUpperCase();
    }

    formatEmailForDisplay(email: string): string {
        return email.split('@')[0].replace(/[._-]/g, ' ');
    }
    getNestedPropertyValue(object: any, path: string): any {
        if (!object || !path) {
            return '';
        }

        const pathParts = path.split('.');
        let value = object;

        for (const part of pathParts) {
            if (value === null || value === undefined || typeof value !== 'object') {
                return '';
            }
            value = value[part];
        }

        return value;
    }

    // Update isItemSelected method to handle nested properties
    isItemSelected(item: any): boolean {
        return this.selectedItems.some((selectedItem) => {
            const itemValue = this.getNestedPropertyValue(item, this.field);
            const selectedValue = this.getNestedPropertyValue(selectedItem, this.field);
            return itemValue?.trim() == selectedValue?.trim();
        });
    }

    // Update toggleItemSelection method to handle nested fields in filter conditions
    toggleItemSelection(item: any) {
        // Toggle checked state
        item.checked = !item.checked;

        if (item.checked) {
            // If not already in selectedItems, add it
            if (!this.isItemSelected(item)) {
                if (this.multiple) {
                    const currentValue = this.autoCompleteControl.value || [];
                    const newValue = [...currentValue, item];
                    this.autoCompleteControl.setValue(newValue);
                    this.selectedItems.push(item);
                    this.onSelectionChange.emit(newValue);
                } else {
                    this.autoCompleteControl.setValue(item);
                    this.selectedItems = [item];
                    this.onSelectionChange.emit(item);
                }
            }
        } else {
            // Remove from selected items
            if (this.multiple) {
                const currentValue = this.autoCompleteControl.value || [];
                const newValue = currentValue.filter((val: any) => {
                    const itemValue = this.getNestedPropertyValue(item, this.field);
                    const valValue = this.getNestedPropertyValue(val, this.field);
                    return valValue !== itemValue;
                });
                this.autoCompleteControl.setValue(newValue);
                this.selectedItems = this.selectedItems.filter((val) => {
                    const itemValue = this.getNestedPropertyValue(item, this.field);
                    const valValue = this.getNestedPropertyValue(val, this.field);
                    return valValue !== itemValue;
                });
                this.onSelectionChange.emit(newValue);
            } else {
                this.autoCompleteControl.setValue(null);
                this.selectedItems = [];
                this.onSelectionChange.emit(null);
            }
        }
    }
}
