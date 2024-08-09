/* BleDataParser.ts
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


import { gestureOrder } from '../Config/RingIOMappingsConfig';
import { Gestures, TouchEventMask, ModeIndex} from '../Interfaces/Enums';
import { ModeActionData, MotionData, TouchData, RingMode } from '../Interfaces/Interfaces';

import { logBLE } from '../Utils/Logging/TaikaLog';

/**
 * Parses mode action data from a byte array.
 * @param {number[]} byteArray - The input byte array containing mode action data.
 * @returns {ModeActionData | null} Parsed mode action data or null if input is invalid.
 */
export const parseModeActionData = (byteArray: number[]): ModeActionData | null => {
    if (byteArray.length < 6) {
         logBLE("Invalid byteArray length for parseModeActionData. Expected 6, got ", byteArray.length);
         return null;
    }

    const dataView = new DataView(new Uint8Array(byteArray).buffer);

    /* Data structure
    const action = byteArray[1]             // MappingActions
    const gesture: Gestures = byteArray[2]  // IQS7211AGestures
    const target = byteArray[3]             // Connection handle
    const modeIndex = byteArray[4]          // ModeIndex: 0, 1, or 2
    const attribute = byteArray[5]          // Unused
    */
    return {
        mode: dataView.getUint8(4) as ModeIndex,
        gesture: dataView.getUint8(2) as Gestures,
        isIncremental: false,
        incrementalStarted: false,
        rollPitchYaw: { x: 0, y: 0, z: 0},
    }
}

/**
 * Parses incremental action data from a byte array.
 * @param {number[]} byteArray - The input byte array containing incremental action data.
 * @returns {ModeActionData | null} Parsed incremental action data or null if input is invalid.
 */
export const parseIncrementalActionData = (byteArray: number[]): ModeActionData | null => {
    if (byteArray.length < 18) {
        logBLE("Invalid byteArray length for parseIncrementalActionData. Expected 18, got ", byteArray.length);
        return null;
    }

    const dataView = new DataView(new Uint8Array(byteArray).buffer);

    /* Data structure
    const actionIncremental = byteArray[1]            // MappingActions
    const gestureIncremental: Gestures = byteArray[2] // IQS7211AGestures
    const targetIncremental = byteArray[3]            // Connection handle
    const modeIndexIncremental = byteArray[4]         // ModeIndex: 0, 1, or 2
    const attributeIncremental = byteArray[5]         // Unused
    const isFirstPacketIncremental = byteArray[5] === 1 ? true : false;
    let eulersAngles: [number, number, number] = [0, 0, 0];
    */
    return {
        mode: dataView.getUint8(4) as ModeIndex,
        gesture: dataView.getUint8(2) as Gestures,
        isIncremental: true,
        incrementalStarted: dataView.getUint8(5) === 1,
        rollPitchYaw: {
            x: dataView.getFloat32(6, true),
            y: dataView.getFloat32(10, true),
            z: dataView.getFloat32(14, true),
        },
    };
};

/**
 * Parses touch data from a byte array.
 * @param {number[]} byteArray - The input byte array containing touch data.
 * @returns {TouchData | null} Parsed touch data or null if input is invalid.
 */
export const parseTouchData = (byteArray: number[]): TouchData | null => {
    if (byteArray.length < 19) { // TP data only
        logBLE("Invalid byteArray length for parseTouchData. Expected 19, got ", byteArray.length);
        return null;
    }

    const dataView = new DataView(new Uint8Array(byteArray).buffer);
  
    return {
        touchActive: !!dataView.getUint8(0), // Convert to boolean
        x: dataView.getUint16(1, true),
        y: dataView.getUint16(3, true),
        touchStrength: dataView.getUint16(5, true),
        timestamp: dataView.getUint32(15, true),
        touchpadEventMask: dataView.getUint32(11, true) as TouchEventMask,
    };
}

/**
 * Parses motion data from a byte array.
 * @param {number[]} byteArray - The input byte array containing motion data.
 * @returns {MotionData | null} Parsed motion data or null if input is invalid.
 */
export const parseMotionData = (byteArray: number[]): MotionData | null => {
    if (byteArray.length < 87) {
        logBLE("Invalid byteArray length for parseMotionData. Expected 87, got ", byteArray.length);
        return null;
    }

    const dataView = new DataView(new Uint8Array(byteArray).buffer);
  
    return {
        acc: {
            x: dataView.getFloat32(19, true),
            y: dataView.getFloat32(23, true),
            z: dataView.getFloat32(27, true),
        },
        gyro: {
            x: dataView.getFloat32(31, true),
            y: dataView.getFloat32(35, true),
            z: dataView.getFloat32(39, true),
        },
        mag: {
            x: dataView.getFloat32(43, true),
            y: dataView.getFloat32(47, true),
            z: dataView.getFloat32(51, true),
        },
        orientationRelative: {
            x: dataView.getFloat32(55, true),
            y: dataView.getFloat32(59, true),
            z: dataView.getFloat32(63, true),
            w: dataView.getFloat32(67, true),
        },
        orientationAbsolute: {
            x: dataView.getFloat32(71, true),
            y: dataView.getFloat32(75, true),
            z: dataView.getFloat32(79, true),
            w: dataView.getFloat32(83, true),
        },
    };
}

export function ringModeToNumberArray(mode: RingMode): number[] {
    const bytes: number[] = [];
    bytes.push(mode.modeIndex);
    
    // Convert TimeoutOptions to 4 bytes
    bytes.push(...numberToBytes(mode.activeTimeoutS, 4));
    
    // The rest of the fields are 1 byte each
    bytes.push(mode.type, mode.color, mode.modeIndex);
    
    gestureOrder.forEach((gesture: Gestures) => {
        const mapping = mode.modeMappings[gesture];
        if (mapping) {
            // Assuming each field exists and is initialized as specified
            bytes.push(mapping.action, mapping.bonding, mapping.target, mapping.attribute);
        } else {
            bytes.push(0, 0, 0, 0); // Push zeros for unmapped gestures
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


