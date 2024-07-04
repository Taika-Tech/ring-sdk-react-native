/* DataService.ts
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

export const dataServiceUUID: string = "2d9c938c-4161-4ce7-bfef-3907998c9f4e";
export const imuCharacteristicUUID: string = "2e3283c4-c0ac-4d18-acc4-fd17803b624b";
export const touchpadCharacteristicUUID: string = "dfe0cb08-1a2c-4063-9525-ed771b076eef";

class DataService extends BaseService {
  constructor() {
    super(dataServiceUUID);
    this.addCharacteristic(imuCharacteristicUUID);
    this.addCharacteristic(touchpadCharacteristicUUID);
  }

  public async readIMUData(): Promise<number[] | null> {
    return await this.read(imuCharacteristicUUID);
  }

  public async readTouchpadData(): Promise<number[] | null> {
    return await this.read(touchpadCharacteristicUUID);
  }
}

export default DataService;
