/* OtaDfuService.ts
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

const otaDfuServiceUUID: string = "1d14d6ee-fd63-4fa1-bfa4-8f47b42119f0";
const otaDfuControlCharacteristicUUID: string = "F7BF3564-FB6D-4E53-88A4-5E37E0326063";
const otaDfuDataCharacteristicUUID: string = "984227F3-34FC-4045-A5D0-2C581F81A153";

class OtaDfuService extends BaseService {
  constructor() {
    super(otaDfuServiceUUID);
    this.addCharacteristic(otaDfuControlCharacteristicUUID);
    this.addCharacteristic(otaDfuDataCharacteristicUUID);
  }

  public async controlOtaDfu(data: number[]): Promise<boolean> {
    return await this.write(data, otaDfuControlCharacteristicUUID);
  }

  public async sendOtaDfuData(data: number[]): Promise<boolean> {
    return await this.writeWithoutResponse(data, otaDfuDataCharacteristicUUID);
  }
}

export default OtaDfuService;
