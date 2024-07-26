/* ControlService.ts
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

import { ControlToClient, Handedness, StateEnum, TaikaConnectionType, TouchpadReadType } from '../Interfaces/Enums';
import { MouseConfig } from '../Interfaces/Interfaces';
import { ConnectedDevices } from '../Integrations/ConnectedDevices';
import { logBLE } from '../Utils/Logging/TaikaLog';
import BaseService from './BaseService';
import { Buffer } from 'buffer';

const controlServiceUUID: string = "dc374d70-77bc-4f4e-8c7e-047f09f8e883";
export const controlToServerCharacteristicUUID: string = "a6d93476-f864-44f7-8197-a2cc089ffa7b";
export const controlToClientCharacteristicUUID: string = "2d193527-cd1f-4eb6-bd6c-9d47bcd00019";

enum Commands {
    ADJUST_SENSITIVITY =                0x01,
    DELETE_BONDINGS =                   0x02,
    DELETE_BONDING =                    0x03,
    SYSTEM_RESET =                      0x04,
    FORCE_SHUTOFF =                     0x05,
    CHANGE_DEVICE_NAME =                0x06, // todo, doesn't work currently
    CONFIRM_CONNECTION_NAME =           0x07,
    FORCE_STATE =                       0x08,
    ASK_FOR_STATE =                     0x0A,
    CONTROL_ADVERTISEMENT =             0x0C,
    CHANGE_HANDEDNESS =                 0x0E,
    CHECK_IF_BONDED =                   0x0F,
    TEST_PACKET =                       0x10,
    STREAM_DATA =                       0x11,
    CHANGE_APPLICATION =                0x12,
    CLEAR_ERRORS =                      0x13,
    SHIP_MODE =                         0x14,
    KEEP_ACTIVE =                       0x15,
    FACTORY_RESET =                     0x16,
    FACTORY_RESET_AND_SHIP =            0x17,
    RESEED_TOUCHPAD =                   0x18,
    BOOT_TO_BOOTLOADER =                0x1A,
    TOUCHPAD_DEBUG_STATE =              0x1B,
    MAG_CALIBRATION =                   0x1C,
}

export const ControlToServerNames: { [key: number]: string } = {};

for (const [name, value] of Object.entries(Commands)) {
    if (typeof value === "number") {  // Ensure only numeric values are processed
        ControlToServerNames[value] = name;
    }
}

export const ControlToClientNames: { [key: number]: string } = {};

for (const [name, value] of Object.entries(ControlToClient)) {
    if (typeof value === "number") {  // Ensure only numeric values are processed
        ControlToClientNames[value] = name;
    }
}

export const taikaFileNames: { [key: number]: string } = {
  0x00: "Ble connections",
  0x01: "Ble event handler",
  0x02: "Ble globals",
  0x03: "Ble main",
  0x04: "Communications",
  0x05: "Ring init",
  0x06: "States",                         
  0x07: "NVM",                         
  0x08: "Timer",
  0x09: "Leds",
  0x0A: "Power management IC",
  0x0B: "Power management",
  0x0C: "Touchpad",
  0x0D: "Touchpad i2c",
  0x0E: "Touchpad gesture recognition",
  0x0F: "Touchpad low level driver",
  0x10: "Mouse driver",
  0x11: "Mag IC",
  0x12: "Mag",
  0x13: "Acc & Gyro",
  0x14: "IMU",
  0x15: "Ble write handler",
  0x16: "Over the air firmware update",
  0x17: "Assert",
  0x18: "Watchdog",
  0x19: "gsdk files",
  0x20: "Taika_file_count"
};

class ControlService extends BaseService {
  private connectedDevices: ConnectedDevices | undefined;
  
  constructor() {
    super(controlServiceUUID);
    this.addCharacteristic(controlToServerCharacteristicUUID);
    this.addCharacteristic(controlToClientCharacteristicUUID);

  }
  
  public setConnectedDevices(connectedDevices: ConnectedDevices) {
    this.connectedDevices = connectedDevices;
  }

  /*************************************************************************************** /
  *  Generic control service interface
  * ***************************************************************************************/
  public async sendControlCommand(data: number[]): Promise<boolean> {
    return await this.write(data, controlToServerCharacteristicUUID);
  }

  public async readControlResponse(): Promise<number[] | null> {
    return await this.read(controlToClientCharacteristicUUID);
  }

  /*************************************************************************************** /
  *  Specific control service interface
  * ***************************************************************************************/
  /**
   * Method that forces the ring to delete bondings
   */
  public async confirmConnection(bonding: number, deviceType: TaikaConnectionType) {
    this.sendControlCommand([Commands.CONFIRM_CONNECTION_NAME, bonding, deviceType])
  }

  /**
   * Method that forces the ring to delete bondings, resets NVM and resets ring
   */
  public async factoryReset() {
    this.sendControlCommand([Commands.FACTORY_RESET])
  }

  /**
   * Method that forces the ring to ship mode
   */
  public async shipApplication() {
    this.sendControlCommand([Commands.SHIP_MODE])
  }

  public async factoryResetAndShipApplication() {
    this.sendControlCommand([Commands.FACTORY_RESET_AND_SHIP])
  }

  /**
   * Method that forces the ring to delete bondings
   */
  public async deleteBondings() {
    this.sendControlCommand([Commands.DELETE_BONDINGS])
  }

  /**
   * Method that forces the ring into a certain state
   */
  public async forceState(state: StateEnum) {
    this.sendControlCommand([Commands.FORCE_STATE, 1, state])
  }

  /**
   * Method that frees the state, so that ring logic can handle state changing
   */
  public async freeState() {
    this.sendControlCommand([Commands.FORCE_STATE, 0, 0])
  }

  /**
   * Method that frees the state, so that ring logic can handle state changing
   */
  public async keepRingActive(KeepActive: boolean) {
    if (KeepActive) {
      this.sendControlCommand([Commands.KEEP_ACTIVE, 1])
    } else {
      this.sendControlCommand([Commands.KEEP_ACTIVE, 0])
    }
  }

  public updateHandedness(handedness: Handedness) {
    this.sendControlCommand([Commands.CHANGE_HANDEDNESS, handedness])
  }

  public beginTouchpadDebugMode(readType: TouchpadReadType) {
    this.sendControlCommand([Commands.TOUCHPAD_DEBUG_STATE, readType, 1])
  }

  public endTouchpadDebugMode() {
    this.sendControlCommand([Commands.TOUCHPAD_DEBUG_STATE, TouchpadReadType.TP_default, 0])
  }

  public reseedTouchpad() {
    this.sendControlCommand([Commands.RESEED_TOUCHPAD])
  }

  public async magCalibrate() {
    await this.sendControlCommand([Commands.MAG_CALIBRATION])
  }

  /**
   * Asks ring to send its state via notification
   */
  public async getState() {
    await this.sendControlCommand([Commands.ASK_FOR_STATE])
  }

  // This method sends mouse sensitivity and axis settings to a BLE device.
  // Note: The `id` field from MouseConfig is not included as it is irrelevant for device settings.
  public updateMouseAxesAndSensitivity(mouseConfig: MouseConfig) {
    const sliderValues = [
      mouseConfig.xSpeed,
      mouseConfig.ySpeed,
      mouseConfig.xAcceleration,
      mouseConfig.yAcceleration,
      mouseConfig.quaternion
    ];
    const newAxes = [mouseConfig.flipXAxis, mouseConfig.flipYAxis];

    let buffer = Buffer.alloc(1 + 1); // Starting with control command and subcommand
    buffer.writeUInt8(Commands.ADJUST_SENSITIVITY, 0);
    buffer.writeUInt8(5, 1); // Sub-command or identifier for this particular setting

    sliderValues.forEach(value => {
      const floatBuffer = Buffer.alloc(4); // Each float is 4 bytes
      floatBuffer.writeFloatLE(value); // Write as little-endian
      buffer = Buffer.concat([buffer, floatBuffer]);
    });

    newAxes.forEach(axis => {
      const axisBuffer = Buffer.alloc(1);
      axisBuffer.writeUInt8(axis ? 1 : 0, 0);
      buffer = Buffer.concat([buffer, axisBuffer]);
    });

    this.sendControlCommand(Array.from(buffer))
  }

  public async deleteConfirmedDevice(deviceHandle: number): Promise<void> {
    if (this.connectedDevices === undefined) {
      return;
    }

    const bondingHandle = this.connectedDevices.getBondingByDeviceHandle(deviceHandle);
    this.sendControlCommand([Commands.DELETE_BONDING, bondingHandle]);
    try {
      await this.connectedDevices.deleteConfirmedDevice(deviceHandle);
    } catch (error) {
      const err = error as { message: string }; 
      throw new Error(`Failed to delete device: ${err.message}`);
    }
  }
  
  /**
   * Method that clears the ring error buffer
   */
  public async clearErrors() {
    this.write([Commands.CLEAR_ERRORS], controlToServerCharacteristicUUID)
  }
}

export default ControlService;
