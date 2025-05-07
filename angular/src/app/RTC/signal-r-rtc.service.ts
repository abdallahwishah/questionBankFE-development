// src/app/core/services/signal-r-rtc.service.ts
import { Injectable, EventEmitter, Injector, NgZone } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { HubConnection } from '@microsoft/signalr';
import { CallRequest, IceCandidate, SessionDescription } from './modelsRTC';

@Injectable({
    providedIn: 'root',
})
export class SignalRRTCService extends AppComponentBase {
    cameraHub: HubConnection;
    isRTCConnected = false;

    callerId;
    // Event emitters for handling incoming calls and WebRTC signaling
    public incomingVideoCall = new EventEmitter<CallRequest>();
    public videoCallAccepted = new EventEmitter<string>();
    public videoCallRejected = new EventEmitter<string>();
    public videoCallEnded = new EventEmitter<string>();
    public receiveVideoOffer = new EventEmitter<SessionDescription>();
    public receiveVideoAnswer = new EventEmitter<SessionDescription>();
    public receiveIceCandidate = new EventEmitter<IceCandidate>();

    constructor(
        injector: Injector,
        public _zone: NgZone,
    ) {
        super(injector);
        // setTimeout(() => {
        //     this.startConnection();

        // }, 1000);
    }

    configureConnection(connection): void {
        // Set the common hub
        this.cameraHub = connection;

        // Reconnect loop
        let reconnectTime = 5000;
        let tries = 1;
        let maxTries = 8;
        const start = () => {
            return new Promise((resolve, reject) => {
                if (tries > maxTries) {
                    reject();
                } else {
                    connection
                        .start()
                        .then(resolve)
                        .then(() => {
                            reconnectTime = 5000;
                            tries = 1;
                        })
                        .catch(() => {
                            setTimeout(() => {
                                start().then(resolve);
                            }, reconnectTime);
                            reconnectTime *= 2;
                            tries += 1;
                        });
                }
            });
        };

        // Reconnect if hub disconnects
        connection.onclose((e) => {
            this.isRTCConnected = false;

            if (e) {
                abp.log.debug('Camera connection closed with error: ' + e);
            } else {
                abp.log.debug('Camera disconnected');
            }

            start().then(() => {
                this.isRTCConnected = true;
            });
        });
        setTimeout(() => {
            // Register to get notifications
            this.registerRTCEvents(connection);
        }, 1000);
    }

    registerRTCEvents(connection): void {
        ;
        // For Employee: Handle incoming video call
        connection.on('IncomingVideoCall', (data: CallRequest) => {
            this.incomingVideoCall.emit(data);
        });

        // For Admin: Handle when employee accepts the call
        connection.on('VideoCallAccepted', (employeeId: string) => {
            console.log('Call accepted by employee:', employeeId);
            this.videoCallAccepted.emit(employeeId);
        });

        // For Admin: Handle when employee rejects the call
        connection.on('VideoCallRejected', (reason: string) => {
            console.log('Call rejected:', reason);
            this.videoCallRejected.emit(reason);
        });

        // Handle receiving video offer
        connection.on('ReceiveVideoOffer', (senderId: string, offer: string) => {
            console.log('Received video offer from:', senderId);
            this.callerId = senderId;


            this.receiveVideoOffer.emit({ senderId, description: offer });
        });

        // Handle receiving video answer
        connection.on('ReceiveVideoAnswer', (senderId: string, answer: string) => {
            console.log('Received answer from:', senderId);
            this.receiveVideoAnswer.emit({ senderId, description: answer });
        });

        // Handle receiving ICE candidates
        connection.on('ReceiveICECandidate', (senderId: string, candidate: string) => {
            console.log('Received ICE candidate from:', senderId);
            this.receiveIceCandidate.emit({ senderId, candidate });
        });

        // Handle call ended
        connection.on('VideoCallEnded', (reason: string) => {
            console.log('Call ended:', reason);
            this.videoCallEnded.emit(reason);
        });
    }

