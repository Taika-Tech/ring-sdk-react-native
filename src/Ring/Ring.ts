// Ring.ts
// Copyritght Taika Tech - license notice at the bottom of the file

// Imports
import TaikaBleManager from '../Bluetooth/BleManager';
import GenericDataController from '../Utils/Data/GenericDataController';
import {
    AppConfig,
    IOMappings,
    MouseConfig,
    MQTTConfiguration,
    RingMode,
    RingModes,
    IOMapping,
    RingBleConfig,
    RingVersion
} from '../Interfaces/Interfaces';
import * as DefaultConfigs from '../Config/TableConfigurations';
import { logRing } from '../Utils/Logging/TaikaLog';
import { Handedness, ModeIndex, TaikaModeType } from '../Interfaces/Enums';
import { debounce } from 'lodash';
import * as Mappings from '../Config/RingIOMappingsConfig';
import { ConnectedDevices } from '../Integrations/ConnectedDevices';
import ControlService from '../Services/ControlService';
import BatteryService from '../Services/BatteryService';
import ModeService from '../Services/ModeService';
import DataInitializer from '../Utils/Data/DataInitializer';
import DeviceInformationService from '../Services/DeviceInformationService';
import DataService from '../Services/DataService';
import LedService, { LedConfig } from '../Services/LedService';
import OtaDfuService from '../Services/OtaDfuService';
import { BleManager } from 'react-native-ble-plx';
import ConfigService from '../Services/ConfigService';


class Ring {
    private static instance: Ring;
    private observers: (() => void)[] = [];

    // BLE & Services
    private bleManager: TaikaBleManager | undefined;
    public devInfoService: DeviceInformationService = new DeviceInformationService();
    public controlService: ControlService = new ControlService();
    public batteryService: BatteryService = new BatteryService();
    public modeService: ModeService = new ModeService();
    public dataService: DataService = new DataService();
    public ledService: LedService = new LedService();
    public otaService: OtaDfuService = new OtaDfuService();
    private configService: ConfigService = new ConfigService();

    // Data controllers for persistent storage
    private controllers: { [key: string]: GenericDataController } = {};

    // Configuration variables
    public appConfig: AppConfig = DefaultConfigs.defaultAppConfig as AppConfig;
    public mqttConfig: MQTTConfiguration = DefaultConfigs.defaultMQTTConfig as MQTTConfiguration;
    public mouseConfig: MouseConfig = DefaultConfigs.defaultMouseConfig as MouseConfig;
    public handedness: Handedness = DefaultConfigs.defaultHandedness.userHandedness;
    public ringModes: RingModes = DefaultConfigs.defaultRingModes as RingModes;
    public allModes: { [uniqueID: string]: RingMode } = {};
    public ioMappings: IOMapping[] = [];
    public bleInfo: RingBleConfig = DefaultConfigs.defaultBleConfig as RingBleConfig;
    public ledConfig: LedConfig = DefaultConfigs.defaultLedConfig as LedConfig;

    // Debounced function for updating mouse configuration
    private debouncedUpdateMouseConfig: ((data: MouseConfig) => void) | undefined;

    /**
     * Private constructor to enforce singleton pattern.
     * Doesn't initialize anything, calling Ring.initialize(args) is required.
     */
    private constructor() {
    }

    /**
     * Gets the singleton instance of the Ring class.
     * Creates an instance of the Ring class if it doesn't already exist.
     * @param context - Context object containing data controllers.
     * @returns The singleton instance.
     */
    public static getInstance(): Ring {
        if (!Ring.instance) {
            Ring.instance = new Ring();
        }
        return Ring.instance;
    }

    public async initialize(manager: BleManager): Promise<void> {
        const dataInitializer = new DataInitializer();
        this.controllers = await dataInitializer.initializeData();

        const { appConfig, ringModes, mouseConfig, handedness } = await dataInitializer.initializeRingConfig();
        this.appConfig = appConfig;
        this.ringModes = ringModes;
        this.mouseConfig = mouseConfig;
        this.handedness = handedness;

        this.ledConfig = await dataInitializer.initializeLedConfig();

        const { allModes, ioMappings } = await dataInitializer.initializeModesAndMappings();
        this.allModes = allModes;
        this.ioMappings = ioMappings;

        // Moving MQTT out of SDK
        //this.mqttConfig = await dataInitializer.initializeMQTTConfig();

        this.bleInfo = await dataInitializer.initializeBLEConfig();

        // These need to be initialized before setting up services
        const connectedDevices = ConnectedDevices.createInstance(this.controllers);
        this.bleManager = TaikaBleManager.createInstance();
        await this.bleManager.initialize(this, connectedDevices, this.batteryService, this.controlService, this.devInfoService, this.modeService, manager);
        logRing("BLE init through");

        this.devInfoService.setBleManager(this.bleManager);
        this.controlService.setBleManager(this.bleManager);
        this.batteryService.setBleManager(this.bleManager);
        this.modeService.setBleManager(this.bleManager);
        this.dataService.setBleManager(this.bleManager);
        this.ledService.setBleManager(this.bleManager);
        this.otaService.setBleManager(this.bleManager);
        this.configService.setBleManager(this.bleManager);

        this.controlService.setConnectedDevices(connectedDevices);
        this.modeService.setConnectedDevices(connectedDevices);


        // Set up debounced update function in constructor to make type clear for compiler
        this.debouncedUpdateMouseConfig = debounce(this.updateMouseConfig, 200);

        // Notfify observers after all data has been initialized
        this.notifyObservers();
        
        logRing(" -- NewRing created and data initialized! -- ");
    }

