/* HelperPrints.tsx
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

import { ConnectedDevices } from "../../Integrations/ConnectedDevices";
import { ActionDescriptions, ColorDescriptions, GestureDescriptions, ModeTypeDescriptions, TimeoutOptionsDescriptions } from "../../Interfaces/Descriptions";
import { IOMapping, IOMappings, RingMode, RingVersion } from "../../Interfaces/Interfaces";
import { MQTTMapping, blankMapping, mouseMapping, musicMapping, presentationMapping } from "../../Config/RingIOMappingsConfig";

export function printRingVersion(description: string, ringVersion: RingVersion): void {
    console.log(`${description}.
\t HW: ${ringVersion.hardwareMainLetter}.${ringVersion.hardwareMainNumber}:${ringVersion.hardwareTouchLetter}.${ringVersion.hardwareTouchNumber} \t FW: ${ringVersion.firmwareMajor}:${ringVersion.firmwareMinor}:${ringVersion.firmwarePatch}`);
}

export function printMode(mode: RingMode, bondingHandles: boolean = false) {
    const deviceManager = ConnectedDevices.getInstance();

    console.log("Mode Details:");
    console.log(`Name: ${mode.name}`);
    console.log(`Active Timeout: ${TimeoutOptionsDescriptions[mode.activeTimeoutS]}`);
    console.log(`Type: ${ModeTypeDescriptions[mode.type]}`);
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


export function printMapping(mode: IOMapping) {
    // Retrieve the description for the action
    const actionDescription = ActionDescriptions[mode.action] || "Unknown Action";
    // Retrieve the description for the gesture
    const gestureDescription = GestureDescriptions[mode.gesture] || "Unknown Gesture";
    const deviceManager = ConnectedDevices.getInstance(); // Singleton instance of ConnectedDevices
    const deviceName = deviceManager.getNameByDeviceHandle(mode.target);

    console.log(`    "${actionDescription}"(${mode.action}) with "${gestureDescription}"(${mode.gesture}) for ${deviceName} (${mode.target}:${mode.bonding}). Attribute: ${mode.attribute}`);
}

export function printMappings(mappings: IOMappings) {
    console.log("IOMappings Overview:");
    Object.entries(mappings).forEach(([gestureType, mapping]) => {
        console.log(`${gestureType}:`);
        printMapping(mapping);
    });
}

export const printDefaultMappings = () => {
    //logMappings("Printing default mappings -------------------------");

    const allMappings = {
        musicMapping,
        mouseMapping,
        blankMapping,
        MQTTMapping,
        presentationMapping
    };

    Object.entries(allMappings).forEach(([mappingName, mappings]) => {
        //logMappings(`\n${mappingName}:`);
        Object.entries(mappings).forEach(([gesture, mappingDetails]) => {
            //logMappings(`${gesture}: Action ${mappingDetails.action}, Gesture ${mappingDetails.gesture}`);
        });
    });
};

