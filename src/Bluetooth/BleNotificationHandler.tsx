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

// Ring
import { ringEventHandler } from '../Ring/RingEvents';
import { APPLICATION_DEVICE_HANDLE } from '../Ring/Mappings/IOMappings';
// Integrations
import { ConnectedDevices, TaikaConnectionType } from '../Integrations/ConnectedDevices';
import { getDeviceName } from '../Integrations/Platform';
// Interfaces
import { ControlToClient, TouchpadReadType } from '../Interfaces/Enums';
// Service UUIDs
import { controlToClientCharacteristicUUID } from '../Services/ControlService';
import { claimPrimaryCharacteristicUUID, updateModeForIndexCharacteristicUUID } from '../Services/ModeService';
import { touchpadCharacteristicUUID } from '../Services/DataService';
import { updateCharacteristicUUID } from '../Services/UpdateService';
// Utils
import BleLogs from '../Utils/Logging/BleLogs';
import { logBLE } from '../Utils/Logging/TaikaLog';
import { parseIncrementalActionData, parseModeActionData, parseMotionData, parseTouchData } from './BleDataParser';

class NotificationHandler {
  private connectedDevices;
  private bleLogs: BleLogs;

  public constructor(connectedDevices: ConnectedDevices) {
    this.connectedDevices = connectedDevices;
    this.bleLogs = BleLogs.getInstance();
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
        this.handleStreamEventUpdate(byteArray);
        break;

      default:
        logBLE("Unknown Characteristic UUID.");
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
      let deviceName = await getDeviceName();
      this.connectedDevices.updateBondingHandle(APPLICATION_DEVICE_HANDLE, byteArray[1]);
      this.connectedDevices.updateConfirmedDevice(APPLICATION_DEVICE_HANDLE, deviceName, TaikaConnectionType.primaryPhone);
    } else {
      logBLE("Cannot be primary.");
    }
  }

  private async handleModeAction(byteArray: number[]) {
    const modeActionData = parseModeActionData(byteArray);

    if (modeActionData) {
      ringEventHandler.trigger("ModeAction", modeActionData);
    }
  }

  private async handleIncrementalAction(byteArray: number[]) {
    const modeIncrementalActionData = parseIncrementalActionData(byteArray);

    if (modeIncrementalActionData) {
      ringEventHandler.trigger("ModeAction", modeIncrementalActionData);
    }
  }

  private async handleStreamEventUpdate(byteArray: number[]) {
    logBLE("Stream length: ", byteArray.length);
    
    const touchData = parseTouchData(byteArray);
    if (touchData) {
      ringEventHandler.trigger('touchEvent', touchData);
    }
    
    const motionData = parseMotionData(byteArray);
    if (motionData) {
      ringEventHandler.trigger('motionEvent', motionData);
    }
  }
}

export default NotificationHandler;
