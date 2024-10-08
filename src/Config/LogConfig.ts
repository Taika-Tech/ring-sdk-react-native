/* LogConfig.tsx
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

interface LogSettings {
    ringLog: boolean;
    mqttLog: boolean;
    mqttUiLog: boolean;
    bleLog: boolean;
    uiLog: boolean;
    sqlLog: boolean;
    fileExplorerLog: boolean;
    connectedDevicesLog: boolean;
    appLog: boolean;
    mappingsLog: boolean;
}

const devLogSettings: LogSettings = {
    ringLog:            true,
    mqttLog:            true,
    mqttUiLog:          true,
    bleLog:             true,
    uiLog:              false,
    sqlLog:             false,
    fileExplorerLog:    true,
    connectedDevicesLog: false,
    appLog:             true,
    mappingsLog:        true
};

const prodLogSettings: LogSettings = {
    ringLog:            false,
    mqttLog:            false,
    mqttUiLog:          false,
    bleLog:             false,
    uiLog:              false,
    sqlLog:             false,
    fileExplorerLog:    false,
    connectedDevicesLog: false,
    appLog:             false,
    mappingsLog:        false
};
  
export const logSettings: LogSettings = 
    process.env.NODE_ENV === 'production' ? prodLogSettings : devLogSettings;
