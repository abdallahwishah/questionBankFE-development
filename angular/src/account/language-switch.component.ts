﻿import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { filter as _filter } from 'lodash-es';

@Component({
    selector: 'language-switch',
    templateUrl: './language-switch.component.html',
    styles: ['.language-switch-btn { width: auto; height: auto; }'],
})
export class LanguageSwitchComponent extends AppComponentBase implements OnInit {
    currentLanguage: abp.localization.ILanguageInfo;
    languages: abp.localization.ILanguageInfo[] = [];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        this.languages = _filter(abp.localization.languages, (l) => (<any>l).isDisabled === false);
        this.currentLanguage = abp.localization.currentLanguage;
        console.log('language :' , this.currentLanguage)

    }

   /*  changeLanguage(language: abp.localization.ILanguageInfo) {
        abp.utils.setCookieValue(
            'Abp.Localization.CultureName',
            language.name,
            new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
            abp.appPath
        );
        location.reload();
    } */
    changeLanguage(name:any) {
        abp.utils.setCookieValue(
            'Abp.Localization.CultureName',
            name,
            new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
            abp.appPath
        );
        location.reload();
    }
}
