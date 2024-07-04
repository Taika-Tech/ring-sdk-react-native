/* Enums.tsx
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

/* *********************** Rules *****************************
- This file must only contain enums
- naming convention:
    - PascalCase
    - descriptive
- Sort enums A-Z
*********************************************************** */

export enum Color {
    Red =       0x00,
    Green =     0x01,
    Blue =      0x02,
    Purple =    0x03,
    Teal =      0x04,
    Yellow =    0x05,
    Indigo =    0x06,
    Orange =    0x07,
    Pink =      0x08,
}

export enum ControlToClient {
    BLE_CONTROL_TO_CLIENT_CONFIRM_CONNECTION =                  0x00,
    BLE_CONTROL_TO_CLIENT_UPDATE_STATE =                        0x01,
    BLE_CONTROL_TO_CLIENT_PERFORM_MODE_ACTION =                 0x02,
    BLE_CONTROL_TO_CLIENT_HARDWARE_VERSIONINGS =                0x03,
    BLE_CONTROL_TO_CLIENT_CONFIRMED_BONDINGS =                  0x04,
    BLE_CONTROL_TO_CLIENT_SUCCESSFUL_BONDING =                  0x05,
    BLE_CONTROL_TO_CLIENT_PERFORM_INCREMENTAL_MODE_ACTION =     0x06,
    BLE_CONTROL_TO_CLIENT_UPDATE_ERROR =                        0x07,
    BLE_CONTROL_TO_CLIENT_UPDATE_CONFIRMED_CONNECTIONS =        0x08
}

export enum Handedness {
    leftHanded = 0,
    rightHanded = 1,
}

export enum IQS7211AGestures {
    azoteqTPGestureTap =                        0x00,
    azoteqTPGesturePressHold =                  0x01,
    azoteqTPGesturePressHoldBegin =             0x02,
    azoteqTPGesturePressHoldEnd =               0x03,
    azoteqTPGestureSwipeXNegative =             0x04,
    azoteqTPGestureSwipeXPositive =             0x05,
    azoteqTPGestureSwipeYPositive =             0x06,
    azoteqTPGestureSwipeYNegative =             0x07,
    taikaTPGestureSingleTap =                   0x08,
    taikaTPGestureDoubleTap =                   0x09,
    taikaTPGestureTripleTap =                   0x10,
    taikaTPGesturePressHold =                   0x11,
    taikaTPGesturePressHoldBegin =              0x12,
    taikaTPGesturePressHoldEnd =                0x13,
    taikaTPGestureSwipeXNegative =              0x14,
    taikaTPGestureSwipeXPositive =              0x15,
    taikaTPGestureSwipeYPositive =              0x16,
    taikaTPGestureSwipeYNegative =              0x17,
    taikaTPGestureSwipeAndHoldXNegative =       0x18,
    taikaTPGestureSwipeAndHoldXPositive =       0x19,
    taikaTPGestureSwipeAndHoldYPositive =       0x20,
    taikaTPGestureSwipeAndHoldYNegative =       0x21,
    tpGestureNone =                             0x22
}

/*
class MappingAction {
    private name: string;
    private actionEnum: number;
    private description: string;

    constructor(name: string, action: number) {
        this.name = name;
        this.actionEnum = action;
        this.description = "this";
    }

    getName(): string {
        return this.name;
    }

    getAction(): number {
        return this.actionEnum;
    }
}

export const Mappings: MappingAction[] {
    NoAction = new MappingAction("No Action", 0x00),
}

Mappings.NoAction.getName();
Mappings.NoAction.getAction();
*/

export enum MappingActions {
    // HID commands
    NoAction =              0x00,
    PlayPause =             0x01,
    NextSong =              0x02,
    PreviousSong =          0x03,
    VolumeUp =              0x04,
    VolumeDown =            0x05,
    LeftClick =             0x06,
    DoubleClick =           0x07,
    RightClick =            0x08,
    LeftKey =               0x09,
    RightKey =              0x0A,
    //UpKey =                 0x0B, //todo
    //DownKey =               0x0C, //todo
    swipeUp =               0x0D,
    swipeDown =             0x0E,
    swipeLeft =             0x0F,
    swipeRight =            0x10,

    HidAndTaikaDivider =        0x7F,
    // Taika API commands
    TurnLightsOn =              0x80, //not in use
    TurnLightsOff =             0x81, //not in use
    ToggleLights =              0x82, //not in use
    MQTT =                      0x83,
    TaikaAndPressAndHoldDivider = 0xAF,
    // Brightness =             0xB0, // Uncomment if needed later
    // Volume =                 0xB1,     // Uncomment if needed later
    DragAndDrop =               0xB2,
    Cursor =                    0xB3
}

