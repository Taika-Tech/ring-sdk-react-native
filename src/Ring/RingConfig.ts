/* RingConfig.ts
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

/**
 * Turns off the ring.
 * @throws {Error} Always throws an error as the function is not implemented.
 */
export function RingOff(): void {
    throw new Error("RingOff is not implemented yet.");
}

/**
 * Sets the ring to idle mode.
 * @throws {Error} Always throws an error as the function is not implemented.
 */
export function RingIdle(): void {
    throw new Error("RingIdle is not implemented yet.");
}

/**
 * Sets the idle update interval for the ring.
 * @param {number} interval - The update interval in milliseconds (min 20ms).
 * @throws {Error} Always throws an error as the function is not implemented.
 */
export function RingSetIdleUpdateInterval(interval: number): void {
    if (typeof interval !== 'number') {
        throw new TypeError("interval must be a number.");
    } 
    if (interval < 20) {
        interval = 20;
        // Do warning instead of error?
        throw new TypeError("interval must be at least 20 (ms)");
    }
    if (interval > 10000) {
        interval = 10000;
        // Do warning instead of error?
        throw new TypeError("interval must be under 10000 (ms)");
    }
    // TODO: do something with interval
    
    throw new Error("RingSetIdleUpdateInterval is not implemented yet.");
}

/**
 * Sets the active update interval for the ring.
 * @param {number} interval - The update interval in milliseconds (min 20ms).
 * @throws {Error} Always throws an error as the function is not implemented.
 */
export function RingSetActiveUpdateInterval(interval: number): void {
    if (typeof interval !== 'number') {
        throw new TypeError("interval must be a number.");
    } 
    if (interval < 20) {
        interval = 20;
        // Do warning instead of error?
        throw new TypeError("interval must be at least 20 (ms)");
    }
    if (interval > 10000) {
        interval = 10000;
        // Do warning instead of error?
        throw new TypeError("interval must be under 10000 (ms)");
    }
    throw new Error("RingSetActiveUpdateInterval is not implemented yet.");
}

/**
 * Sets the data rate for the ring's sensor.
 * @param {number} dataRate - The sensor ODR in Hz (0.0 to 100.0).
 * @throws {Error} Always throws an error as the function is not implemented.
 */
export function RingSetDataRate(dataRate: number): void {
    if (typeof dataRate !== 'number' || dataRate < 0.0 || dataRate > 100.0) {
        throw new TypeError("dataRate must be a number between 0.0 and 100.0.");
    }
    throw new Error("RingSetDataRate is not implemented yet.");
}

/**
 * Enables power saving mode on the ring.
 * @throws {Error} Always throws an error as the function is not implemented.
 */
export function RingSetPowerSaving(): void {
    throw new Error("RingSetPowerSaving is not implemented yet.");
}