    // Start SignalR connection and register event handlers
    public async startConnection(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.isRTCConnected) {
                resolve();
                return;
            }

            this.init()
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    // Admin: Request camera access from employee
    public async requestCameraAccess(studentId: string, offer: string): Promise<void> {
        if (!this.isRTCConnected) {
            abp.notify.warn(this.l('VideoCallIsNotConnectedWarning'));
            throw new Error('Video call service is not connected');
        }

        try {
            await this.cameraHub.invoke('SendVideoOffer', studentId + '', offer);
        } catch (error) {
            console.error('Error requesting camera access:', error);
            throw error;
        }
    }

    // Employee: Accept video call
    public async acceptVideoCall(): Promise<void> {
        if (!this.isRTCConnected) {
            abp.notify.warn(this.l('VideoCallIsNotConnectedWarning'));
            throw new Error('Video call service is not connected');
        }

        try {
            await this.cameraHub.invoke('AcceptVideoCall', this.callerId);
        } catch (error) {
            console.error('Error accepting video call:', error);
            throw error;
        }
    }

    // Employee: Reject video call
    public async rejectVideoCall(callerId: string, reason: string): Promise<void> {
        if (!this.isRTCConnected) {
            abp.notify.warn(this.l('VideoCallIsNotConnectedWarning'));
            return;
        }

        try {
            await this.cameraHub.invoke('RejectVideoCall', callerId, reason);
        } catch (error) {
            console.error('Error rejecting video call:', error);
            throw error;
        }
    }

    // Send WebRTC offer
    public async sendVideoOffer(recipientId: string, offer: string): Promise<void> {
        if (!this.isRTCConnected) {
            abp.notify.warn(this.l('VideoCallIsNotConnectedWarning'));
            throw new Error('Video call service is not connected');
        }

        try {
            await this.cameraHub.invoke('SendVideoOffer', recipientId + '', offer);
        } catch (error) {
            console.error('Error sending video offer:', error);
            throw error;
        }
    }

    // Send WebRTC answer
    public async sendVideoAnswer(recipientId: string, answer: string): Promise<void> {
        if (!this.isRTCConnected) {
            abp.notify.warn(this.l('VideoCallIsNotConnectedWarning'));
            throw new Error('Video call service is not connected');
        }

        try {
            console.log('Sending video answer:', recipientId, answer); // Add this line for debugging

            await this.cameraHub.invoke('SendVideoAnswer', recipientId + '', answer);
        } catch (error) {
            console.error('Error sending video answer:', error);
            throw error;
        }
    }

    // Send ICE candidate
    public async sendIceCandidate(recipientId: string, candidate: string): Promise<void> {
        if (!this.isRTCConnected) {
            abp.notify.warn(this.l('VideoCallIsNotConnectedWarning'));
            throw new Error('Video call service is not connected');
        }
        console.log('recipientIdrecipientId',recipientId,candidate)
        try {
            await this.cameraHub.invoke('SendICECandidate', recipientId + '', candidate);
        } catch (error) {
            console.error('Error sending ICE candidate:', error);
            throw error;
        }
    }

    // Admin: Stop streaming
    public async stopStreaming(employeeId: string): Promise<void> {
        if (!this.isRTCConnected) {
            abp.notify.warn(this.l('VideoCallIsNotConnectedWarning'));
            return;
        }

        try {
            await this.cameraHub.invoke('StopStreaming', employeeId);
        } catch (error) {
            console.error('Error stopping stream:', error);
            throw error;
        }
    }

    init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._zone.runOutsideAngular(() => {
                abp.signalr.connect();
                abp.signalr
                    .startConnection(abp.appPath + 'signalr-camera', (connection) => {
                        this.configureConnection(connection);
                    })
                    .then(() => {
                        abp.event.trigger('app.rtc.connected');
                        this.isRTCConnected = true;
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        });
    }
}
