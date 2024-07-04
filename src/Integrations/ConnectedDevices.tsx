/* ConnectedDevices.tsx
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

import { APPLICATION_DEVICE_HANDLE, NO_BONDING } from '../Ring/Mappings/IOMappings';
import { TaikaConnectionType } from '../Interfaces/Enums';
import { ConnectedDevice } from '../Interfaces/Interfaces';
import { logConnectedDevices, logRing } from '../Utils/Logging/TaikaLog';
import GenericDataController from '../Utils/Data/GenericDataController';
import { cloneDeep } from 'lodash';
import { getDeviceName } from './Platform';


export const connectionTypeDescriptions: { [key in TaikaConnectionType]: string } = {
    [TaikaConnectionType.other]: "Other",
    [TaikaConnectionType.primaryPhone]: "Primary phone",
    [TaikaConnectionType.computer]: "Computer",
    //[TaikaConnectionType.TV]: "TV",
    //[TaikaConnectionType.appleHomeHub]: "Apple Home Hub",
    [TaikaConnectionType.otherPhone]: "Other phone",
    [TaikaConnectionType.MQTT]: "MQTT",
    //[TaikaConnectionType.endDeviceSplit]: "End Device Split",
    //[TaikaConnectionType.locator]: "Locator",
    //[TaikaConnectionType.dongle]: "Dongle",
};

class ConnectedDevices {
    private static instance: ConnectedDevices | null = null;
    private confirmedDevices: ConnectedDevice[] = [];
    private unconfirmedDevices: ConnectedDevice[] = [];
    private onChangeCallbacks: Function[] = [];
    private isReady: boolean = false;
    public selfBondingHandle: number = NO_BONDING;

    private confirmedDevicesController: GenericDataController;
    private unconfirmedDevicesController: GenericDataController;

    private constructor(
        controllers: {
            confirmedDevices: GenericDataController;
            unconfirmedDevices: GenericDataController;
        }) {
        // Set data controllers for persistent storage
        this.confirmedDevicesController = controllers.confirmedDevices;
        this.unconfirmedDevicesController = controllers.unconfirmedDevices;
        this.initialize();
    }

    // Method to get the singleton instance
    public static getInstance(): ConnectedDevices {
        if (!ConnectedDevices.instance) {
            throw new Error("Instance of ConnectedDevices has not been created. Ensure that it's created inside a React component with access to ControllerContext.");
        }
        return ConnectedDevices.instance;
    }

    // Static method to create an instance (to ensure it's created with proper context)
    public static createInstance(context: any): ConnectedDevices {
        if (!ConnectedDevices.instance) {
            ConnectedDevices.instance = new ConnectedDevices(context);
            logConnectedDevices("New instance of connected devices created.");
        }
        return ConnectedDevices.instance;
    }

    private async initialize() {
        try {
            await this.getDevicesFromStorage();  // Load devices
            await this.initializeSelfToDevices();
            this.isReady = true;  // Set readiness flag
            this.notifyChange();  // Notify any system components that initialization is complete
        } catch (error) {
            console.error("Failed to initialize ConnectedDevices:", error);
        }
    }

        /**
    * Initializes self to connected devices.
    */
    private async initializeSelfToDevices() {
        let deviceName = await getDeviceName();
        logRing("deviceName name :", deviceName);
        const connectedDevices = ConnectedDevices.getInstance();

        try {
            await connectedDevices.addConfirmedDevice(deviceName,
                TaikaConnectionType.primaryPhone,
                NO_BONDING,
                APPLICATION_DEVICE_HANDLE);
        } catch (error) {
            console.error("Failed to add device:", error);
        }
    }

    private async getDevicesFromStorage() {
        try {
            const confirmed = await this.confirmedDevicesController.getData();
            const unconfirmed = await this.unconfirmedDevicesController.getData();

            this.confirmedDevices = confirmed as ConnectedDevice[];
            this.unconfirmedDevices = unconfirmed as ConnectedDevice[];
            this.printConfirmedConnections();
            this.printUnconfirmedConnections();
        } catch (error) {
            console.error('Error initializing data:', error);
        }
    }

    public onChange(callback: Function) {
        this.onChangeCallbacks.push(callback);
    }

    public removeChangeListener(callback: Function) {
        this.onChangeCallbacks = this.onChangeCallbacks.filter(cb => cb !== callback);
    }

    private notifyChange() {
        this.onChangeCallbacks.forEach(callback => callback());
    }

    // Simulated function to ensure system readiness
    private async checkIfReady(): Promise<void> {
        // Check and wait for certain conditions (e.g., system initialization, configuration loaded, etc.)
        return new Promise((resolve) => {
            // Assuming some condition or event must be true/occur
            if (this.isReady) {
                resolve();
            } else {
                // Optionally set a timeout to periodically check or just delay execution
                setTimeout(() => resolve(), 1000); // waits 1 second before resolving
            }
        });
    }

    private determineNextDeviceHandle(): number {
        // Gather all device handles from both confirmed and unconfirmed devices
        const allHandles = [
            ...this.confirmedDevices.map(device => device.deviceHandle),
            ...this.unconfirmedDevices.map(device => device.deviceHandle)
        ];

        // Sort handles numerically to easily find the first gap in the sequence
        allHandles.sort((a, b) => a - b);

        // Find the smallest missing number in the sorted list
        if (allHandles.length === 0) {
            return 1; // Return 1 if no devices are present
        }

        // Check for the first gap in the sequence
        for (let i = 0; i < allHandles.length; i++) {
            if (allHandles[i] !== i) {
                return i; // Returns the first missing handle
            }
        }

        // If there are no gaps, the next handle is the length of the array
        return allHandles.length;
    }

    public async deleteAllDevicesExceptSelfAndMqtt() {
        for (const unconfirmedDevice of this.unconfirmedDevices) {
            this.cancelConfirmation(unconfirmedDevice.deviceHandle);
        }
        for (const confirmedDevice of this.confirmedDevices) {
            this.deleteConfirmedDevice(confirmedDevice.deviceHandle);
        }
    }

    // Add confirmed device
    public async addConfirmedDevice(name: string, type: TaikaConnectionType, bondingHandle: number, deviceHandle: number | null = null): Promise<number> {
        logConnectedDevices("Add confirmed device.");
        await this.checkIfReady();

        if (this.confirmedDevices.some(device => device.deviceHandle === 0 && deviceHandle === 0)) {
            logConnectedDevices("A device with handle 0 is already present. Cannot add a new device.");
            this.printConfirmedConnections();
            return -1;
        }

        if (this.confirmedDevices.some(device => device.name === name)) {
            logConnectedDevices(`A device with the name '${name}' already exists.`);
            this.printConfirmedConnections();
            return -1;
        }

        if (deviceHandle) {
            if (this.confirmedDevices.some(device => device.deviceHandle === deviceHandle)) {
                logConnectedDevices(`A device with the handle '${deviceHandle}' already exists.`);
                return -1;
            }
        }

        // Use the provided deviceHandle if it is not null, otherwise determine the next available handle
        const newDeviceHandle = deviceHandle !== null ? deviceHandle : this.determineNextDeviceHandle();

        const newDevice: ConnectedDevice = {
            name: name,
            type: type,
            bondingHandle: bondingHandle,
            deviceHandle: newDeviceHandle
        };

        try {
            // Save to persistent storage
            await this.confirmedDevicesController.saveData(newDevice, 'deviceHandle = ?', [newDevice.deviceHandle])
            // Save to local list
            this.confirmedDevices.push(newDevice);

            // Notify listeners about the change
            this.notifyChange();
            this.printConfirmedConnections();
            return newDevice.deviceHandle;

        } catch (error) {
            logConnectedDevices('Failed to insert confirmed device:', error);
            return -1;  // Indicate failure
        }
    }

    public async addUnconfirmedDevice(deviceType: TaikaConnectionType, bondingHandle: number): Promise<number> {
        logConnectedDevices("Add unconfirmed device.");
        await this.checkIfReady();
        // Check if a device with the same bondingHandle already exists
        const existingDevice = this.unconfirmedDevices.find(device => device.bondingHandle === bondingHandle);
        if (existingDevice) {
            logConnectedDevices(`A device with bonding handle ${bondingHandle} already exists as unconfirmed.`);
            return -1; // Indicate failure or conflict
        }

        // Determine the next available device handle
        const newDeviceHandle = this.determineNextDeviceHandle();

        // Create a new device object
        const newDevice: ConnectedDevice = {
            name: "Unconfirmed Device", // Default name or you might add a parameter for name
            type: deviceType,
            bondingHandle: bondingHandle,
            deviceHandle: newDeviceHandle
        };

        try {
            // Save to persistent memory
            await this.unconfirmedDevicesController.saveData(newDevice, 'deviceHandle = ?', [newDevice.deviceHandle])

            // Save to local list
            this.unconfirmedDevices.push(newDevice);

            // Notify listeners about the change
            this.notifyChange();
            this.printUnconfirmedConnections();
            return newDevice.deviceHandle;  // Return the handle of the newly added device
        } catch (error) {
            console.error('Failed to insert unconfirmed device:', error);
            return -1;  // Indicate failure to insert
        }
    }

    public async confirmDevice(deviceHandle: number, name: string, type: TaikaConnectionType): Promise<boolean> {
        logConnectedDevices("Confirm device.");
        await this.checkIfReady();
        // Find the device in the unconfirmed list
        const index = this.unconfirmedDevices.findIndex(device => device.deviceHandle === deviceHandle);
        if (index === -1) {
            logConnectedDevices(`No unconfirmed device found with handle ${deviceHandle}`);
            return false;
        }

        const device = this.unconfirmedDevices[index];

        // Attempt to add the device to the confirmed list
        logConnectedDevices(`debug log bond: ${device.bondingHandle} device ahndle ${device.deviceHandle}`);
        const handle = await this.addConfirmedDevice(name, type, device.bondingHandle, device.deviceHandle);

        if (handle === -1) {
            logConnectedDevices(`Failed to confirm device: ${name} with handle ${deviceHandle}`);
            return false;
        }

        // If successfully added to confirmed, delete from unconfirmed in database
        try {
            // Delete from persistent storage
            await this.unconfirmedDevicesController.deleteData('deviceHandle = ?', [device.deviceHandle])

            // Delete from local list
            this.unconfirmedDevices.splice(index, 1);

            // Notify changes
            this.notifyChange();
            logConnectedDevices(`Device confirmed and deleted from unconfirmed: ${name} with handle ${deviceHandle}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete unconfirmed device from database: ${error}`);
            // Handle failure to delete from database (rare case)
            return false;
        }
    }

    public async cancelConfirmation(deviceHandle: number): Promise<boolean> {
        logConnectedDevices("Cancel confirmation.");
        await this.checkIfReady();
        const index = this.unconfirmedDevices.findIndex(device => device.deviceHandle === deviceHandle);
        if (index !== -1) {
            // Delete from persistent storage
            await this.unconfirmedDevicesController.deleteData('deviceHandle = ?', [deviceHandle])

            // Delete from local list
            this.unconfirmedDevices.splice(index, 1);

            // Notify changes
            this.notifyChange();
            return true;
        }
        return false;
    }

    public async deleteConfirmedDevice(deviceHandle: number): Promise<void> {
        // Check that not deleting primary device
        const type = this.getTypeByDeviceHandle(deviceHandle);
        if (type == TaikaConnectionType.primaryPhone) {
            logConnectedDevices(`Deletion attempt blocked for protected device handle: ${deviceHandle}`);
            throw new Error("Can't remove primary device.");
        }

        if (type == TaikaConnectionType.MQTT && deviceHandle == 1) {
            logConnectedDevices(`Deletion attempt blocked for protected device handle: ${deviceHandle}`);
            throw new Error("Can't remove protected MQTT device.");
        }

        // Find the device in the list by handle
        const deviceIndex = this.confirmedDevices.findIndex(device => device.deviceHandle === deviceHandle);

        if (deviceIndex === -1) {
            logConnectedDevices(`No matching device found to delete.`);
            return;
        }

        // Get the specific device to delete.
        const deviceToDelete = this.confirmedDevices[deviceIndex];

        try {
            await this.confirmedDevicesController.deleteData('deviceHandle = ?', [deviceToDelete.deviceHandle])
            // Update the local state array to reflect this deletion
            this.confirmedDevices.splice(deviceIndex, 1); // Remove the device from the local array
            this.notifyChange(); // Notify any system components that a change occurred

            logConnectedDevices(`Successfully deleted device: ${deviceToDelete.name}`);
        } catch (error) {
            console.error(`Failed to delete device: ${error}`);
            throw new Error(`Failed to delete the device from the database: ${error}`);
        }
    }

    /*
    * Update the bonding with the device handle. Also update other bondings with the same bonding handle.
    **/
    public async updateBondingHandle(deviceHandle: number, newBondingHandle: number): Promise<boolean> {
        logConnectedDevices("Update bonding handle.");
        await this.checkIfReady();
        let updated = false;
        let device = this.confirmedDevices.find(d => d.deviceHandle === deviceHandle);

        if (!device) {
            this.printConfirmedConnections();
            return false;
        }

        // Update the self bonding handle
        if (device.deviceHandle == APPLICATION_DEVICE_HANDLE) {
            this.selfBondingHandle = newBondingHandle;
        }

        // Store the old bonding handle to search for it in other devices
        const oldBondingHandle = device.bondingHandle;

        // Update the device found by deviceHandle
        device.bondingHandle = newBondingHandle;
        const deviceToSave = cloneDeep(device);

        await this.confirmedDevicesController.saveData(deviceToSave, 'deviceHandle = ?', [deviceToSave.deviceHandle]);
        this.notifyChange();
        updated = true;

        // Update all other devices that have the same old bonding handle
        for (const d of this.confirmedDevices) {
            if (d.bondingHandle === oldBondingHandle && d.deviceHandle !== deviceHandle) {
                d.bondingHandle = newBondingHandle;
                await this.confirmedDevicesController.saveData(d, 'deviceHandle = ?', [d.deviceHandle]);
                this.notifyChange();
                updated = true;
            }
        }

        this.printConfirmedConnections();
        return updated; // Returns true if any device was updated, false otherwise
    }

    public async updateConfirmedDevice(deviceHandle: number, newName: string, newType: TaikaConnectionType): Promise<boolean> {

        await this.checkIfReady();
        const device = this.confirmedDevices.find(device => device.deviceHandle === deviceHandle);

        if (!device) {
            logConnectedDevices("Device not found.");
            return false;
        }

        try {
            device.name = newName;
            device.type = newType;

            await this.confirmedDevicesController.saveData(device, "deviceHandle = ?", [deviceHandle])
            this.notifyChange();
            logConnectedDevices("Device updated successfully.");

            return true;
        } catch (error) {
            console.error(`Failed to update the device from the database: ${error}`);
            return false;
        }
    }

    // Called only from BLE stack, when ring informs its actual connections
    public updateCurrentConfirmedBondigs(bondings: number[]) {
        this.confirmedDevices.forEach(device => {
            if (!bondings.includes(device.bondingHandle)) {
                this.deleteConfirmedDevice(device.deviceHandle);
            }
        });
    }

    // -----------------------------------------------------------------------------
    // Get functions
    // -----------------------------------------------------------------------------
    public getNameByDeviceHandle(deviceHandle: number): string {
        const device = this.confirmedDevices.find(device => device.deviceHandle === deviceHandle);
        if (device) {
            return device.name
        }
        return "No name";
    }

    public getTypeByDeviceHandle(deviceHandle: number): TaikaConnectionType | null {
        const device = this.confirmedDevices.find(device => device.deviceHandle === deviceHandle);
        if (device) {
            return device.type
        }
        return null;
    }

    public getNameByBondingHandle(bondingHandle: number): string {
        const device = this.confirmedDevices.find(device => device.bondingHandle === bondingHandle);
        if (device) {
            return device.name
        }
        return "No name";
    }

    public getBondingByDeviceHandle(deviceHandle: number): number {
        const device = this.confirmedDevices.find(device => device.deviceHandle === deviceHandle);
        if (device) {
            return device.bondingHandle
        }
        return NO_BONDING;
    }

    public listDevices(): ConnectedDevice[] {
        return this.confirmedDevices;
    }

    public listUnconfirmedDevices(): ConnectedDevice[] {
        return this.unconfirmedDevices;
    }

    // -----------------------------------------------------------------------------
    // Print functions
    // -----------------------------------------------------------------------------
    public printConfirmedConnections(): void {
        logConnectedDevices("Confirmed devices:");
        this.confirmedDevices.forEach(device => {
            logConnectedDevices(`\tName: ${device.name}, BondingHandle: ${device.bondingHandle}, ConnectionHandle: ${device.deviceHandle}, Type: ${connectionTypeDescriptions[device.type]}`);
        });
        logConnectedDevices("\n");
    }

    public printUnconfirmedConnections(): void {
        logConnectedDevices("Unconfirmed devices:");
        this.unconfirmedDevices.forEach(device => {
            logConnectedDevices(`\tName: ${device.name}, BondingHandle: ${device.bondingHandle}, ConnectionHandle: ${device.deviceHandle}, Type: ${connectionTypeDescriptions[device.type]}`);
        });
        logConnectedDevices("\n");
    }
}

export { ConnectedDevices, TaikaConnectionType };
