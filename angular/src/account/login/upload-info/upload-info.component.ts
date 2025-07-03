import {
    GenderEnum,
    PasswordComplexitySetting,
    ProfileServiceProxy,
} from './../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit } from '@angular/core';
import { UploaderService } from '@app/shared/services/uploader.service';
import { Router } from '@node_modules/@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    GetStudentInfoOutput,
    RegisterStudentDto,
    StudentsServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { register } from 'module';

@Component({
    selector: 'app-upload-info',
    templateUrl: './upload-info.component.html',
    styleUrls: ['./upload-info.component.css'],
})
export class UploadInfoComponent extends AppComponentBase implements OnInit {
    studentInfo = new GetStudentInfoOutput();
    registerStudent = new RegisterStudentDto();
    showErrorMessage: boolean;
    identityImage: string;
    personalImage: string;
    isAgree: boolean = false;
    confirmPassword;
    GenderEnum = GenderEnum;
    passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();
    passwordComplexityInfo = '';
    passwordErrors = {
        requireDigit: false,
        requireLowercase: false,
        requireUppercase: false,
        requireNonAlphanumeric: false,
        requiredLength: false,
    };

    confirmPasswordErrors = {
        requireDigit: false,
        requireLowercase: false,
        requireUppercase: false,
        requireNonAlphanumeric: false,
        requiredLength: false,
    };

    constructor(
        injector: Injector,
        private studentService: StudentsServiceProxy,
        private _uploaderService: UploaderService,
        private _profileService: ProfileServiceProxy,
        private router: Router,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.studentInfo = history.state;
        if (!this.studentInfo.id) {
            this.router.navigate(['account/login'], { replaceUrl: true });
        }

        this._profileService.getPasswordComplexitySetting().subscribe((passwordComplexityResult) => {
            this.passwordComplexitySetting = passwordComplexityResult.setting;
            this.setPasswordComplexityInfo();
        });
    }

    setPasswordComplexityInfo(): void {
        this.passwordComplexityInfo = '<ul>';

        if (this.passwordComplexitySetting.requireDigit) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireDigit_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireLowercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireLowercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireUppercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireUppercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireNonAlphanumeric) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireNonAlphanumeric_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requiredLength) {
            this.passwordComplexityInfo +=
                '<li>' +
                this.l('PasswordComplexity_RequiredLength_Hint', this.passwordComplexitySetting.requiredLength) +
                '</li>';
        }

        this.passwordComplexityInfo += '</ul>';
    }

    checkPasswordErrors() {
        const password = this.registerStudent.password || '';
        this.passwordErrors.requireDigit = this.passwordComplexitySetting.requireDigit && !/\d/.test(password);
        this.passwordErrors.requireLowercase =
            this.passwordComplexitySetting.requireLowercase && !/[a-z]/.test(password);
        this.passwordErrors.requireUppercase =
            this.passwordComplexitySetting.requireUppercase && !/[A-Z]/.test(password);
        this.passwordErrors.requireNonAlphanumeric =
            this.passwordComplexitySetting.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(password);
        this.passwordErrors.requiredLength = password.length < this.passwordComplexitySetting.requiredLength;
    }

    checkConfirmPasswordErrors() {
        const password = this.confirmPassword || '';
        this.confirmPasswordErrors.requireDigit = this.passwordComplexitySetting.requireDigit && !/\d/.test(password);
        this.confirmPasswordErrors.requireLowercase =
            this.passwordComplexitySetting.requireLowercase && !/[a-z]/.test(password);
        this.confirmPasswordErrors.requireUppercase =
            this.passwordComplexitySetting.requireUppercase && !/[A-Z]/.test(password);
        this.confirmPasswordErrors.requireNonAlphanumeric =
            this.passwordComplexitySetting.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(password);
        this.confirmPasswordErrors.requiredLength = password.length < this.passwordComplexitySetting.requiredLength;
    }

    checkPassword(): void {
        this.showErrorMessage = this.registerStudent.password !== this.confirmPassword;
    }

    uploadIdentity(file) {
        let identity = file?.target?.files[0];

        if (identity && identity.type.startsWith('image/')) {
            // Proceed with upload
            this._uploaderService.uploadFileOrFiles(identity).subscribe((value: any) => {
                this.registerStudent.identityPhotoToken = value?.result?.fileToken;
                this.identityImage = URL.createObjectURL(identity);
            });
        } else {
            // Show error
            this.notify.error('InvalidFileType');
        }
    }

    uploadPersonalImage(file) {
        let personalImage = file?.target?.files[0];
        if (personalImage && personalImage.type.startsWith('image/')) {
            this._uploaderService.uploadFileOrFiles(personalImage).subscribe((value: any) => {
                this.registerStudent.selfiePhotoToken = value?.result?.fileToken;
                this.personalImage = URL.createObjectURL(personalImage);
            });
        } else {
            this.notify.error('InvalidFileType');
        }
    }

    register() {
        this.registerStudent.id = this.studentInfo.id;
        this.studentService.register(this.registerStudent).subscribe({
            next: () => {
                this.notify.success(this.l('SavedSuccessfully'));
                this.router.navigate(['account/login'], { replaceUrl: true });
            },
            error: () => {
                // this.notify.error(this.l('ErrorOccuredTryAgain'));
            },
        });
    }
}
