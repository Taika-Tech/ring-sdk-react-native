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

import TaikaBleManager from '../Bluetooth/BleManager';
import { logBLE } from '../Utils/Logging/TaikaLog';

class BaseService {
  protected uuid: string;
  protected characteristicUUIDs: string[] = [];
  private bleManager: TaikaBleManager | undefined;

  constructor(serviceUUID: string) {
    this.uuid = serviceUUID;
  }

  /**
   * Add characteristic to a service. 
   * @param characteristicUUID 
   */
  public addCharacteristic(characteristicUUID: string) {
    this.characteristicUUIDs.push(characteristicUUID);
  }

  public setBleManager(bleManager: TaikaBleManager) {
    this.bleManager = bleManager;
  }

  /**
   * Read from a characteristic belonging to the service. 
   * @param fromCharacteristic the characteristic to read from
   * @return number array of characteristic if read succesfull, null otherwise 
   */
  public async read(fromCharacteristic: string): Promise<number[] | null> {
    if (!this.characteristicUUIDs.includes(fromCharacteristic)) {
      return null;
    }
    if (this.bleManager === undefined) {
      return null;
    }
    
    try {
      const arr = await this.bleManager.read(fromCharacteristic, this.uuid);
      return arr ? Array.from(arr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Write data to a characteristic belonging the service. 
   * @param data list of numbers to write to the characteristic
   * @param fromCharacteristic the characteristic to write to
   * @return true if write succesfull, false otherwise
   */
  public async write(data: number[], toCharacteristic: string): Promise<boolean> {
    if (!this.characteristicUUIDs.includes(toCharacteristic)) {
      logBLE("Invalid characteristic at write.");
      return false;
    }
    if (this.bleManager === undefined) {
      logBLE("Invalid blemanager at write.");
      return false;
    }    
    try {
      await this.bleManager.write(toCharacteristic, data, this.uuid);
      return true;
    } catch {
      return false;
    }
  }

    /**
   * Write data to a characteristic belonging the service. 
   * @param data list of numbers to write to the characteristic
   * @param toCharacteristic the characteristic to write to
   * @return true if write succesfull, false otherwise
   */
    public async writeWithoutResponse(data: number[], toCharacteristic: string): Promise<boolean> {
      if (!this.characteristicUUIDs.includes(toCharacteristic)) {
        logBLE("Invalid characteristic at write.");
        return false;
      }
      if (this.bleManager === undefined) {
        logBLE("Invalid blemanager at write.");
        return false;
      }
      
      
      try {
        await this.bleManager.writeWithoutResponse(toCharacteristic, data, this.uuid);
        return true;
      } catch {
        return false;
      }
    }
}

export default BaseService;
