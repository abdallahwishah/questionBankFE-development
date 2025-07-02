import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { UploaderService } from './uploader.service';
import { DEFAULT_PHOTO_CONFIG, PhotoCaptureConfig, PROCTORING_STORAGE_KEYS } from '../config/proctoring.config';

export interface CameraStatus {
    hasAccess: boolean;
    hasPermission: boolean;
    error?: string;
    stream?: MediaStream;
}

export interface PhotoCapture {
    id: string;
    timestamp: number;
    blob: Blob;
    base64: string;
    studentAttemptId?: string;
    uploaded: boolean;
    retryCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class CameraProctoringService {
    private cameraStatusSubject = new BehaviorSubject<CameraStatus>({
        hasAccess: false,
        hasPermission: false
    });

    public cameraStatus$ = this.cameraStatusSubject.asObservable();

    private mediaStream: MediaStream | null = null;
    private videoElement: HTMLVideoElement | null = null;

    // Photo capture management
    private captureInterval: any;
    private captureWorker: Worker | undefined;
    private pendingPhotos: PhotoCapture[] = [];

    // Configuration
    private config: PhotoCaptureConfig = DEFAULT_PHOTO_CONFIG;

    // Storage keys from config
    private readonly PENDING_PHOTOS_KEY = PROCTORING_STORAGE_KEYS.PENDING_PHOTOS;
    private readonly CAMERA_ACCESS_KEY = PROCTORING_STORAGE_KEYS.CAMERA_ACCESS;

    constructor(private uploaderService: UploaderService) {
        this.loadPendingPhotos();
        this.initializeCameraWorker();
    }

    /**
     * Check if camera access is available and request permission
     */
    async checkCameraAccess(): Promise<CameraStatus> {
        try {
            // Check if camera API is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const status: CameraStatus = {
                    hasAccess: false,
                    hasPermission: false,
                    error: 'Camera API not supported in this browser'
                };
                this.cameraStatusSubject.next(status);
                return status;
            }

            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: this.config.photoWidth,
                    height: this.config.photoHeight,
                    facingMode: 'user' // Front camera preferred
                }
            });

            this.mediaStream = stream;

            const status: CameraStatus = {
                hasAccess: true,
                hasPermission: true,
                stream: stream
            };

            this.cameraStatusSubject.next(status);
            localStorage.setItem(this.CAMERA_ACCESS_KEY, 'true');

            return status;
        } catch (error) {
            console.error('Camera access error:', error);

            let errorMessage = 'Camera access denied or not available';
            if (error.name === 'NotFoundError') {
                errorMessage = 'No camera found. Please use a device with a camera.';
            } else if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera access denied. Please allow camera access and refresh the page.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera is already in use by another application.';
            }

            const status: CameraStatus = {
                hasAccess: false,
                hasPermission: false,
                error: errorMessage
            };

            this.cameraStatusSubject.next(status);
            localStorage.removeItem(this.CAMERA_ACCESS_KEY);

            return status;
        }
    }

    /**
     * Check if camera access was previously granted
     */
    hasPreviousCameraAccess(): boolean {
        return localStorage.getItem(this.CAMERA_ACCESS_KEY) === 'true';
    }

    /**
     * Initialize the camera preview (for testing purposes)
     */
    async initializeCameraPreview(videoElement: HTMLVideoElement): Promise<void> {
        if (!this.mediaStream) {
            await this.checkCameraAccess();
        }

        if (this.mediaStream && videoElement) {
            videoElement.srcObject = this.mediaStream;
            this.videoElement = videoElement;
        }
    }

    /**
     * Start automatic photo capture every 10 minutes
     */
    startAutomaticCapture(studentAttemptId: string, examEndTime: number): void {
        this.stopAutomaticCapture(); // Clear any existing intervals

        // Calculate capture interval from config
        const captureIntervalMs = this.config.intervalMinutes * 60 * 1000;

        // Start the worker for precise timing
        if (this.captureWorker) {
            this.captureWorker.postMessage({
                command: 'start',
                intervalMs: captureIntervalMs,
                examEndTime: examEndTime,
                studentAttemptId: studentAttemptId
            });
        }

        // Also set a backup interval
        this.captureInterval = setInterval(() => {
            this.capturePhoto(studentAttemptId);
        }, captureIntervalMs);

        // Take first photo immediately
        setTimeout(() => {
            this.capturePhoto(studentAttemptId);
        }, 5000); // 5 second delay to ensure exam has started
    }

    /**
     * Stop automatic photo capture
     */
    stopAutomaticCapture(): void {
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }

        if (this.captureWorker) {
            this.captureWorker.postMessage({ command: 'stop' });
        }
    }

    /**
     * Capture a photo from the camera
     */
    async capturePhoto(studentAttemptId: string): Promise<PhotoCapture | null> {
        try {
            if (!this.mediaStream) {
                console.error('No camera stream available for photo capture');
                return null;
            }

            // Create a canvas to capture the photo
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Create a video element if we don't have one
            let videoElement = this.videoElement;
            if (!videoElement) {
                videoElement = document.createElement('video');
                videoElement.srcObject = this.mediaStream;
                videoElement.muted = true;
                await new Promise((resolve) => {
                    videoElement!.onloadedmetadata = () => {
                        videoElement!.play();
                        resolve(void 0);
                    };
                });
            }

            // Set canvas dimensions
            canvas.width = videoElement.videoWidth || this.config.photoWidth;
            canvas.height = videoElement.videoHeight || this.config.photoHeight;

            // Draw the current frame
            context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            // Convert to blob
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob as Blob);
                }, 'image/jpeg', this.config.jpegQuality);
            });

            // Convert to base64 for offline storage
            const base64 = canvas.toDataURL('image/jpeg', this.config.jpegQuality);

            const photoCapture: PhotoCapture = {
                id: this.generatePhotoId(),
                timestamp: Date.now(),
                blob: blob,
                base64: base64,
                studentAttemptId: studentAttemptId,
                uploaded: false,
                retryCount: 0
            };

            // Add to pending photos (limit storage)
            this.pendingPhotos.push(photoCapture);

            // Keep only recent photos to prevent storage overflow
            if (this.pendingPhotos.length > this.config.maxPhotosInStorage) {
                this.pendingPhotos = this.pendingPhotos.slice(-this.config.maxPhotosInStorage);
            }

            this.savePendingPhotos();

            // Try to upload immediately if online
            if (navigator.onLine) {
                this.uploadPhoto(photoCapture);
            }

            console.log('Photo captured successfully:', photoCapture.id);
            return photoCapture;

        } catch (error) {
            console.error('Error capturing photo:', error);
            return null;
        }
    }

    /**
     * Upload a photo to the server
     */
    private async uploadPhoto(photo: PhotoCapture): Promise<void> {
        try {
            const file = new File([photo.blob], `exam-photo-${photo.id}.jpg`, {
                type: 'image/jpeg'
            });

            const params = {
                studentAttemptId: photo.studentAttemptId,
                timestamp: photo.timestamp.toString(),
                photoId: photo.id
            };

            await this.uploaderService.uploadFileOrFiles(file, params).toPromise().then(value => {
                console.log('Upload successful:', value);
            }).catch(error => {
                console.error('Upload error:', error);
            });

            // Mark as uploaded
            photo.uploaded = true;
            this.savePendingPhotos();

            console.log('Photo uploaded successfully:', photo.id);

        } catch (error) {
            console.error('Error uploading photo:', error);
            photo.retryCount++;
            this.savePendingPhotos();
        }
    }

    /**
     * Retry uploading failed photos when connection is restored
     */
    async retryFailedUploads(): Promise<void> {
        const failedPhotos = this.pendingPhotos.filter(p => !p.uploaded && p.retryCount < this.config.maxRetries);

        for (const photo of failedPhotos) {
            await this.uploadPhoto(photo);

            // Add delay between retries to avoid overwhelming the server
            if (failedPhotos.length > 1) {
                await new Promise(resolve => setTimeout(resolve, this.config.uploadRetryDelay / failedPhotos.length));
            }
        }

        // Remove successfully uploaded photos
        this.pendingPhotos = this.pendingPhotos.filter(p => !p.uploaded);
        this.savePendingPhotos();
    }

    /**
     * Initialize the worker for precise photo capture timing
     */
    private initializeCameraWorker(): void {
        const workerBlob = new Blob([this.getCameraWorkerString()], {
            type: 'application/javascript'
        });
        const workerUrl = URL.createObjectURL(workerBlob);

        this.captureWorker = new Worker(workerUrl);

        this.captureWorker.onmessage = ({ data }) => {
            if (data.type === 'capture') {
                this.capturePhoto(data.studentAttemptId);
            }
        };
    }

    /**
     * Worker script for precise timing
     */
    private getCameraWorkerString(): string {
        return `
            let captureInterval = null;
            let examEndTime = null;
            let studentAttemptId = null;

            self.onmessage = (e) => {
                if (e.data.command === 'start') {
                    examEndTime = e.data.examEndTime;
                    studentAttemptId = e.data.studentAttemptId;

                    if (captureInterval) {
                        clearInterval(captureInterval);
                    }

                    captureInterval = setInterval(() => {
                        const now = Date.now();

                        // Stop if exam has ended
                        if (examEndTime && now >= examEndTime) {
                            clearInterval(captureInterval);
                            captureInterval = null;
                            return;
                        }

                        // Send capture signal
                        postMessage({
                            type: 'capture',
                            studentAttemptId: studentAttemptId,
                            timestamp: now
                        });

                    }, e.data.intervalMs);

                } else if (e.data.command === 'stop') {
                    if (captureInterval) {
                        clearInterval(captureInterval);
                        captureInterval = null;
                    }
                }
            };
        `;
    }

    /**
     * Save pending photos to localStorage
     */
    private savePendingPhotos(): void {
        try {
            const photosToSave = this.pendingPhotos.map(photo => ({
                ...photo,
                blob: undefined, // Don't store blob in localStorage
                base64: photo.base64 // Keep base64 for offline storage
            }));

            localStorage.setItem(this.PENDING_PHOTOS_KEY, JSON.stringify(photosToSave));
        } catch (error) {
            console.error('Error saving pending photos:', error);
        }
    }

    /**
     * Load pending photos from localStorage
     */
    private loadPendingPhotos(): void {
        try {
            const savedPhotos = localStorage.getItem(this.PENDING_PHOTOS_KEY);
            if (savedPhotos) {
                const photos = JSON.parse(savedPhotos);
                this.pendingPhotos = photos.map((photo: any) => ({
                    ...photo,
                    blob: this.base64ToBlob(photo.base64) // Convert base64 back to blob
                }));
            }
        } catch (error) {
            console.error('Error loading pending photos:', error);
            this.pendingPhotos = [];
        }
    }

    /**
     * Convert base64 to blob
     */
    private base64ToBlob(base64: string): Blob {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: 'image/jpeg' });
    }

    /**
     * Generate unique photo ID
     */
    private generatePhotoId(): string {
        return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clean up resources
     */
    cleanup(): void {
        this.stopAutomaticCapture();

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.captureWorker) {
            this.captureWorker.terminate();
            this.captureWorker = undefined;
        }

        this.videoElement = null;
    }

    /**
     * Get pending photos count
     */
    getPendingPhotosCount(): number {
        return this.pendingPhotos.filter(p => !p.uploaded).length;
    }

    /**
     * Clear all stored photos (call when exam is completed)
     */
    clearStoredPhotos(): void {
        this.pendingPhotos = [];
        localStorage.removeItem(this.PENDING_PHOTOS_KEY);
    }
}
