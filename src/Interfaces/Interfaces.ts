// Interfaces.tsx
/* Interfaces.tsx
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
import { Color, Handedness, MappingActions, 
    Gestures, ModeIndex, TaikaConnectionType, 
    TaikaModeType, TimeoutOptions, TouchEventMask, 
 } from './Enums';
import GenericDataController from '../Utils/Data/GenericDataController';

/* *********************** Rules *****************************
- This file must only contain interfaces
- naming convention:
    - PascalCase
    - descriptive
- Sort interfaces A-Z
*********************************************************** */

export interface AppConfig {
    ringName:               string;
}

export interface Controllers {
    [key: string]:          GenericDataController;
}

export interface ConnectedDevice {
    name:                   string;
    type:                   TaikaConnectionType;
    bondingHandle:          number; // Physical device 
    deviceHandle:           number; // Unique ID, always 0 for the primary device
}

export interface DataConfiguration {
    tableName:              string;
    fields:                 string[];
    types:                  string[];
    primaryKey:             string[];
    defaultData:            { [key: string]: any };
}

export { Handedness };

export interface IOMapping {
    modeID?:                number;
    action:                 MappingActions;
    gesture:                Gestures;
    bonding:                number; // NO_BONDING as default
    target:                 number; // NO_BONDING as default
    attribute:              number; // 0 as default
}

export type IOMappings = {
    [key in Gestures]?:     IOMapping;
}

export interface ModeActionData {
    mode:               ModeIndex,
    gesture:            Gestures,
    isIncremental:      boolean,
    incrementalStarted: boolean,
    rollPitchYaw:       Vector3,
}

export interface MotionData {
    acc: Vector3,
    gyro: Vector3,
    mag: Vector3,
    orientationRelative: Vector4,
    orientationAbsolute: Vector4,
}
  
export interface MouseConfig {
    id:                     number;
    xSpeed:                 number;
    ySpeed:                 number;
    xAcceleration:          number;
    yAcceleration:          number;
    quaternion:             number;
    flipXAxis:              number;
    flipYAxis:              number;
}

export interface MQTTConfiguration {
    brokerIP:               string;
    port:                   number;
    clientID:               string;
    username:               string;
    password:               string;
    //connection handle
    // name
}

export interface MQTTTopicsConfig {
    availability:           { topic: string };
    event_types:            string[];
    name:                   string;
    state_topic:            string;
    unique_id:              string;
}

export interface RingBleConfig {
    sqlIdentifier:          number;
    id:                     string;
    name:                   string;
}

export interface RingMode {                             // 41 bytes
    name:                   string;                     // only on app
    activeTimeoutS:         TimeoutOptions;             // 4 bytes
    type:                   TaikaModeType;              // 1 byte
    color:                  Color;                      // 1 byte
    modeIndex:              ModeIndex;                  // 1 byte
    modeMappings:           IOMappings;                 // 8 x 4 bytes = 32 bytes
    defaultTarget:          number;                     // The device handle
    mouseTarget:            number;                     // 1 byte
    activeMouse:            number;                     // 1 byte
    uniqueID:               number,
}

export interface RingModes {
    id:                     number;
    ringModeOne:            number;
    ringModeTwo:            number;
    ringModeThree:          number;
}

export interface RingVersion {
    hardwareMainLetter:     string;
    hardwareMainNumber:     number;
    hardwareTouchLetter:    string;
    hardwareTouchNumber:    number;
    firmwareMajor:          number;
    firmwareMinor:          number;
    firmwarePatch:          number;
}

export interface TableColumn {
    name:                   string;
    type:                   'INTEGER' | 'TEXT' | 'REAL' | 'BLOB';
    primaryKey?:            boolean;
    notNull?:               boolean;
}

export interface TableRowItem {
    key:                    string;
    title:                  string;
    titleTwo?:              string;
    type:                   string;
    onPress?:               () => void;
}

export interface TouchTimestampedEventMask {
    currentEvents: TouchEventMask;
    eventTimestamp: number;
}


export interface TouchData {
    touchActive:        boolean,
    x:                  number,
    y:                  number,
    touchStrength:      number,
    timestamp:          number,
    touchpadEventMask:  TouchEventMask,
}

export interface Vector3 {
    x: number, 
    y: number, 
    z: number 
}

export interface Vector4 {
    x: number, 
    y: number, 
    z: number, 
    w: number
}
