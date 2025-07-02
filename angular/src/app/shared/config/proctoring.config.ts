export interface PhotoCaptureConfig {
    intervalMinutes: number;
    maxRetries: number;
    jpegQuality: number;
    maxPhotosInStorage: number;
    uploadRetryDelay: number;
    photoWidth: number;
    photoHeight: number;
}

export const DEFAULT_PHOTO_CONFIG: PhotoCaptureConfig = {
    intervalMinutes: 10, // Take photo every 10 minutes
    maxRetries: 3, // Maximum retry attempts for failed uploads
    jpegQuality: 0.8, // JPEG compression quality (0.1 to 1.0)
    maxPhotosInStorage: 50, // Maximum photos to store locally
    uploadRetryDelay: 30000, // 30 seconds delay between upload retries
    photoWidth: 640, // Photo width in pixels
    photoHeight: 480 // Photo height in pixels
};

export const PROCTORING_STORAGE_KEYS = {
    PENDING_PHOTOS: 'EXAM_PENDING_PHOTOS',
    CAMERA_ACCESS: 'CAMERA_ACCESS_GRANTED',
    CAPTURE_SESSION: 'CAPTURE_SESSION_DATA'
} as const;
