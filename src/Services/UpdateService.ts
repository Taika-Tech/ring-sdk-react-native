/* UpdateService.ts
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

const updateServiceUUID: string = "71f66364-797b-4e2b-b286-b97cdc04940d";
export const updateCharacteristicUUID: string = "14205919-23a5-4be8-ab28-fa2b29d0b9b0";

class UpdateService extends BaseService {  
  constructor() {
    super(updateServiceUUID);
    this.addCharacteristic(updateCharacteristicUUID);
  }

  public async getTouchEvents(): Promise<number[]> {
    try {
      const characteristicData = await this.read(updateCharacteristicUUID);
      if (!characteristicData || characteristicData.length === 0) {
        console.warn('Update data is unavailable or empty.');
        return [-1]; // Error value
      }

      const dataView = new DataView(new Uint8Array(characteristicData).buffer);

      // Parse touch_data_t
      const touchActive = dataView.getUint8(0);
      const touchX = dataView.getUint16(1, true); // true for little-endian
      const touchY = dataView.getUint16(3, true);
      const touchStrength = dataView.getUint16(5, true);
      const touchTimestamp = dataView.getUint32(7, true);

      // Parse tp_timestamped_eventmask_t
      const currentEvents = dataView.getUint32(11, true);
      const eventTimestamp = dataView.getUint32(15, true);

      return [
        touchActive,
        touchX,
        touchY,
        touchStrength,
        touchTimestamp,
        currentEvents,
        eventTimestamp
      ];
    } catch (error) {
      console.error('Error reading touch data:', error);
      return [-1]; // Error value
    }
  }
}

export default UpdateService;
