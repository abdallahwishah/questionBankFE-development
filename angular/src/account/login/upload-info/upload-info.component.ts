import {
    GenderEnum,
    PasswordComplexitySetting,
    ProfileServiceProxy,
} from './../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
export class UploadInfoComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('videoElement', { static: false }) videoElement: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement', { static: false }) canvasElement: ElementRef<HTMLCanvasElement>;
    
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
    
    // Camera related properties
    mediaStream: MediaStream | null = null;
    isCameraActive = false;
    showCameraPreview = false;
    capturedPhoto: string | null = null;
    isCapturing = false;
    cameraError = '';
    
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

    ngOnDestroy() {
        this.stopCamera();
    }

    // --------------------------
    // Camera Methods
    // --------------------------
    
    async startCamera() {
        try {
            this.cameraError = '';
            this.isCapturing = true;
            
            // Request camera access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user' // Front camera
                }
            });
            
            this.isCameraActive = true;
            this.showCameraPreview = true;
            
            // Wait for view to render
            setTimeout(() => {
                if (this.videoElement && this.videoElement.nativeElement) {
                    this.videoElement.nativeElement.srcObject = this.mediaStream;
                }
            }, 100);
            
        } catch (error) {
            console.error('Camera error:', error);
            this.cameraError = this.getCameraErrorMessage(error);
            this.isCameraActive = false;
            this.showCameraPreview = false;
        } finally {
            this.isCapturing = false;
        }
    }
    
    stopCamera() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        this.isCameraActive = false;
        this.showCameraPreview = false;
    }
    
    capturePhoto() {
        if (!this.videoElement || !this.canvasElement) {
            this.notify.error('Camera not ready');
            return;
        }
        
        const video = this.videoElement.nativeElement;
        const canvas = this.canvasElement.nativeElement;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw current frame to canvas
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        this.capturedPhoto = canvas.toDataURL('image/jpeg', 0.8);
        this.personalImage = this.capturedPhoto;
        
        // Convert to blob and upload
        canvas.toBlob((blob) => {
            if (blob) {
                this.uploadCapturedPhoto(blob);
            }
        }, 'image/jpeg', 0.8);
        
        // Stop camera after capture
        this.stopCamera();
    }
    
    retakePhoto() {
        this.capturedPhoto = null;
        this.personalImage = '';
        this.registerStudent.selfiePhotoToken = null;
        this.startCamera();
    }
    
    confirmPhoto() {
        if (this.capturedPhoto && this.registerStudent.selfiePhotoToken) {
            this.stopCamera();
            this.notify.success('Photo confirmed successfully');
        }
    }
    
    private uploadCapturedPhoto(blob: Blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        
        this._uploaderService.uploadFileOrFiles(file).subscribe({
            next: (value: any) => {
                this.registerStudent.selfiePhotoToken = value?.result?.fileToken;
                console.log('Photo uploaded successfully');
            },
            error: (error) => {
                console.error('Upload error:', error);
                this.notify.error('Failed to upload photo');
            }
        });
    }
    
    private getCameraErrorMessage(error: any): string {
        if (error.name === 'NotFoundError') {
            return 'No camera found. Please use a device with a camera.';
        } else if (error.name === 'NotAllowedError') {
            return 'Camera access denied. Please allow camera access and try again.';
        } else if (error.name === 'NotReadableError') {
            return 'Camera is already in use by another application.';
        } else {
            return 'Unable to access camera. Please try again.';
        }
    }

    // --------------------------
    // Password Complexity Methods
    // --------------------------

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
            this.notify.error(this.l('InvalidFileType'));
        }
    }

    // uploadPersonalImage method removed - replaced with camera capture

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