    public startBluetooth() {
        if (!this.bleManager) {
            return;
        }
        this.bleManager.startBle();
    }

    /**
    * Notify observers of new data
    */
    private notifyObservers() {
        this.observers.forEach(callback => callback());
    }

    /*************************************
     *  
     * Ring Public API
     * 
     *************************************/
    /**
     * Sets the data streaming on for both Touchpad and motion sensors
     * @param setTrue - True for streaming on, false for off.
     */
    public setTouchpadStreaming(setTrue: Boolean) {
        if (setTrue) {
            this.configService.startDataStreaming();
        } else {
            this.configService.stopDataStreaming();
        }
    }

    /**
     * Sets the application configuration and saves it to the database.
     * @param data - The new application configuration.
     */
    public async setAppConfig(data: AppConfig) {
        this.appConfig = data;
        await this.controllers["appConfig"].saveData(data, "id = ?", [1]);
    }

    /**
     * Sets the mouse configuration, sends it to the ring, and saves it to the database.
     * Calls debouncedUpdateMouseConfig to limit BLE and SQL update rate during slider changes.
     * @param data - The new mouse configuration.
     */
    public async setMouseConfig(data: MouseConfig) {
        this.mouseConfig = data;
        await this.controllers["mouseConfiguration"].saveData(data, "id = ?", [1]);

        if (this.debouncedUpdateMouseConfig) {
            this.debouncedUpdateMouseConfig(data);  // Debounced backend update
        } else {
            // Handle the case where debouncedUpdateMouseConfig is not defined
            console.warn('debouncedUpdateMouseConfig is not initialized');
        }
    }

    /**
     * @brief Internal mouse config update, sends data to ring and save to internal database.
     * 
     * Debounced to max 200ms update intervals.
     *  */ 
    private async updateMouseConfig(data: MouseConfig) {
        this.controlService.updateMouseAxesAndSensitivity(data);        // Update data to BLE manager
        await this.controllers["mouseConfiguration"].saveData(data, "id = ?", [1]);   // Save to persistent storage
    }

    /**
     * @brief Request full LED config update from ring. 
     * 
     * Requests and reads the full LED config from ring, then writes it to local storage and 
     * the ledConfig class variable.
     *  */ 
    public async requestLedConfigFromRing(): Promise<void> {
        const ledConfig = await this.ledService.readLedConfig();
        if (ledConfig) {
            // First save to internal variable
            this.ledConfig = ledConfig;

            // Convert the config to the format expected by the database
            const dbConfig = {
                id: 1,
                generalConfig: JSON.stringify(ledConfig.general),
                touchResponse: JSON.stringify(ledConfig.touchResponse),
                chargingConfig: JSON.stringify(ledConfig.charging),
                colorConfig: JSON.stringify(ledConfig.colorConfig),
                brightness: JSON.stringify(ledConfig.brightness),
                timing: JSON.stringify(ledConfig.timing),
                activityIndication: JSON.stringify(ledConfig.activityIndication)
            };
            await this.controllers["ledConfiguration"].saveData(dbConfig, "id = ?", [1]);
        } else {
            console.error('Failed to read LED configuration from device');
        }
    }

    /**
     * @brief Set and save the full LED config. 
     *  */ 
    public async setLedConfig(config: LedConfig): Promise<void> {
        if (config) {
            // First save to internal variable
            this.ledConfig = config;

            // Convert the config to the format expected by the database
            const dbConfig = {
                id: 1,
                generalConfig: JSON.stringify(config.general),
                touchResponse: JSON.stringify(config.touchResponse),
                chargingConfig: JSON.stringify(config.charging),
                colorConfig: JSON.stringify(config.colorConfig),
                brightness: JSON.stringify(config.brightness),
                timing: JSON.stringify(config.timing),
                activityIndication: JSON.stringify(config.activityIndication)
            };
            await this.controllers["ledConfiguration"].saveData(dbConfig, "id = ?", [1]);
        } else {
            console.error('Failed to read LED configuration from device');
        }
    }

