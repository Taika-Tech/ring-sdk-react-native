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

import { IOMapping, IOMappings } from '../Interfaces/Interfaces';
import { MappingActions, Gestures, TaikaModeType } from '../Interfaces/Enums';

export const NO_BONDING: number = 255;
export const APPLICATION_DEVICE_HANDLE: number = 0; // The device handle of this application is hardcoded to 0, for instance, to initiate self as target at setup

// This is needed below to make sure gestures are in the correct order
export const gestureOrder: Gestures[] = [
    Gestures.singleTap,
    Gestures.doubleTap,
    Gestures.tripleTap,
    Gestures.swipeUp,
    Gestures.swipeDown,
    Gestures.swipeLeft,
    Gestures.swipeRight,
    Gestures.pressAndHold
];

// replace key number with key .tvcontrol ect
export const allowedActions: { [key: number]: MappingActions[] } = {
    [TaikaModeType.MQTTControl]: [
        MappingActions.NoAction, MappingActions.MQTT
    ],
    [TaikaModeType.ComputerMouse]: [
        MappingActions.NoAction, MappingActions.LeftKey, MappingActions.RightKey, MappingActions.Cursor, MappingActions.LeftClick, MappingActions.DoubleClick, MappingActions.RightClick, MappingActions.DragAndDrop, 
    ],
   /* [TaikaModeType.TvControl]: [
        MappingActions.NoAction, MappingActions.PlayPause
    ],*/
    [TaikaModeType.PresentationTool]: [
        MappingActions.NoAction, MappingActions.LeftKey, MappingActions.RightKey, MappingActions.Cursor, MappingActions.LeftClick, MappingActions.DoubleClick, MappingActions.RightClick
    ],
    /*[TaikaModeType.Sport]: [
        MappingActions.NoAction, MappingActions.PlayPause, MappingActions.NextSong, MappingActions.PreviousSong, MappingActions.VolumeUp, MappingActions.VolumeDown
    ],*//*
    [TaikaModeType.Influencer]: [
        MappingActions.NoAction, MappingActions.PlayPause, MappingActions.NextSong, MappingActions.PreviousSong,
        MappingActions.VolumeUp, MappingActions.VolumeDown, MappingActions.LeftClick, MappingActions.DoubleClick,
        MappingActions.RightClick, MappingActions.DragAndDrop, MappingActions.Cursor, 
        MappingActions.swipeUp, MappingActions.swipeDown, MappingActions.swipeLeft, MappingActions.swipeRight
    ],*/
    [TaikaModeType.Music]: [
        MappingActions.NoAction, MappingActions.PlayPause, MappingActions.NextSong, MappingActions.PreviousSong,
        MappingActions.VolumeUp, MappingActions.VolumeDown
    ],
    [TaikaModeType.Custom]: [
        MappingActions.NoAction, MappingActions.PlayPause, MappingActions.NextSong, MappingActions.PreviousSong,
        MappingActions.VolumeUp, MappingActions.VolumeDown, MappingActions.LeftClick, MappingActions.DoubleClick,
        MappingActions.RightClick, MappingActions.DragAndDrop, MappingActions.Cursor,
        MappingActions.swipeUp, MappingActions.swipeDown, MappingActions.swipeLeft, MappingActions.swipeRight
    ]
};

// Utility function to create mappings without hardtyping all parameters
function createMapping(actions: Partial<Record<Gestures, MappingActions>>): IOMappings {
    const defaultAction: Omit<IOMapping, 'gesture'> = {
        action: MappingActions.NoAction,
        bonding: APPLICATION_DEVICE_HANDLE,
        target: APPLICATION_DEVICE_HANDLE,
        attribute: 0
    };

    return (Object.values(Gestures) as Gestures[]).reduce((acc, gesture) => {
        acc[gesture] = {
            ...defaultAction,
            gesture,
            action: actions[gesture] || MappingActions.NoAction
        };
        return acc;
    }, {} as IOMappings);
}

export const blankMapping = createMapping({});

export const musicMapping = createMapping({
    [Gestures.singleTap]: MappingActions.PlayPause,
    [Gestures.doubleTap]: MappingActions.NextSong,
    [Gestures.tripleTap]: MappingActions.PreviousSong,
    [Gestures.swipeUp]: MappingActions.VolumeUp,
    [Gestures.swipeDown]: MappingActions.VolumeDown,
    [Gestures.swipeLeft]: MappingActions.NextSong,
    [Gestures.swipeRight]: MappingActions.PreviousSong
});

export const mouseMapping = createMapping({
    [Gestures.singleTap]: MappingActions.LeftClick,
    [Gestures.doubleTap]: MappingActions.DoubleClick,
    [Gestures.tripleTap]: MappingActions.RightClick,
    [Gestures.pressAndHold]: MappingActions.DragAndDrop
});

export const MQTTMapping = createMapping(
    (Object.values(Gestures) as Gestures[]).reduce((acc, gesture) => {
        acc[gesture] = MappingActions.MQTT;
        return acc;
    }, {} as Record<Gestures, MappingActions>)
);

export const presentationMapping = createMapping({
    [Gestures.singleTap]: MappingActions.RightKey,
    [Gestures.doubleTap]: MappingActions.DoubleClick,
    [Gestures.swipeLeft]: MappingActions.RightKey,
    [Gestures.swipeRight]: MappingActions.LeftKey,
    [Gestures.pressAndHold]: MappingActions.Cursor
});
/*
export const influencerMapping = createMapping({
    [Gestures.singleTap]: MappingActions.PlayPause,
    [Gestures.doubleTap]: MappingActions.NextSong,
    [Gestures.tripleTap]: MappingActions.PreviousSong,
    [Gestures.swipeUp]: MappingActions.swipeUp,
    [Gestures.swipeDown]: MappingActions.swipeDown,
    [Gestures.swipeLeft]: MappingActions.swipeLeft,
    [Gestures.swipeRight]: MappingActions.swipeRight
});
*/