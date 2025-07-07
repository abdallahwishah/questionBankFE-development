import { Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LoginService } from '../login.service';
import { Router } from '@node_modules/@angular/router';
import { UploaderService } from '@app/shared/services/uploader.service';
import { ReCaptchaV3WrapperService } from '@account/shared/recaptchav3-wrapper.service';

@Component({
    selector: 'app-verify-face-regonition',
    templateUrl: './verify-face-regonition.component.html',
    styleUrls: ['./verify-face-regonition.component.css'],
})
export class VerifyFaceRegonitionComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('videoElement', { static: false }) videoElement: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement', { static: false }) canvasElement: ElementRef<HTMLCanvasElement>;

    fileToken: string;

    // Camera and photo states
    mediaStream: MediaStream | null = null;
    cameraActive = false;
    photoTaken = false;
    capturedImageDataUrl: string | null = null;
    capturedImageBlob: Blob | null = null;

    // UI states
    isLoading = false;
    cameraError = false;
    cameraErrorMessage = '';
    isSubmitting = false;
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
            this._router.navigate(['account/login'], { replaceUrl: true });
            return;
        }

        // Initialize camera on component load
        this.initializeCamera();
    }

    ngOnDestroy() {
        this.stopCamera();
    }

    /**
     * Initialize camera stream
     */
    async initializeCamera(): Promise<void> {
        try {
            this.isLoading = true;
            this.cameraError = false;

            // Check if camera API is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }

            // Request camera permission
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user', // Front camera preferred
                },
            });

            // Wait for video element to be available
            setTimeout(() => {
                if (this.videoElement && this.mediaStream) {
                    this.videoElement.nativeElement.srcObject = this.mediaStream;
                    this.cameraActive = true;
                }
                this.isLoading = false;
            }, 100);
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.isLoading = false;
            this.cameraError = true;

            if (error.name === 'NotFoundError') {
                this.cameraErrorMessage = 'No camera found. Please use a device with a camera.';
            } else if (error.name === 'NotAllowedError') {
                this.cameraErrorMessage = 'Camera access denied. Please allow camera access and try again.';
            } else if (error.name === 'NotReadableError') {
                this.cameraErrorMessage = 'Camera is already in use by another application.';
            } else {
                this.cameraErrorMessage = 'Failed to access camera. Please check your camera and try again.';
            }
        }
    }

    /**
     * Stop camera stream
     */
    stopCamera(): void {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
            this.mediaStream = null;
        }
        this.cameraActive = false;
    }

    /**
     * Take a photo from the camera
     */
    takePhoto(): void {
        this.photoTaken = true;
        if (!this.videoElement || !this.canvasElement || !this.cameraActive) {
            this.photoTaken = false;
            return;
        }

        const video = this.videoElement.nativeElement;
        const canvas = this.canvasElement.nativeElement;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame to canvas
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL and blob
        this.capturedImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

        canvas.toBlob(
            (blob) => {
                this.photoTaken = false;
                this.capturedImageBlob = blob;
                this.photoTaken = true;
                // Stop camera after taking photo
                this.stopCamera();
            },
            'image/jpeg',
            0.8,
        );
    }

    /**
     * Retake photo - restart camera
     */
    retakePhoto(): void {
        this.photoTaken = false;
        this.capturedImageDataUrl = null;
        this.capturedImageBlob = null;
        this.initializeCamera();
    }

    /**
     * Confirm photo and proceed with upload
     */
    confirmPhoto(): void {
        if (!this.capturedImageBlob) {
            return;
        }

        // Create file from blob
        const file = new File([this.capturedImageBlob], 'face-verification.jpg', {
            type: 'image/jpeg',
        });

        // Upload and submit
        this.uploadImageAndSubmit(file);
    }

    uploadImage(image) {
        this._uploaderService.uploadFileOrFiles(image).subscribe((value: any) => {
            this.fileToken = value?.result?.fileToken;
        });
    }

    /**
     * Upload image and automatically submit
     */
    uploadImageAndSubmit(image: File): void {
        this.isSubmitting = true;

        this._uploaderService.uploadFileOrFiles(image).subscribe({
            next: (value: any) => {
                this.fileToken = value?.result?.fileToken;
                // Automatically submit after successful upload
                this.submit();
            },
            error: (error) => {
                console.error('Upload error:', error);
                this.isSubmitting = false;
                this.message.error('Failed to upload image. Please try again.');
            },
        });
    }

    submit(): void {
        if (!this.fileToken) {
            this.message.error('Please take a photo first.');
            return;
        }

        let recaptchaCallback = (token: string) => {
            this.loginService.authenticateModel.towFactorFaceRecognitionPhotoToken = this.fileToken;
            this.loginService.authenticate(
                () => {
                    this.isSubmitting = false;
                },
                null,
                token,
            );
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
