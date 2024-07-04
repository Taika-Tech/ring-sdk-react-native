/* TaikaLog.tsx
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

import { logSettings } from "../../Config/LogConfig";

function logOutput(component: string, ...args: any[]): void {
    if (args.length) {
        console.log(`[${component}]`, ...args);
    }
}

export function logRing(...args: any[]): void {
    if (logSettings.ringLog) {
        logOutput('RING', ...args);
    }
}

export function logMQTT(...args: any[]): void {
    if (logSettings.mqttLog) {
        logOutput('MQTT', ...args);
    }
}

export function logUiMQTT(...args: any[]): void {
    if (logSettings.mqttUiLog) {
        logOutput('MQTT UI', ...args);
    }
}

export function logBLE(...args: any[]): void {
    if (logSettings.bleLog) {
        logOutput('BLE', ...args);
    }
}

export function logUI(...args: any[]): void {
    if (logSettings.uiLog) {
        logOutput('UI', ...args);
    }
}

export function logSQL(...args: any[]): void {
    if (logSettings.sqlLog) {
        logOutput('SQL', ...args);
    }
}

export function logFileExplorer(...args: any[]): void {
    if (logSettings.fileExplorerLog) {
        logOutput('FILES', ...args);
    }
}

export function logConnectedDevices(...args: any[]): void {
    if (logSettings.connectedDevicesLog) {
        logOutput('CONNECTED DEV', ...args);
    }
}

export function logApp(...args: any[]): void {
    if (logSettings.appLog) {
        logOutput('APP', ...args);
    }
}

export function logMappings(...args: any[]): void {
    if (logSettings.mappingsLog) {
        logOutput('MAPPINGS', ...args);
    }
}

