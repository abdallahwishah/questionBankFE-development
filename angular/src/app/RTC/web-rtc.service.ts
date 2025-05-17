import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SignalRRTCService } from './signal-r-rtc.service';

@Injectable({
    providedIn: 'root',
})
export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStreamSubject: BehaviorSubject<MediaStream | null> = new BehaviorSubject<MediaStream | null>(null);
    private localStreamSubject: BehaviorSubject<MediaStream | null> = new BehaviorSubject<MediaStream | null>(null);
    private currentPeerId: string | null = null;
    private videoDevicesSubject: BehaviorSubject<MediaDeviceInfo[]> = new BehaviorSubject<MediaDeviceInfo[]>([]);
    private pendingIceCandidates: RTCIceCandidate[] = [];
    private streamMonitorInterval: any = null;

    // RTCPeerConnection configuration
    configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: ['turn:turn.agora.io:3478'],
                username: 'abd7364208634677bc977f6aab5eb085',
                credential: 'eb0f9075230b4c81b6a49506505bf6c4',
            },
        ],
        iceCandidatePoolSize: 10,
    };
    constructor(
        private signalRService: SignalRRTCService,
        private ngZone: NgZone,
    ) {
        this.setupSignalRHandlers();
        // Initialize available cameras
        this.updateVideoDevices();
    }

    // Get remote stream as observable
    public get remoteStream$(): Observable<MediaStream | null> {
        return this.remoteStreamSubject.asObservable();
    }

    // Get local stream as observable
    public get localStream$(): Observable<MediaStream | null> {
        return this.localStreamSubject.asObservable();
    }

    // Get available video devices as observable
    public get videoDevices$(): Observable<MediaDeviceInfo[]> {
        return this.videoDevicesSubject.asObservable();
    }

    // Get list of video devices
    public async updateVideoDevices(): Promise<void> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === 'videoinput');

            // If we don't have labels, we need to request permission first
            if (videoDevices.length > 0 && !videoDevices[0].label) {
                try {
                    // Get temporary access to camera to get labels
                    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    tempStream.getTracks().forEach((track) => track.stop());

                    // Get devices again with labels
                    const devicesWithLabels = await navigator.mediaDevices.enumerateDevices();
                    const videoDevicesWithLabels = devicesWithLabels.filter((device) => device.kind === 'videoinput');

                    this.ngZone.run(() => {
                        this.videoDevicesSubject.next(videoDevicesWithLabels);
                    });
                } catch (err) {
                    // If permission denied, just return devices without labels
                    this.ngZone.run(() => {
                        this.videoDevicesSubject.next(videoDevices);
                    });
                }
            } else {
                // Already have labels
                this.ngZone.run(() => {
                    this.videoDevicesSubject.next(videoDevices);
                });
            }
        } catch (error) {
            console.error('Error getting video devices:', error);
        }
    }

    // Setup SignalR event handlers
    private setupSignalRHandlers(): void {
        console.log('Setting up SignalR handlers...');
        this.signalRService.videoCallAccepted.subscribe((peerId: string) => {
            this.currentPeerId = peerId;

            // Don't create a new peer connection if one already exists
            if (this.peerConnection && this.peerConnection.connectionState === 'connected') {
                console.log('Peer connection already exists and is connected, skipping setup');
                return;
            }

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

    // Setup WebRTC peer connection with specified camera
    public async setupPeerConnection(cameraId?: string): Promise<void> {
        try {
            if (this.peerConnection) {
                this.peerConnection.close();
            }

            this.peerConnection = new RTCPeerConnection(this.configuration);
            console.log('PeerConnection created');

            // Set up connection state monitoring
            this.setupConnectionMonitoring();

            // Setup local stream if not already set up
            if (!this.localStream) {
                try {
                    // First try with audio and video
                    this.localStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            deviceId: cameraId ? { exact: cameraId } : undefined,
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        },
                        audio: true,
                    });
                    console.log('Successfully got media stream with audio and video');
                } catch (err) {
                    console.warn('Failed to get stream with audio, trying video only');
                    // Second try with video only
                    this.localStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            deviceId: cameraId ? { exact: cameraId } : undefined,
                        },
                        audio: false,
                    });
                }

                this.ngZone.run(() => {
                    this.localStreamSubject.next(this.localStream);
                });
            }

            // Add tracks to peer connection
            this.localStream.getTracks().forEach((track) => {
                console.log(`Adding ${track.kind} track to peer connection, enabled: ${track.enabled}`);
                if (this.peerConnection && this.localStream) {
                    this.peerConnection.addTrack(track, this.localStream);
                }
            });

            // Handle remote tracks
            this.peerConnection.ontrack = (event) => {
                console.log('Received remote track', event);

                // Ensure we have a valid stream with tracks
                if (event.streams && event.streams.length > 0) {
                    const stream = event.streams[0];

                    // Log track information
                    console.log(`Remote stream has ${stream.getTracks().length} tracks`);
                    stream.getTracks().forEach((track) => {
                        console.log(
                            `Remote ${track.kind} track, enabled: ${track.enabled}, readyState: ${track.readyState}`,
                        );

                        // Add listener for track ending
                        track.onended = () => {
                            console.log(`Remote ${track.kind} track ended`);
                        };

                        // Add listener for track muting
                        track.onmute = () => {
                            console.log(`Remote ${track.kind} track muted`);
                        };

                        // Add listener for track unmuting
                        track.onunmute = () => {
                            console.log(`Remote ${track.kind} track unmuted`);
                        };
                    });

                    // Monitor this stream for changes
                    this.monitorRemoteStream(stream);

                    // Update the stream in the NgZone
                    this.ngZone.run(() => {
                        this.remoteStreamSubject.next(stream);
                    });
                } else {
                    console.error('Received track event with no streams');
                }
            };

            // Handle ICE candidates
            this.peerConnection.onicecandidate = async (event) => {
                if (event.candidate) {
                    console.log('ICE candidate generated:', event.candidate.candidate);
                    if (this.currentPeerId) {
                        console.log('Sending ICE candidate to peer:', this.currentPeerId);
                        await this.signalRService.sendIceCandidate(this.currentPeerId, JSON.stringify(event.candidate));
                        console.log('ICE candidate sent successfully');
                    } else {
                        console.error('Cannot send ICE candidate: No peer ID');
                    }
                } else {
                    console.log('ICE candidate gathering complete');
                }
            };
        } catch (error) {
            console.error('Error setting up peer connection:', error);
            throw error;
        }
    }

    // Monitor remote stream for stability
    private monitorRemoteStream(stream: MediaStream): void {
        // Check stream and tracks every second
        const intervalId = setInterval(() => {
            if (!this.peerConnection || this.peerConnection.connectionState !== 'connected') {
                clearInterval(intervalId);
                return;
            }

            // Log stream active state
            console.log('Remote stream active:', stream.active);

            // Check all tracks
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length === 0) {
                console.warn('Remote stream has no video tracks!');
            } else {
                videoTracks.forEach((track) => {
                    console.log(`Video track: enabled=${track.enabled}, readyState=${track.readyState}`);

                    // Re-enable track if it was disabled
                    if (!track.enabled) {
                        console.log('Re-enabling disabled video track');
                        track.enabled = true;
                    }
                });
            }
        }, 1000);

        // Store the interval ID so we can clear it later
        this.streamMonitorInterval = intervalId;
    }

    // Set up monitoring for connection state changes
    private setupConnectionMonitoring(): void {
        if (!this.peerConnection) return;

        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection?.iceConnectionState);

            if (this.peerConnection?.iceConnectionState === 'connected') {
                console.log('ICE connection established successfully');
            } else if (this.peerConnection?.iceConnectionState === 'disconnected') {
                // Don't clean up yet, just log it
                console.log('ICE connection temporarily disconnected - waiting to recover');

                // Only clean up if it remains disconnected for a while
                setTimeout(() => {
                    if (
                        this.peerConnection?.iceConnectionState === 'disconnected' ||
                        this.peerConnection?.iceConnectionState === 'failed' ||
                        this.peerConnection?.iceConnectionState === 'closed'
                    ) {
                        console.log('ICE connection did not recover, cleaning up call');
                        this.cleanupCall();
                    }
                }, 5000); // Give it 5 seconds to recover
            } else if (
                this.peerConnection?.iceConnectionState === 'failed' ||
                this.peerConnection?.iceConnectionState === 'closed'
            ) {
                console.log('ICE connection permanently failed');
                this.cleanupCall();
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection?.connectionState);
        };

        this.peerConnection.onsignalingstatechange = () => {
            console.log('Signaling state:', this.peerConnection?.signalingState);
        };
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
                    this.localStream.getTracks().forEach((track) => {
                        if (this.peerConnection && this.localStream) {
                            this.peerConnection.addTrack(track, this.localStream);
                        }
                    });
                }
            }

            // Create offer with explicit options
            console.log('Creating offer with specific options');
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });

            // Set local description
            console.log('Setting local description from offer');
            await this.peerConnection.setLocalDescription(offer);

            // Send offer
            console.log('Sending offer to recipient:', recipientId);
            await this.signalRService.sendVideoOffer(recipientId, JSON.stringify(this.peerConnection.localDescription));
            console.log('Offer sent successfully');
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

            // Create answer
            console.log('Creating answer...');
            const answer = await this.peerConnection.createAnswer();

            // Set local description
            console.log('Setting local description from answer');
            await this.peerConnection.setLocalDescription(answer);

            // Send answer
            console.log('Sending answer to:', recipientId);
            await this.signalRService.sendVideoAnswer(
                recipientId,
                JSON.stringify(this.peerConnection.localDescription),
            );
            console.log('Answer sent successfully');
        } catch (error) {
            console.error('Error creating answer:', error);
            throw error;
        }
    }

    // Handle incoming WebRTC offer
    private async handleVideoOffer(senderId: string, offer: string): Promise<void> {
        console.log('Handling video offer from:', senderId);
        try {
            if (!this.peerConnection) {
                throw new Error('PeerConnection not initialized');
            }

            // Set remote description
            console.log('Setting remote description from offer');
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)));
            console.log('Remote description set successfully');

            // Process any pending ICE candidates
            if (this.pendingIceCandidates.length > 0) {
                console.log(`Adding ${this.pendingIceCandidates.length} pending ICE candidates`);
                for (const candidate of this.pendingIceCandidates) {
                    await this.peerConnection.addIceCandidate(candidate);
                }
                this.pendingIceCandidates = [];
            }

            // Create and send answer
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

            console.log('Setting remote description from answer');
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
            console.log('Remote description set successfully');

            // Process any pending ICE candidates
            if (this.pendingIceCandidates.length > 0) {
                console.log(`Adding ${this.pendingIceCandidates.length} pending ICE candidates`);
                for (const candidate of this.pendingIceCandidates) {
                    await this.peerConnection.addIceCandidate(candidate);
                }
                this.pendingIceCandidates = [];
            }

            // Log connection state after setting answer
            console.log('Connection state after setting answer:', this.peerConnection.connectionState);
            console.log('ICE connection state after setting answer:', this.peerConnection.iceConnectionState);
            console.log('Signaling state after setting answer:', this.peerConnection.signalingState);
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

            const iceCandidate = new RTCIceCandidate(JSON.parse(candidate));

            // If remote description is not set yet, store the candidate for later
            if (!this.peerConnection.remoteDescription) {
                console.log('Remote description not set yet, storing ICE candidate for later');
                this.pendingIceCandidates.push(iceCandidate);
                return;
            }

            // Otherwise add the candidate immediately
            console.log('Adding ICE candidate');
            await this.peerConnection.addIceCandidate(iceCandidate);
            console.log('ICE candidate added successfully');
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
            // Don't throw the error to prevent breaking the entire flow
        }
    }

    // Request access to camera and create offer
    public async requestCameraAccess(employeeId: string, cameraId?: string): Promise<void> {
        try {
            this.currentPeerId = employeeId;

            // Setup peer connection with specified camera
            await this.setupPeerConnection(cameraId);

            // Create and send offer
            const offer = await this.peerConnection!.createOffer({
                offerToReceiveVideo: true,
                offerToReceiveAudio: true,
            });

            await this.peerConnection!.setLocalDescription(offer);

            await this.signalRService.requestCameraAccess(employeeId, JSON.stringify(offer));
        } catch (error) {
            console.error('Error requesting camera access:', error);
            throw error;
        }
    }

    // Change camera during active call
    public async switchCamera(deviceId: string): Promise<void> {
        try {
            console.log('Switching to camera:', deviceId);

            // Stop current video tracks
            if (this.localStream) {
                this.localStream.getVideoTracks().forEach((track) => {
                    track.stop();
                });
            }

            // Get new stream with selected camera
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: { exact: deviceId },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: true,
            });

            // Update peer connection if in a call
            if (this.peerConnection) {
                const senders = this.peerConnection.getSenders();
                const videoSender = senders.find((sender) => sender.track && sender.track.kind === 'video');

                if (videoSender) {
                    const newVideoTrack = newStream.getVideoTracks()[0];
                    await videoSender.replaceTrack(newVideoTrack);
                    console.log('Video track replaced in peer connection');
                }
            }

            // Update local stream
            if (this.localStream) {
                // Replace video tracks in local stream
                const audioTracks = this.localStream.getAudioTracks();
                const newVideoTrack = newStream.getVideoTracks()[0];

                // Create a new stream with existing audio and new video
                const combinedStream = new MediaStream();
                audioTracks.forEach((track) => combinedStream.addTrack(track));
                combinedStream.addTrack(newVideoTrack);

                // Update local stream
                this.localStream = combinedStream;
                this.ngZone.run(() => {
                    this.localStreamSubject.next(this.localStream);
                });
            } else {
                // Just use the new stream if no existing stream
                this.localStream = newStream;
                this.ngZone.run(() => {
                    this.localStreamSubject.next(this.localStream);
                });
            }

            console.log('Camera switched successfully');
        } catch (error) {
            console.error('Error switching camera:', error);
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
        console.log('Cleaning up call...');

        // Clear stream monitor interval
        if (this.streamMonitorInterval) {
            clearInterval(this.streamMonitorInterval);
            this.streamMonitorInterval = null;
        }

        // Clear pending ICE candidates
        this.pendingIceCandidates = [];

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                track.stop();
                console.log(`Stopped ${track.kind} track`);
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
        console.log('Call cleanup complete');
    }
}
