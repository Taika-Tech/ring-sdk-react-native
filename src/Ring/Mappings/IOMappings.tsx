/* IOMappings.tsx
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

import { TaikaModeType } from '../Ring-Mode/ModeTypesObject';
import { ConnectedDevices } from '../../Integrations/ConnectedDevices';
import { IOMapping } from '../../Interfaces/Interfaces';
import { IOMappings } from '../../Interfaces/Interfaces';
import { ActionDescriptions, GestureDescriptions } from '../../Interfaces/Descriptions';
import { MappingActions, Gestures } from '../../Interfaces/Enums';
export const NO_BONDING: number = 255;
export const APPLICATION_DEVICE_HANDLE: number = 0; // The device handle of this application is hardcoded to 0, for instance, to initiate self as target at setup

// replace key number with key .tvcontrol ect
export const allowedActions: { [key: number]: MappingActions[] } = {
    [TaikaModeType.MQTTControl]: [
        MappingActions.NoAction, MappingActions.MQTT
    ],
    [TaikaModeType.ComputerMouse]: [
        MappingActions.NoAction, MappingActions.LeftKey, MappingActions.RightKey, MappingActions.Cursor, MappingActions.LeftClick, MappingActions.DoubleClick, MappingActions.RightClick
    ],
   /* [TaikaModeType.TvControl]: [
        MappingActions.NoAction, MappingActions.PlayPause
    ],*/
    [TaikaModeType.PresentationTool]: [
        MappingActions.NoAction, MappingActions.LeftKey, MappingActions.RightKey, MappingActions.Cursor, MappingActions.LeftClick, MappingActions.DoubleClick, MappingActions.RightClick
    ],
    /*[TaikaModeType.Sport]: [
        MappingActions.NoAction, MappingActions.PlayPause, MappingActions.NextSong, MappingActions.PreviousSong, MappingActions.VolumeUp, MappingActions.VolumeDown
    ],*/
    [TaikaModeType.Influencer]: [
        MappingActions.NoAction, MappingActions.PlayPause, MappingActions.NextSong, MappingActions.PreviousSong,
        MappingActions.VolumeUp, MappingActions.VolumeDown, MappingActions.LeftClick, MappingActions.DoubleClick,
        MappingActions.RightClick, MappingActions.DragAndDrop, MappingActions.Cursor, MappingActions.swipeUp, MappingActions.swipeDown,
        MappingActions.swipeLeft, MappingActions.swipeRight
    ],
    [TaikaModeType.Music]: [
        MappingActions.NoAction, MappingActions.PlayPause, MappingActions.NextSong, MappingActions.PreviousSong,
        MappingActions.VolumeUp, MappingActions.VolumeDown
    ],/*
    [TaikaModeType.Custom]: [
        MappingActions.NoAction, MappingActions.PlayPause, MappingActions.NextSong, MappingActions.PreviousSong,
        MappingActions.VolumeUp, MappingActions.VolumeDown, MappingActions.LeftClick, MappingActions.DoubleClick,
        MappingActions.RightClick, MappingActions.DragAndDrop, MappingActions.Cursor
    ]*/
};

