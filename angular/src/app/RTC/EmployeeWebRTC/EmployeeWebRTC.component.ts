import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebRTCService } from '../web-rtc.service';
import { SignalRRTCService } from '../signal-r-rtc.service';
import { AppSharedModule } from '@app/shared/app-shared.module';

@Component({
  selector: 'app-employee-webrtc',
  templateUrl: './EmployeeWebRTC.component.html',
  styleUrls: ['./EmployeeWebRTC.component.scss'],
  standalone: true,
  imports: [CommonModule,AppSharedModule],
})
export class EmployeeWebRTCComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('remoteVideo') remoteVideoElement: ElementRef<HTMLVideoElement>;
  @ViewChild('localVideo') localVideoElement: ElementRef<HTMLVideoElement>;

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.autoInitialize) {
        this.initializeSignalR();
      }
    }, 1000);
  }

  ngAfterViewInit(): void {
    // Setup direct event handlers for video elements
    if (this.localVideoElement?.nativeElement) {
      const localVideo = this.localVideoElement.nativeElement;
      localVideo.onloadedmetadata = () => {
        console.log('Local video metadata loaded');
        localVideo.play().catch(e => console.error('Error playing local video:', e));
      };
    }

    if (this.remoteVideoElement?.nativeElement) {
      const remoteVideo = this.remoteVideoElement.nativeElement;
      remoteVideo.onloadedmetadata = () => {
        console.log('Remote video metadata loaded');
        remoteVideo.play().catch(e => console.error('Error playing remote video:', e));
      };

      remoteVideo.onplay = () => {
        console.log('Remote video started playing');
      };

      remoteVideo.onerror = (e) => console.error('Remote video error:', e);
    }

    // Monitor video elements
    this.monitorVideoElements();
  }

  monitorVideoElements(): void {
    // Monitor remote video element
    if (this.remoteVideoElement?.nativeElement) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'srcObject') {
            console.log('srcObject changed on remote video element');
          }
        });
      });

      observer.observe(this.remoteVideoElement.nativeElement, {
        attributes: true,
        attributeFilter: ['srcObject']
      });

      // Also add timeupdate listener
      this.remoteVideoElement.nativeElement.addEventListener('timeupdate', () => {
        if (this.remoteStream && !this.remoteStream.active) {
          console.warn('Stream not active during video timeupdate');
        }
      });
    }
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
    try {
      // Start SignalR connection
      await this.signalRService.startConnection();
      console.log('SignalR connection established');

      // Set up event handlers
      this.setupSignalRHandlers();

      // Monitor for video offers
      this.signalRService.receiveVideoOffer.subscribe(() => {
        console.log('Received video offer, will accept automatically');
        setTimeout(() => {
          this.acceptCall();
        }, 2000);
      });
    } catch (error) {
      console.error('Failed to connect to SignalR hub:', error);
      this.showToast('danger', 'Failed to connect to video call server');
      this.connectionStatus = 'error';
    }
  }

  // Accept an incoming call
  public acceptCall(): void {
    console.log('Accepting call...');

    // Don't create a new peer connection if one already exists with streams
    if (this.remoteStream && this.localStream) {
      console.log('Connection already exists, just sending accept signal');
      // Just send the accept signal
      this.signalRService.acceptVideoCall()
        .then(() => {
          console.log('Call accepted successfully');
          this.stopCountdown();
          this.hideAccessRequestModal();
        })
        .catch((error) => {
          console.error('Error accepting call:', error);
          this.showToast('danger', 'Error accepting the call');
        });
      return;
    }

    // If no connection exists, set it up first
    this.webRTCService.setupPeerConnection()
      .then(() => {
        console.log('Peer connection set up successfully');
        return this.signalRService.acceptVideoCall();
      })
      .then(() => {
        console.log('Call accepted successfully');
        this.stopCountdown();
        this.hideAccessRequestModal();
      })
      .catch((error) => {
        console.error('Error accepting call:', error);
        this.showToast('danger', 'Error accepting the call - could not access camera');
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
    this.hideAccessRequestModal();
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

  // Test video display (for troubleshooting)
  testVideo(): void {
    if (this.remoteVideoElement?.nativeElement) {
      const videoEl = this.remoteVideoElement.nativeElement;
      console.log('Video element status:');
      console.log('- readyState:', videoEl.readyState);
      console.log('- paused:', videoEl.paused);
      console.log('- ended:', videoEl.ended);
      console.log('- currentTime:', videoEl.currentTime);
      console.log('- videoWidth/Height:', videoEl.videoWidth, videoEl.videoHeight);

      if (this.remoteStream) {
        console.log('Remote stream status:');
        console.log('- active:', this.remoteStream.active);
        const videoTracks = this.remoteStream.getVideoTracks();
        console.log('- video tracks:', videoTracks.length);
        videoTracks.forEach((track, i) => {
          console.log(`- track ${i} enabled:`, track.enabled);
          console.log(`- track ${i} readyState:`, track.readyState);

          // Try resetting the track
          track.enabled = false;
          setTimeout(() => {
            track.enabled = true;
            // Force a refresh of the video element
            videoEl.srcObject = null;
            setTimeout(() => {
              videoEl.srcObject = this.remoteStream;
              videoEl.play().catch(e => console.error('Error playing video:', e));
            }, 100);
          }, 100);
        });
      }
    }
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

        // Update video element if available
        if (stream && this.localVideoElement?.nativeElement) {
          console.log('Setting local stream to video element');
          this.localVideoElement.nativeElement.srcObject = stream;
          this.localVideoElement.nativeElement.play().catch(e =>
            console.error('Error playing local video:', e)
          );
        }

        if (stream) {
          console.log('Local camera stream established');
        }
      }),

      // Handle remote stream (caller's video)
      this.webRTCService.remoteStream$.subscribe((stream) => {
        if (stream) {
          console.log('Remote stream received');
          this.remoteStream = stream;

          // Update UI state
          this.isCallActive = true;
          this.connectionStatus = 'connected';
          this.callStartTime = new Date();
          this.startCallTimer();
          this.callStarted.emit();

          // Make multiple attempts to play the video at different times
          setTimeout(() => this.playRemoteVideo(), 500);  // First attempt
          setTimeout(() => this.playRemoteVideo(), 1500); // Second attempt
          setTimeout(() => this.playRemoteVideo(), 3000); // Third attempt
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

  // Play remote video with error handling
  private playRemoteVideo(): void {
    if (this.remoteVideoElement?.nativeElement && this.remoteStream) {
      const videoEl = this.remoteVideoElement.nativeElement;

      // Ensure srcObject is set
      if (videoEl.srcObject !== this.remoteStream) {
        videoEl.srcObject = this.remoteStream;
      }

      // First try: Standard play
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Remote video playing successfully');
          this.showToast('success', 'Video call has been established');
        }).catch(e => {
          console.error('Error playing remote video:', e);

          // Second try: With delay
          setTimeout(() => {
            console.log('Retrying play with delay...');
            videoEl.play().catch(delayErr => {
              console.error('Delayed play failed:', delayErr);

              // Third try: With muted
              videoEl.muted = true;
              videoEl.play().then(() => {
                console.log('Remote video playing with muted workaround');
                // Try to unmute after playback starts
                setTimeout(() => {
                  videoEl.muted = false;
                }, 2000);
              }).catch(mutedErr => {
                console.error('Even muted play failed:', mutedErr);
              });
            });
          }, 1000);
        });
      }
    }
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

    // Show request modal
    this.showAccessRequestModal();

    // Start auto-reject countdown
    this.startCountdown();
  }

  // Show access request modal
  private showAccessRequestModal(): void {
    // In Angular, we'd typically use property binding rather than directly manipulating the DOM
    // This is a placeholder - implement according to your UI framework approach
    this.isIncomingCall = true;
    this.cdr.detectChanges();
  }

  // Hide access request modal
  private hideAccessRequestModal(): void {
    this.isIncomingCall = false;
    this.cdr.detectChanges();
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
