/* BaseService.ts
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

import BaseService from './BaseService';
  
const ledServiceUUID: string = "ef6779a1-0566-4917-a12d-7388d7727d64";
const LedRGBCharacteristicUUID: string = "373a0e9b-5789-4439-90a9-9b6ae5d5f1a5";
const LedPeriodicCharacteristicUUID: string = "7513a1e4-cda3-4f01-8237-f220263dc5d2";
const ledFlashSequenceCharacteristicUUID: string = "a9ed9a57-82fc-4a4c-b563-cadae5f364ea";
const ledControlCharacteristicUUID: string = "751ec71e-c52c-40a2-9ec8-9fd5c9fbead8";

class LedService extends BaseService {
  constructor() {
    super(ledServiceUUID);
    this.addCharacteristic(LedRGBCharacteristicUUID);
    this.addCharacteristic(LedPeriodicCharacteristicUUID);
    this.addCharacteristic(ledFlashSequenceCharacteristicUUID);
    this.addCharacteristic(ledControlCharacteristicUUID);
  }

  public async readLedConfig(): Promise<number[] | null> {
    return this.read(ledControlCharacteristicUUID);
  }

  public async setLedRGB(data: number[]): Promise<boolean> {
    return await this.write(data, LedRGBCharacteristicUUID);
  }

  public async setLedPeriodic(data: number[]): Promise<boolean> {
    return await this.write(data, LedPeriodicCharacteristicUUID);
  }

  public async setLedFlashSequence(data: number[]): Promise<boolean> {
    return await this.write(data, ledFlashSequenceCharacteristicUUID);
  }

  public async controlLed(data: number[]): Promise<boolean> {
    return await this.write(data, ledControlCharacteristicUUID);
  }
}

export default LedService;
