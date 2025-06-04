import {
    GetSupervisorForEditOutput,
    GovernoratesServiceProxy,
    NameValueDtoOfInt32,
    SupervisorsServiceProxy,
} from './../../../../../../shared/service-proxies/service-proxies';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { PasswordMeterComponent } from '@metronic/app/kt/components';
import { NgForm } from '@node_modules/@angular/forms';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    PasswordComplexitySetting,
    UserEditDto,
    UserServiceProxy,
    ProfileServiceProxy,
    CreateOrEditSupervisorDto,
} from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-create-or-edit-supervisor-modal',
    templateUrl: './create-or-edit-supervisor-modal.component.html',
    styleUrls: ['./create-or-edit-supervisor-modal.component.css'],
})
export class CreateOrEditSupervisorModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('userForm') userForm: NgForm;
    @Output() modalSave = new EventEmitter();
    active: boolean;
    supervisor: GetSupervisorForEditOutput = new GetSupervisorForEditOutput();
    saving: boolean;
    isTwoFactorEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled');
    isLockoutEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.UserLockOut.IsEnabled');
    profilePicture: string;
    sendActivationEmail = true;
    setRandomPassword = true;
    canChangeProfilePicture = false;
    passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();
    allowedUserNameCharacters = '';
    isSMTPSettingsProvided = false;
    canChangeUserName = true;
    passwordComplexityInfo = '';
    passwordMeterInitialized = false;
    userPasswordRepeat = '';
    allGovernorates: NameValueDtoOfInt32[];

    constructor(
        injector: Injector,
        private _profileService: ProfileServiceProxy,
        private _supervisorsService: SupervisorsServiceProxy,
        private _governorateService: GovernoratesServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {}

    show(supervisorId?: number): void {
        this._governorateService.getGovernoratesForDropdown().subscribe((result) => {
            this.allGovernorates = result;
        });
        if (!supervisorId) {
            this.active = true;
            this.setRandomPassword = true;
            this.sendActivationEmail = false;
            this.canChangeProfilePicture = false;
            this.supervisor = new GetSupervisorForEditOutput();
            this.supervisor.supervisor = new CreateOrEditSupervisorDto();
            this.supervisor.user = new UserEditDto();
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            this.modal.show();
        } else {
            this.canChangeProfilePicture = this.permission.isGranted('Pages.Administration.Users.ChangeProfilePicture');

            this._supervisorsService.getSupervisorForEdit(supervisorId).subscribe((result) => {
                this.supervisor = result;
                this.canChangeUserName =
                    this.supervisor.user.userName !== AppConsts.userManagement.defaultAdminUserName;
                this.allowedUserNameCharacters = result.allowedUserNameCharacters;
                this.isSMTPSettingsProvided = result.isSMTPSettingsProvided;
                this.sendActivationEmail = result.isSMTPSettingsProvided;

                this.getProfilePicture(result.supervisor.id);

                if (supervisorId) {
                    this.active = true;

                    setTimeout(() => {
                        this.setRandomPassword = false;
                    }, 0);

                    this.sendActivationEmail = false;
                }

                this._profileService.getPasswordComplexitySetting().subscribe((passwordComplexityResult) => {
                    this.passwordComplexitySetting = passwordComplexityResult.setting;
                    this.setPasswordComplexityInfo();
                    this.modal.show();
                });
            });
        }
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

    getProfilePicture(userId: number): void {
        if (!userId) {
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            return;
        }

        this._profileService.getProfilePictureByUser(userId).subscribe((result) => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            } else {
                this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            }
        });
    }

    setRandomPasswordChange(event): void {
        if (this.passwordMeterInitialized) {
            return;
        }

        if (!this.setRandomPassword) {
            return;
        }

        setTimeout(() => {
            PasswordMeterComponent.bootstrap();
            this.passwordMeterInitialized = true;
        }, 0);
    }

    save() {
        this.saving = true;
        let createOrEditSupervisor = new CreateOrEditSupervisorDto();
        createOrEditSupervisor.city = this.supervisor.supervisor.city;
        createOrEditSupervisor.id = this.supervisor.supervisor.id;
        createOrEditSupervisor.year = this.supervisor.supervisor.year;
        createOrEditSupervisor.cycleNumber = this.supervisor.supervisor.cycleNumber;
        createOrEditSupervisor.user = this.supervisor.user;
        createOrEditSupervisor.sendActivationEmail = this.sendActivationEmail;
        createOrEditSupervisor.setRandomPassword = this.setRandomPassword;

        this.userForm.form.markAllAsTouched();
        if (this.userForm.form.valid) {
            this._supervisorsService.createOrEdit(createOrEditSupervisor).subscribe({
                next: () => {
                    this.notify.success(this.l('SavedSuccessfully'));
                    this.modalSave.emit();
                    this.close();
                },
                error: () => {
                    this.saving = false;
                },
            });
        } else {
            this.saving = false;
        }
    }

    close() {
        this.modal.hide();
    }
}
