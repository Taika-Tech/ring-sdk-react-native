/* LEDColorsObject.tsx
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
import { Color } from '../../Interfaces/Enums';

const ColorDescriptions: { [key in Color]: string } = {
    [Color.Red]: "Red",
    [Color.Green]: "Green",
    [Color.Blue]: "Blue",
    [Color.Purple]: "Purple",
    [Color.Teal]: "Teal",
    [Color.Yellow]: "Yellow",
    [Color.Indigo]: "Indigo",
    [Color.Orange]: "Orange",
    [Color.Pink]: "Pink",
    //[Color.White]: "White",   white is a reserved color, not available as mode color
};

const ColorStyling: { [index: number]: string } = {
    [Color.Red]: "#FF453A",
    [Color.Green]: "#30D158",
    [Color.Blue]: "#0A84FF",
    [Color.Purple]: "#BF5AF2",
    [Color.Teal]: "#64D2FF",
    [Color.Yellow]: "#FFD60A",
    [Color.Indigo]: "#5E5CE6",
    [Color.Orange]: "#FF9F0A",
    [Color.Pink]: "#FF2D55",
    //[Color.White]: "white",   white is a reserved color, not available as mode color
};

export { Color, ColorDescriptions, ColorStyling };