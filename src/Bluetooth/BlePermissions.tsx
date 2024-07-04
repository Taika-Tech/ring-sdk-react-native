/* BluetoothPermissions.tsx
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

import { PermissionsAndroid, Platform } from 'react-native';

const requestBluetoothPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      //if (debugging) { console.log('Device platform: IOS'); }
      return true; // Permissions are handled in Info.plist
    }

    if (Platform.OS === 'android') {
      //if (debugging) { console.log('Device platform: Android'); }
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      if (apiLevel < 31) {
        try {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
          //console.error('Failed to request ACCESS_FINE_LOCATION permission', error);
          return false;
        }
      }

      if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
        try {
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ]);
          return (
            result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
            result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
            result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
          );
        } catch (error) {
          //console.error('Failed to request BLUETOOTH permissions', error);
          return false;
        }
      }
    }

    //if (debugging) { console.log('Permissions have not been granted'); }
    return false;
};

export default requestBluetoothPermission;
