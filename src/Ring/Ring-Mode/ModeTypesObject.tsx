/* ModeTypesObject.tsx
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

import { TaikaModeType } from '../../Interfaces/Enums';

const TaikaModeTypeDescriptions: { [key in TaikaModeType]: string } = {
    [TaikaModeType.MQTTControl]: "Home Assistant",
    [TaikaModeType.ComputerMouse]: "Computer Mouse",
    //[TaikaModeType.TvControl]: "TV Control",
    [TaikaModeType.PresentationTool]: "Presentation Tool",
    //[TaikaModeType.Sport]: "Sport",
    [TaikaModeType.Influencer]: "Influencer",
    [TaikaModeType.Music]: "Music",
    //[TaikaModeType.Custom]: "Custom"
};

/*
const ModeIcons: { [key in TaikaModeType]: string } = {
    [TaikaModeType.MQTTControl]: "wifi",
    [TaikaModeType.ComputerMouse]: "mouse",
    [TaikaModeType.PresentationTool]: "movie",
    [TaikaModeType.Music]: "music-note",
    [TaikaModeType.Custom]: "create"
};
*/
const TaikaModeTypeDescriptionsExtended: { [key in TaikaModeType]: string } = {
    [TaikaModeType.MQTTControl]: "In MQTT mode, the app will relay the gestures to your smart home platform over MQTT. Specify your broker from the MQTT menu in settings tab of this app.",
    [TaikaModeType.ComputerMouse]: "In mouse mode, you can move the cursor by moving your finger in the air. You can view and modify clicking gestures from functions below.",
    //[TaikaModeType.TvControl]: "TV Control",
    [TaikaModeType.PresentationTool]: "Swipe to switch slides with Presentation Tool. You can point on the screen by pressing and holding the ring's touchpad.",
    //[TaikaModeType.Sport]: "Sport",
    [TaikaModeType.Influencer]: "Influencer",
    [TaikaModeType.Music]: "In music mode, you can tap to play/pause and swipe to switch the song. You can customize functionality from functions below.",
    //[TaikaModeType.Custom]: "Use custom mode for making your own mode."
};

export { TaikaModeType, TaikaModeTypeDescriptions, TaikaModeTypeDescriptionsExtended };
