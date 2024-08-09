/* RingContext.tsx
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
// External imports
import React, { ReactNode, createContext, useEffect, useState } from 'react';
// SDK imports
import Ring from '../Ring';
import { AppConfig, MouseConfig, Handedness, MQTTConfiguration, RingModes, IOMapping, RingBleConfig } from '../Interfaces/Interfaces';
import { defaultMouseConfig, defaultHandedness, defaultMQTTConfig, defaultRingModes, defaultBleConfig } from '../Config/TableConfigurations';
import { ModeIndex } from '../Interfaces/Enums';
import { RingMode } from '../Interfaces/Interfaces';
import { blankMapping } from '../Ring/Mappings/IOMappings';
import { logRing } from '../Utils/Logging/TaikaLog';

interface Props {
    children: ReactNode;
}

export interface RingContextType {
    appConfig:                  AppConfig | null;
    mouseConfig:                MouseConfig | null;
    handedness:                 Handedness | null;
    mqttConfig:                 MQTTConfiguration,
    currentRingModes:           RingModes,
    currentlyModifiedMode:      RingMode | null,
    allModes:                   { [uniqueID: number]: RingMode };
    ioMappings:                 IOMapping[],
    ringBleInfo:                RingBleConfig | null,
    setAppConfig:               (config: AppConfig) => Promise<void>;
    setMouseConfig:             (config: MouseConfig) => Promise<void>;
    setHandedness:              (config: Handedness) => Promise<void>;
    setMQTTConfig:              (config: MQTTConfiguration) => Promise<void>;
    setCurrentRingModes:        (modes: RingModes) => Promise<void>;
    setCurrentlyModifiedMode:   (mode: ModeIndex) => Promise<void>;
    setMode:                    (mode: RingMode) => Promise<void>;
    setAllModes:                (modes: RingMode[]) => Promise<void>;
    setIOMapping:               (newMapping: IOMapping) => Promise<void>;
    setAllIOMappings:           (newMappings: IOMapping[]) => Promise<void>;
    setRingBleInfo:             (config: RingBleConfig) => Promise<void>;
    resetMappingsOfCurrentMode: () => Promise<void>,
    clearMappingsOfCurrentMode: () => Promise<void>,
}

// Initialize context with default non-null values
export const RingContext = createContext<RingContextType>({
    appConfig: null,
    setAppConfig: async (config: AppConfig) => { },

    mouseConfig: defaultMouseConfig as MouseConfig, // Default values to ensure non-null
    setMouseConfig: async (config: MouseConfig) => { },

    handedness: defaultHandedness.userHandedness,
    setHandedness: async (config: Handedness) => { },

    mqttConfig: defaultMQTTConfig as MQTTConfiguration,
    setMQTTConfig: async (config: MQTTConfiguration) => { },

    currentRingModes: defaultRingModes as RingModes,
    setCurrentRingModes: async (modes: RingModes) => { },

    currentlyModifiedMode: null,
    setCurrentlyModifiedMode: async (mode: ModeIndex) => { },
    
    allModes: {},
    setMode: async (mode: RingMode) => { },                     // Set a single mode
    setAllModes: async (modes: RingMode[]) => { },              // Set all modes
    
    ioMappings: [],
    setIOMapping: async (newMapping: IOMapping) => { },         // Set a single IO mapping
    setAllIOMappings: async (newMappings: IOMapping[]) => { },  // Set all IO mappings
    resetMappingsOfCurrentMode: async () => { },
    clearMappingsOfCurrentMode: async () => { }, 

    ringBleInfo: defaultBleConfig as RingBleConfig,
    setRingBleInfo: async (bleInfo: RingBleConfig) => { },
});

// Provider Component
export const RingProvider: React.FC<Props> = ({ children }) => {
    const ring = Ring.getInstance();

    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [mouseConfig, setMouseConfig] = useState<MouseConfig>(ring.mouseConfig || defaultMouseConfig as MouseConfig);
    const [handedness, setHandedness] = useState<Handedness>(ring.handedness || defaultHandedness.userHandedness);
    const [mqttConfig, setMQTTConfig] = useState<MQTTConfiguration>(ring.mqttConfig);
    const [currentRingModes, setCurrentRingModes] = useState<RingModes>(ring.ringModes);
    const [currentlyModifiedMode, setCurrentlyModifiedMode] = useState<RingMode | null>(null);
    const [allModes, setAllModes] = useState<{ [uniqueID: number]: RingMode }>(ring.allModes);
    const [ioMappings, setAllIOMappings] = useState<IOMapping[]>(ring.ioMappings);
    const [ringBleInfo, setRingBleInfo] = useState<RingBleConfig>(ring.bleInfo || defaultBleConfig as RingBleConfig);

    useEffect(() => {
        ring.subscribe(() => {
            // Update provider state when Ring notifies of a state change
            setAppConfig(ring.appConfig);
            setMouseConfig(ring.mouseConfig);
            setHandedness(ring.handedness);
            setMQTTConfig(ring.mqttConfig);
            setCurrentRingModes(ring.ringModes);
            setAllModes({ ...ring.allModes });
            setAllIOMappings(ring.ioMappings);
            setRingBleInfo(ring.bleInfo);

            // Set a default mode for modifications
            // TODO: this seems to be null everytime. Figure out why and create a better solution
            if (currentlyModifiedMode === null) {
                // Fetch default mode that the app will modify
                logRing("CurrentlyModifiedMode is null");
                logRing("Current modes: ", currentRingModes);
                const initialModeId = currentRingModes.ringModeOne; // Default initial mode
                if (allModes[initialModeId]) {
                    setCurrentlyModifiedMode(allModes[initialModeId]);
                } else {
                    console.error("Couldn't initialize currentlyModifiedMode with uniqueID: ", initialModeId);
                }
            }
        });

        return () => {
            // Implement cleanup if needed
        };
    }, []);

    const handleSetAppConfig = async (updatedProperty: Partial<AppConfig>) => {
        const newConfig = { ...appConfig, ...updatedProperty };
        const bubbleGumFix = newConfig as { ringName: string};
        setAppConfig(bubbleGumFix); // Trigger re-render
        await ring.setAppConfig(bubbleGumFix);
    };

    const handleSetMouseConfig = async (config: MouseConfig) => {
        setMouseConfig(config); // Trigger re-render
        await ring.setMouseConfig(config);
    };

    const handleSetHandedness = async (config: Handedness) => {
        setHandedness(config); // Trigger re-render
        await ring.setHandedness(config);
    };

    const handleSetMQTTConfig = async (config: MQTTConfiguration) => {
        setMQTTConfig(config); // Trigger re-render
        await ring.setMQTTConfig(config);
    };

    const handleSetRingModes = async (config: RingModes) => {
        if (currentlyModifiedMode) {
            const mode = currentlyModifiedMode.modeIndex    // Get index (0, 1 or 2) of current mode
            const modeKey = ring.getModeKey(mode);          // Get key of current mode, for example "ringModeThree"
            const newModeValue = config[modeKey];           // Get index of current mode (in all modes list)

            const allModeKeys = (Object.keys(config) as (keyof RingModes)[])

            // Loop through all modes, and if a mode is used in 2 or more slots, switch modes around
            for (const key of allModeKeys) {
                if (key != "id" && key != modeKey) {
                    if (config[key] === newModeValue) {
                        config[key] = currentlyModifiedMode.uniqueID; // Update the new mode to the "RingModes" inteface
                        ring.allModes[newModeValue].modeIndex = mode    // Update the index (0, 1 or 2) for other mode

                        ring.setMode(ring.allModes[newModeValue]); // Save mode
                        break;
                    }
                }
            }
        }
        //console.log("config",  "one: ", config.ringModeOne, "two:", config.ringModeTwo, "three:", config.ringModeThree);
        //console.log("current", currentlyModifiedMode?.uniqueID, currentlyModifiedMode?.modeIndex);

        setCurrentRingModes(config); // Trigger re-render
        await ring.setCurrentRingModes(config);
    };

    const handleSetCurrentlyModifiedMode = async (modeIndex: ModeIndex) => {
        const newModeId = ring.getModeIdFromCurrentRingModes(modeIndex);
        if (newModeId !== null && allModes[newModeId]) {
            // Change the mode index depending on which page we are at
            allModes[newModeId].modeIndex = modeIndex;
            setCurrentlyModifiedMode(allModes[newModeId]);
            // Update mode to Ring when we start modifying it
            await ring.setMode(allModes[newModeId]);
        } else {
            console.error(`Couldn't find mode with ID: ${newModeId}`);
        }
    };

    const handleSetMode = async (config: RingMode) => {
        await ring.setMode(config);
        setAllModes({ ...ring.allModes }); // Trigger re-render
    };

    const handleSetAllModes = async (modes: { [uniqueID: number]: RingMode }) => {
        // Use Object.keys and ensure each key is treated as a number
        for (const key of Object.keys(modes)) {
            const modeKey = parseInt(key, 10); // Convert key to number since Object.keys returns string[]
            const mode = modes[modeKey];
            if (mode) { // TypeScript-safe check
                await ring.setMode(mode);
            }
        }
        setAllModes({ ...modes }); // Spread to update the object and trigger re-render
    };


    const handleSetIOMapping = async (newMapping: IOMapping) => {
        await ring.setIOMapping(newMapping);
        // Update the state to trigger re-render in the subscribed components
        setAllIOMappings([...ring.ioMappings]); // Trigger re-render
    };

    const handleSetAllIOMappings = async (mappings: IOMapping[]) => {
        for (const mapping of mappings) {
            await ring.setIOMapping(mapping);
        }
        setAllIOMappings([...mappings]); // Trigger re-render
    };


    const handleSetRingBleInfo = async (bleInfo: RingBleConfig) => {
        setRingBleInfo(bleInfo); // Trigger re-render
        await ring.setRingBleInfo(bleInfo);
    };

    const resetMappingsOfCurrentMode = async () => {
        if (currentlyModifiedMode == null) return;
        // Fetch default mappings
        const newMappings = ring.getDefaultMappingsForMode(currentlyModifiedMode.type);
        // Add mode ID to the defaults
        for (const [gesture, mapping] of Object.entries(newMappings)) {
            if (mapping != null) {
                mapping.modeID = currentlyModifiedMode.uniqueID;
            }
        }
        const newMode = {
            ...currentlyModifiedMode,
            modeMappings: newMappings
        };
        handleSetMode(newMode);
        setCurrentlyModifiedMode(newMode);
    };

    const clearMappingsOfCurrentMode = async () => {
        if (currentlyModifiedMode == null) return;
        const newMappings = blankMapping;
        // Add mode ID to the defaults
        for (const [gesture, mapping] of Object.entries(newMappings)) {
            if (mapping != null) {
                mapping.modeID = currentlyModifiedMode.uniqueID;
            }
        }
        const newMode = {
            ...currentlyModifiedMode,
            modeMappings: blankMapping
        };
        handleSetMode(newMode);
        setCurrentlyModifiedMode(newMode);
    };

    return (
        <RingContext.Provider value={{
            appConfig,
            setAppConfig: handleSetAppConfig, 

            mouseConfig, 
            setMouseConfig: handleSetMouseConfig, 

            handedness, 
            setHandedness: handleSetHandedness, 

            mqttConfig,
            setMQTTConfig: handleSetMQTTConfig,

            currentRingModes,
            setCurrentRingModes: handleSetRingModes,

            currentlyModifiedMode,
            setCurrentlyModifiedMode: handleSetCurrentlyModifiedMode,

            allModes,
            setMode: handleSetMode,
            setAllModes: handleSetAllModes,

            ioMappings, 
            setIOMapping: handleSetIOMapping,   // For updating single mapping
            setAllIOMappings: handleSetAllIOMappings, // For updating all mappings
            clearMappingsOfCurrentMode,
            resetMappingsOfCurrentMode,
            
            ringBleInfo,
            setRingBleInfo: handleSetRingBleInfo,
        }}>
            {children}
        </RingContext.Provider>
    );
};
