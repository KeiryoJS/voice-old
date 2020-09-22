/*
 * Copyright (c) 2020. MeLike2D All Rights Reserved.
 * Neo is licensed under the MIT License.
 * See the LICENSE file in the project root for more details.
 */

import { EventEmitter } from "events";
import type { ConnectData } from "./util/Interfaces";

export class ConnectionManager extends EventEmitter {
  public userId: string;

  /**
   * @param userId The user id
   */
  public constructor(userId: string) {
    super();

    this.userId = userId;
  }

  /**
   * Establish a voice connection.
   * @param data
   */
  public connect(data: ConnectData): void {
    void data;
    return;
  }
}