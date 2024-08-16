/* BleConnectionHandler.tsx
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

import { BleManager, Device, Characteristic, ScanMode, ScanOptions, State, LogLevel, BleErrorCode } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import { logBLE } from '../Utils/Logging/TaikaLog';
import NotificationHandler from './BleNotificationHandler';
import requestBluetoothPermission from './BlePermissions';
import Ring from '../Ring/Ring';
import { defaultBleConfig } from '../Config/TableConfigurations';
import { ringEventHandler } from '../Ring/RingEvents';
import { dataServiceUUID } from '../Services/DataService';
import { Buffer } from 'buffer';

//type Callback = () => void;
type Callback = (...args: any[]) => void | Promise<void>;

class ConnectionHandler {
  public TaikaRing?: Device;
  private manager: BleManager;
  private ring: Ring | undefined;
  private state!: State;
  private bleLogLevel: LogLevel = LogLevel.Verbose;
  private notificationHandler: NotificationHandler;
  private scanParams: ScanOptions | null = null;
  private activeNotifications: Set<string> = new Set();
  private ringReadyCallbacks: Callback[] = [];

  // Pairing behaviour
  private RSSILimitForInitialConnection: number = -60;

  constructor(notificationHandler: NotificationHandler, manager: BleManager) {
    /*this.manager = new BleManager({
        restoreStateIdentifier: 'BleInTheBackground',
        restoreStateFunction: this.restoreStateFunction.bind(this)
    });*/
    this.manager = manager;
    this.manager.setLogLevel(this.bleLogLevel);
    this.notificationHandler = notificationHandler;

    if (Platform.OS === 'ios') {
      this.scanParams = { allowDuplicates: true };
    } else if (Platform.OS === 'android') {
      this.scanParams = { scanMode: ScanMode.Balanced };
    }
  }

  public setRing(ring: Ring) {
    this.ring = ring;
  }

  public addRingReadyCallback(callback: Callback) {
    this.ringReadyCallbacks.push(callback);
  }

  public async startConnectionHandler() {
    try {
      // Does not work on konstas debug android without this
      await requestBluetoothPermission();

      this.state = await this.manager.state();

      this.manager.onStateChange((state) => {
        this.state = state;
        this.handleBleState();
      }, true);

    } catch (error) {
      logBLE('Error setting up connection handler:', error);
      console.error('Error setting up connection handler:', error);
    }
  }

  private handleBleState(): void {
    switch (this.state) {
      case State.PoweredOff:
        // TODO: Alert user that BLE needs to be on for ring
        break;
      case State.PoweredOn:
        this.startScanning();
        break;
      case State.Unauthorized:
        requestBluetoothPermission();
        break;
      case State.Resetting:
        // Currently unavailable
        break;
      case State.Unsupported:
        // TODO: Platform does not support BLE
        break;
      case State.Unknown:
        // ???
        break;
      default:
        throw new Error("ConnectionHandler: unknown error in state handler!");
    }
  }

  private async startScanning() {
    try {
      this.manager.startDeviceScan([dataServiceUUID], this.scanParams, (error, device) => {
      //this.manager.startDeviceScan(null, this.scanParams, (error, device) => {

        if (error) {
          logBLE(`Scanning error: ${error.message}`, error.reason);
          // Attempt scanning again if scanning failed
          this.startScanning();
          return;
        }

        if (device?.id && this.isTaikaRing(device)) {
          logBLE(`Found Taika Ring: ${device.name} (${device.id}) RSSI:  (${device.rssi})`);
          this.manager.stopDeviceScan();
          this.connectAndSetupDevice(device);
        }
      });
    } catch (error) {
      logBLE(`Scan error: ${(error as Error).message}`);
    }
  }

  private isTaikaRing(device: Device): boolean {
    // If mac address is default, there is no taika ring previously saved, check from name if this is a taika ring
    if (this.ring && this.ring.bleInfo.id === defaultBleConfig.id) {
      // Check rssi strength
      if (device.rssi && device.rssi > this.RSSILimitForInitialConnection && device.rssi < 0) {
        return !!device.name && device.name.toLowerCase().includes(this.ring.bleInfo.name.toLowerCase());
      } else {
        return false;
      }
    } else {
      return device.id === this.ring?.bleInfo.id;
    }
  }

  private async connectAndSetupDevice(device: Device) {
    logBLE(`Attempting connection to device: ${device.name}`);
    try {
      this.TaikaRing = await this.manager.connectToDevice(device.id);
      this.setupDisconnectionListener(this.TaikaRing.id);
      await this.TaikaRing.discoverAllServicesAndCharacteristics();
      await this.setupCharacteristicsAndServices();
      ringEventHandler.trigger('connected');
      logBLE(`Successfully connected to device: ${this.TaikaRing.name}`);
    } catch (error) {
      logBLE(`Connection error: ${(error as Error).message}`);
      this.startScanning();
    }
  }

  private setupDisconnectionListener(deviceId: string) {
    // Setup a new listener for the device disconnection
    const subscription = this.manager.onDeviceDisconnected(deviceId, (error, device) => {
      logBLE(`Device disconnected: ${device?.name}`);
      ringEventHandler.trigger('disconnected');
      this.clearNotifications();
      this.TaikaRing = undefined;
      this.startScanning();
      subscription.remove();
    });
  }

  private clearNotifications() {
    this.activeNotifications.forEach(transactionId => this.manager.cancelTransaction(transactionId));
    this.activeNotifications.clear();
  }

  private async setupCharacteristicsAndServices() {
    if (!this.TaikaRing) return;

    // TODO: THIS CHECK NEEDS TO BE DONE ASAP
    // Wait for the device to be bonded
    //await this.waitForBonding();

    try {
      const services = await this.TaikaRing.services();
      for (const service of services) {
        const characteristics = await this.TaikaRing.characteristicsForService(service.uuid);
        if (characteristics) {
          for (const characteristic of characteristics) {
            if (characteristic.isNotifiable || characteristic.isIndicatable) {
              await this.setupNotifications(characteristic, service.uuid);
            }
          }
        }
      }
      logBLE("All notifications set up, ringReadyCallback.");

      await this.ringReadyCallback(); // Call ringReadyCallback only after all promises resolve
      logBLE("ringReadyCallback called.");
    } catch (error) {
      console.error(`Error setting up characteristics and services: ${error}`);
    }
  }

  private async setupNotifications(characteristic: Characteristic, serviceUUID: string): Promise<void> {
    if (!this.TaikaRing) return;

    const transactionId = `monitor_${characteristic.uuid}`;
    logBLE("Attempting to subscribe to: ", characteristic.uuid);
    this.activeNotifications.add(transactionId); // Keep track of transactionIds to cancel later if needed

    try {
      this.manager.monitorCharacteristicForDevice(
        this.TaikaRing.id, serviceUUID, characteristic.uuid,
        (error, char) => {
          if (error) {
            // Ignore non fatal errors
            if (error.errorCode === BleErrorCode.OperationCancelled) {
              //logBLE(`Notification error for ${characteristic.uuid} cancelled.`);
              return
            } else if (error.errorCode === BleErrorCode.DeviceDisconnected) {
              //logBLE(`Notification error for ${characteristic.uuid}, device disconnected.`);
              return
            } else {
              logBLE(`Notification error ${error.errorCode} for ${characteristic.uuid}: ${error.message}`, error);
              return;
            }
          }

          if (char?.value) {
            const buffer = Buffer.from(char.value, 'base64');
            const val = Array.from(buffer);
            this.notificationHandler.notificationCB(char.uuid, val); // Process notification data
          }
        }, transactionId
      );
    } catch (error) {
      console.error(`Error during monitoring ${characteristic.uuid}: ${error}`);
      this.activeNotifications.delete(transactionId); // Remove from active notifications on error
    }
  }

  private async ringReadyCallback() {
    // Save ring info to persistent storage
    if (this.TaikaRing && this.ring && this.ring.bleInfo) {
      await this.ring.setRingBleInfo({
        sqlIdentifier: this.ring.bleInfo.sqlIdentifier,
        id: this.TaikaRing.id,
        name: this.TaikaRing.name || defaultBleConfig.name,
      });
    }
    await Promise.all(this.ringReadyCallbacks.map(callback => callback()));

    //this.ringReadyCallbacks.forEach(callback => callback());
  }

  public async restoreStateFunction(restoredState: any) {
    if (restoredState == null) {
      logBLE('Ble Manager not restored');
      return;
    }

    const devices = restoredState.connectedPeripherals;
    if (devices.length === 0) {
      logBLE('No connected devices to restore...');
      return;
    }

    const device = devices[0];
    logBLE('Restoring device[0]...');
    try {
      await this.restoredProcess(device);
    } catch (error) {
      console.log("Error in ringSDK, BLEManager: restoring device failed");
    }

    logBLE(`BleManager restored: ${restoredState.connectedPeripherals.map((device: Device) => device.name)}`);
  }

  public async restoredProcess(device: Device) {
    this.TaikaRing = device;
    logBLE(`Successfully restored Taika Ring: ${this.TaikaRing.name}`);
    this.setupDisconnectionListener(device.id);
    await device.discoverAllServicesAndCharacteristics();
    await this.setupCharacteristicsAndServices();
  }
  
  public async ringRSSI(): Promise<number> {
    if (this.TaikaRing) {
      try {
        const device = await this.manager.readRSSIForDevice(this.TaikaRing.id);
        if (device.rssi !== undefined && device.rssi !== null) {
          return device.rssi;
        }
      } catch (error) {
        console.error('Error reading RSSI:', error);
        return -1;
      }
    }
    return -1;
  }

  // TODO: implement this logic below to check if ring is bonded before setting up the connection
  /*
  private async waitForBonding(timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const isBonded = await this.checkIfBonded();
      if (isBonded) {
        logBLE("Device is now bonded. Proceeding with setup.");
        return;
      }
      //logBLE("Waiting for user to accept bonding...");
      //await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
    }
    
    throw new Error("Bonding timeout: User did not complete the bonding process in time.");
  }

  public async checkIfBonded(): Promise<boolean> {

    // This characteristic can only be read by bonded devices
    const HID_SERVICE_UUID = '1812';
    const REPORT_MAP_CHARACTERISTIC_UUID = '2A4B';
    
    if (!this.TaikaRing) {
      logBLE('No device connected, cannot check bond status');
      return false;
    }

    try {
      const isConnected = await this.TaikaRing.isConnected();
      if (!isConnected) {
        logBLE('Device is not connected, cannot check bond status');
        return false;
      }

      // Try to read the Report Map characteristic
      const characteristic = await this.TaikaRing.readCharacteristicForService(
        HID_SERVICE_UUID,
        REPORT_MAP_CHARACTERISTIC_UUID
      );

      // If we can read the characteristic, the device is bonded
      logBLE('Successfully read Report Map characteristic, device is bonded');
      return true;
    } catch (error) {
      // If we get an error, the device is likely not bonded
      logBLE('Error reading Report Map characteristic, device is probably not bonded:', error);
      return false;
    }
  }*/
}

export default ConnectionHandler;
