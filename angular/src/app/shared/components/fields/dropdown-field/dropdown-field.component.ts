import { CommonModule } from '@angular/common';
import {
    Component,
    OnInit,
    ElementRef,
    Renderer2,
    ChangeDetectorRef,
    NgZone,
    Input,
    forwardRef,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { optionsConfigModel } from '@app/shared/Models/models';
import { HttpService } from '@app/shared/services/http.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FilterService, PrimeNGConfig } from 'primeng/api';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { Subscription, map, tap } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, DropdownModule, ReactiveFormsModule],
    selector: 'app-dropdown-field',
    templateUrl: './dropdown-field.component.html',
    styleUrls: ['./dropdown-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownFieldComponent),
            multi: true,
        },
    ],
    encapsulation: ViewEncapsulation.None,
})
export class DropdownFieldComponent extends Dropdown implements OnInit, ControlValueAccessor, OnChanges {
    loading = false;
    autoComplete = false;
    withoutBaseUrl = false;
    fieldControl = new FormControl();
    isEnglish = document.dir == 'ltr' ? true : false;
    controlSubscription = new Subscription();
    override onChange: any = () => {};
    onTouch: any = () => {};
    @Input() labelField: string;
    @Input() lookupKey: string;
    @Input() excludeIds: any[] = [];
    @Input() disableddisabled: string;

    @Input() sharedLookup: any;
    @Input() optionsFromApiLink: any;
    @Input() optionsFromApiKeys: any;
    @Input() optionsLocal: any;
    autoCompleteConfig: any;
    @Input() enm: any;

    @Output() onSelectionChange = new EventEmitter();
    @Output() onLoad: EventEmitter<any> = new EventEmitter();
    @Input() optionsConfig: optionsConfigModel;
    @Input() FilterFunction: Function;
    @Input() override appendTo: any = 'body';
    @Input() override get disabled(): boolean {
        return this._disabled;
    }
    override set disabled(_disabled: boolean) {
        this._disabled = _disabled;
    }

    constructor(
        el: ElementRef<any>,
        renderer: Renderer2,
        cd: ChangeDetectorRef,
        zone: NgZone,
        filterService: FilterService,
        config: PrimeNGConfig,
        private http: HttpService,
        private appComponentBase: AppComponentBase,
    ) {
        super(el, renderer, cd, zone, filterService, config);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['optionsConfig']) {
            this.optionLabel = this.optionsConfig?.optionLabel;
        }
    }

    l(string) {
        return this.appComponentBase.l(string);
    }

    override writeValue(obj: any): void {
        if (obj) {
            this.fieldControl.setValue(obj, { emitEvent: false });
        } else {
            this.fieldControl.reset(obj, { emitEvent: false });
        }
    }

    override registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    override registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }
    override setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.fieldControl.disable({ emitEvent: false });
        } else {
            this.fieldControl.enable({ emitEvent: false });
        }
    }

    override ngOnInit() {
        super.ngOnInit(); // If you want to call the parent class's ngOnInit
        if (this.optionsConfig?.optionLabel) this.optionLabel = this.optionsConfig.optionLabel;
        if (this.optionsConfig?.optionValue) this.optionValue = this.optionsConfig.optionValue;
        if (this.optionsFromApiKeys?.apiSrcKey) {
            this.autoComplete = true;
            this.autoCompleteConfig = {
                keySearch: this.optionsFromApiKeys.apiSrcKey,
                api: this.optionsFromApiLink,
                field: this.isEnglish ? this.optionsFromApiKeys?.labelL : this.optionsFromApiKeys?.labelF,
            };
            this.withoutBaseUrl = true;
        } else if (this.sharedLookup?.id) {
            this.withoutBaseUrl = false;
            this.autoComplete = true;

            this.autoCompleteConfig = {
                keySearch: 'filter',
                api: '/api/services/app/SharedLookups/GetSharedLookupOptions',
                field: this.isEnglish ? 'labelEN' : 'labelAR',
                customParams: { id: this.sharedLookup?.id },
                PathObj: ['result', 'sharedLookup', 'options'],
            };
        } else if (this.optionsLocal) {
            console.log('optionsLocal', this.labelField, this.optionsLocal);
            this.optionValue = 'value';
            this.optionLabel = 'label';
            this.options = this.optionsLocal?.map((item: any) => {
                return {
                    label: item[this.isEnglish ? 'labelF' : 'labelL'],
                    value: item.id,
                };
            });
            this.autoComplete = false;
        }
        if (this.enm) {
            this.options = Object.entries(this.enm)
                .filter(([key, value]) => typeof value === 'number')
                .map(([key, value]) => ({
                    Name: key,
                    Code: value,
                }));

            this.optionLabel = 'Name';
            this.optionValue = 'Code';
            // excludeIds
            if (this.excludeIds.length > 0) {
                this.options = this.options.filter((item) => !this.excludeIds.includes(item['Code']));
            }
        }
        this.controlSubscription.add(
            this.fieldControl.valueChanges.subscribe((value) => {
                this.onChange(value);
                this.onSelectionChange.emit(this.getFullDataForItemSelected(value));
            }),
        );
        this.getOptions();
        // this.placeholder = this.placeholder;
    }
    getFullDataForItemSelected(value: any) {
        let itemSelected = this.options?.find((item) => item[this.optionValue] == value);
        return itemSelected;
    }

    getOptions() {
        switch (this.optionsConfig?.sourceData) {
            case 'api':
                // let canSend = true;
                let apiConfig = this.optionsConfig?.apiConfig;
                // apiConfig.requiredParams?.forEach((keyParam) => {
                //     if (!apiConfig?.params[keyParam]) canSend = false;
                // });
                // if (!canSend) {
                //     return;
                // }
                console.log('apiConfig', apiConfig);
                this.http.get(apiConfig?.api, apiConfig?.params).subscribe((items) => {
                    if (this.FilterFunction) {
                        this.options = items?.filter(this.FilterFunction);
                    } else {
                        this.options = items?.items;
                    }
                    if (document.dir == 'ltr') {
                        let isEng = Object.keys(this.options[0]).includes('Eng');
                        if (this.optionLabel == 'Name' && isEng) {
                            this.optionLabel = 'Eng';
                        }
                    } else {
                        let isAr = Object.keys(this.options[0]).includes('Name');
                        if (this.optionLabel == 'Eng' && isAr) {
                            this.optionLabel = 'Name';
                        }
                    }
                });
                break;
            default:
                // handle invalid sourceData value
                break;
        }
    }
    ngOnDestroy() {
        this.controlSubscription.unsubscribe();
    }
}
