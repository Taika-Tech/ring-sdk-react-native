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

// Interfaces used by the ledService
interface LedGeneralConfig {
  enLedOnWhenRingActive: boolean;
  enBlinkPeriodicallyWhenActive: boolean;
  enBlinkPeriodicallyWhenIdle: boolean;
  enMagCalibrationAnimation: boolean;
  disableSystemBehaviour: boolean;
  restoreDefaults: boolean;
}

interface LedTouchResponse {
  enActiveTouchAnimation: boolean;
  enGestureAnimations: boolean;
  enGestureAnimShowTapCount: boolean;
  enGestureAnimPressAndHold: boolean;
}

interface LedChargingConfig {
  enChargingAnimation: boolean;
  chargingAnimBrightness: number;  // 0-100 range
  chargingAnimStepMs: number;
}

interface LedColorConfig {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
}

interface LedBrightness {
  active: number;   // in promille (0-1000)
  idle: number;     // in promille (0-1000)
}

interface LedTiming {
  ledAnimationSpeedMultiplier: number;  // in promille (0-1000)
}

interface LedActivityBlinking {
  ringActiveIndicationBlinkIntervalMs: number;
  ringIdleIndicationBlinkIntervalMs: number;
}

export interface LedConfig {
  general: LedGeneralConfig;
  touchResponse: LedTouchResponse;
  charging: LedChargingConfig;
  colorConfig: LedColorConfig;
  brightness: LedBrightness;
  timing: LedTiming;
  activityIndication: LedActivityBlinking;
}

const ledServiceUUID: string = "ef6779a1-0566-4917-a12d-7388d7727d64";
const LedRGBCharacteristicUUID: string = "373a0e9b-5789-4439-90a9-9b6ae5d5f1a5";
const ledControlCharacteristicUUID: string = "751ec71e-c52c-40a2-9ec8-9fd5c9fbead8";

// BLE headers
const LED_CONFIG_WRITE_HEADER = 41;
const LED_CONFIG_READ_HEADER = 42;

// LED Register IDs used as BLE headers
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
   * Reads and parses the full LED configuration from the device.
   * @returns A promise that resolves to the LED configuration if successful, null otherwise.
   */
  public async readLedConfig(): Promise<LedConfig | null> {
    // First write the request header
    const success = await this.write([LED_CONFIG_WRITE_HEADER], ledControlCharacteristicUUID);
    if (!success) {
      console.error('Failed to write LED config request header');
      return null;
    }

    // Wait a bit for the device to prepare the data
    await new Promise(resolve => setTimeout(resolve, 100));

    // Read the configuration data
    const data = await this.read(ledControlCharacteristicUUID);
    if (!data) {
        console.error('Failed to read LED config data: no data received');
        return null;
    }
    if (data.length < 22) {
        console.error(`Invalid LED config data length: expected at least 22 bytes, got ${data.length}`);
        return null;
    }
    if (data[0] !== LED_CONFIG_READ_HEADER) {
        console.error(`Invalid LED config header: expected ${LED_CONFIG_READ_HEADER}, got ${data[0]}`);
        return null;
    }

    return this.parseLedConfig(data);
  }

  private parseLedConfig(data: number[]): LedConfig | null {
    try {
        let index = 1; // Skip header byte

        // Parse general config byte
        const generalByte = data[index++];
        const general: LedGeneralConfig = {
            enLedOnWhenRingActive: !!(generalByte & 0x01),
            enBlinkPeriodicallyWhenActive: !!(generalByte & 0x02),
            enBlinkPeriodicallyWhenIdle: !!(generalByte & 0x04),
            enMagCalibrationAnimation: !!(generalByte & 0x08),
            disableSystemBehaviour: !!(generalByte & 0x40),
            restoreDefaults: !!(generalByte & 0x80),
        };

        // Parse touch response byte
        const touchByte = data[index++];
        const touchResponse: LedTouchResponse = {
            enActiveTouchAnimation: !!(touchByte & 0x01),
            enGestureAnimations: !!(touchByte & 0x02),
            enGestureAnimShowTapCount: !!(touchByte & 0x04),
            enGestureAnimPressAndHold: !!(touchByte & 0x08),
        };

        // Parse charging config (4 bytes)
        const charging: LedChargingConfig = {
            enChargingAnimation: !!(data[index] & 0x01),
            chargingAnimBrightness: data[index + 1],
            chargingAnimStepMs: (data[index + 2] << 8) | data[index + 3],
        };
        index += 4;

        // Parse color config (3 bytes)
        const colorConfig: LedColorConfig = {
            r: data[index++],
            g: data[index++],
            b: data[index++],
        };

        // Parse brightness (4 bytes)
        const brightness: LedBrightness = {
            active: (data[index] << 8) | data[index + 1],
            idle: (data[index + 2] << 8) | data[index + 3],
        };
        index += 4;

        // Parse timing (4 bytes)
        const timing: LedTiming = {
            ledAnimationSpeedMultiplier: (data[index] << 8) | data[index + 1],
        };
        index += 4; // Skip reserved bytes

        // Parse activity blinking (4 bytes)
        const activityIndication: LedActivityBlinking = {
            ringActiveIndicationBlinkIntervalMs: (data[index] << 8) | data[index + 1],
            ringIdleIndicationBlinkIntervalMs: (data[index + 2] << 8) | data[index + 3],
        };

        return {
            general,
            touchResponse,
            charging,
            colorConfig,
            brightness,
            timing,
            activityIndication,
        };
    } catch (error) {
        console.error('Error parsing LED config:', error);
        return null;
    }
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
