// src/app/core/services/webrtc.service.ts
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SignalRRTCService } from './signal-r-rtc.service';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStreamSubject: BehaviorSubject<MediaStream | null> = new BehaviorSubject<MediaStream | null>(null);
  private localStreamSubject: BehaviorSubject<MediaStream | null> = new BehaviorSubject<MediaStream | null>(null);
  private currentPeerId: string | null = null;

  // RTCPeerConnection configuration
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  constructor(
    private signalRService: SignalRRTCService,
    private ngZone: NgZone
  ) {
    this.setupSignalRHandlers();
  }

  // Get remote stream as observable
  public get remoteStream$(): Observable<MediaStream | null> {
    return this.remoteStreamSubject.asObservable();
  }

  // Get local stream as observable
  public get localStream$(): Observable<MediaStream | null> {
    return this.localStreamSubject.asObservable();
  }

  // Setup SignalR event handlers
  private setupSignalRHandlers(): void {
    console.log('Setting up SignalR handlers...');
    this.signalRService.videoCallAccepted.subscribe((peerId: string) => {
      this.currentPeerId = peerId;
      this.setupPeerConnection().then(() => {
        this.createAndSendOffer(peerId);
      });
    });

    this.signalRService.receiveVideoOffer.subscribe(async ({ senderId, description }) => {

      this.currentPeerId = senderId;
      if (!this.peerConnection) {
        await this.setupPeerConnection();
      }

      await this.handleVideoOffer(senderId, description);
    });

    this.signalRService.receiveVideoAnswer.subscribe(async ({ senderId, description }) => {
      await this.handleVideoAnswer(description);
    });

    this.signalRService.receiveIceCandidate.subscribe(async ({ senderId, candidate }) => {
      await this.handleIceCandidate(candidate);
    });

    this.signalRService.videoCallEnded.subscribe((_) => {
      this.cleanupCall();
    });
  }

  // Setup WebRTC peer connection
  public async setupPeerConnection(): Promise<void> {
    try {
      if (this.peerConnection) {
        this.peerConnection.close();
      }

      this.peerConnection = new RTCPeerConnection(this.configuration);
      console.log('PeerConnection created');

      // Setup local stream if not already set up
      if (!this.localStream) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        this.ngZone.run(() => {
          this.localStreamSubject.next(this.localStream);
        });
      }

      // Explicitly log track information before adding
      this.localStream.getTracks().forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection, enabled: ${track.enabled}`);
        if (this.peerConnection && this.localStream) {
            debugger
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Handle remote tracks - making this more robust
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track', event);

        // Ensure we have a valid stream with tracks
        if (event.streams && event.streams.length > 0) {
          const stream = event.streams[0];

          // Log track information
          console.log(`Remote stream has ${stream.getTracks().length} tracks`);
          stream.getTracks().forEach(track => {
            console.log(`Remote ${track.kind} track, enabled: ${track.enabled}, readyState: ${track.readyState}`);
          });

          // Update the stream in the NgZone
          this.ngZone.run(() => {
            this.remoteStreamSubject.next(stream);
          });
        } else {
          console.error('Received track event with no streams');
        }
      };

      // Keep the rest of your existing code...
    } catch (error) {
      console.error('Error setting up peer connection:', error);
      throw error;
    }
  }
  // Create and send WebRTC offer
  public async createAndSendOffer(recipientId: string): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection not initialized');
      }

      // Ensure all tracks are added before creating the offer
      if (this.localStream) {
        const senders = this.peerConnection.getSenders();
        if (senders.length === 0) {
          console.log('No senders found, adding tracks again');
          this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
          });
        }
      }

      // Explicitly request both audio and video in the offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);

      await this.signalRService.sendVideoOffer(
        recipientId,
        JSON.stringify(this.peerConnection.localDescription)
      );
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }
  // Create and send WebRTC answer
  private async createAndSendAnswer(recipientId: string): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection not initialized');
      }


      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      await this.signalRService.sendVideoAnswer(
        recipientId,
        JSON.stringify(this.peerConnection.localDescription)
      );
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  // Handle incoming WebRTC offer
  private async handleVideoOffer(senderId: string, offer: string): Promise<void> {
    console.log('handleVideoOffer...')
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection not initialized');
      }

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(offer))
      );

      await this.createAndSendAnswer(senderId);
    } catch (error) {
      console.error('Error handling video offer:', error);
      throw error;
    }
  }
  // Handle incoming WebRTC answer
  private async handleVideoAnswer(answer: string): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection not initialized');
      }

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(answer))
      );
    } catch (error) {
      console.error('Error handling video answer:', error);
      throw error;
    }
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(candidate: string): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection not initialized');
      }

      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(JSON.parse(candidate))
      );
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      throw error;
    }
  }

  // Request access to camera and create offer
  public async requestCameraAccess(employeeId: string): Promise<void> {
    try {
      this.currentPeerId = employeeId;

      await this.setupPeerConnection();

      const offer = await this.peerConnection!.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true  // Make sure audio is also enabled
      });

      await this.peerConnection!.setLocalDescription(offer);

      await this.signalRService.requestCameraAccess(
        employeeId,
        JSON.stringify(offer)
      );
    } catch (error) {
      console.error('Error requesting camera access:', error);
      throw error;
    }
  }

  // Take snapshot from remote video stream
  public takeSnapshot(): string {
    const remoteStream = this.remoteStreamSubject.value;
    if (!remoteStream) {
      throw new Error('No remote stream available');
    }

    // Create a video element to capture the current frame
    const video = document.createElement('video');
    video.srcObject = remoteStream;
    video.play();

    // Create a canvas to draw the video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
  }

  // Stop streaming and clean up resources
  public async stopStreaming(): Promise<void> {
    try {
      if (this.currentPeerId) {
        await this.signalRService.stopStreaming(this.currentPeerId);
      }

      this.cleanupCall();
    } catch (error) {
      console.error('Error stopping stream:', error);
      throw error;
    }
  }

  // Clean up WebRTC resources
  public cleanupCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
      this.ngZone.run(() => {
        this.localStreamSubject.next(null);
      });
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.ngZone.run(() => {
      this.remoteStreamSubject.next(null);
    });

    this.currentPeerId = null;
  }
}
