/* RingTimeOutsObject.tsx
 *  * 
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

import { TimeoutOptions } from '../../Interfaces/Enums';

const TimeoutOptionsDescriptions: { [key in TimeoutOptions]: string } = {
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

export { TimeoutOptions, TimeoutOptionsDescriptions };
