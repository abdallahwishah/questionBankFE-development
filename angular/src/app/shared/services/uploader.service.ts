import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';

@Injectable({
    providedIn: 'root',
})
export class UploaderService {
    constructor(private _http: HttpClient) {}
    uploadFileOrFiles(file, params?: any) {
        const formData = new FormData();

        if (Array.isArray(file)) {
            file.forEach((f) => {
                formData.append('fileReq', f);
            });
        } else {
            formData.append('fileReq', file);
        }

        return this._http.post(AppConsts.remoteServiceBaseUrl + '/File/UploadAttachmentToTemp', formData, {
            params: params,
        });
    }
}
