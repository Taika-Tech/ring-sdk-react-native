/* TaikaMQTT.tsx
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
import { Client, Message } from 'paho-mqtt';
// RingSDK imports
import { MQTTConfiguration } from '../../Interfaces/Interfaces'
import MQTTTopics from './TaikaMQTTConfig'
import { APPLICATION_DEVICE_HANDLE, NO_BONDING } from '../../Ring/Mappings/IOMappings';
import { ConnectedDevices, TaikaConnectionType } from '../ConnectedDevices';
import { ModeIndex } from '../../Interfaces/Enums';
import { logMQTT } from '../../Utils/Logging/TaikaLog';
import { error } from 'console';
import { Alert } from 'react-native';


class MQTTClient {
    //TODO: Figure out what to do with these
    private lastRoll: number = 0.00;
    private lastPitch: number = 0.00;
    private lastYaw: number = 0.00;

    private static instance: MQTTClient | null = null;
    public client: Client | undefined;
    private testConnectionCallback: ((status: { success: boolean, message: string }) => void) | null = null;
    private mqttConfig: MQTTConfiguration;
    private mqttTopics: MQTTTopics;
    private connectedDevices = ConnectedDevices.getInstance();

    // Constructor only initializes the singleton instance with necessary parameters
    private constructor(mqttConfig: MQTTConfiguration) {
        this.mqttConfig = mqttConfig;
        logMQTT("Setup mqtt topics");
        this.mqttTopics = new MQTTTopics(mqttConfig.clientID);
        this.connect();
        // Todo: use the client name as mqtt name, to enable multiple instances. The mqtt class would need to mapp the device handle to the conifguration and connect to it (and disconnect from the wrong one) etc.
        const bondingHandle = this.connectedDevices.getBondingByDeviceHandle(APPLICATION_DEVICE_HANDLE);
        this.connectedDevices.addConfirmedDevice("MQTT", TaikaConnectionType.MQTT, bondingHandle)
    }

    public static createInstance(mqttConfig: MQTTConfiguration): MQTTClient {
        if (!MQTTClient.instance) { // TO DO hard code vars
            logMQTT("Create an instance of MQTT");
            MQTTClient.instance = new MQTTClient(mqttConfig);
            
            
            // Save self to connected devices
            const connectedDevices = ConnectedDevices.getInstance();
            logMQTT(`TaikaMQTT: New MQTT instance: ${mqttConfig.brokerIP}, ${mqttConfig.port}, ${mqttConfig.clientID}, ${mqttConfig.username}, ${mqttConfig.password}`);
        } else {
            MQTTClient.instance.updateConfig(mqttConfig);
            logMQTT(`TaikaMQTT: MQTT instance updated: ${mqttConfig.brokerIP}, ${mqttConfig.port}, ${mqttConfig.clientID}, ${mqttConfig.username}, ${mqttConfig.password}`);
        }
        return MQTTClient.instance;
    }

    public static getInstance():  MQTTClient | null  {
        return this.instance;
    }
    
    public isConnected(): boolean {
        if (this.client) {
            return this.client.isConnected();
        }
        return false;
    }

    private connect() {
        // Check if the client already exists and is connected
        if (this.client && this.client.isConnected()) {
            // If already connected, you might choose to disconnect or simply return without reconnecting,
            // depending on your application's needs.
            logMQTT("TaikaMQTT: Client is already connected. Disconnecting before reconnecting.");
            this.client.disconnect();
        }
        
        logMQTT("TaikaMQTT: Connecting to MQTT broker...");
        this.client = new Client(this.mqttConfig.brokerIP, this.mqttConfig.port, this.mqttConfig.clientID);
    
        this.client.onConnectionLost = this.onConnectionLost.bind(this);
        this.client.onMessageArrived = this.onMessageArrived.bind(this);
        logMQTT("Actually connect to ", this.mqttConfig.username, ":", this.mqttConfig.password);
        try {
            this.client.connect({
                onSuccess: this.onConnect.bind(this),
                userName: this.mqttConfig.username,
                password: this.mqttConfig.password,
                useSSL: false,
                onFailure: this.onFailure.bind(this)
            });
        } catch (error) {
            console.error("TaikaMQTT: Error in connecting:", error);
            if (this.testConnectionCallback) {
                const err = error as { message: string };
                this.testConnectionCallback({ success: false, message: "Failed to connect: " + err.toString() });
            }
        }
    }
    
    public onConnect() {
        logMQTT("TaikaMQTT: Connected to MQTT broker");

        if (this.testConnectionCallback) {
            this.testConnectionCallback({ success: true, message: "Connected successfully to MQTT broker." });
        }

        // Example topic subscription
        if (this.client != undefined) 
        this.client.subscribe("taika/#", { qos: 2 });
        this.sendTestMessage();
        this.setupTaikaRing();
    }

    // Method to send a test message
    public sendTestMessage() {
        if (this.client && this.client.isConnected()) {
            logMQTT("TaikaMQTT: Sending 'Hello World' to topic 'taika'");
            const message = new Message("Test message");
            message.destinationName = "taika";
            message.qos = 2;
            try {
                this.client.send(message);
            } catch (error) {
                console.error("TaikaMQTT: Error sending message:", error);
            }
        } else {
            console.error("TaikaMQTT: Cannot send message. Client is not connected.");
        }
    }


    // Setup MQTT Home Assistant
    private setupTaikaRing() {
        for (const mode in this.mqttTopics.configTopics) {
            if (Object.prototype.hasOwnProperty.call(this.mqttTopics.configTopics, mode)) {
                const topic = this.mqttTopics.configTopics[mode];
                const config = this.mqttTopics.ringConfigs[parseInt(mode)];

                if (config) {
                    try {
                        const jsonString = JSON.stringify(config);
                        if (jsonString) {
                            this.sendMessage(topic, jsonString);
                        } else {
                            console.error("Failed to convert JSON data to string");
                        }
                    } catch (error) {
                        console.error("Error:", error);
                    }
                } else {
                    console.error(`Configuration not found for mode: ${mode}`);
                }
            }
        }

        // Send the "online" status message to the STATUS_TOPIC
        this.sendMessage(this.mqttTopics.STATUS_TOPIC, "online");
        logMQTT("MQTT Home assistant setup done.");
    }

    private onConnectionLost(responseObject: { errorCode: number; errorMessage: string }) {
        if (responseObject.errorCode !== 0) {
            logMQTT("TaikaMQTT: onConnectionLost:", responseObject.errorMessage);
        }
    }

    private onMessageArrived(message: Message) {
        logMQTT("TaikaMQTT: onMessageArrived:", message.payloadString);
    }

    private onFailure = (responseObject: { errorCode: number; errorMessage: string, invocationContext: any }) => {
        let userFriendlyMessage = '';
        switch (responseObject.errorCode) {
            case 7:
                userFriendlyMessage = `${responseObject.errorMessage}`;
                break;
            default:
                userFriendlyMessage = `Connection failed: ${responseObject.errorMessage}`;
                break;
        }
        Alert.alert(`MQTT: Failed to connect: ${responseObject.errorCode}, error: ${responseObject.errorMessage}`, responseObject.invocationContext);
        logMQTT(`Failed to connect: ${responseObject.errorCode}, error: ${responseObject.errorMessage}`, responseObject.invocationContext);
        if (this.testConnectionCallback) {
            this.testConnectionCallback({ success: false, message: userFriendlyMessage });
        }
    }

    public setTestConnectionCallback(callback: (status: { success: boolean, message: string }) => void) {
        this.testConnectionCallback = callback;
    }

    public sendMessage(topic: string, payload: string) {
        payload = payload.replace(/\//g, "\\/");

        const message = new Message(payload);
        message.destinationName = topic;
        message.qos = 2;

        if (this.client != undefined) 
        this.client.send(message);
    }


    public sendTaikaPacket(gestureName: string, modeIndex: ModeIndex, eulers?: number[], isPacketFirst?: boolean) {
        if (modeIndex < ModeIndex.modeOne || modeIndex > ModeIndex.modeThree) {
            logMQTT("Invalid mode index");
            return;
        }

        let commandDict: { [key: string]: any } = { event_type: gestureName };
        let resetDict: { [key: string]: any } = { event_type: "No gesture" };

        if (isPacketFirst) {
            this.lastRoll = 0.00;
            this.lastPitch = 0.00;
            this.lastYaw = 0.00;
            commandDict["first_packet"] = isPacketFirst;
            logMQTT("First packet");
        }

        if (eulers && eulers.length === 3) {
            const [roll, pitch, yaw] = eulers;

            if (roll !== undefined) {
                commandDict["roll"] = roll;
                commandDict["delta_roll"] = roll - this.lastRoll;
                this.lastRoll = roll;
                logMQTT(`Roll: ${roll}`);
            }

            if (pitch !== undefined) {
                commandDict["pitch"] = pitch;
                commandDict["delta_pitch"] = pitch - this.lastPitch;
                this.lastPitch = pitch;
            }

            if (yaw !== undefined) {
                commandDict["yaw"] = yaw;
                commandDict["delta_yaw"] = yaw - this.lastYaw;
                this.lastYaw = yaw;
            }
        }

        try {
            const jsonPayload = JSON.stringify(commandDict);
            const jsonResetPayload = JSON.stringify(resetDict);

            const topic = this.mqttTopics.commandTopics[modeIndex];
            this.sendMessage(topic, jsonPayload);
            this.sendMessage(topic, jsonResetPayload);
        } catch (error) {
            const err = error as { message: string };
            logMQTT(`MQTT Failed to create JSON data: ${err.message}`);
        }
    }

    public static disconnect() {
        if (MQTTClient.instance != null && MQTTClient.instance.client != undefined)

        if (MQTTClient.instance && MQTTClient.instance.client.isConnected()) {
            MQTTClient.instance.client.disconnect();
            logMQTT("TaikaMQTT: Disconnected successfully from MQTT broker.");
        } else {
            logMQTT("TaikaMQTT: TaikaMQTT: No active MQTT client to disconnect or already disconnected.");
        }
    }

    public isConnected() {
        return this.client?.isConnected();
    }

    public updateConfig(newMqttConfig: MQTTConfiguration) {
        //if (this.brokerUrl !== brokerUrl || this.port !== port || this.clientId !== clientId || this.username !== username || this.password !== password) {
        logMQTT("TaikaMQTT: Updated config");
        this.mqttConfig = newMqttConfig;
        this.connect();
        //}
    }
}

export default MQTTClient;