/* index.ts
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

import { BleManager } from 'react-native-ble-plx';
import Ring from './src/Ring';
import { logRing } from './src/Utils/Logging/TaikaLog';

export const initializeRing = async (manager: BleManager) => {
  // Initialize Ring instance
  const ring = Ring.getInstance();
  await ring.initialize(manager);
  ring.startBluetooth();
  return { ring };
};


// Ring
export { default as Ring } from './src/Ring'; // Default and named export

//export * from './src/Ring';

// Bluetooth
export * from './src/Bluetooth/BleConnectionHandler';
export * from './src/Bluetooth/BleManager';
export * from './src/Bluetooth/BleNotificationHandler';
export * from './src/Bluetooth/BlePermissions';

// Config
export * from './src/Config/LogConfig';
export * from './src/Config/TableConfigurations';

// Context
export * from './src/Context/RingContext';

// Integrations
export * from './src/Integrations/ConnectedDevices';
export * from './src/Integrations/MQTT/TaikaMQTT';
export * from './src/Integrations/MQTT/TaikaMQTTConfig';
export * from './src/Integrations/Platform';

// Interfaces
export * from './src/Interfaces/Descriptions';
export * from './src/Interfaces/Enums';
export * from './src/Interfaces/Interfaces';

// Ring
export * from './src/Ring/Mappings/IOMappings';
export * from './src/Ring/Ring-Mode/LEDColorsObject';
export * from './src/Ring/Ring-Mode/ModeIndex';
export * from './src/Ring/Ring-Mode/ModeTypesObject';
export * from './src/Ring/Ring-Mode/RingMode';
export * from './src/Ring/Ring-Mode/RingModes';
export * from './src/Ring/Ring-Mode/RingTimeOutsObject';
export * from './src/Ring/RingConfig';
export * from './src/Ring/RingEvents';

// Services
export * from './src/Services/BaseService';
export * from './src/Services/BatteryService';
export * from './src/Services/ConfigService';
export * from './src/Services/ControlService';
export * from './src/Services/DataService';
export * from './src/Services/DeviceInformationService';
export * from './src/Services/LedService';
export * from './src/Services/ModeService';
export * from './src/Services/OtaDfuService';
export * from './src/Services/UpdateService';

// Utils
export * from './src/Utils/Data/DataInitializer';
export * from './src/Utils/Data/DatabaseManager';
export * from './src/Utils/Data/GenericDataController';
export * from './src/Utils/Logging/BleLogs';
export * from './src/Utils/Logging/HelperPrints';
export * from './src/Utils/Logging/TaikaLog';
