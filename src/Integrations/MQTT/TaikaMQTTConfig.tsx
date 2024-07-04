/* TaikaMQTTConfig.tsx
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
import { MQTTTopicsConfig } from '../../Interfaces/Interfaces';

class MQTTTopics {
    ringName: string;
    ringConfigs: { [key: number]: MQTTTopicsConfig };
    commandTopics: { [key: number]: string };
    configTopics: { [key: number]: string };
    STATUS_TOPIC: string;

    constructor(ringName: string) {
        this.ringName = ringName;
        this.STATUS_TOPIC = `taika/rings/${ringName}/status`;

        this.ringConfigs = {
            0: {
                name: "Ring Mode 1",
                unique_id: `${ringName}-mode1`,
                state_topic: `taika/rings/${ringName}_MODE1/state`,
                availability: { topic: `taika/rings/${ringName}/status` },
                event_types: [
                    "Single tap", "Double tap", "Triple tap",
                    "Swipe up", "Swipe down", "Swipe left", "Swipe right", "Press & hold", "No gesture"
                ]
            },
            1: {
                name: "Ring Mode 2",
                unique_id: `${ringName}-mode2`,
                state_topic: `taika/rings/${ringName}_MODE2/state`,
                availability: { topic: `taika/rings/${ringName}/status` },
                event_types: [
                    "Single tap", "Double tap", "Triple tap",
                    "Swipe up", "Swipe down", "Swipe left", "Swipe right", "Press & hold", "No gesture"
                ]
            },
            2: {
                name: "Ring Mode 3",
                unique_id: `${ringName}-mode3`,
                state_topic: `taika/rings/${ringName}_MODE3/state`,
                availability: { topic: `taika/rings/${ringName}/status` },
                event_types: [
                    "Single tap", "Double tap", "Triple tap",
                    "Swipe up", "Swipe down", "Swipe left", "Swipe right", "Press & hold", "No gesture"
                ]
            }
        };

        this.commandTopics = {
            0: `taika/rings/${ringName}_MODE1/state`,
            1: `taika/rings/${ringName}_MODE2/state`,
            2: `taika/rings/${ringName}_MODE3/state`
        };

        this.configTopics = {
            0: `homeassistant/event/${ringName}_MODE1/config`,
            1: `homeassistant/event/${ringName}_MODE2/config`,
            2: `homeassistant/event/${ringName}_MODE3/config`
        };
    }
}

export default MQTTTopics;
