/* DeviceInformationService.ts
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

import { RingVersion } from '../Interfaces/Interfaces';
import { logBLE } from '../Utils/Logging/TaikaLog';
import BaseService from './BaseService';
import { TextDecoder } from 'text-encoding';

const deviceInformationServiceUUID: string = "180A";
const HardwareRevisionStringCharacteristicUUID: string = "2A27";
const FirmwareRevisionStringCharacteristicUUID: string = "2A26";

class DeviceInformationService extends BaseService {
  constructor() {
    super(deviceInformationServiceUUID);
    this.addCharacteristic(HardwareRevisionStringCharacteristicUUID);
    this.addCharacteristic(FirmwareRevisionStringCharacteristicUUID);
  }

  public async readHardwareRevision(): Promise<number[] | null> {
    return await this.read(HardwareRevisionStringCharacteristicUUID);
  }

  /**
  * Reads and parses the firmware and hardware version from the device.
  * @returns A Promise resolving to a RingVersion object.
  */
  public async readFirmwareVersion(): Promise<RingVersion | undefined> {
    try {
      const hwVersionData = await this.read(HardwareRevisionStringCharacteristicUUID);
      const fwVersionData = await this.read(FirmwareRevisionStringCharacteristicUUID);
      return this.parseFirmwareVersion(
        hwVersionData ? new Uint8Array(hwVersionData) : undefined,
        fwVersionData ? new Uint8Array(fwVersionData) : undefined
      );    
    } catch (error) {
      logBLE(`Error reading versions: ${(error as Error).message}`);
      return {
        hardwareMainLetter: 'A',
        hardwareMainNumber: 0,
        hardwareTouchLetter: 'A',
        hardwareTouchNumber: 0,
        firmwareMajor: 0,
        firmwareMinor: 0,
        firmwarePatch: 0,
      };
    }
  }

  private parseFirmwareVersion(hwVersionData: Uint8Array | undefined, fwVersionData: Uint8Array | undefined): RingVersion {
    const decoder = new TextDecoder();
    const hwVersion = decoder.decode(hwVersionData);
    const fwVersion = decoder.decode(fwVersionData);
    const [hwMain, hwTouch] = hwVersion.split(':');
    const [hardwareMainLetter, hardwareMainNumber] = hwMain.split('.');
    const [hardwareTouchLetter, hardwareTouchNumber] = hwTouch.split('.');
    const hexString = fwVersion.slice(2);
    const firmwareMajor = parseInt(hexString.slice(0, 2), 16);
    const firmwareMinor = parseInt(hexString.slice(2, 4), 16);
    const firmwarePatch = parseInt(hexString.slice(4, 6), 16);
    return {
      hardwareMainLetter,
      hardwareMainNumber: parseInt(hardwareMainNumber),
      hardwareTouchLetter,
      hardwareTouchNumber: parseInt(hardwareTouchNumber),
      firmwareMajor,
      firmwareMinor,
      firmwarePatch,
    };
  }
}

export default DeviceInformationService;
