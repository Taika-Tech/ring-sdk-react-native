/* BleManager.tsx
 *  
 * Copyright Taika Tech 2024
 * 
 * This software is licensed under dual licensing terms:
 *
 * 1. MIT License:
 *    - when used for personal use,
 *    - when used for educational use,
 *    - when used with Taika Tech's smart rings,
 *
 *    See the LICENSE file for the full text of the MIT License.
 *
 * 2. Taika Software License 1 (TSL1):
 *    - This license applies to the use of the Software with other manufacturers' smart rings, or other 
 *      typically finger-worn or wrist-worn devices, and requires a separate commercial license from Taika Tech Oy.
 *    - Contact sales@taikatech.fi to acquire such a license.
 *    - See the COMMERCIAL_LICENSE file for the full text of the TSL1.
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { Buffer } from 'buffer';

// Ble related imports
import NotificationHandler from './BleNotificationHandler';
import { logBLE } from '../Utils/Logging/TaikaLog';
import Ring from '../Ring.js'; // NEW RING
import { defaultBleConfig } from '../Config/TableConfigurations';
import { RingVersion } from '../Interfaces/Interfaces';
import ConnectionHandler from './BleConnectionHandler';
import ControlService from '../Services/ControlService';
import DeviceInformationService from '../Services/DeviceInformationService';
import BleLogs from '../Utils/Logging/BleLogs';
import { ConnectedDevices } from '../Integrations/ConnectedDevices';
import { BleManager } from 'react-native-ble-plx';
import ModeService from '../Services/ModeService';

type Callback = () => void;

class TaikaBleManager {
  public RingVersion: RingVersion | undefined;          //TODO: make sure this is always up to date

  private static instance: TaikaBleManager;
  private notificationHandler: NotificationHandler | undefined;
  private connectionHandler: ConnectionHandler | undefined;
  private ring: Ring | undefined;
  private connectingCompletedCallbacks: Callback[] = [];
  private controlService: ControlService | undefined;
  private deviceInfoService: DeviceInformationService | undefined;
  private modeService: ModeService | undefined;
  private ringReadyForReadWrite = false;

  private constructor() {
  }

  public static getInstance(): TaikaBleManager {
    if (!TaikaBleManager.instance) {
      throw new Error("Can't get Taika BLE manager, it has not been created!");
    }
    return TaikaBleManager.instance;
  }

  public static createInstance() {
    if (!TaikaBleManager.instance) {
      TaikaBleManager.instance = new TaikaBleManager();
    }
    return TaikaBleManager.instance;
  }
  
  public async initialize(ring: Ring, connectedDevices: ConnectedDevices, controlService: ControlService, deviceInformationService: DeviceInformationService, modeService: ModeService, manager: BleManager) {
    this.ring = ring;
    
    this.notificationHandler = new NotificationHandler(connectedDevices);
    this.connectionHandler = new ConnectionHandler(this.notificationHandler, manager);
    this.controlService = controlService;
    this.deviceInfoService = deviceInformationService;
    this.modeService = modeService;
    
    // Add callbacks that are called each time ring has connected
    this.connectionHandler.addRingReadyCallback(this.ringReadyCB.bind(this));
    this.connectionHandler.setRing(ring);
    this.notificationHandler.setRing(ring);
  }

  public startBle() {
    if (!this.connectionHandler) {
      return;
    }
    this.connectionHandler.startConnectionHandler();
  }

  /*************************************************************************************** /
  *  Ring connection behaviour
  * ***************************************************************************************/
  private async ringReadyCB() {
    if (!this.deviceInfoService || !this.controlService || !this.modeService) {
      return;
    }
    this.ringReadyForReadWrite = true;
    this.RingVersion = await this.deviceInfoService.readFirmwareVersion();
    this.modeService.claimPrimary();
    this.notifyConnectingCompletedCallbacks();
  }

  private async updateDeviceSettings() {
    if (!this.controlService) {
      return;
    }
    if (this.ring?.mouseConfig) {
      this.controlService.updateMouseAxesAndSensitivity(this.ring.mouseConfig);
    }
    if (this.ring?.handedness) {
      this.controlService.updateHandedness(this.ring.handedness);
    }
  }

  private notifyConnectingCompletedCallbacks(): void {
    if (this.ringReadyForReadWrite) {
        this.connectingCompletedCallbacks.forEach(callback => callback());
    }
  }

  /*************************************************************************************** /
  *  BLE state getters
  * ***************************************************************************************/
  public ringPaired(): boolean {
    return !!this.ring && this.ring.bleInfo.id !== defaultBleConfig.id;
  }

  public ringConnected(): boolean {
    if (!this.connectionHandler) {
      return false;
    }
    return !!this.connectionHandler.TaikaRing;
  }

  public ringFirmwareVersion(): RingVersion | undefined {
    return this.RingVersion;
  }

  public async getRingVersion(): Promise<RingVersion | undefined> {
    return this.RingVersion;
  }

  public async ringRSSI(): Promise<number> {
    if (!this.connectionHandler) {
      return -1;
    }
    
    return await this.connectionHandler.ringRSSI();
  }
  
  /*************************************************************************************** /
   *  BLE read  operations
  * ***************************************************************************************/
  /**
   * @brief Writes data to given characteristic UUID.
   * @param characteristicUUID The characteristic UUID string.
   * @param data Array of numbers to write.
   */
  public async write(characteristicUUID: string, data: number[], serviceUUID: string) {
    if (!this.connectionHandler) {
      logBLE("No connection handler.");
      return;
    }
    if (!this.connectionHandler.TaikaRing) {
      logBLE("Ring not connected.");
      return;
    }
    if (!this.ringReadyForReadWrite) {
      logBLE("Cannot read or write before characteristic discovery is complete.");
      return;
    }

    //logBLE(`wrote: ${data} to ${serviceUUID}:${characteristicUUID}`);
    const base64Data = Buffer.from(new Uint8Array(data)).toString('base64');
    try {
      await this.connectionHandler.TaikaRing.writeCharacteristicWithResponseForService(serviceUUID, characteristicUUID, base64Data);
      logBLE(`Data written to ${characteristicUUID}`);
    } catch (error) {
      logBLE(`Error writing to characteristic ${characteristicUUID}: ${(error as Error).message}`);
    }
  }

  /*************************************************************************************** /
  *  BLE write operation
  * ***************************************************************************************/
  /**
   * Reads data from a specified characteristic.
   * @param characteristicUUID The UUID of the characteristic to read from.
   * @param serviceUUID Optional. The UUID of the service that the characteristic belongs to. If not provided, it will be determined from the characteristic UUID.
   * @returns The data read from the characteristic as a Uint8Array, or null if the read fails.
   */
  public async read(characteristicUUID: string, serviceUUID: string): Promise<Uint8Array | null> {
    if (!this.connectionHandler) {
      return null;
    }

    if (!this.connectionHandler.TaikaRing) {
      logBLE("No device connected.");
      return null;
    }
    if (!this.ringReadyForReadWrite) {
      logBLE("Cannot read before characteristic discovery is completed.");
      return null;
    }
  
    try {
      // Read the characteristic
      const characteristic = await this.connectionHandler.TaikaRing.readCharacteristicForService(serviceUUID, characteristicUUID);

      // Decode the Base64-encoded string to bytes
      const data = Buffer.from(characteristic.value || '', 'base64');
      return new Uint8Array(data);
    } catch (error) {
      console.error(`Error reading from characteristic ${characteristicUUID}: ${(error as Error).message}`);
      return null;
    }
  }
}

export default TaikaBleManager;
