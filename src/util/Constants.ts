/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

export const ENCRYPTION_MODE = "xsalsa20_poly1305";

export enum VoiceOpCode {
  Identify,
  SelectProtocol,
  Ready,
  Heartbeat,
  SessionDescription,
  Speaking,
  HeartbeatAck,
  Resume,
  Hello,
  Resumed,
  ClientConnect = 12,
  ClientDisconnect = 13
}

export enum OpCode {
  Dispatch,
  Heartbeat,
  Identify,
  PresenceUpdate,
  VoiceStateUpdate,
  Resume = 6,
  Reconnect,
  RequestGuildMembers,
  InvalidSession,
  Hello,
  HeartbeatAck,
}

export enum CloseCodes {
  UnknownOPCode = 4001,
  NotAuthenticated = 4003,
  AuthenticationFailed,
  AlreadyAuthenticated,
  SessionInvalid,
  SessionTimeout = 4009,
  ServerNotFound = 4011,
  UnknownProtocol,
  Disconnected,
  ServerCrashed,
  UnknownEncryption
}