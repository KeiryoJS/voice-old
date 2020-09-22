/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { define, Timers } from "@neocord/utils";
import { OpCode } from "../util/Constants";

import type { VoiceWS } from "./Websocket";

export class Heartbeat {
  /**
   * Whether or not our last heartbeat was acknowledged.
   */
  public acked = false;

  /**
   * When we last sent a heartbeat.
   */
  public last = 0;

  /**
   * The heartbeat interval.
   */
  public interval?: number;

  /**
   * The voice websocket this heartbeat belongs to.
   */
  public ws: VoiceWS;

  /**
   * The heartbeat latency.
   */
  public latency = 0;

  /**
   * The node.js interval.
   * @private
   */
  private _interval?: NodeJS.Timeout;

  /**
   * @param {VoiceWS} ws
   */
  public constructor(ws: VoiceWS) {
    this.ws = ws;
    define({ writable: true })(this, "_interval");
  }

  /**
   * Sets the heartbeat interval.
   * @param ms
   */
  public set heartbeatInterval(ms: number) {
    this.interval = ms;
    this._init();
  }

  /**
   * Resets this heartbeat.
   */
  public reset(): void {
    this.acked = false;
    this.last = 0;
    delete this.interval;

    if (this._interval) {
      Timers.clearInterval(this._interval);
      this._interval = undefined;
    }
  }

  /**
   * Called whenever the gateway sends a HeartbeatAck op.
   */
  public ack(): void {
    this.acked = true;
    this.latency = Date.now() - this.last;
    this._debug(`Gateway acknowledged our heartbeat, latency: ${this.latency}ms`);
  }

  /**
   * Sends a heartbeat to the gateway.
   * @param {string} reason The heartbeat reason.
   */
  public async new(reason: string): Promise<void> {
    this._debug(`‹${reason}› Sending a heartbeat to the gateway.`);
    await this.ws.sendJson({ op: OpCode.Heartbeat, d: Date.now() });
    this.acked = false;
    this.last = Date.now();
  }

  /**
   * Emits a heartbeat event on the internal sharding manager.
   * @private
   */
  private _debug(message: string): void {
    this.ws.emit("debug", message);
    return;
  }

  /**
   * Initializes the heartbeat interval.
   * @private
   */
  private _init(): void {
    this._debug(`Now sending a heartbeat every: ${this.interval} ms`);
    this._interval = Timers.setInterval(
      () => this.new("interval"),
      this.interval as number
    );
    return;
  }
}
