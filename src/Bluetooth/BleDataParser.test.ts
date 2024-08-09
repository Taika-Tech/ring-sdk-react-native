/* BleDataParser.test.ts
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

import { parseModeActionData, parseIncrementalActionData, parseTouchData, parseMotionData, ringModeToNumberArray } from './BleDataParser';
import { musicMapping, gestureOrder } from '../Config/RingIOMappingsConfig';
import { Gestures, TouchEventMask, ModeIndex, TaikaModeType, TimeoutOptions } from '../Interfaces/Enums';
import { RingMode } from '../Interfaces/Interfaces';

describe('BleDataParser', () => {
  describe('parseModeActionData', () => {
    it('should parse valid mode action data', () => {
      const byteArray = [0, 1, 2, 3, 1, 5]; // Example data
      const result = parseModeActionData(byteArray);
      expect(result).toEqual({
        mode: 1 as ModeIndex,
        gesture: 2 as Gestures,
        isIncremental: false,
        incrementalStarted: false,
        rollPitchYaw: { x: 0, y: 0, z: 0 },
      });
    });

    it('should return null for invalid data length', () => {
      const byteArray = [0, 1, 2, 3, 4]; // Too short
      const result = parseModeActionData(byteArray);
      expect(result).toBeNull();
    });
  });

  describe('parseIncrementalActionData', () => {
    it('should parse valid incremental action data', () => {
      const byteArray = new Uint8Array([0, 1, 2, 3, 1, 1, 0, 0, 128, 63, 0, 0, 0, 64, 0, 0, 64, 64]); // Example data with float values
      const result = parseIncrementalActionData(Array.from(byteArray));
      expect(result).toEqual({
        mode: 1 as ModeIndex,
        gesture: 2 as Gestures,
        isIncremental: true,
        incrementalStarted: true,
        rollPitchYaw: { x: 1, y: 2, z: 3 },
      });
    });

    it('should return null for invalid data length', () => {
      const byteArray = [0, 1, 2, 3, 4, 5]; // Too short
      const result = parseIncrementalActionData(byteArray);
      expect(result).toBeNull();
    });
  });

  describe('parseTouchData', () => {
    it('should parse valid touch data', () => {
      const byteArray = new Uint8Array([1, 100, 0, 200, 0, 50, 0, 0, 0, 0, 0, 1, 0, 0, 0, 210, 2, 150, 73]); // Example data
      const result = parseTouchData(Array.from(byteArray));
      expect(result).toEqual({
        touchActive: true,
        x: 100,
        y: 200,
        touchStrength: 50,
        timestamp: 1234567890,
        touchpadEventMask: 1 as TouchEventMask,
      });
    });

    it('should return null for invalid data length', () => {
      const byteArray = [0, 1, 2, 3, 4, 5]; // Too short
      const result = parseTouchData(byteArray);
      expect(result).toBeNull();
    });
  });

  describe('parseMotionData', () => {
    it('should parse valid motion data', () => {
      const byteArray = new Uint8Array(87).fill(0);
      const dataView = new DataView(byteArray.buffer);
      dataView.setFloat32(19, 1, true);
      dataView.setFloat32(23, 2, true);
      dataView.setFloat32(27, 3, true);
      // ... set other values ...

      const result = parseMotionData(Array.from(byteArray));
      expect(result).toEqual({
        acc: { x: 1, y: 2, z: 3 },
        gyro: { x: 0, y: 0, z: 0 },
        mag: { x: 0, y: 0, z: 0 },
        orientationRelative: { x: 0, y: 0, z: 0, w: 0 },
        orientationAbsolute: { x: 0, y: 0, z: 0, w: 0 },
      });
    });

    it('should return null for invalid data length', () => {
      const byteArray = new Uint8Array(86).fill(0); // Too short
      const result = parseMotionData(Array.from(byteArray));
      expect(result).toBeNull();
    });
  });

  describe('ringModeToNumberArray', () => {
    it('should convert RingMode to number array correctly', () => {
      const ringMode: RingMode = {
        modeIndex: ModeIndex.modeTwo,
        activeTimeoutS: TimeoutOptions.Timeout_5s,
        type: TaikaModeType.Music,
        color: 3,
        modeMappings: musicMapping,
        mouseTarget: 5,
        activeMouse: 6,
        name: 'Test Mode',
        defaultTarget: 0,
        uniqueID: 7
      };
  
      const result = ringModeToNumberArray(ringMode);
  
      // Check basic properties
      expect(result[0]).toBe(ModeIndex.modeTwo);
      expect(result.slice(1, 5)).toEqual([5, 0, 0, 0]); // TimeoutOptions.Timeout_5s in little-endian
      expect(result[5]).toBe(TaikaModeType.Music);
      expect(result[6]).toBe(3); // color
      expect(result[7]).toBe(ModeIndex.modeTwo); // modeIndex again
  
      // Check modeMappings
      let offset = 8; // Start after the basic properties
      gestureOrder.forEach((gesture: Gestures) => {
        const mapping = musicMapping[gesture];
        if (mapping) {
          expect(result[offset]).toBe(mapping.action);
          expect(result[offset + 1]).toBe(mapping.bonding);
          expect(result[offset + 2]).toBe(mapping.target);
          expect(result[offset + 3]).toBe(mapping.attribute);
          offset += 4;
        }
      });
  
      // Check mouse properties
      expect(result[result.length - 2]).toBe(5); // mouseTarget
      expect(result[result.length - 1]).toBe(6); // activeMouse
  
      // Check total length
      const expectedLength = 8 + (gestureOrder.length * 4) + 2;
      expect(result.length).toBe(expectedLength);
    });
  
    it('should handle empty modeMappings correctly', () => {
      const ringMode: RingMode = {
        modeIndex: ModeIndex.modeOne,
        activeTimeoutS: TimeoutOptions.Timeout_10s,
        type: TaikaModeType.Custom,
        color: 1,
        modeMappings: {},
        mouseTarget: 0,
        activeMouse: 0,
        name: 'Empty Mode',
        defaultTarget: 0,
        uniqueID: 8
      };
  
      const result = ringModeToNumberArray(ringMode);
  
      // Basic checks
      expect(result[0]).toBe(ModeIndex.modeOne);
      expect(result.slice(1, 5)).toEqual([10, 0, 0, 0]); // TimeoutOptions.Timeout_10s in little-endian
      expect(result[5]).toBe(TaikaModeType.Custom);
      expect(result[6]).toBe(1); // color
      expect(result[7]).toBe(ModeIndex.modeOne);
  
      // Check that all gesture mappings are zero
      const mappingStart = 8;
      const mappingEnd = mappingStart + (gestureOrder.length * 4);
      const mappingSection = result.slice(mappingStart, mappingEnd);
      expect(mappingSection).toEqual(new Array(gestureOrder.length * 4).fill(0));
  
      // Check mouse properties
      expect(result[result.length - 2]).toBe(0); // mouseTarget
      expect(result[result.length - 1]).toBe(0); // activeMouse

      // Check total length
      const expectedLength = 8 + (gestureOrder.length * 4) + 2;
      expect(result.length).toBe(expectedLength);
    });
  });
});