/* RingEvents.ts
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

import { ModeActionData, MotionData, TouchData } from '../Interfaces/Interfaces';

type EventCallback = (...args: any[]) => void;

class RingEventHandler {
    private events: { [key: string]: EventCallback[] } = {};

    on(event: string, callback: EventCallback): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event: string, callback: EventCallback): void {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    trigger(event: string, ...args: any[]): void {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(...args));
    }
}

export const ringEventHandler = new RingEventHandler();

export function onConnected(callback: () => void): void {
    ringEventHandler.on('connected', callback);
}

export function onDisconnected(callback: () => void): void {
    ringEventHandler.on('disconnected', callback);
}

export function onLowBattery(callback: () => void): void {
    ringEventHandler.on('lowBattery', callback);
}

export function onMotionEvent(callback: (data: MotionData) => void): void {
    ringEventHandler.on('motionEvent', callback);
  }

export function onTouchEvent(callback: (data: TouchData) => void): void {
    ringEventHandler.on('touchEvent', callback);
}

export function onModeActionEvent(callback: (data: ModeActionData) => void): void {
    ringEventHandler.on('modeActionEvent', callback);
}
