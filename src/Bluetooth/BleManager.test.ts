/* BleManager.test.ts
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


import TaikaBleManager from './BleManager';
import { BleManager } from 'react-native-ble-plx';
import { RingVersion } from '../Interfaces/Interfaces';

// Mock the dependencies
jest.mock('react-native-ble-plx');
jest.mock('../Utils/Logging/TaikaLog', () => ({
    logBLE: jest.fn(),
}));
jest.mock('../Ring/Ring', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('./BleNotificationHandler');
jest.mock('./BleConnectionHandler');
jest.mock('../Services/ControlService');
jest.mock('../Services/DeviceInformationService');
jest.mock('../Services/ModeService');
jest.mock('../Services/BatteryService');

describe('TaikaBleManager', () => {
    let bleManager: TaikaBleManager;
    let mockRing: any;
    let mockConnectedDevices: any;
    let mockBatteryService: any;
    let mockControlService: any;
    let mockDeviceInfoService: any;
    let mockModeService: any;
    let mockBleManagerInstance: any;

    beforeEach(() => {
        TaikaBleManager.createInstance();
        bleManager = TaikaBleManager.getInstance();

        mockRing = { bleInfo: { id: 'test-id' } };
        mockConnectedDevices = {};
        mockBatteryService = { readBatteryLevel: jest.fn() };
        mockControlService = { updateMouseAxesAndSensitivity: jest.fn(), updateHandedness: jest.fn() };
        mockDeviceInfoService = { readFirmwareVersion: jest.fn() };
        mockModeService = { claimPrimary: jest.fn() };
        mockBleManagerInstance = new BleManager();
    });

    test('initialize sets up the manager correctly', async () => {
        await bleManager.initialize(
            mockRing,
            mockConnectedDevices,
            mockBatteryService,
            mockControlService,
            mockDeviceInfoService,
            mockModeService,
            mockBleManagerInstance
        );

        expect(bleManager.ringPaired()).toBeTruthy();
    });

    test('ringConnected returns false when not connected', () => {
        expect(bleManager.ringConnected()).toBeFalsy();
    });

    test('write method handles errors correctly', async () => {
        const mockWrite = jest.fn().mockRejectedValue(new Error('Write failed'));
        const mockTaikaRing = { writeCharacteristicWithResponseForService: mockWrite };
        
        // @ts-ignore - Typescript might complain about private property access
        bleManager['connectionHandler'] = { TaikaRing: mockTaikaRing };
        // @ts-ignore
        bleManager['ringReadyForReadWrite'] = true;

        await bleManager.write('testCharacteristic', [1, 2, 3], 'testService');
        
        expect(mockWrite).toHaveBeenCalled();
    });

    describe('ringReadyCB', () => {
        beforeEach(async () => {
            await bleManager.initialize(
                mockRing,
                mockConnectedDevices,
                mockBatteryService,
                mockControlService,
                mockDeviceInfoService,
                mockModeService,
                mockBleManagerInstance
            );
        });

        test('sets ringReadyForReadWrite to true', async () => {
            await bleManager.__test__ringReadyCB();
            // @ts-ignore - Accessing private property for testing
            expect(bleManager['ringReadyForReadWrite']).toBe(true);
        });

        test('reads firmware version', async () => {
            const mockVersion: RingVersion = {
                hardwareMainLetter: 'A',
                hardwareMainNumber: 1,
                hardwareTouchLetter: 'B',
                hardwareTouchNumber: 2,
                firmwareMajor: 3,
                firmwareMinor: 4,
                firmwarePatch: 5
            };      
            mockDeviceInfoService.readFirmwareVersion.mockResolvedValue(mockVersion);

            await bleManager.__test__ringReadyCB();

            expect(mockDeviceInfoService.readFirmwareVersion).toHaveBeenCalled();
            expect(bleManager.RingVersion).toEqual(mockVersion);
        });

        test('reads battery level', async () => {
            await bleManager.__test__ringReadyCB();

            expect(mockBatteryService.readBatteryLevel).toHaveBeenCalled();
        });

        test('claims primary mode', async () => {
            await bleManager.__test__ringReadyCB();

            expect(mockModeService.claimPrimary).toHaveBeenCalled();
        });

        test('notifies connecting completed callbacks', async () => {
            const mockCallback = jest.fn();
            // @ts-ignore - Accessing private property for testing
            bleManager['connectingCompletedCallbacks'].push(mockCallback);

            await bleManager.__test__ringReadyCB();

            expect(mockCallback).toHaveBeenCalled();
        });

        test('does not execute if services are undefined', async () => {
            // @ts-ignore - Setting private properties to undefined for testing
            bleManager['deviceInfoService'] = undefined;
            bleManager['controlService'] = undefined;
            bleManager['modeService'] = undefined;

            await bleManager.__test__ringReadyCB();

            // @ts-ignore - Accessing private property for testing
            expect(bleManager['ringReadyForReadWrite']).toBe(false);
            expect(mockDeviceInfoService.readFirmwareVersion).not.toHaveBeenCalled();
            expect(mockBatteryService.readBatteryLevel).not.toHaveBeenCalled();
            expect(mockModeService.claimPrimary).not.toHaveBeenCalled();
        });

        test('handles error when reading firmware version', async () => {
            mockDeviceInfoService.readFirmwareVersion.mockRejectedValue(new Error('Failed to read firmware version'));
    
            await bleManager.__test__ringReadyCB();
    
            expect(mockDeviceInfoService.readFirmwareVersion).toHaveBeenCalled();
            expect(bleManager.RingVersion).toBeUndefined();
        });

        test('continues execution even if battery read fails', async () => {
            mockBatteryService.readBatteryLevel.mockRejectedValue(new Error('Failed to read battery level'));

            await bleManager.__test__ringReadyCB();

            expect(mockBatteryService.readBatteryLevel).toHaveBeenCalled();
            expect(mockModeService.claimPrimary).toHaveBeenCalled();
        });
    });
});*/