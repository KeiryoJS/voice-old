import { EventEmitter } from "events";
import { createSocket, Socket } from "dgram";
import type { VoiceConnection } from "../VoiceConnection";

export class VoiceUDP extends EventEmitter {
  /**
   * The voice connection that this udp client is for.
   */
  public readonly vc: VoiceConnection;

  /**
   * The address of the discord voice server.
   */
  public udpIP!: string;

  /*
   * The address of the discord voice server.
   */
  public udpPort!: number;

  /**
   * Local IP shit.
   */
  public local!: { address: string; port: string; };

  /**
   * The UDP Socket.
   */
  public socket?: Socket;

  /**
   * @param vc
   */
  public constructor(vc: VoiceConnection) {
    super();

    this.vc = vc;
  }

  /**
   * Send a voice packet to discord.
   * @param packet
   */
  public send(packet: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) throw new Error("No UDP Socket");
      if (!this.local.address || !this.local.port) {
        reject(new Error("No local ip information"));
        return;
      }

      this.socket.send(packet, 0, packet.length, this.udpPort, this.udpIP);
      resolve();
    });
  }

  /**
   * Creates the udp socket.
   * @param address
   * @param port
   */
  public async createSocket(address: string, port: number): Promise<void> {
    this.udpIP = address;
    this.udpPort = port;

    this.socket = createSocket("udp4");
    this.socket.once("message", this._message.bind(this));
    this.socket.on("error", this._error.bind(this));
    this.socket.on("close", this._close.bind(this));

    const blank = Buffer.alloc(70);
    blank.writeUIntBE(1, 0, 4);
    await this.send(blank);
  }

  /**
   * Shutdown the UDP Socket.
   */
  public shutdown(): void {
    this.emit("debug", "(UDP) Shutdown");
    if (this.socket) {
      try {
        this.socket.close();
      } finally {
        delete this.socket;
      }
    }
  }

  /**
   * Handles a socket error.
   * @private
   */
  private _error(error: any): void {
    this.emit("debug", `(UDP) Ran into an error: ${error}`);
    this.emit("error", error);
    return;
  }

  /**
   * Handles the socket close.
   * @private
   */
  private _close(): void {
    this.emit("debug", "(UDP) Socket Closed.");
    return;
  }

  /**
   * Handles a socket message.
   * @private
   */
  private _message(message: Buffer): void {
    let address = "";
    for (let i = 4; i < message.indexOf(0, i); i++)
      address += String.fromCharCode(message[i]);

    this.local = {
      port: message.readUIntBE(message.length - 2, 2).toString(10),
      address
    };
  }
}