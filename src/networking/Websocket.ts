/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { EventEmitter } from "events";
import WebSocket from "ws";
import { Heartbeat } from "./Heartbeat";

import type { VoiceConnection } from "../VoiceConnection";
import { OpCode, VoiceOpCode } from "../util/Constants";
import type { Payload } from "../util/Interfaces";

export class VoiceWS extends EventEmitter {
  /**
   * The voice connection that this websocket serves.
   */
  public readonly vc: VoiceConnection;

  /**
   * How many connection attempts have been made.
   */
  public connectAttempts: number;

  /**
   * If this websocket is dead.
   */
  public dead: boolean;

  /**
   * This WebSocket's heartbeat.
   */
  public heartbeat: Heartbeat;

  /**
   * The websocket instance.
   */
  private ws?: WebSocket;

  /**
   * @param vc
   */
  public constructor(vc: VoiceConnection) {
    super();

    this.vc = vc;
    this.connectAttempts = 0;
    this.dead = false;
    this.heartbeat = new Heartbeat(this);
  }

  /**
   * If this websocket is connected.
   */
  public get connected(): boolean {
    return this.ws !== undefined && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Sends a message to the voice server.
   * @param {*} data The data to send.
   */
  public send(data: unknown): Promise<unknown> {
    return new Promise((res, rej) => {
      if (!this.connected) throw new Error("WebSocket not open");
      this.ws?.send(data, (err) =>
        err
          ? rej(err)
          : res(data)
      );
    });
  }

  /**
   * Sends a json packet to the voice server.
   * @param {*} data The data.
   */
  public sendJson(data: any): Promise<unknown> {
    data = JSON.stringify(data);
    return this.send(data);
  }

  /**
   * Resets the websocket.
   */
  public reset(): void {
    this.emit("debug", "(WS) Resetting.");

    // Destroy WebSocket.
    if (this.ws) {
      if (this.connected) this.ws.close();
      delete this.ws;
    }

    this.heartbeat.reset();
  }

  /**
   * Connect to the discord voice server.
   */
  public connect(): void {
    this.emit("debug", "(WS) Connecting...");

    if (this.dead) return;
    if (this.ws) this.reset();
    if (this.connectAttempts >= 5) {
      this.emit("debug", `(WS) Too many connection attempts: ${this.connectAttempts}`);
      return;
    }

    this.ws = new WebSocket("wss://"); // TODO: endpoint
    this.connectAttempts++;

    this.ws.onopen = this._open.bind(this);
    this.ws.onmessage = this._message.bind(this);
  }

  /**
   * Called when the websocket encounters a message.
   * @param data
   * @private
   */
  private async _message({ data }: WebSocket.MessageEvent) {
    const pk: Payload = JSON.parse(data.toString());

    switch (pk.op) {
      case VoiceOpCode.Hello:
        this.heartbeat.heartbeatInterval = pk.d.heartbeat_interval;
        break;
      case VoiceOpCode.Ready:
        this.emit("ready", pk.d);
        break;
      case VoiceOpCode.SessionDescription:
        pk.d.secret_key = new Uint8Array(pk.d.secret_key);
        this.emit("sessionDescription", pk.d);
        break;
      case VoiceOpCode.ClientConnect:
        this.vc.ssrcMap.set(+pk.d.audio_ssrc, { speaking: 0, userId: pk.d.user_id });
        break;
      case VoiceOpCode.HeartbeatAck:
        this.heartbeat.ack();
        break;
    }
  }

  /**
   * Called when the websocket has opened.
   * @private
   */
  private async _open() {
    this.emit("debug", "(WS) Opened, Gateway: "); // TODO: gateway

    await this.sendJson({
      op: OpCode.Dispatch,
      d: {}
    });
  }
}

