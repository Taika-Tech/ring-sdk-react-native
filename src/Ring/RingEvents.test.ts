/* RingEvents.test.ts
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
import { ringEventHandler, onConnected, onDisconnected, onLowBattery, onNewData, onMotionEvent } from './RingEvents';

describe('Ring Event Handler', () => {
  beforeEach(() => {
    // Clear all events before each test
    ringEventHandler['events'] = {};
  });

  it('should trigger connected event', () => {
    const mockCallback = jest.fn();
    onConnected(mockCallback);

    ringEventHandler.trigger('connected-test');
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

  it('should trigger newData event with data', () => {
    const mockCallback = jest.fn();
    const data = { key: 'value' };
    onNewData(mockCallback);

    ringEventHandler.trigger('newData', data);
    expect(mockCallback).toHaveBeenCalledWith(data);
  });

  it('should trigger motionEvent event with vector data', () => {
    const mockCallback = jest.fn();
    const vector: [number, number, number] = [1, 2, 3];
    onMotionEvent(mockCallback);

    ringEventHandler.trigger('motionEvent', vector);
    expect(mockCallback).toHaveBeenCalledWith(vector);
  });

  it('should trigger multiple callbacks for the same event', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    onConnected(mockCallback1);
    onConnected(mockCallback2);

    ringEventHandler.trigger('connected-test');
    expect(mockCallback1).toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalled();
  });

  it('should not trigger removed callbacks', () => {
    const mockCallback = jest.fn();
    onConnected(mockCallback);
    ringEventHandler.off('connected', mockCallback);

    ringEventHandler.trigger('connected-test');
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle different data payloads', () => {
    const mockCallback = jest.fn();
    const data1 = { key: 'value1' };
    const data2 = { key: 'value2' };
    onNewData(mockCallback);

    ringEventHandler.trigger('newData', data1);
    expect(mockCallback).toHaveBeenCalledWith(data1);

    ringEventHandler.trigger('newData', data2);
    expect(mockCallback).toHaveBeenCalledWith(data2);
  });
});
