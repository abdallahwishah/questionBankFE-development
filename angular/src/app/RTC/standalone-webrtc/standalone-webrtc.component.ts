import {
    Component,
    Input,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    AfterViewInit,
    ChangeDetectorRef
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { Subscription } from 'rxjs';
  import { WebRTCService } from '../web-rtc.service';
  import { SignalRRTCService } from '../signal-r-rtc.service';

  @Component({
    selector: 'app-standalone-webrtc',
    templateUrl: './standalone-webrtc.component.html',
    styleUrls: ['./standalone-webrtc.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule],
  })
  export class StandaloneWebRTCComponent implements OnDestroy, OnChanges, AfterViewInit {
    @ViewChild('remoteVideo') remoteVideoElement: ElementRef<HTMLVideoElement>;
    @ViewChild('localVideo') localVideoElement: ElementRef<HTMLVideoElement>;

    // Input properties
    @Input() employeeId: string | null = null;
    @Input() autoConnect: boolean = true;
    @Input() showControls: boolean = true;

    // Output events
    @Output() callStarted = new EventEmitter<void>();
    @Output() callEnded = new EventEmitter<string>();
    @Output() callError = new EventEmitter<string>();

    // Connection state
    isConnecting: boolean = false;
    isCallActive: boolean = false;
    connectionStatus: string = 'idle';

    // Video streams
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;

    // Video devices
    videoDevices: MediaDeviceInfo[] = [];
    selectedCameraId: string = '';
    cameraSelected: boolean = false;

    // Call info
    callDuration: number = 0;
    callStartTime: Date | null = null;
    durationTimer: any = null;

    // UI state
    toastMessage: { type: string; message: string } | null = null;
    toastVisible: boolean = false;
    showConfirmDialog: boolean = false;
    confirmDialogMessage: string = '';
    confirmAction: (() => void) | null = null;

    private subscriptions: Subscription[] = [];

    constructor(
      private webRTCService: WebRTCService,
      private signalRService: SignalRRTCService,
      private cdr: ChangeDetectorRef
    ) {}

    ngAfterViewInit(): void {
      // Initialize SignalR connection
      this.initializeSignalR();

      // Load camera options
      this.loadCameraOptions();

      // Subscribe to WebRTC events
      this.setupSubscriptions();

      // We won't auto-start here anymore - require camera selection first
    }

    ngOnChanges(changes: SimpleChanges): void {
      // If employee ID changes, handle connection based on autoConnect setting
      if (changes['employeeId'] && changes['employeeId'].currentValue) {
        // Disconnect previous call if needed
        if (
          changes['employeeId'].previousValue &&
          changes['employeeId'].previousValue !== changes['employeeId'].currentValue &&
          (this.isCallActive || this.isConnecting)
        ) {
          this.endCall();
        }

        // We no longer auto-connect - require camera selection first
      }
    }

    ngOnDestroy(): void {
      // Clean up all resources
      this.endCall();
      this.stopCallTimer();
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    // Initialize SignalR connection
    private async initializeSignalR(): Promise<void> {
      try {
        await this.signalRService.startConnection();
        console.log('SignalR connection established');
      } catch (error) {
        console.error('Failed to connect to SignalR hub:', error);
        this.showToast('danger', 'Failed to connect to video call server');
        this.callError.emit('signalr_connection_failed');
      }
    }

    // Load available cameras
    private async loadCameraOptions(): Promise<void> {
      this.subscriptions.push(
        this.webRTCService.videoDevices$.subscribe(devices => {
          this.videoDevices = devices;

          // Don't auto-select camera anymore
          this.cdr.detectChanges();
        })
      );

      // Trigger camera detection
      await this.webRTCService.updateVideoDevices();
    }

    // Initialize local camera stream for preview
    private async initializeCameraPreview(deviceId: string): Promise<void> {
      try {
        if (this.localStream) {
          // Stop current tracks
          this.localStream.getTracks().forEach(track => track.stop());
        }

        // Get new stream for preview
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false // No audio needed for preview
        });

        this.localStream = stream;

        // Update video element if available
        if (this.localVideoElement?.nativeElement) {
          this.localVideoElement.nativeElement.srcObject = stream;
          this.localVideoElement.nativeElement.play().catch(e =>
            console.error('Error playing local preview video:', e)
          );
        }

        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error initializing camera preview:', error);
        this.showToast('danger', 'Could not access selected camera');
      }
    }

    // Set up event subscriptions
    private setupSubscriptions(): void {
      this.subscriptions.push(
        // Handle local stream
        this.webRTCService.localStream$.subscribe(stream => {
          console.log('Local stream updated:', stream ? 'available' : 'null');
          this.localStream = stream;

          // Update video element if available
          if (stream && this.localVideoElement?.nativeElement) {
            this.localVideoElement.nativeElement.srcObject = stream;
            this.localVideoElement.nativeElement.play().catch(e =>
              console.error('Error playing local video:', e)
            );
          }
        }),

        // Handle remote stream
        this.webRTCService.remoteStream$.subscribe(stream => {
          console.log('Remote stream updated:', stream ? 'available' : 'null');

          if (stream) {
            // Set the stream first without trying to play immediately
            this.remoteStream = stream;
            this.isCallActive = true;
            this.connectionStatus = 'connected';
            this.isConnecting = false;

            // Start call timer
            this.callStartTime = new Date();
            this.startCallTimer();

            // Notify parent
            this.callStarted.emit();

            // Success notification
            this.showToast('success', 'Video call has been established');

            // Play the video after a delay to ensure it's fully loaded
            setTimeout(() => {
              this.playRemoteVideo();
            }, 1000);
          }
        }),

        // Handle call accepted event
        this.signalRService.videoCallAccepted.subscribe(() => {
          this.connectionStatus = 'accepted';
          console.log('Call accepted by employee');
        }),

        // Handle call rejected event
        this.signalRService.videoCallRejected.subscribe((reason) => {
          this.connectionStatus = 'rejected';
          this.isConnecting = false;

          // Show rejection message
          this.showToast('warning', reason || 'The employee declined your call');

          // Clean up resources
          this.cleanupCall();

          // Notify parent
          this.callEnded.emit('rejected');
        }),

        // Handle call ended event
        this.signalRService.videoCallEnded.subscribe((reason) => {
          this.connectionStatus = 'ended';
          this.isConnecting = false;

          // Show message
          this.showToast('info', reason || 'The call has ended');

          // Clean up resources
          this.cleanupCall();

          // Notify parent
          this.callEnded.emit('ended');
        })
      );
    }

    // Play remote video with error handling
    private playRemoteVideo(): void {
      if (this.remoteVideoElement?.nativeElement && this.remoteStream) {
        const videoEl = this.remoteVideoElement.nativeElement;

        // Ensure srcObject is set
        if (videoEl.srcObject !== this.remoteStream) {
          videoEl.srcObject = this.remoteStream;
        }

        // Use a promise-based approach to handle play
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Remote video playing successfully');
          }).catch(e => {
            console.error('Error playing remote video:', e);
            // Try again with muted (browsers often allow muted autoplay)
            videoEl.muted = true;
            videoEl.play().then(() => {
              console.log('Remote video playing with muted workaround');
              // Try to unmute after playback starts
              setTimeout(() => {
                videoEl.muted = false;
              }, 2000);
            }).catch(err => {
              console.error('Still cannot play video even when muted:', err);
            });
          });
        }
      }
    }

    // Show toast message
    private showToast(type: string, message: string): void {
      this.toastMessage = { type, message };
      this.toastVisible = true;

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        this.toastVisible = false;
      }, 5000);
    }

    // Hide toast message
    hideToast(): void {
      this.toastVisible = false;
    }

    // Show confirmation dialog
    private showConfirm(message: string, action: () => void): void {
      this.confirmDialogMessage = message;
      this.confirmAction = action;
      this.showConfirmDialog = true;
    }

    // Handle confirmation dialog result
    handleConfirmation(confirmed: boolean): void {
      this.showConfirmDialog = false;

      if (confirmed && this.confirmAction) {
        this.confirmAction();
      }

      this.confirmAction = null;
    }

    // Handle camera selection change
    onCameraChange(deviceId: string): void {
        debugger
      if (!deviceId || deviceId === this.selectedCameraId) return;

      console.log('Selected camera:', deviceId);
      this.selectedCameraId = deviceId;
      this.cameraSelected = true;

      // Initialize preview with selected camera
      this.initializeCameraPreview(deviceId);

      // If in a call, update the camera
      if (this.isCallActive) {
        this.webRTCService.switchCamera(deviceId)
          .then(() => {
            this.showToast('success', 'Camera changed successfully');
          })
          .catch(error => {
            console.error('Error switching camera:', error);
            this.showToast('danger', 'Failed to switch camera');
          });
      }
    }

    // Start a call to the employee
    startCall(): void {
      if (!this.employeeId) {
        console.error('Cannot start call: No employee ID provided');
        this.showToast('danger', 'No employee ID provided');
        this.callError.emit('no_employee_id');
        return;
      }

      if (!this.cameraSelected || !this.selectedCameraId) {
        console.error('Cannot start call: No camera selected');
        this.showToast('warning', 'Please select a camera first');
        return;
      }

      if (this.isCallActive || this.isConnecting) {
        console.warn('Call already in progress');
        return;
      }

      // Update state
      this.isConnecting = true;
      this.connectionStatus = 'connecting';

      // Request camera access from employee
      this.webRTCService
        .requestCameraAccess(this.employeeId, this.selectedCameraId)
        .then(() => {
          console.log('Camera access request sent to employee:', this.employeeId);
        })
        .catch((error) => {
          console.error('Error requesting camera access:', error);
          this.isConnecting = false;
          this.connectionStatus = 'error';

          this.showToast('danger', 'Failed to request camera access from employee');

          this.callError.emit('camera_request_failed');
        });
    }

    // End the current call
    endCall(): void {
      if (!this.isCallActive && !this.isConnecting) {
        return;
      }

      // Show confirmation if the call is active
      if (this.isCallActive) {
        this.showConfirm('Are you sure you want to end this call?', () => {
          this.executeCallEnd();
        });
      } else {
        // If still connecting, just end it without confirmation
        this.executeCallEnd();
      }
    }

    // Take a snapshot from the remote video
    takeSnapshot(): void {
      if (!this.remoteStream) {
        this.showToast('warning', 'No video stream available');
        return;
      }

      try {
        const dataUrl = this.webRTCService.takeSnapshot();

        // Create download link for the image
        const link = document.createElement('a');
        link.download = `snapshot_${new Date().toISOString()}.png`;
        link.href = dataUrl;
        link.click();

        this.showToast('success', 'Image saved to your downloads');
      } catch (error) {
        console.error('Error taking snapshot:', error);
        this.showToast('danger', 'Failed to capture image from video');
      }
    }

    // Test video playback (can be called from UI during troubleshooting)
    testVideo(): void {
        this.playRemoteVideo();

    }

    // Execute call end without confirmation
    private executeCallEnd(): void {
      // Stop WebRTC streams
      this.webRTCService.stopStreaming().catch((error) => {
        console.error('Error stopping stream:', error);
      });

      // Clean up resources
      this.cleanupCall();

      // Notify parent
      this.callEnded.emit('user_ended');
    }

    // Clean up call resources
    private cleanupCall(): void {
      this.isCallActive = false;
      this.isConnecting = false;
      this.stopCallTimer();
      this.callStartTime = null;
      this.callDuration = 0;
      this.webRTCService.cleanupCall();
    }

    // Start call duration timer
    private startCallTimer(): void {
      this.stopCallTimer(); // Ensure no duplicate timers

      this.durationTimer = setInterval(() => {
        if (this.callStartTime) {
          const now = new Date();
          this.callDuration = Math.floor((now.getTime() - this.callStartTime.getTime()) / 1000);
        }
      }, 1000);
    }

    // Stop call duration timer
    private stopCallTimer(): void {
      if (this.durationTimer) {
        clearInterval(this.durationTimer);
        this.durationTimer = null;
      }
    }

    // Format seconds to MM:SS display
    formatDuration(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
