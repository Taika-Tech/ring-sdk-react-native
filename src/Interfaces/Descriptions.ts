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
import { MappingActions, Gestures, Color, ModeIndex, TaikaModeType, TimeoutOptions } from './Enums';

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
    [MappingActions.MQTT]: "MQTT",
    [MappingActions.TaikaAndPressAndHoldDivider]: "TaikaAndPressAndHoldDivider",
    [MappingActions.DragAndDrop]: "Drag And Drop",
    [MappingActions.Cursor]: "Cursor"
};

export const ColorDescriptions: { [key in Color]: string } = {
    [Color.Red]: "Red",
    [Color.Green]: "Green",
    [Color.Blue]: "Blue",
    [Color.Purple]: "Purple",
    [Color.Teal]: "Teal",
    [Color.Yellow]: "Yellow",
    [Color.Indigo]: "Indigo",
    [Color.Orange]: "Orange",
    [Color.Pink]: "Pink",
    //[Color.White]: "White",   white is a reserved color, not available as mode color
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

export const ModeIndexDescriptions: { [key in ModeIndex]: string } = {
    [ModeIndex.modeOne]: "Single tap mode",
    [ModeIndex.modeTwo]: "Double tap mode",
    [ModeIndex.modeThree]: "Triple tap mode",
    //[ModeTapIndex.currentMode]: "Current mode",
    //[ModeTapIndex.bigError]: "Error in tap mode",
};

export const ModeTypeDescriptions: { [key in TaikaModeType]: string } = {
    [TaikaModeType.MQTTControl]: "Home Assistant",
    [TaikaModeType.ComputerMouse]: "Computer Mouse",
    //[TaikaModeType.TvControl]: "TV Control",
    [TaikaModeType.PresentationTool]: "Presentation Tool",
    //[TaikaModeType.Sport]: "Sport",
    //[TaikaModeType.Influencer]: "Influencer",
    [TaikaModeType.Music]: "Music",
    [TaikaModeType.Custom]: "Custom"
};

export const ModeTypeDescriptionsExtended: { [key in TaikaModeType]: string } = {
    [TaikaModeType.MQTTControl]: "In MQTT mode, the app will relay the gestures to your smart home platform over MQTT. Specify your broker from the MQTT menu in settings tab of this app.",
    [TaikaModeType.ComputerMouse]: "In mouse mode, you can move the cursor by moving your finger in the air. You can view and modify clicking gestures from functions below.",
    //[TaikaModeType.TvControl]: "TV Control",
    [TaikaModeType.PresentationTool]: "Swipe to switch slides with Presentation Tool. You can point on the screen by pressing and holding the ring's touchpad.",
    //[TaikaModeType.Sport]: "Sport",
    //[TaikaModeType.Influencer]: "Flick through social media reels.",
    [TaikaModeType.Music]: "In music mode, you can tap to play/pause and swipe to switch the song. You can customize functionality from functions below.",
    [TaikaModeType.Custom]: "Use custom mode for making your own mode."
};

export const TimeoutOptionsDescriptions: { [key in TimeoutOptions]: string } = {
    [TimeoutOptions.Timeout_1s]: "1 sec",
    [TimeoutOptions.Timeout_5s]: "5 sec",
    [TimeoutOptions.Timeout_10s]: "10 sec",
    [TimeoutOptions.Timeout_15s]: "15 sec",
    [TimeoutOptions.Timeout_20s]: "20 sec",
    [TimeoutOptions.Timeout_25s]: "25 sec",
    [TimeoutOptions.Timeout_30s]: "30 sec",
    [TimeoutOptions.Timeout_1min]: "1 min",
    [TimeoutOptions.Timeout_2min]: "2 min",
    [TimeoutOptions.Timeout_5min]: "5 min",
    [TimeoutOptions.Timeout_1h]: "1 h",
};