    /**
     * @brief Get full LED config. 
     *  */ 
    public getLedConfig(): LedConfig {
        return this.ledConfig;
    }

    /**
     * Sets the ring handedness, sends it to the ring, and saves it to the database.
     * @param data - The new handedness configuration.
     */
    public async setHandedness(data: Handedness) {
        this.handedness = data;
        this.controlService.updateHandedness(data);
        // Verify that the below hack works
        const handednessData = { id: 1, userHandedness: data }; // Add id for correct format in database
        await this.controllers["handedness"].saveData(handednessData, "id = ?", [1]);
    }

    /**
     * Sets the MQTT configuration parameters and saves them to the database.
     * @param config - The new MQTT configuration.
     */
    public async setMQTTConfig(config: MQTTConfiguration) {
        this.mqttConfig = config;
        await this.controllers["mqttConfiguration"].saveData(config, "brokerIP = ? AND port = ?", [config.brokerIP, config.port]);
    }

    /**
     * Gets the MQTT configuration parameters.
     * @returns MQTTConfiguration
     */
    public getMQTTConfig(): MQTTConfiguration {
        return this.mqttConfig;
    }

    /**
     * Sets the current ring modes (i.e. uniqueID of a mode object assigned to mode 1, 2, and 3) and saves them to the database.
     * @param modes - The new ring modes.
     */
    public async setCurrentRingModes(modes: RingModes) {
        this.ringModes = modes;
        await this.controllers["currentRingModes"].saveData(modes, "id = ?", [1]);
    }

    /**
     * Sets a ring mode, sends it to the ring, and saves it to the database.
     * @param mode - The new ring mode.
     */
    public async setMode(mode: RingMode) {
        const { modeMappings, ...modeData } = mode; // Extract only relevant mode data
        this.allModes[mode.uniqueID] = mode;
        this.modeService.BLEUpdateModeForIndex(mode);

        // Save mode
        this.controllers["allModes"].saveData(modeData, "uniqueID = ?", [mode.uniqueID]);

        // Save all mappings individually
        Object.entries(modeMappings).forEach(mapping => {
            if (mapping != undefined) {
                this.setIOMapping(mapping[1]); // mapping: [string, IOMapping]
            }
        });

        logRing("Saved new mode with ID ", mode.uniqueID);
    }

    /**
     * Sets an IO mapping, updates the relevant mode, sends it to the ring, and saves it to the database.
     * @param mapping - The new IO mapping.
     */
    public async setIOMapping(mapping: IOMapping) {
        if (mapping.modeID == null) {
            console.error("ModeID not found for mapping: ", mapping);
            return; // Early exit if the modeID doesn't exist
        }
        if (!this.allModes[mapping.modeID]) {
            console.error("Mode not found for mapping, modeID: ", mapping.modeID);
            return; // Early exit if the mode doesn't exist
        }

        // Assign mapping directly to the mode's mapping dictionary
        this.allModes[mapping.modeID].modeMappings[mapping.gesture] = mapping;

        // This is obsolete; we don't need to keep a list of ioMappings up to date
        const index = this.ioMappings.findIndex(m => m.modeID === mapping.modeID && m.gesture === mapping.gesture);
        if (index !== -1) {
            this.ioMappings[index] = { ...this.ioMappings[index], ...mapping };
        } else {
            this.ioMappings.push(mapping);
        }

        await this.controllers["IOMappings"].saveData(mapping, "modeID = ? AND gesture = ?", [mapping.modeID, mapping.gesture]);
        logRing("Saved new mapping with modeID ", mapping.modeID, " and gesture ", mapping.gesture);
    }


    /**
     * Sets the ring BLE info and saves it to the database.
     * @param bleInfo - The new BLE configuration.
     */
    public async setRingBleInfo(bleInfo: RingBleConfig) {
        this.bleInfo = bleInfo;
        await this.controllers["ringBleInfo"].saveData(bleInfo, "sqlIdentifier = ?", [bleInfo.sqlIdentifier]);
    }

    /**
     * Returns true if the app is paired to a Taika Ring.
     * @returns boolean if ring is paired
     */
    public isPaired(): boolean {
        if (this.bleManager == undefined) {
            return false;
        }
        return this.bleManager.ringPaired();
    }

    /**
     * Returns true if the app is currently connected to a Taika Ring.
     * @returns boolean
     */
    public isConnected(): boolean {
        if (this.bleManager == undefined) {
            return false;
        }
        return this.bleManager.ringConnected();
    }

    /**
     * Sets the ring to ship mode.
     * In ship mode, the ring is completely turned off, and can
     * be woken up by connecting it to a charger.
     */
    public shipMode() {
        this.controlService.shipApplication();
    }

