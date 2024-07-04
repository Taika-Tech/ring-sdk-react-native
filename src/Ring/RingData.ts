/* RingData.ts
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

import { ringEventHandler } from './RingEvents';

/**  TODO: 
 * Fix logic like this: 
 * 1. Data arrives to BLE
 * 2. Update to Ring
 * 3. Ring triggers a motionEvent
 * 
 * getAcceleration should just fetch the data from ring. 
 * Or these functions could be implemented directly to Ring.tsx
 * 
 */

type Vector3 = [number, number, number];

class RingData {
    /**
     * Gets the current acceleration vector from the ring.
     * @returns {Vector3} The acceleration vector in m/s².
     * @throws {Error} Always throws an error as the function is not implemented.
     */
    getAcceleration(): Vector3 {
        // Placeholder implementation
        const data: Vector3 = [0, 0, 0]; // Dummy data
        // Trigger event
        ringEventHandler.trigger('motionEvent', data);
        return data;
    }

    /**
     * Gets the current rotation vector from the ring.
     * @returns {Vector3} The rotation vector in degrees per second (dps).
     * @throws {Error} Always throws an error as the function is not implemented.
     */
    getRotation(): Vector3 {
        // Placeholder implementation
        const data: Vector3 = [0, 0, 0]; // Dummy data
        // Trigger event
        ringEventHandler.trigger('motionEvent', data);
        return data;
    }
}

const ringData = new RingData();
export default ringData;

// Example usage:
// const acceleration = ringData.getAcceleration();
// const rotation = ringData.getRotation();
