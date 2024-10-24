/* TableConfigurations.tsx
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

import { DataConfiguration } from '../Interfaces/Interfaces';

// LED config is a bit more complex so we define it first on its own
export const ledConfigTableConfig: DataConfiguration = {
    tableName: 'LedConfiguration',
    fields: [
        'id',
        'generalConfig',
        'touchResponse',
        'chargingConfig',
        'colorConfig',
        'brightness',
        'timing',
        'activityIndication'
    ],
    types: [
        'INTEGER',
        'TEXT',  // JSON string for complex objects
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT'
    ],
    primaryKey: ['id'],
    defaultData: {
        id: 1,
        generalConfig: JSON.stringify({
            enLedOnWhenRingActive: true,
            enBlinkPeriodicallyWhenActive: false,
            enBlinkPeriodicallyWhenIdle: false,
            enMagCalibrationAnimation: true,
            disableSystemBehaviour: false,
            restoreDefaults: false
        }),
        touchResponse: JSON.stringify({
            enActiveTouchAnimation: true,
            enGestureAnimations: true,
            enGestureAnimShowTapCount: false,
            enGestureAnimPressAndHold: true
        }),
        chargingConfig: JSON.stringify({
            enChargingAnimation: true,
            chargingAnimBrightness: 5,
            chargingAnimStepMs: 400
        }),
        colorConfig: JSON.stringify({
            r: 128,
            g: 0,
            b: 128
        }),
        brightness: JSON.stringify({
            active: 150,  // 15.0%
            idle: 10     // 1.0%
        }),
        timing: JSON.stringify({
            ledAnimationSpeedMultiplier: 420
        }),
        activityIndication: JSON.stringify({
            ringActiveIndicationBlinkIntervalMs: 1000,
            ringIdleIndicationBlinkIntervalMs: 5000
        })
    }
};

export const tableConfigurations: { [key: string]: DataConfiguration }  = {
    appConfig: {
        tableName: 'AppConfig',
        fields: ['id', 'ringName'],
        types: ['INTEGER', 'TEXT'],
        primaryKey: ['id'],
        defaultData: {
            id: 1,
            ringName: "My Taika Ring",
        }
    },
    confirmedDevices: {
        tableName: 'ConfirmedDevices',
        fields: ['deviceHandle', 'name', 'type', 'bondingHandle'],
        types: ['INTEGER', 'TEXT', 'INTEGER', 'INTEGER'],
        primaryKey: ['deviceHandle'],
        defaultData: {},
    },
    unconfirmedDevices: {
        tableName: 'UnconfirmedDevices',
        fields: ['deviceHandle', 'name', 'type', 'bondingHandle'],
        types: ['INTEGER', 'TEXT', 'INTEGER', 'INTEGER'],
        primaryKey: ['deviceHandle'],
        defaultData: {},
    },
    mqttConfiguration: {
        tableName: 'MQTTConfiguration',
        fields: ['brokerIP', 'port', 'clientID', 'username', 'password'],
        types: ['TEXT', 'INTEGER', 'TEXT', 'TEXT', 'TEXT'],
        primaryKey: ['brokerIP, port'],
        defaultData: {
            brokerIP: '1.2.3.4',
            port: 1884,
            clientID: 'TaikaRing',
            username: 'username',
            password: 'password'
        }
    },
    mouseConfiguration: {
        tableName: 'MouseConfiguration',
        fields: ['id', 'xSpeed', 'ySpeed', 'xAcceleration', 'yAcceleration', 'quaternion', 'flipXAxis', 'flipYAxis'],
        types: ['INTEGER', 'REAL', 'REAL', 'REAL', 'REAL', 'REAL', 'INTEGER', 'INTEGER'],
        primaryKey: ['id'],
        defaultData: {
            id: 1, 
            xSpeed: 6.0,
            ySpeed: 8.0,
            xAcceleration: 1.4,
            yAcceleration: 1.4,
            quaternion: 0.1,
            flipXAxis: 1,
            flipYAxis: 0,
        }
    },
    handedness: {
        tableName: 'Handedness',
        fields: ['id', 'userHandedness'],
        types: ['INTEGER', 'INTEGER'],
        primaryKey: ['id'],
        defaultData: {
            id: 1,
            userHandedness: 1   // Right handed
        }
    },
    currentRingModes: {
        tableName: 'CurrentApplicationModes',
        fields: ['id','ringModeOne', 'ringModeTwo', 'ringModeThree'],
        types: ['INTEGER', 'INTEGER', 'INTEGER', 'INTEGER'],
        primaryKey: ['id'],
        defaultData: {
            id: 1,
            ringModeOne: 6,     // Music
            ringModeTwo: 0,     // MQTT
            ringModeThree: 1    // Mouse
        }
    },
    allModes: {
        tableName: 'AllModes',
        fields: ['uniqueID', 'name', 'type', 'activeTimeoutS', 'color', 'modeIndex', 'defaultTarget', 'mouseTarget', 'activeMouse'],
        types: ['INTEGER', 'TEXT', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER'],
        primaryKey: ['uniqueID'],
        defaultData: {}
    },
    IOMappings: {
        tableName: 'IOMappings',
        fields: ['modeID', 'action', 'attribute', 'bonding', 'gesture', 'target'],
        types: ['INTEGER', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER', 'INTEGER'],
        primaryKey: ['modeID, gesture'],
        defaultData: {}
    },
    ringBleInfo: {
        tableName: 'BLEInfo',
        fields: ['sqlIdentifier', 'id, name'],
        types: ['INTEGER', 'TEXT', 'TEXT'],
        primaryKey: ['id'],
        defaultData: {
            sqlIdentifier: 0,
            id: "N/A",
            name: "Taika Ring",
        }
    },
    ledConfiguration: ledConfigTableConfig, // LED configuration defined above is added to this list for easy access
};

export default tableConfigurations;
// Export defaults configurations separately
export const defaultAppConfig = tableConfigurations.appConfig.defaultData;
export const defaultMouseConfig = tableConfigurations.mouseConfiguration.defaultData;
export const defaultMQTTConfig = tableConfigurations.mqttConfiguration.defaultData;
export const defaultHandedness = tableConfigurations.handedness.defaultData;
export const defaultRingModes = tableConfigurations.currentRingModes.defaultData;
export const defaultBleConfig = tableConfigurations.ringBleInfo.defaultData;
export const defaultLedConfig = ledConfigTableConfig.defaultData;