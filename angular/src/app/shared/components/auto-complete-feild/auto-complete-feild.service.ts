import { tap } from 'rxjs/operators';
import { environment } from './../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConsts } from '../../../../shared/AppConsts';

@Injectable({
    providedIn: 'root',
})
export class AutoCompleteFeildService {
    baseUrl: string = AppConsts.remoteServiceBaseUrl;

    constructor(private http: HttpClient) {}

    searchCustom(api: string, key: string, keySearch?: string, customParams?: any, withoutBaseUrl?: boolean) {
        // delete nulls keys
        if (customParams) {
            Object.keys(customParams).forEach((key) => {
                if (customParams[key] == null|| customParams[key] == undefined) {
                    delete customParams[key];
                }
            });
        }
        if (api?.includes('/app/User/GetUsers') || api?.includes('GetRoles')) {
            return this.http.post<any[]>((withoutBaseUrl ? '' : this.baseUrl) + api, {
                ...customParams,
                [keySearch]: key,
            });
        } else {
            return this.http.get<any[]>((withoutBaseUrl ? '' : this.baseUrl) + api + `?${keySearch || 'key'}=${key}`, {
                params: customParams,
            });
        }
    }
}
