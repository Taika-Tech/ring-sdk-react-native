/* RingMode.tsx
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

import { ColorDescriptions } from './LEDColorsObject';
import { TaikaModeTypeDescriptions } from './ModeTypesObject';
import { TimeoutOptionsDescriptions } from './RingTimeOutsObject';
import { printMappings } from '../Mappings/IOMappings';
import { RingMode } from '../../Interfaces/Interfaces';
import  { ConnectedDevices } from '../../Integrations/ConnectedDevices'
import { gestureOrder } from '../../Interfaces/Descriptions'

export function PrintMode(mode: RingMode, bondingHandles: boolean = false) {
    const deviceManager = ConnectedDevices.getInstance();

    console.log("Mode Details:");
    console.log(`Name: ${mode.name}`);
    console.log(`Active Timeout: ${TimeoutOptionsDescriptions[mode.activeTimeoutS]}`);
    console.log(`Type: ${TaikaModeTypeDescriptions[mode.type]}`);
    console.log(`Color: ${ColorDescriptions[mode.color]}`);
    console.log(`Mode Index: ${mode.modeIndex}`);

    // Print all IO Mappings
    console.log("IO Mappings:");
    printMappings(mode.modeMappings); // Assumes you have the printMappings function as previously defined
    
    if (bondingHandles) {
        console.log(`Physical default target is: ${deviceManager.getNameByBondingHandle(mode.defaultTarget)}`);
        console.log(`Physical mouse Target: ${deviceManager.getNameByBondingHandle(mode.mouseTarget)}`);
    } else {
        console.log(`Default Target Device Handle: ${deviceManager.getNameByDeviceHandle(mode.defaultTarget)}`);
        console.log(`Mouse Target: ${deviceManager.getNameByDeviceHandle(mode.mouseTarget)}`);
    }
    console.log(`Active Mouse: ${mode.activeMouse}`);
}

export function RingModeToNumberArray(mode: RingMode): number[] {
    const bytes: number[] = [];
    bytes.push(...numberToBytes(mode.modeIndex, 1));
    
    // Convert TimeoutOptions to 4 bytes
    bytes.push(...numberToBytes(mode.activeTimeoutS, 4));
    
    // The rest of the fields are 1 byte each
    bytes.push(mode.type, mode.color, mode.modeIndex);
    
    gestureOrder.forEach(gesture => {
        const mapping = mode.modeMappings[gesture];
        if (mapping) {
            // Assuming each field exists and is initialized as specified
            bytes.push(mapping.action, mapping.bonding, mapping.target, mapping.attribute);
        }
    });

    // Mouse targets
    bytes.push(mode.mouseTarget, mode.activeMouse);
    
    return bytes;
}

// Helper function to ensure numbers fit into the specified byte width
function numberToBytes(num: number, byteSize: number): number[] {
    const bytes = [];
    for (let i = 0; i < byteSize; i++) {
        bytes.push((num >> (8 * i)) & 0xFF);
    }
    return bytes;
}