export enum Gestures {
    singleTap =         0x08,
    doubleTap =         0x09,
    tripleTap =         0x0A,
    swipeUp =           0x06,
    swipeDown =         0x07,
    swipeLeft =         0x05,
    swipeRight =        0x04,
    pressAndHold =      0x01
}

export enum ModeIndex {
    modeOne =           0x00,
    modeTwo =           0x01,
    modeThree =         0x02,
}

export enum StateEnum {
    active =            0,
    idle =              1,
    sleep =             2,
    fault =             3,
    shutoff =           4,
    test =              5,
    charging =          6,
    stateCount =        7,
}

export enum TaikaConnectionType {
    other =             0x00,
    primaryPhone =      0x01,
    computer =          0x02,
    //TV =              0x03,
    //appleHomeHub =    0x04,
    otherPhone =        0x05,
    MQTT =              0x06,
    //endDeviceSplit =  0x7f,
    //locator =         0x80,
    //dongle =          0x81,
}

export enum TaikaModeType {
    MQTTControl =       0x00,
    ComputerMouse =     0x01,
    //TvControl =       0x02,
    PresentationTool =  0x03,
    //Sport =           0x04,
    Influencer =        0x05,
    Music =             0x06,
    //Custom =          0x07,
}

export enum TimeoutOptions {
    Timeout_1s =        1,
    Timeout_5s =        5,
    Timeout_10s =       10,
    Timeout_15s =       15,
    Timeout_20s =       20,
    Timeout_25s =       25,
    Timeout_30s =       30,
    Timeout_1min =      60,
    Timeout_2min =      120,
    Timeout_5min =      300,
    Timeout_1h =        3600,
}

/**
 * @enum TpEvent
 *
 * @brief Event mask and enum to use touch events in the code.
 *
 * Bitmasks allow us to represent multiple boolean flags in a single number. 
 * Each bit in the number represents a different flag.
 *
 * To set multiple events:
 *  let events: TouchEventMask = TouchEvent.TOUCH_START | TouchEvent.SINGLE_TAP | TouchEvent.SWIPE_UP;
 *
 * Check if an event bit is set:
 *  if (events & TouchEvent.SINGLE_TAP) {
 *    // Single tap event is set
 *  }
 */
export enum TouchEvent {
    TOUCH_ACTIVE = 1 << 0,          // 1st bit, hexadecimal 1
    TOUCH_START = 1 << 1,           // 2nd bit, hexadeciaml 2
    TOUCH_END = 1 << 2,             // 3rd bit, hexadecimal 4
    TOUCH_TOP = 1 << 3,             // 4th bit, hexadecimal 8 (0x00000008)
    TOUCH_SIDE = 1 << 4,            // 5th bit, hexadeciaml 10 (0x00000010)
  
    GESTURE_EVENT = 1 << 5,         // 6th bit, hex 20 
    LOW_POWER_OUTPUT = 1 << 6,      // 7th bit, hex 40 
  
    HOLD_START = 1 << 8,            // 9th bit, hex 80
    HOLD_RELEASE = 1 << 9,          // 10th bit, hex 100
    HOLD_ONGOING = 1 << 10,         // 11th bit, hex 200
  
    SINGLE_TAP = 1 << 11,           // 12th bit, hex 400
    DOUBLE_TAP = 1 << 12,           // 13th bit
    TRIPLE_TAP = 1 << 13,           // 14th bit
  
    // Slow swipes are WiP
    SLOW_SWIPE_UP = 1 << 16,        // 17th bit 
    SLOW_SWIPE_DOWN = 1 << 17,      // 18th bit 
    SLOW_SWIPE_LEFT = 1 << 18,      // 19th bit 
    SLOW_SWIPE_RIGHT = 1 << 19,     // 20st bit

    SWIPE_UP = 1 << 20,             // 18th bit
    SWIPE_DOWN = 1 << 21,           // 19th bit 
    SWIPE_LEFT = 1 << 22,           // 20th bit
    SWIPE_RIGHT = 1 << 23,          // 21st bit
  
    // Touchpads power mode
    PM_ACTIVE = 1 << 26,            // 22nd bit
    PM_IDLE = 1 << 27,              // 23rd bit
    PM_LOW_POWER = 1 << 28,         // 24th bit
    PM_TO_ACTIVE = 1 << 29,         // 25th bit
    PM_TO_IDLE = 1 << 30,           // 26th bit 
    PM_TO_LOW_POWER = 1 << 31       // 32nd bit
}
  
export type TouchEventMask = number;
  

export enum TouchLocations {
    NoTouch =           0x00,
    TopTouch =          0x01,
    SideTouch =         0x02
}

export enum TouchpadReadType {
    TP_default = 0x00,
    TP_counts = 0x01,
    TP_references = 0x02,
    TP_deltas = 0x03,
    TP_compensation= 0x04
}