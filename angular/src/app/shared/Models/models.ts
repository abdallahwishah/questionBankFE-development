export interface responseModel {
    endpoint: string;
    status: number;
    code: number;
    locale: string;
    message: any;
    errors: any;
    data: any;
    cacheSession: any;
    stackTrace: any;
}
export interface loginResModel {
    appUser: AppUser;
    succeeded: boolean;
    token: string;
    expiryDate: string;
}

export interface AppUser {
    name: string;
    userName: string;
    phoneNumber: string;
    email: string;
    nationalId: any;
    dateOfBirth: any;
    role: string;
    financialEntity: any;
    serviceProvider: any;
}

export interface lookupsModel {
    id: number;
    value: string;
    lookupValues: LookupValue[];
}

export interface LookupValue {
    id: number;
    value: string;
    english: string;
    arabic: string;
    lookupId: number;
    lookup: any;
}

export interface dynamicFieldModel {
    x?: any;
    key?: string;
    y?: any;
    cols?: any;
    rows?: any;
    label?: string;
    formControlName: string;
    type:
        | 'dropdown'
        | 'multiSelect'
        | 'text'
        | 'number'
        | 'textArea'
        | 'custum'
        | 'date'
        | 'keyForEdit'
        | 'file'
        | 'custom'
        | 'section'
        | 'checkbox';
    speicalConfig?: dropdownFieldModel | textFieldModel | numberFieldModel | textAreaFieldModel | dateInputModel;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    validationMessage?: string;
    value?: any;
    validators?: any[];
    class?: string;
    icon?: iconInfo;
    onChange?: Function;
    onLoad?: Function;
    suffix?: String;
    lang?: string;
    dontReset?: boolean;
    isAddicionalField?: boolean;
}
[
    {
        type: 'section',
        key: 'section1',
        configration: '',
    },
    {
        type: 'dropdown',
        key: 'dropdown',
        configration: '',
    },
];
export interface IButtonsProperties {
    cancel?: { visible: boolean; label?: string };
    submit?: { visible: boolean; label?: string };
}
export interface dropdownFieldModel {
    options?: any[];
    filter?: boolean;
    filterBy?: string;
    lazy?: boolean;
    virtualScroll?: boolean;
    optionsConfig?: optionsConfigModel;
    FilterFunction?: Function;
}
export interface optionsConfigModel {
    sourceData?: 'local' | 'lookupStorage' | 'api';
    lookupKey?: string;
    optionLabel?: string;
    optionValue?: string;
    apiConfig?: {
        api?: string;
        params?: any;
        requiredParams?: string[];
    };
}
export interface numberFieldModel {
    min?: number;
    max?: number;
}
export interface dateInputModel {
    selectionMode?: string;
    minDate?: number;
    maxDate?: number;
}
export interface textFieldModel {
    validation?: 'email' | 'phone';
}
export interface imageFieldModel {}
export interface fileFieldModel {}
export interface textAreaFieldModel {
    rows: number;
    max?: number;
    showIndicator?: boolean;
    resizeable?: boolean;
}
export interface iconInfo {
    icon: string;
    position: 'right' | 'left';
}

export interface carModel {
    guid: string;
    chassisNumber: number;
    code: string;
    manufacturer: string;
    classification: string;
    year: string;
    manufacturerLabel: string;
    classificationLabel: string;
    yearLabel: string;
    trim: string;
    exteriorColor: string;
    transmissionType: string;
    fuelType: string;
    interiorColor: string;
    seat: string;
    driveTrainType: string;
    distributer: string;
    engineSize: string;
    engineCylinders: string;
    price: number;
    description: string;
    serviceProvider: string;
    imageUid: string;
    carState: string;
    carStateId: number;
    id: number;
}
export interface AccordingModel {
    title: string;
}

export interface IUserInfo {
    name: string;
    userName: string;
    phoneNumber: string;
    email: string;
    nationalId: string;
    dateOfBirth: Date;
    role: string;
    financialEntity: string;
    serviceProvider: string;
}
export interface apiConfigAction {
    api: string;
    method: 'get' | 'post' | 'delete';
    dataRequest: any;
    onStart: Function;
    onSuccess: Function;
    onFail: Function;
}
export interface inSideActions {
    typeAction:
        | 'patchValueToForm'
        | 'resetValueToForm'
        | 'openDialog'
        | 'closeDialog'
        | 'api'
        | 'updateParamsTable'
        | 'refreshTable'
        | 'addCustomFieldsOnForm'
        | 'openPreviewAadditionalFields'
        | 'customFunction'
        | 'disableControlsInForm'
        | 'reloadPage';
    config: any;
    subActions: inSideActions[];
    validation: any;
}
