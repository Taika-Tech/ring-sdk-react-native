/* RingModes.tsx
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

import { Color } from './ColorsConfig';
import { MQTTMapping, mouseMapping, presentationMapping, musicMapping, blankMapping, APPLICATION_DEVICE_HANDLE, influencerMapping } from './RingIOMappingsConfig';
import { IOMappings, RingMode } from '../Interfaces/Interfaces';
import { ModeIndex, TaikaModeType, TimeoutOptions } from '../Interfaces/Enums';

// Define the RingModes object with an explicit index signature
const defaultModes: RingMode[] = [
    {
        name: "MQTT",
        activeTimeoutS: TimeoutOptions.Timeout_10s,
        type: TaikaModeType.MQTTControl,
        color: Color.Yellow,
        modeMappings: { ...MQTTMapping },
        modeIndex: ModeIndex.modeOne,
        defaultTarget: APPLICATION_DEVICE_HANDLE,
        mouseTarget: APPLICATION_DEVICE_HANDLE,
        activeMouse: 0,
        uniqueID: 0,
    },
    {
        name: "Computer Mouse",
        activeTimeoutS: TimeoutOptions.Timeout_5s,
        type: TaikaModeType.ComputerMouse,
        color: Color.Green,
        modeMappings: { ...mouseMapping },
        modeIndex: ModeIndex.modeTwo,
        defaultTarget: APPLICATION_DEVICE_HANDLE,
        mouseTarget: APPLICATION_DEVICE_HANDLE,
        activeMouse: 1,
        uniqueID: 1,
    },/*
    {
        name: "TV Control",
        activeTimeoutS: TimeoutOptions.Timeout_10s,
        type: TaikaModeType.TvControl,
        color: Color.Blue,
        modeMappings: { ...blankMapping },
        modeIndex: ModeIndex.modeThree,
        defaultTarget: APPLICATION_DEVICE_HANDLE,
        mouseTarget: APPLICATION_DEVICE_HANDLE,
        activeMouse: 0,
        uniqueID: 2,
    },*/
    {
        name: "Presentation Tool",
        activeTimeoutS: TimeoutOptions.Timeout_15s,
        type: TaikaModeType.PresentationTool,
        color: Color.Purple,
        modeMappings: { ...presentationMapping },
        modeIndex: ModeIndex.modeOne,
        defaultTarget: APPLICATION_DEVICE_HANDLE,
        mouseTarget: APPLICATION_DEVICE_HANDLE,
        activeMouse: 0,
        uniqueID: 3,
    },/*
    {
        name: "Sport",
        activeTimeoutS: TimeoutOptions.Timeout_20s,
        type: TaikaModeType.Sport,
        color: Color.Indigo,
        modeMappings: { ...blankMapping },
        modeIndex: ModeIndex.modeOne,
        defaultTarget: APPLICATION_DEVICE_HANDLE,
        mouseTarget: APPLICATION_DEVICE_HANDLE,
        activeMouse: 0,
        uniqueID: 4,
    },*/
    {
        name: "Influencer",
        activeTimeoutS: TimeoutOptions.Timeout_10s,
        type: TaikaModeType.Influencer,
        color: Color.Yellow,
        modeMappings: { ...influencerMapping },
        modeIndex: ModeIndex.modeOne,
        defaultTarget: APPLICATION_DEVICE_HANDLE,
        mouseTarget: APPLICATION_DEVICE_HANDLE,
        activeMouse: 0,
        uniqueID: 5,
    },
    {
        name: "Music",
        activeTimeoutS: TimeoutOptions.Timeout_30s,
        type: TaikaModeType.Music,
        color: Color.Teal,
        modeMappings: { ...musicMapping },
        modeIndex: ModeIndex.modeOne,
        defaultTarget: APPLICATION_DEVICE_HANDLE,
        mouseTarget: APPLICATION_DEVICE_HANDLE,
        activeMouse: 0,
        uniqueID: 6,
    },
    {
        name: "Custom",
        activeTimeoutS: TimeoutOptions.Timeout_1min,
        type: TaikaModeType.Custom,
        color: Color.Red,
        modeMappings: { ...blankMapping },
        modeIndex: ModeIndex.modeOne,
        defaultTarget: APPLICATION_DEVICE_HANDLE,
        mouseTarget: APPLICATION_DEVICE_HANDLE,
        activeMouse: 0,
        uniqueID: 7,
    },
];

// Function to get default mappings by mode type
export function getDefaultMappingsByType(type: TaikaModeType): IOMappings {
    switch (type) {
        case TaikaModeType.MQTTControl:
            return { ...MQTTMapping };
        case TaikaModeType.ComputerMouse:
            return { ...mouseMapping };
        /*case TaikaModeType.TvControl:
            return { ...blankMapping }; // Assuming blankMapping is the default for TV Control*/
        case TaikaModeType.PresentationTool:
            return { ...presentationMapping };
        /*case TaikaModeType.Sport:
            return { ...presentationMapping };
        case TaikaModeType.Influencer:
            return { ...blankMapping }; // Using blankMapping for Sport and Influencer as an example*/
        case TaikaModeType.Music:
            return { ...musicMapping };
        case TaikaModeType.Custom:
            return { ...blankMapping }; // Default for custom types
        default:
            return { ...blankMapping }; // Safe default
    }
}


// Export the RingModes object
export default defaultModes;