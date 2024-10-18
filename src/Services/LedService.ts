/* LedService.ts
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

import BaseService from './BaseService';
  
const ledServiceUUID: string = "ef6779a1-0566-4917-a12d-7388d7727d64";
const LedRGBCharacteristicUUID: string = "373a0e9b-5789-4439-90a9-9b6ae5d5f1a5";
const ledControlCharacteristicUUID: string = "751ec71e-c52c-40a2-9ec8-9fd5c9fbead8";

// LED Register IDs
enum LedRegister {
  GENERAL_CONFIG = 100,
  TOUCH_RESPONSE,
  CHARGING_CONFIG,
  COLOR_CONFIG,
  BRIGHTNESS,
  TIMING,
  ACTIVITY_BLINKING
}

class LedService extends BaseService {
  constructor() {
    super(ledServiceUUID);
    this.addCharacteristic(LedRGBCharacteristicUUID);
    this.addCharacteristic(ledControlCharacteristicUUID);
  }

  /**
   * Turns the LED on.
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setLedOn(): Promise<boolean> {
    return await this.write([1], ledControlCharacteristicUUID);
  }

  /**
   * Turns the LED off.
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setLedOff(): Promise<boolean> {
    return await this.write([0], ledControlCharacteristicUUID);
  }

  /**
   * Sets the LED color using RGB values. 
   * The effect of this function is temporary, useful for continuous or frequent changing of the LED color
   * @param r Red component (0-255).
   * @param g Green component (0-255).
   * @param b Blue component (0-255).
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setLedRGB(r: number, g: number, b: number): Promise<boolean> {
    return await this.write([
      this.clamp(r, 0, 255), 
      this.clamp(g, 0, 255), 
      this.clamp(b, 0, 255)
    ], LedRGBCharacteristicUUID);
  } 

  /**
   * Restores default LED behavior.
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async restoreLedDefaults(): Promise<boolean> {
    const configByte = 128;
    return await this.write([LedRegister.GENERAL_CONFIG, configByte], ledControlCharacteristicUUID);
  }

  /**
   * Sets the default LED color. 
   * Note: the default color will be overridden by mode colors if default system behaviour is used.
   * @param r Red component (0-255).
   * @param g Green component (0-255).
   * @param b Blue component (0-255).
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setDefaultRGB(r: number, g: number, b: number): Promise<boolean> {
    return await this.write([
        LedRegister.COLOR_CONFIG, 
        this.clamp(r, 0, 255), 
        this.clamp(g, 0, 255), 
        this.clamp(b, 0, 255)
    ], ledControlCharacteristicUUID);
  }

  /**
   * Sets the LED default brightness levels.
   * @param active Brightness level for e.g. when ring is touched or showing a gesture (0.0 to 100.0).
   * Default: 15.0
   * @param idle Brightness level when the LED is idle (0.0 to 100.0).
   * Default: 1.0
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setDefaultBrightness(active: number, idle: number): Promise<boolean> {
    // Convert decimal percentages to promilles (0-1000 range)
    const activePromille = Math.round(this.clamp(active, 0, 100) * 10);
    const idlePromille = Math.round(this.clamp(idle, 0, 100) * 10);

    // Convert to 16-bit values
    const activeBytes = this.uint16ToBytes(activePromille);
    const idleBytes = this.uint16ToBytes(idlePromille);

    return await this.write([
        LedRegister.BRIGHTNESS,
        ...activeBytes,
        ...idleBytes
    ], ledControlCharacteristicUUID);
  }

  /**
   * Sets the LED to blink periodically. Blinking will happen with the default color.
   * @param intervalMs The interval between blinks in milliseconds.
   * @param onTimeMs The duration the LED stays on during each blink in milliseconds.
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setLedPeriodic(intervalMs: number, onTimeMs: number): Promise<boolean> {
    const data = [2, ...this.uint16ToBytes(intervalMs), ...this.uint16ToBytes(onTimeMs)];
    return await this.write(data, ledControlCharacteristicUUID);
  }

  /**
   * Configures general LED behavior.
   * 
   * @param ledOnWhenRingActive Determines if the LED should be on when the ring is active.
   * Default: true
   * @param blinkPeriodicallyWhenActive Determines if the LED should blink periodically when the ring is active.
   * Default: false
   * @param blinkPeriodicallyWhenIdle Determines if the LED should blink periodically when the ring is idle.
   * Default: false
   * @param magCalibrationAnimation Enables or disables the magnetometer calibration animation.
   * Default: true
   * @param disableSystemBehaviour Disables the default system LED behavior when true.
   * Default: false
   * @param restoreDefaults Restores the default settings of the LED module.
   * 
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setGeneralConfig(
    ledAlwaysOnWhenRingActive: boolean,
    blinkPeriodicallyWhenRingActive: boolean,
    blinkPeriodicallyWhenRingIdle: boolean,
    magCalibrationAnimation: boolean,
    disableSystemBehaviour: boolean,
    restoreDefaults: boolean
  ): Promise<boolean> {
    const configByte = 
      (ledAlwaysOnWhenRingActive ? 1 : 0) |
      (blinkPeriodicallyWhenRingActive ? 2 : 0) |
      (blinkPeriodicallyWhenRingIdle ? 4 : 0) |
      (magCalibrationAnimation ? 8 : 0) |
      (disableSystemBehaviour ? 64 : 0) |
      (restoreDefaults ? 128 : 0);
    return await this.write([LedRegister.GENERAL_CONFIG, configByte], ledControlCharacteristicUUID);
  }

  /**
   * Configures LED response to touch and gesture events.
   * 
   * @param activeTouchAnimation Enables or disables LED animation on active touch.
   * Default: true
   * @param gestureAnimations Enables or disables LED animations for gestures.
   * Default: true
   * @param showTapCount Determines if the LED should indicate the number of taps.
   * Default: false
   * @param showPressAndHold Determines if the LED should indicate press and hold gestures.
   * Default: true
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setTouchResponse(
    activeTouchAnimation: boolean,
    gestureAnimations: boolean,
    showTapCount: boolean,
    showPressAndHold: boolean
  ): Promise<boolean> {
    const configByte = 
      (activeTouchAnimation ? 1 : 0) |
      (gestureAnimations ? 2 : 0) |
      (showTapCount ? 4 : 0) |
      (showPressAndHold ? 8 : 0);
    return await this.write([LedRegister.TOUCH_RESPONSE, configByte], ledControlCharacteristicUUID);
  }

  /**
   * Configures LED behavior during charging.
   * 
   * @param enableChargingAnimation Enables or disables the LED animation during charging.
   * Default: true
   * @param chargingAnimBrightness Sets the brightness of the charging animation in % (0-100).
   * Default: 5 %
   * @param chargingAnimStepMs Sets the step duration, i.e. animation speed, of the charging animation in milliseconds.
   * Default: 400 ms
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setChargingAnimationConfig(
    enableChargingAnimation: boolean,
    chargingAnimBrightness: number,
    chargingAnimStepMs: number
  ): Promise<boolean> {
    const configByte = enableChargingAnimation ? 1 : 0;
    const data = [
      LedRegister.CHARGING_CONFIG,
      configByte, // This byte includes both en_charging_animation and reserved bits
      this.clamp(chargingAnimBrightness, 0, 100),
      ...this.uint16ToBytes(chargingAnimStepMs)
    ];
    return await this.write(data, ledControlCharacteristicUUID);
  }

  /**
   * Configures the general LED blinking/animation speed.
   * 
   * @param animationSpeedMultiplier LED animation speed multiplier in promilles (range 0 to 1000, 1% = 10units)
   * Default: 420 (42%)
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setAnimationSpeed(
    animationSpeedMultiplier: number,
  ): Promise<boolean> {
    const data = [
      LedRegister.TIMING,
      ...this.uint16ToBytes(this.clamp(animationSpeedMultiplier, 0, 1000)),
    ];
    return await this.write(data, ledControlCharacteristicUUID);
  }

  /**
   * Configures LED blinking timing for active and idle states.
   * 
   * For this config to have effect, you must have either
   * blinkPeriodicallyWhenRingActive or blinkPeriodicallyWhenRingIdle enabled.
   * 
   * @param activeIndicationIntervalMs Interval for LED indications when the ring is active, in milliseconds.
   * Default: 1 000 ms
   * @param idleIndicationIntervalMs Interval for LED indications when the ring is idle, in milliseconds.
   * Default: 5 000 ms
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  public async setStateIndicationTiming(
    activeIndicationIntervalMs: number,
    idleIndicationIntervalMs: number
  ): Promise<boolean> {
    const data = [
      LedRegister.ACTIVITY_BLINKING,
      ...this.uint16ToBytes(activeIndicationIntervalMs),
      ...this.uint16ToBytes(idleIndicationIntervalMs),

    ];
    return await this.write(data, ledControlCharacteristicUUID);
  }

  /**
   * Private helpers
   */

  private uint16ToBytes(value: number): number[] {
    return [(value >> 8) & 0xFF, value & 0xFF];
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }
}

export default LedService;
