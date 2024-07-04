/* Descriptions.tsx
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
import { MappingActions, Gestures } from './Enums';

// This file has been left in progress since it was a low priority.

export const ActionDescriptions: { [key in MappingActions]: string } = {
    [MappingActions.NoAction]: "No Action",
    [MappingActions.PlayPause]: "Play/Pause",
    [MappingActions.NextSong]: "Next Song",
    [MappingActions.PreviousSong]: "Previous Song",
    [MappingActions.VolumeUp]: "Volume Up",
    [MappingActions.VolumeDown]: "Volume Down",
    [MappingActions.LeftClick]: "Left Click",
    [MappingActions.DoubleClick]: "Double Click",
    [MappingActions.RightClick]: "Right Click",
    [MappingActions.LeftKey]: "Left Key",
    [MappingActions.RightKey]: "Right Key",
    //[MappingActions.UpKey]: "Up Key",
    //[MappingActions.DownKey]: "Down Key",
    [MappingActions.swipeDown]: "Swipe Down",
    [MappingActions.swipeUp]: "Swipe Up",
    [MappingActions.swipeLeft]: "Swipe Left",
    [MappingActions.swipeRight]: "Swipe Right",
    [MappingActions.HidAndTaikaDivider]: "HidAndTaikaDivider",
    [MappingActions.TurnLightsOn]: "Turn Lights On",
    [MappingActions.TurnLightsOff]: "Turn Lights Off",
    [MappingActions.ToggleLights]: "Toggle Lights",
    [MappingActions.MQTT]: "MQTT",
    [MappingActions.TaikaAndPressAndHoldDivider]: "TaikaAndPressAndHoldDivider",
    [MappingActions.DragAndDrop]: "Drag And Drop",
    [MappingActions.Cursor]: "Cursor"
};

export const GestureDescriptions: { [key in Gestures]: string } = {
    [Gestures.singleTap]: "Single Tap",
    [Gestures.doubleTap]: "Double Tap",
    [Gestures.tripleTap]: "Triple Tap",
    [Gestures.swipeUp]: "Swipe Up",
    [Gestures.swipeDown]: "Swipe Down",
    [Gestures.swipeLeft]: "Swipe Left",
    [Gestures.swipeRight]: "Swipe Right",
    [Gestures.pressAndHold]: "Press & Hold"
};

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