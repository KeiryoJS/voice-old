/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import type { VoiceOpCode } from "./Constants";

export interface ConnectData {
  guildId: string;
}

export interface Payload {
  op: VoiceOpCode;
  d: any;
}

export interface SSRC {
  userId: string;
  speaking: number;
}
