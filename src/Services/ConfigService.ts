/* ConfigService.ts
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

import { logBLE, logConnectedDevices } from '../Utils/Logging/TaikaLog';
import BaseService from './BaseService';

const configServiceUUID: string = "a0f5e4ad-da0f-4b83-8e39-0f55260b2320";
const appConfigCharacteristicUUID: string = "98dd72f0-e06a-4645-b47c-7ec7022aafb7";

enum ConfigRegistry {
    useModes = 0x01,            // First bit flag
    streamDataEnable = 0x02,    // Second bit flag
    updateFlag = 0x80           // Third bit flag
}

class ConfigService extends BaseService {  
  constructor() {
    super(configServiceUUID);
    this.addCharacteristic(appConfigCharacteristicUUID);
  }


  public writeConfig(data: number[]) {
    this.write(data, appConfigCharacteristicUUID)
  }

  public startDataStreaming() {
    // This will write the first byte of rings config registry to: 0b10000010, and set the other bytes to 0
    const data = ConfigRegistry.updateFlag | ConfigRegistry.streamDataEnable;
    this.write([data, 0, 0, 0, 0], appConfigCharacteristicUUID);
  }

  public stopDataStreaming() {
    // This will write the first byte of rings config registry to: 0b10000000, and set the other bytes to 0
    const data = ConfigRegistry.updateFlag;
    this.write([data, 0, 0, 0, 0], appConfigCharacteristicUUID);
  }
}

export default ConfigService;
