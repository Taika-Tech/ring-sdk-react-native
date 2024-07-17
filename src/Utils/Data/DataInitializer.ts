/* DataInitializer.ts
 * 
 * Copyright Taika Tech Oy 2024.
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

// src/Utils/DataInitializer.ts
import GenericDataController from './GenericDataController';
import {
    AppConfig,
    MQTTConfiguration,
    MouseConfig,
    Handedness,
    RingModes,
    IOMapping,
    RingBleConfig,
    RingMode,
    Controllers
} from '../../Interfaces/Interfaces';
import {
    defaultAppConfig,
    defaultMQTTConfig,
    defaultMouseConfig,
    defaultHandedness,
    defaultRingModes,
    defaultBleConfig,
    tableConfigurations
} from '../../Config/TableConfigurations';
import { Gestures, TaikaModeType } from '../../Interfaces/Enums';
import defaultModes from '../../Ring/Ring-Mode/RingModes';
import { IOMappings } from '../../Interfaces/Interfaces';
import { musicMapping, mouseMapping, MQTTMapping, influencerMapping, presentationMapping, blankMapping } from '../../Ring/Mappings/IOMappings';
import { logApp } from '../Logging/TaikaLog';

class DataInitializer {
    private controllers: { [key: string]: GenericDataController } = {};

    public async initializeData(): Promise<{ [key: string]: GenericDataController }> {
        /*
        Object.keys(tableConfigurations).forEach((key) => {
            this.controllers[key] = new GenericDataController(tableConfigurations[key]);
            logApp(this.controllers[key]);
        });*/
        // Dynamically create a controller for each table configuration
        this.controllers = Object.keys(tableConfigurations).reduce((acc: Controllers, key: string) => {
            acc[key] = new GenericDataController(tableConfigurations[key]);
            return acc;
        }, {});

        return this.controllers;
    }


    public async initializeRingConfig(): Promise<{
        appConfig: AppConfig;
        ringModes: RingModes;
        mouseConfig: MouseConfig;
        handedness: Handedness;
    }> {
        let appConfig = defaultAppConfig as AppConfig;
        let ringModes = defaultRingModes as RingModes;
        let mouseConfig = defaultMouseConfig as MouseConfig;
        let handedness = defaultHandedness.userHandedness;

        try {
            const appConfigData = await this.controllers["appConfig"].getData();
            const currentRingModesData = await this.controllers["currentRingModes"].getData();
            const mouseConfigData = await this.controllers["mouseConfiguration"].getData();
            const handednessData = await this.controllers["handedness"].getData();

            if (appConfigData.length > 0) appConfig = appConfigData[0];
            if (currentRingModesData.length > 0) ringModes = currentRingModesData[0];
            if (mouseConfigData.length > 0) mouseConfig = mouseConfigData[0];
            if (handednessData.length > 0) handedness = handednessData[0].userHandedness;
        } catch (error) {
            console.error("Failed to initialize Ring config:", error);
        }

        return { appConfig, ringModes, mouseConfig, handedness };
    }

    public async initializeModesAndMappings(): Promise<{
        allModes: { [uniqueID: string]: RingMode };
        ioMappings: IOMapping[];
    }> {
        let allModes: { [uniqueID: string]: RingMode } = {};
        let ioMappings: IOMapping[] = [];

        try {
            const modesData = await this.controllers["allModes"].getData();
            const ioMappingsData = await this.controllers["IOMappings"].getData();

            if (modesData.length > 0) {
                modesData.forEach(mode => {
                    allModes[mode.uniqueID] = { ...mode, modeMappings: {} };
                });
            } else {
                for (const mode of defaultModes) {
                    allModes[mode.uniqueID] = mode;
                    const { modeMappings, ...modeData } = mode; // Extract only relevant mode data
                    await this.controllers["allModes"].saveData(modeData, "uniqueID = ?", [mode.uniqueID]);
                }
            }

            if (ioMappingsData.length > 0) {
                ioMappingsData.forEach(mapping => {
                    const mode = allModes[mapping.modeID];
                    if (mode) {
                        const gestureKey: Gestures = mapping.gesture;
                        mode.modeMappings[gestureKey] = mapping;
                        ioMappings.push(mapping as IOMapping);
                    }
                });
            } else {
                for (const mode of Object.values(allModes)) {
                    const defaultMappings = this.getDefaultMappingsForMode(mode.type);
                    for (const [gesture, mapping] of Object.entries(defaultMappings)) {
                        if (mapping != undefined) {
                            mapping.modeID = mode.uniqueID;
                            ioMappings.push(mapping);
                            await this.controllers["IOMappings"].saveData(mapping, "modeID = ? AND gesture = ?", [mapping.modeID, mapping.gesture]);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to initialize Modes and Mappings:", error);
        }

        return { allModes, ioMappings };
    }

    public async initializeMQTTConfig(): Promise<MQTTConfiguration> {
        let mqttConfig = defaultMQTTConfig as MQTTConfiguration;
        try {
            const mqttConfigData = await this.controllers["mqttConfiguration"].getData();
            if (mqttConfigData.length > 0) {
                mqttConfig = mqttConfigData[0];
            }
        } catch (error) {
            console.error("Failed to initialize MQTT data:", error);
        }
        return mqttConfig;
    }

    public async initializeBLEConfig(): Promise<RingBleConfig> {
        let bleInfo = defaultBleConfig as RingBleConfig;
        try {
            const bleInfoData = await this.controllers["ringBleInfo"].getData();
            if (bleInfoData.length > 0) {
                bleInfo = bleInfoData[0];
            }
        } catch (error) {
            console.error("Failed to initialize BLE data:", error);
        }
        return bleInfo;
    }

    private getDefaultMappingsForMode(modeType: number): IOMappings {
        switch (modeType) {
            case TaikaModeType.Music:
                return musicMapping;
            case TaikaModeType.ComputerMouse:
                return mouseMapping;
            case TaikaModeType.MQTTControl:
                return MQTTMapping;
            case TaikaModeType.PresentationTool:
                return presentationMapping;
            case TaikaModeType.Influencer:
                return influencerMapping;
            default:
                return blankMapping;
        }
    }
}

export default DataInitializer;
