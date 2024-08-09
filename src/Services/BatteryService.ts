/* BatteryService.ts
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

import { ringEventHandler } from 'ring-sdk-react-native';
import BaseService from './BaseService';

const batteryServiceUUID: string = "180F";
const batteryCharacteristicUUID: string = "2A19";

class BatteryService extends BaseService {
  constructor() {
    super(batteryServiceUUID);
    this.addCharacteristic(batteryCharacteristicUUID);
  }

  public async readBatteryLevel(): Promise<number> {
    try {
      const characteristicData = await this.read(batteryCharacteristicUUID);
      if (!characteristicData || characteristicData.length === 0) {
        console.warn('State of charge data is unavailable or empty.');
        return -1;
      }
  
      // First byte represents the state of charge
      const stateOfCharge = characteristicData[0];

      // Trigger lowBattery event if battery under 20%
      if (stateOfCharge <= 20) {
        ringEventHandler.trigger('lowBattery');
      }
      
      return stateOfCharge;
    } catch (error) {
      console.error('Error reading state of charge:', error);
      return -1; // Or another default value
    }
  }

}

export default BatteryService;
