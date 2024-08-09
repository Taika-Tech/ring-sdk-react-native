/* RingEvents.test.ts
 *
 * Copyright Taika Tech 2024
 *
 * This software is licensed under dual licensing terms:
 *
 * 1. MIT License:
 * - when used for personal use,
 * - when used for educational use,
 * - when used with Taika Tech's smart rings,
 *
 * See the LICENSE file for the full text of the MIT License.
 *
 * 2. Taika Software License 1 (TSL1):
 * - This license applies to the use of the Software with other manufacturers' smart rings, or other
 * typically finger-worn or wrist-worn devices, and requires a separate commercial license from Taika Tech Oy.
 * - Contact sales@taikatech.fi to acquire such a license.
 * - See the COMMERCIAL_LICENSE file for the full text of the TSL1.
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { ringEventHandler, onConnected, onDisconnected, onLowBattery, onMotionEvent, onTouchEvent, onModeActionEvent } from './RingEvents';
import { MotionData, TouchData, ModeActionData } from '../Interfaces/Interfaces';
import { Gestures, ModeIndex } from '../Interfaces/Enums';

describe('Ring Event Handler', () => {
  beforeEach(() => {
    // Clear all events before each test
    ringEventHandler['events'] = {};
  });

  it('should trigger connected event', () => {
    const mockCallback = jest.fn();
    onConnected(mockCallback);
    ringEventHandler.trigger('connected');
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should trigger disconnected event', () => {
    const mockCallback = jest.fn();
    onDisconnected(mockCallback);
    ringEventHandler.trigger('disconnected');
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should trigger lowBattery event', () => {
    const mockCallback = jest.fn();
    onLowBattery(mockCallback);
    ringEventHandler.trigger('lowBattery');
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should trigger motionEvent with MotionData', () => {
    const mockCallback = jest.fn();
    const motionData: MotionData = {
      acc: { x: 1, y: 2, z: 3 },
      gyro: { x: 4, y: 5, z: 6 },
      mag: { x: 7, y: 8, z: 9 },
      orientationRelative: { x: 10, y: 11, z: 12, w: 13 },
      orientationAbsolute: { x: 14, y: 15, z: 16, w: 17 }
    };
    onMotionEvent(mockCallback);
    ringEventHandler.trigger('motionEvent', motionData);
    expect(mockCallback).toHaveBeenCalledWith(motionData);
  });

  it('should trigger touchEvent with TouchData', () => {
    const mockCallback = jest.fn();
    const touchData: TouchData = {
      touchActive: true,
      x: 100,
      y: 200,
      touchStrength: 50,
      timestamp: 1234567890,
      touchpadEventMask: 1 // Assuming 1 is a valid TouchEventMask value
    };
    onTouchEvent(mockCallback);
    ringEventHandler.trigger('touchEvent', touchData);
    expect(mockCallback).toHaveBeenCalledWith(touchData);
  });

  it('should trigger modeActionEvent with ModeActionData', () => {
    const mockCallback = jest.fn();
    const modeActionData: ModeActionData = {
      mode: ModeIndex.modeOne,
      gesture: Gestures.singleTap, 
      isIncremental: false,
      incrementalStarted: false,
      rollPitchYaw: { x: 0, y: 0, z: 0 }
    };
    onModeActionEvent(mockCallback);
    ringEventHandler.trigger('modeActionEvent', modeActionData);
    expect(mockCallback).toHaveBeenCalledWith(modeActionData);
  });

  it('should trigger multiple callbacks for the same event', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    onConnected(mockCallback1);
    onConnected(mockCallback2);
    ringEventHandler.trigger('connected');
    expect(mockCallback1).toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalled();
  });

  it('should not trigger removed callbacks', () => {
    const mockCallback = jest.fn();
    onConnected(mockCallback);
    ringEventHandler.off('connected', mockCallback);
    ringEventHandler.trigger('connected');
    expect(mockCallback).not.toHaveBeenCalled();
  });
});