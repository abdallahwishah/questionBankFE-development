import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LoginService } from '../login.service';
import { Router } from '@node_modules/@angular/router';
import { UploaderService } from '@app/shared/services/uploader.service';
import { ReCaptchaV3WrapperService } from '@account/shared/recaptchav3-wrapper.service';
import { identity } from '@node_modules/@types/lodash-es';

@Component({
    selector: 'app-verify-face-regonition',
    templateUrl: './verify-face-regonition.component.html',
    styleUrls: ['./verify-face-regonition.component.css'],
})
export class VerifyFaceRegonitionComponent extends AppComponentBase implements OnInit {
    fileToken: string;
    constructor(
        injector: Injector,
        private loginService: LoginService,
        private _router: Router,
        private _uploaderService: UploaderService,
        private _recaptchaWrapperService: ReCaptchaV3WrapperService,
    ) {
        super(injector);
    }

    canActivate(): boolean {
        if (this.loginService.authenticateModel && this.loginService.authenticateResult) {
            return true;
        }

        return false;
    }

    ngOnInit() {
        if (!this.canActivate()) {
            this._router.navigate(['account/login']);
            return;
        }
    }

    uploadImage(image) {
        this._uploaderService.uploadFileOrFiles(image).subscribe((value: any) => {
            this.fileToken = value?.result?.fileToken;
        });
    }

    submit(): void {
        let recaptchaCallback = (token: string) => {
            this.loginService.authenticateModel.towFactorFaceRecognitionPhotoToken = this.fileToken;
            this.loginService.authenticate(() => {}, null, token);
        };

        if (this._recaptchaWrapperService.useCaptchaOnLogin()) {
            this._recaptchaWrapperService
                .getService()
                .execute('login')
                .subscribe((token) => recaptchaCallback(token));
        } else {
            recaptchaCallback(null);
        }
    }
}
