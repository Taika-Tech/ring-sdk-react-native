/* ModeService.ts
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

import { cloneDeep } from 'lodash';
import BaseService from './BaseService';
import { logBLE } from '../Utils/Logging/TaikaLog';
import { IOMappings, RingMode } from '../Interfaces/Interfaces';
import { ringModeToNumberArray } from '../Bluetooth/BleDataParser';
import { ConnectedDevices } from '../Integrations/ConnectedDevices';
import { Gestures } from '../Interfaces/Enums';

const modeServiceUUID: string = "869309e1-2649-483a-b9a8-2c4047987325";
const applyUserModeCharacteristicUUID: string = "28ae7e63-48e8-4ed5-9d20-473f4cbebbc1";
export const updateModeForIndexCharacteristicUUID: string = "199792a7-7e83-487a-9bf2-5b06ba48235e";
export const claimPrimaryCharacteristicUUID: string = "5fcf6df9-7113-4df1-b163-0c3de91db165"; // TODO: this needs to go somewhere else. Needs a ringside update too

class ModeService extends BaseService {
  connectedDevices: ConnectedDevices | undefined;

  constructor() {
    super(modeServiceUUID);
    this.addCharacteristic(applyUserModeCharacteristicUUID);
    this.addCharacteristic(updateModeForIndexCharacteristicUUID);
    this.addCharacteristic(claimPrimaryCharacteristicUUID);
  }
  
  public setConnectedDevices(connectedDevices: ConnectedDevices) {
    this.connectedDevices = connectedDevices;
  }

  public async applyUserMode(data: number[]): Promise<boolean> {
    return await this.write(data, applyUserModeCharacteristicUUID);
  }

  public async updateModeForIndex(data: number[]): Promise<boolean> {
    return await this.write(data, updateModeForIndexCharacteristicUUID);
  }

  /**
   * Method to update the mode for a given index. Data should be sent as a byte array.
   */
  public async BLEUpdateModeForIndex(modeToSend: RingMode) {
    logBLE("SEND MODE", modeToSend.modeIndex);

    let ringMode = cloneDeep(modeToSend);
    ringMode = this.convertModeForRing(ringMode) ?? ringMode;

    const bytes: number[] = ringModeToNumberArray(ringMode);
    await this.write(bytes, updateModeForIndexCharacteristicUUID);
  }

  private convertModeForRing(mode: RingMode): RingMode | undefined {
    if (this.connectedDevices === undefined) {
      return undefined;
    }

    const defaultBonding = this.connectedDevices.getBondingByDeviceHandle(mode.defaultTarget);
    const mappings: IOMappings = mode.modeMappings;

    // Setup the bonding handles
    for (const key in mappings) {
      const gestureKey = parseInt(key) as Gestures;
      const mapping = mappings[gestureKey];
      if (mapping) {
        mapping.bonding = this.connectedDevices.getBondingByDeviceHandle(mapping.target);
      }
    }

    mode.mouseTarget = defaultBonding;
    mode.defaultTarget = defaultBonding;
    return mode
  }

  /**
   * Method for client to claim to be the primary device used for configuring 
   * and controlling ring.
   */
  public async claimPrimary() {
    // Use the controlToServerCharacteristicUUID to write data
    logBLE("Attempt to claim primary device.")
    await this.write([1], claimPrimaryCharacteristicUUID);
  }
}

export default ModeService;
