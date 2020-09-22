/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { Emitter } from "@neocord/utils";

import type { VoiceUDP } from "./networking/UDP";
import type { VoiceWS } from "./networking/Websocket";
import type { SSRC } from "./util/Interfaces";

export class VoiceConnection extends Emitter {
  /**
   * The SSRC map.
   */
  public readonly ssrcMap: Map<number, SSRC>

  /**
   * Voice UDP.
   * @type {VoiceUDP}
   */
  public udp!: VoiceUDP;

  /**
   * Voice WebSocket.
   * @type {VoiceWS}
   */
  public ws!: VoiceWS;

  public constructor() {
    super();

    this.ssrcMap = new Map();
  }

}
