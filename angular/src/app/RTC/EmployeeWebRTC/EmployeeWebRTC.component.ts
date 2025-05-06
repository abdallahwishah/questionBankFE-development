// src/app/shared/components/employee-webrtc/employee-webrtc.component.ts
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebRTCService } from '../web-rtc.service';
import { SignalRRTCService } from '../signal-r-rtc.service';

@Component({
    selector: 'app-employee-webrtc',
    templateUrl: './EmployeeWebRTC.component.html',
    styleUrls: ['./EmployeeWebRTC.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class EmployeeWebRTCComponent implements OnInit, OnDestroy {
    // Inputs
    @Input() employeeId: string | null = null; // The employee's own ID
    @Input() autoInitialize: boolean = true; // Auto initialize SignalR

    // Outputs
    @Output() callStarted = new EventEmitter<void>();
    @Output() callEnded = new EventEmitter<void>();
    @Output() callRequest = new EventEmitter<{ callerId: string; callerName: string }>();

    // Call state
    isCallActive: boolean = false;
    isIncomingCall: boolean = false;
    incomingCallData: { callerId: string; callerName: string } | null = null;
    connectionStatus: string = 'idle'; // idle, incoming, connected, ended, error

    // Video streams
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;

    // Countdown timer for auto-rejection
    countdownValue: number = 30;
    countdownTimer: any = null;

    // Call duration tracking
    callDuration: number = 0;
    callStartTime: Date | null = null;
    durationTimer: any = null;

    // Toast messages
    toastMessage: { type: string; message: string } | null = null;
    toastVisible: boolean = false;

    private subscriptions: Subscription[] = [];

    constructor(
        private webRTCService: WebRTCService,
        private signalRService: SignalRRTCService,

    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            if (this.autoInitialize) {
                this.initializeSignalR();
            }
        }, 1000);
    }

    ngOnDestroy(): void {
        this.stopCountdown();
        this.stopCallTimer();
        this.cleanupCall();
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    // PUBLIC METHODS

    // Initialize the SignalR connection and event handlers
    public async initializeSignalR(): Promise<void> {
        // Handle call accepted event
        this.signalRService.receiveVideoOffer.subscribe(() => {
            debugger;
            this.acceptCall();
        });
        try {
            // Start SignalR connection
            await this.signalRService.startConnection();
            console.log('SignalR connection established');

            // Set up event handlers
            this.setupSignalRHandlers();
        } catch (error) {
            console.error('Failed to connect to SignalR hub:', error);
            this.showToast('danger', 'Failed to connect to video call server');
            this.connectionStatus = 'error';
        }
    }

    public acceptCall(): void {
        // First ensure we have media access
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                // Once we have media, accept the call
                return this.signalRService.acceptVideoCall();
            })
            .catch((error) => {
                console.error('Error accepting call:', error);
                this.showToast('danger', 'Error accepting the call');
            });
    }

    // Reject an incoming call
    public rejectCall(): void {
        if (!this.isIncomingCall || !this.incomingCallData) {
            return;
        }

        this.stopCountdown();
        this.isIncomingCall = false;

        this.signalRService.rejectVideoCall(this.incomingCallData.callerId, 'Call rejected by user').catch((error) => {
            console.error('Error rejecting call:', error);
        });

        this.connectionStatus = 'idle';
        this.incomingCallData = null;
    }

    // End the current call
    public endCall(): void {
        if (!this.isCallActive) {
            return;
        }

        this.webRTCService.stopStreaming().catch((error) => {
            console.error('Error stopping stream:', error);
        });

        this.cleanupCall();
        this.callEnded.emit();
    }

    // PRIVATE METHODS

    // Set up SignalR event handlers
    private setupSignalRHandlers(): void {
        // Handle incoming call request
        this.subscriptions.push(
            this.signalRService.incomingVideoCall.subscribe((data) => {
                this.handleIncomingCall(data);
            }),

            // Handle local stream ready
            this.webRTCService.localStream$.subscribe((stream) => {
                this.localStream = stream;
                if (stream) {
                    console.log('Local camera stream established');
                }
            }),

            // Handle remote stream (caller's video)
            this.webRTCService.remoteStream$.subscribe((stream) => {
                if (stream) {
                    this.remoteStream = null;

                    // Set after a small delay
                    setTimeout(() => {
                        this.remoteStream = stream;
                    }, 100);
                    console.log('Remote stream video tracks:', stream.getVideoTracks().length);
                    setTimeout(() => {
                        const videoElement = document.querySelector('.remote-video') as HTMLVideoElement;
                        if (videoElement) {
                            videoElement.play().catch((err) => console.error('Error playing video:', err));
                        }
                    }, 500);
                    this.isCallActive = true;
                    this.connectionStatus = 'connected';

                    // Start call timer
                    this.callStartTime = new Date();
                    this.startCallTimer();

                    // Notify parent
                    this.callStarted.emit();

                    this.showToast('success', 'Video call has been established');
                }
            }),

            // Handle call ended
            this.signalRService.videoCallEnded.subscribe((reason) => {
                this.showToast('info', reason || 'The call has ended');
                this.cleanupCall();
                this.callEnded.emit();
            }),
        );
    }

    // Handle incoming call
    private handleIncomingCall(data: { callerId: string; callerName: string }): void {
        // If already in a call, automatically reject
        if (this.isCallActive) {
            this.signalRService.rejectVideoCall(data.callerId, 'User is busy in another call').catch((error) => {
                console.error('Error rejecting call while busy:', error);
            });
            return;
        }

        this.incomingCallData = data;
        this.isIncomingCall = true;
        this.connectionStatus = 'incoming';

        // Notify parent component about the incoming call
        this.callRequest.emit(data);

        // Start auto-reject countdown
        this.startCountdown();
    }

    // Auto-reject countdown
    private startCountdown(): void {
        this.countdownValue = 30; // 30 seconds timeout
        this.stopCountdown(); // Clear any existing timer

        this.countdownTimer = setInterval(() => {
            this.countdownValue--;

            if (this.countdownValue <= 0) {
                this.stopCountdown();
                this.rejectCall();
            }
        }, 1000);
    }

    // Stop the countdown timer
    private stopCountdown(): void {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
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

    // Clean up call resources
    private cleanupCall(): void {
        this.isCallActive = false;
        this.isIncomingCall = false;
        this.incomingCallData = null;
        this.connectionStatus = 'idle';
        this.stopCallTimer();
        this.callStartTime = null;
        this.callDuration = 0;
        this.webRTCService.cleanupCall();
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
    public hideToast(): void {
        this.toastVisible = false;
    }

    // Format seconds to MM:SS display
    public formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
