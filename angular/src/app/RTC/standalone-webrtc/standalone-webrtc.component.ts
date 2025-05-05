// src/app/shared/components/standalone-webrtc/standalone-webrtc.component.ts
import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebRTCService } from '../web-rtc.service';
import { SignalRRTCService } from '../signal-r-rtc.service';

@Component({
    selector: 'app-standalone-webrtc',
    templateUrl: './standalone-webrtc.component.html',
    styleUrls: ['./standalone-webrtc.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class StandaloneWebRTCComponent implements  OnDestroy, OnChanges {
    // Employee ID input - the only input required from parent component
    @Input() employeeId: string | null = null;

    // Optional inputs with defaults
    @Input() autoConnect: boolean = true; // Auto-initialize call when employee ID changes
    @Input() showControls: boolean = true; // Show/hide control buttons

    // Events for parent component
    @Output() callStarted = new EventEmitter<void>();
    @Output() callEnded = new EventEmitter<string>();
    @Output() callError = new EventEmitter<string>();

    // Connection state
    isConnecting: boolean = false;
    isCallActive: boolean = false;
    connectionStatus: string = 'idle'; // idle, connecting, connected, rejected, error, ended

    // Video streams
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;

    // Tracking info for UI
    employeeName: string = ''; // Optional: could be populated from a service if needed
    callDuration: number = 0;
    callStartTime: Date | null = null;
    durationTimer: any = null;

    // Toast messages
    toastMessage: { type: string; message: string } | null = null;
    toastVisible: boolean = false;

    // Confirmation dialog
    showConfirmDialog: boolean = false;
    confirmDialogMessage: string = '';
    confirmAction: (() => void) | null = null;

    private subscriptions: Subscription[] = [];

    constructor(
        private webRTCService: WebRTCService,
        private signalRService: SignalRRTCService,
    ) {}

    ngAfterViewInit(): void {
        // Initialize SignalR connection
        this.initializeSignalR();

        // Subscribe to WebRTC events
        this.subscriptions.push(
            // Handle local stream (camera)
            this.webRTCService.localStream$.subscribe((stream) => {
                console.log('localStream',stream)
                this.localStream = stream;
                if (stream) {
                    console.log('Local stream established');
                }
            }),

            // Handle remote stream (employee camera)
            this.webRTCService.remoteStream$.subscribe((stream) => {
                this.remoteStream = stream;
                console.log('remoteStream',this.remoteStream)

                if (stream) {
                    this.isCallActive = true;
                    this.connectionStatus = 'connected';
                    this.isConnecting = false;

                    // Start call timer
                    this.callStartTime = new Date();
                    this.startCallTimer();

                    // Notify parent
                    this.callStarted.emit();

                    // Show success notification
                    this.showToast('success', 'Video call has been established');
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
            }),
        );

        // If employee ID is already set and autoConnect is enabled, start call
        if (this.employeeId && this.autoConnect) {
            this.startCall();
        }
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

            // Start new call if autoConnect is enabled
            if (this.autoConnect && !this.isCallActive && !this.isConnecting) {
                this.startCall();
            }
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

    // PUBLIC METHODS: Can be called from parent component or UI

    // Start a call to the employee
    startCall(): void {
        if (!this.employeeId) {
            console.error('Cannot start call: No employee ID provided');
            this.showToast('danger', 'No employee ID provided');
            this.callError.emit('no_employee_id');
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
            .requestCameraAccess(this.employeeId)
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

    // PRIVATE HELPER METHODS

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
