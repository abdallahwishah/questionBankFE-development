import {
    CreateOrUpdateUserInput,
    GenderEnum,
    GetStudentForEditOutput,
    GetUserForEditOutput,
    GovernoratesServiceProxy,
    NameValueDto,
    NameValueDtoOfInt32,
    StudentsServiceProxy,
    StudyLevelsServiceProxy,
} from './../../../../../../shared/service-proxies/service-proxies';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    CreateOrEditStudentDto,
    PasswordComplexitySetting,
    ProfileServiceProxy,
    UserEditDto,
} from '@shared/service-proxies/service-proxies';
import { PasswordMeterComponent } from '@metronic/app/kt/components';
import { NgForm } from '@node_modules/@angular/forms';
import { all } from '@node_modules/@devexpress/analytics-core/analytics-elements-metadata';

@Component({
    selector: 'app-create-or-edit-student-modal',
    templateUrl: './create-or-edit-student-modal.component.html',
    styleUrls: ['./create-or-edit-student-modal.component.css'],
})
export class CreateOrEditStudentModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('userForm') userForm: NgForm;
    @Output() modalSave = new EventEmitter();
    active: boolean;
    student: GetStudentForEditOutput = new GetStudentForEditOutput();
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
    studentStudyLevel: any;
    allStudyLevel: NameValueDtoOfInt32[];
    allGovernorates: NameValueDtoOfInt32[];
    allGender: any[];

    constructor(
        injector: Injector,
        private _studentsService: StudentsServiceProxy,
        private _profileService: ProfileServiceProxy,
        private _studyLevelService: StudyLevelsServiceProxy,
        private _governoratesService: GovernoratesServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.allGender = Object.keys(GenderEnum)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                name: key,
                id: GenderEnum[key as keyof typeof GenderEnum],
            }));
    }

    show(studentId?: number): void {
        this._studyLevelService.getStudyLevelsForDropdown().subscribe((result) => {
            this.allStudyLevel = result;
        });
        this._governoratesService.getGovernoratesForDropdown().subscribe((result) => {
            this.allGovernorates = result;
        });
        if (!studentId) {
            this.active = true;
            this.setRandomPassword = true;
            this.sendActivationEmail = false;
            this.canChangeProfilePicture = false;
            this.student = new GetStudentForEditOutput();
            this.student.student = new CreateOrEditStudentDto();
            this.student.getUserForEditOutput = new GetUserForEditOutput();
            this.student.getUserForEditOutput.user = new UserEditDto();
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            this.modal.show();
        } else {
            this.canChangeProfilePicture = this.permission.isGranted('Pages.Administration.Users.ChangeProfilePicture');

            this._studentsService.getStudentForEdit(studentId).subscribe((result) => {
                this.student = result;
                this.canChangeUserName = this.student.userName !== AppConsts.userManagement.defaultAdminUserName;
                this.allowedUserNameCharacters = result.getUserForEditOutput.allowedUserNameCharacters;
                this.isSMTPSettingsProvided = result.getUserForEditOutput.isSMTPSettingsProvided;
                this.sendActivationEmail = result.getUserForEditOutput.isSMTPSettingsProvided;
                this.studentStudyLevel = result.student.studyLevelId;

                this.getProfilePicture(result.getUserForEditOutput.user.id);

                if (studentId) {
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
        let createOrEditStudent = new CreateOrEditStudentDto();
        createOrEditStudent.createOrUpdateUserInput = new CreateOrUpdateUserInput();
        createOrEditStudent.city = this.student.student.city;
        createOrEditStudent.id = this.student.student.id;
        createOrEditStudent.studentNumber = this.student.student.studentNumber;
        createOrEditStudent.studyLevelId = this.student.student.studyLevelId;
        createOrEditStudent.year = this.student.student.year;
        createOrEditStudent.cycleNumber = this.student.student.cycleNumber;
        createOrEditStudent.createOrUpdateUserInput.user = this.student.getUserForEditOutput.user;
        createOrEditStudent.createOrUpdateUserInput.sendActivationEmail = this.sendActivationEmail;
        createOrEditStudent.createOrUpdateUserInput.setRandomPassword = this.setRandomPassword;
        createOrEditStudent.createOrUpdateUserInput.assignedRoleNames = ['Student'];
        createOrEditStudent.gender = this.student.student.gender;

        this.userForm.form.markAllAsTouched();
        if (this.userForm.form.valid) {
            this._studentsService.createOrEdit(createOrEditStudent).subscribe({
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
        this.saving = false;
        this.userForm.form.reset();
        this.modal.hide();
    }
}