export function PrintMapping(mode: IOMapping) {
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
        PrintMapping(mapping);
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

// Default mappings
export const musicMapping: IOMappings = {
    [Gestures.singleTap]: { action: MappingActions.PlayPause, gesture: Gestures.singleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.doubleTap]: { action: MappingActions.NextSong, gesture: Gestures.doubleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.tripleTap]: { action: MappingActions.PreviousSong, gesture: Gestures.tripleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeUp]: { action: MappingActions.VolumeUp, gesture: Gestures.swipeUp, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeDown]: { action: MappingActions.VolumeDown, gesture: Gestures.swipeDown, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeLeft]: { action: MappingActions.NextSong, gesture: Gestures.swipeLeft, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeRight]: { action: MappingActions.PreviousSong, gesture: Gestures.swipeRight, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.pressAndHold]: { action: MappingActions.NoAction, gesture: Gestures.pressAndHold, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
};

export const mouseMapping: IOMappings = {
    [Gestures.singleTap]: { action: MappingActions.LeftClick, gesture: Gestures.singleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.doubleTap]: { action: MappingActions.DoubleClick, gesture: Gestures.doubleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.tripleTap]: { action: MappingActions.RightClick, gesture: Gestures.tripleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeUp]: { action: MappingActions.NoAction, gesture: Gestures.swipeUp, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeDown]: { action: MappingActions.NoAction, gesture: Gestures.swipeDown, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeLeft]: { action: MappingActions.NoAction, gesture: Gestures.swipeLeft, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeRight]: { action: MappingActions.NoAction, gesture: Gestures.swipeRight, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.pressAndHold]: { action: MappingActions.DragAndDrop, gesture: Gestures.pressAndHold, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 }
};

export const blankMapping: IOMappings = {
    [Gestures.singleTap]: { action: MappingActions.NoAction, gesture: Gestures.singleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.doubleTap]: { action: MappingActions.NoAction, gesture: Gestures.doubleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.tripleTap]: { action: MappingActions.NoAction, gesture: Gestures.tripleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeUp]: { action: MappingActions.NoAction, gesture: Gestures.swipeUp, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeDown]: { action: MappingActions.NoAction, gesture: Gestures.swipeDown, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeLeft]: { action: MappingActions.NoAction, gesture: Gestures.swipeLeft, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeRight]: { action: MappingActions.NoAction, gesture: Gestures.swipeRight, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.pressAndHold]: { action: MappingActions.NoAction, gesture: Gestures.pressAndHold, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 }
};

export const MQTTMapping: IOMappings = {
    [Gestures.singleTap]: { action: MappingActions.MQTT, gesture: Gestures.singleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.doubleTap]: { action: MappingActions.MQTT, gesture: Gestures.doubleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.tripleTap]: { action: MappingActions.MQTT, gesture: Gestures.tripleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeUp]: { action: MappingActions.MQTT, gesture: Gestures.swipeUp, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeDown]: { action: MappingActions.MQTT, gesture: Gestures.swipeDown, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeLeft]: { action: MappingActions.MQTT, gesture: Gestures.swipeLeft, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeRight]: { action: MappingActions.MQTT, gesture: Gestures.swipeRight, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.pressAndHold]: { action: MappingActions.MQTT, gesture: Gestures.pressAndHold, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 }
};

export const presentationMapping: IOMappings = {
    [Gestures.singleTap]: { action: MappingActions.RightKey, gesture: Gestures.singleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.doubleTap]: { action: MappingActions.DoubleClick, gesture: Gestures.doubleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.tripleTap]: { action: MappingActions.NoAction, gesture: Gestures.tripleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeUp]: { action: MappingActions.NoAction, gesture: Gestures.swipeUp, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeDown]: { action: MappingActions.NoAction, gesture: Gestures.swipeDown, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeLeft]: { action: MappingActions.RightKey, gesture: Gestures.swipeLeft, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeRight]: { action: MappingActions.LeftKey, gesture: Gestures.swipeRight, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.pressAndHold]: { action: MappingActions.Cursor, gesture: Gestures.pressAndHold, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 }
};


export const influencerMapping: IOMappings = {
    [Gestures.singleTap]: { action: MappingActions.PlayPause, gesture: Gestures.singleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.doubleTap]: { action: MappingActions.NextSong, gesture: Gestures.doubleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.tripleTap]: { action: MappingActions.PreviousSong, gesture: Gestures.tripleTap, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeUp]: { action: MappingActions.swipeUp, gesture: Gestures.swipeUp, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeDown]: { action: MappingActions.swipeDown, gesture: Gestures.swipeDown, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeLeft]: { action: MappingActions.swipeLeft, gesture: Gestures.swipeLeft, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.swipeRight]: { action: MappingActions.swipeRight, gesture: Gestures.swipeRight, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
    [Gestures.pressAndHold]: { action: MappingActions.NoAction, gesture: Gestures.pressAndHold, bonding: APPLICATION_DEVICE_HANDLE, target: APPLICATION_DEVICE_HANDLE, attribute: 0 },
};