    /* 
    * Return the ring battery state of charge as increments of 20 %
    */
    public async battery(): Promise<number> {
        return await this.batteryService.readBatteryLevel();
    }


    public async rssi(): Promise<number> {
        if (!this.bleManager) {
            return -1;
        }

        return await this.bleManager.ringRSSI();
    }


    public firmwareVersion(): RingVersion | undefined {
        if (this.bleManager == undefined) {
            return undefined;
        }
        return this.bleManager.ringFirmwareVersion();
    }

    /**
     * Factory resets the ring.
     */
    public factoryReset() {
        const connectedDevices = ConnectedDevices.getInstance();
        connectedDevices.deleteAllDevicesExceptSelfAndMqtt();

        this.controlService.factoryReset();
        this.setRingBleInfo(DefaultConfigs.defaultBleConfig as RingBleConfig);
    }

    /**
     * @brief Factory resets the ring and sets it to ship mode.
     * If you factory reset, you can't control anymore. Therefore,
     * we need to set remove bonding information and set to shipmode 
     * with one command.
     */
    public factoryResetAndShipMode() {
        const connectedDevices = ConnectedDevices.getInstance();
        connectedDevices.deleteAllDevicesExceptSelfAndMqtt();

        this.controlService.factoryResetAndShipApplication();
        this.setRingBleInfo(DefaultConfigs.defaultBleConfig as RingBleConfig);
    }

    /*************************************
     *  Public helpers
     *************************************/
    /**
     * Subscribes a callback to changes.
     * @param callback - The callback function to subscribe.
     */
    subscribe(callback: () => void) {
        this.observers.push(callback);
    }


    // TODO: move into some helper class

    /**
     * Helper method to get default mappings based on the mode type.
     * @param modeType - The type of the mode.
     * @returns IOMappings
     */
    public getDefaultMappingsForMode(modeType: number): IOMappings {
        switch (modeType) {
            case TaikaModeType.Music:
                return Mappings.musicMapping;
            case TaikaModeType.ComputerMouse:
                return Mappings.mouseMapping;
            case TaikaModeType.MQTTControl:
                return Mappings.MQTTMapping;
            case TaikaModeType.PresentationTool:
                return Mappings.presentationMapping;
            case TaikaModeType.Custom:
                return Mappings.blankMapping;
            default:
                return Mappings.blankMapping; // Return blank for other types
        }
    }

    /**
     * Returns the unique ID of a mode assigned to a mode index.
     * @param modeIndex - The index of the mode.
     * @returns number
     */
    public getModeIdFromCurrentRingModes = (modeIndex: ModeIndex) => {
        switch (modeIndex) {
            case ModeIndex.modeOne:
                return this.ringModes.ringModeOne;
            case ModeIndex.modeTwo:
                return this.ringModes.ringModeTwo;
            case ModeIndex.modeThree:
                return this.ringModes.ringModeThree;
            default:
                // Return first mode as default to avoid null
                console.error("DANGER DANGER DIDN'T FIND MODE, DEFAULTING TO RINGMODEONE!!!");
                return this.ringModes.ringModeOne;
        }
    };

    // Helper to get the property name based on the mode index
    public getModeKey = (modeIndex: ModeIndex) => {
        switch (modeIndex) {
            case ModeIndex.modeOne:
                return 'ringModeOne';
            case ModeIndex.modeTwo:
                return 'ringModeTwo';
            case ModeIndex.modeThree:
                return 'ringModeThree';
            default:
                console.error("ERROR ERROR DIDN'T FIND MODE, DEFAULTING TO RINGMODEONE!!!");
                return 'ringModeOne'; // Default fallback, consider handling errors
        }
    };

    public async getTable(tableName: string) {
        try {
            const tableData = await this.controllers[tableName].getData();
            return tableData;
        } catch (error) {
            console.error(`Failed to retrieve ${tableName}: `, error);
        }
    }

    public async deleteRow(tableName: string, condition: string, conditionParams: any[]): Promise<boolean> {
        try {
            const controller = this.controllers[tableName];
            if (!controller) {
                console.error(`Table '${tableName}' not found.`);
                return false;
            }

            const deleted = await controller.deleteData(condition, conditionParams);
            if (deleted) {
                console.log(`Deleted row from ${tableName} successfully.`);
                return true;
            } else {
                console.error(`Failed to delete row from ${tableName}.`);
                return false;
            }
        } catch (error) {
            console.error(`Error deleting row from ${tableName}:`, error);
            return false;
        }
    }

  /*************************************************************************************** /
  *  BLE state restoration for background execution
  * ***************************************************************************************/
  public async restoreBleState(restoredState: any) {
    this.bleManager?.restoreState(restoredState);
  }
}

export default Ring;

/* Ring.ts
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