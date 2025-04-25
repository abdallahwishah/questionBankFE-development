// src/app/core/models/employee.model.ts
export interface Employee {
    id: string;
    name: string;
    department: string;
    isAvailable: boolean;
  }

  // src/app/core/models/call.model.ts
  export interface CallRequest {
    callerId: string;
    callerName: string;
  }

  export interface IceCandidate {
    senderId: string;
    candidate: string;
  }

  export interface SessionDescription {
    senderId: string;
    description: string;
  }
