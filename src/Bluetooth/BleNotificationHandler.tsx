/* TaikaBLE.tsx
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

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Ble related imports
import { logBLE } from '../Utils/Logging/TaikaLog';
import { ControlToClient, Gestures, TouchEventMask, TouchpadReadType } from '../Interfaces/Enums';
import { ConnectedDevices, TaikaConnectionType } from '../Integrations/ConnectedDevices';
import { APPLICATION_DEVICE_HANDLE } from '../Ring/Mappings/IOMappings';
import { GestureDescriptions } from '../Interfaces/Descriptions';
import BleLogs from '../Utils/Logging/BleLogs';
import Ring from '../Ring';
import { controlToClientCharacteristicUUID } from '../Services/ControlService';
import { claimPrimaryCharacteristicUUID, updateModeForIndexCharacteristicUUID } from '../Services/ModeService';
import { touchpadCharacteristicUUID } from '../Services/DataService';
import { updateCharacteristicUUID } from '../Services/UpdateService';
import { ringEventHandler } from '../Ring/RingEvents';

class NotificationHandler {
  private connectedDevices;
  private bleLogs: BleLogs;
  private ring: Ring | undefined;

  public constructor(connectedDevices: ConnectedDevices) {
    this.connectedDevices = connectedDevices;
    this.bleLogs = BleLogs.getInstance();
  }

  public setRing(ring: Ring) {
    this.ring = ring;
  }


  /*************************************************************************************** /
  *  Notification callback
  ****************************************************************************************/
  public async notificationCB(characteristicUUID: string, byteArray: number[]) {
    // Now you have byteArray as [number], which you can use as needed
    //logBLE(`Received data for ${characteristicUUID}:`, byteArray); }
    switch (characteristicUUID) {
      case controlToClientCharacteristicUUID:
        logBLE("Notification to: controlToClientCharacteristicUUID");
        logBLE("data: ", byteArray)        
        this.handleControlToClient(byteArray);
        break;
      case claimPrimaryCharacteristicUUID:
        this.handleClaimPrimary(byteArray);
        break;
      case touchpadCharacteristicUUID:
        this.bleLogs.logTouchpadData(byteArray[0] as TouchpadReadType, byteArray.slice(1));
        break;
      case updateModeForIndexCharacteristicUUID:
        logBLE("Notification to: updateModeForIndexCharacteristicUUID");
        logBLE("data: ", byteArray);
        break;
      case updateCharacteristicUUID:
        this.handleTouchEventUpdate(byteArray);
        break;
    }
  }

  private async handleControlToClient(byteArray: number[]) {
    // Switch statement to handle different cases based on the first byte
    switch (byteArray[0]) {
      case ControlToClient.BLE_CONTROL_TO_CLIENT_CONFIRM_CONNECTION:
        this.connectedDevices.addUnconfirmedDevice(byteArray[1], byteArray[2])
        break;
      case ControlToClient.BLE_CONTROL_TO_CLIENT_UPDATE_STATE:
        break;
      case ControlToClient.BLE_CONTROL_TO_CLIENT_HARDWARE_VERSIONINGS:
        break;
      case ControlToClient.BLE_CONTROL_TO_CLIENT_CONFIRMED_BONDINGS:
        break;
      case ControlToClient.BLE_CONTROL_TO_CLIENT_SUCCESSFUL_BONDING:
        break;
      case ControlToClient.BLE_CONTROL_TO_CLIENT_PERFORM_MODE_ACTION:
        this.handleModeAction(byteArray);
        break;
      case ControlToClient.BLE_CONTROL_TO_CLIENT_PERFORM_INCREMENTAL_MODE_ACTION:
        this.handleIncrementalAction(byteArray);
        break;


      case ControlToClient.BLE_CONTROL_TO_CLIENT_UPDATE_ERROR:
        this.bleLogs.logRingError(byteArray.slice(1));
        break;
      case ControlToClient.BLE_CONTROL_TO_CLIENT_UPDATE_CONFIRMED_CONNECTIONS:
        if (byteArray.length > 1) {
          this.connectedDevices.updateCurrentConfirmedBondigs(byteArray.slice(1));
        }
        break;
      default:
        logBLE("\tUnknown Command");
    }
  }

  private async handleClaimPrimary(byteArray: number[]) {
    if (byteArray[0] === 1) {
      let deviceName = 'Unknown Device';
      if (Platform.OS === 'ios') {
        deviceName = await DeviceInfo.getDeviceName();
      } else if (Platform.OS === 'android') {
        deviceName = DeviceInfo.getModel();
      }
      this.connectedDevices.updateBondingHandle(APPLICATION_DEVICE_HANDLE, byteArray[1]);
      this.connectedDevices.updateConfirmedDevice(APPLICATION_DEVICE_HANDLE, deviceName, TaikaConnectionType.primaryPhone);
    } else {
      logBLE("Cannot be primary.");
    }
  }

  private async handleModeAction(byteArray: number[]) {
    if (byteArray.length < 6) {
      logBLE("Invalid length for BLE_CONTROL_TO_CLIENT_PERFORM_MODE_ACTION");
    }

    const action = byteArray[1]             // MappingActions
    const gesture: Gestures = byteArray[2]  // IQS7211AGestures
    const target = byteArray[3]             // Connection handle
    const modeIndex = byteArray[4]          // ModeIndex: 0, 1, or 2
    const attribute = byteArray[5]          // Unused

    logBLE("Gesture: ", GestureDescriptions[gesture]);
    this.ring?.sendMqtt(GestureDescriptions[gesture], modeIndex);
    
  }

  private async handleIncrementalAction(byteArray: number[]) {
    if (byteArray.length < 18) {
      logBLE("Invalid length for BLE_CONTROL_TO_CLIENT_PERFORM_INCREMENTAL_MODE_ACTION");
    }

    const actionIncremental = byteArray[1]            // MappingActions
    const gestureIncremental: Gestures = byteArray[2] // IQS7211AGestures
    const targetIncremental = byteArray[3]            // Connection handle
    const modeIndexIncremental = byteArray[4]         // ModeIndex: 0, 1, or 2
    const attributeIncremental = byteArray[5]         // Unused
    const isFirstPacketIncremental = byteArray[5] === 1 ? true : false;
    let eulersAngles: [number, number, number] = [0, 0, 0];

    if (byteArray.length >= 18) { // Ensure byteArray has enough bytes
      // Convert number[] to Uint8Array
      const uint8Array = new Uint8Array(byteArray);

      // Extract the relevant subarray (from index 7 to 18)
      const floatValueBytes = uint8Array.subarray(6, 18); // Get bytes from index 7 to 18

      // Use DataView to read the bytes as floats
      const dataView = new DataView(floatValueBytes.buffer, floatValueBytes.byteOffset, floatValueBytes.byteLength);

      const roll = dataView.getFloat32(0, true);  // Read float32 at byte offset 0 (little-endian)
      const pitch = dataView.getFloat32(4, true); // Read float32 at byte offset 4 (little-endian)
      const yaw = dataView.getFloat32(8, true);   // Read float32 at byte offset 8 (little-endian)

      eulersAngles = [roll, pitch, yaw];
    }

    logBLE(eulersAngles);
    logBLE("Gesture: ", GestureDescriptions[gestureIncremental]);

    this.ring?.sendMqtt(GestureDescriptions[gestureIncremental], modeIndexIncremental, eulersAngles, isFirstPacketIncremental);
  }

  private async handleTouchEventUpdate(byteArray: number[]) {
    //logBLE("Stream length: ", byteArray.length);
    if (byteArray.length < 19) { // TP data only
      logBLE("Invalid length for touch event data");
      return;
    }

    const dataView = new DataView(new Uint8Array(byteArray).buffer);

    // Parse touch_data_t
    const active = dataView.getUint8(0);
    const x = dataView.getUint16(1, true);
    const y = dataView.getUint16(3, true);
    const strength = dataView.getUint16(5, true);
    const touchTimestamp = dataView.getUint32(7, true);

    // Parse tp_timestamped_eventmask_t
    const eventMask = dataView.getUint32(11, true) as TouchEventMask;
    const timestamp = dataView.getUint32(15, true);


    logBLE(`Touch event - active: ${active}, x: ${x}, y: ${y}, strength: ${strength}, timestamp: ${timestamp}`);

    // Trigger the touch event
    ringEventHandler.trigger('touchEvent', { active, x, y, strength, eventMask, timestamp });

    if (byteArray.length < 31) {
      logBLE("Invalid length for imu event data");
      return;
    }

    const accX = dataView.getFloat32(19, true);
    const accY = dataView.getFloat32(23, true);
    const accZ = dataView.getFloat32(27, true);
    ringEventHandler.trigger('motionEvent', [accX, accY, accZ]);
  }
}

export default NotificationHandler;
