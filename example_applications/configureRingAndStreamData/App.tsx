// App.tsx
// Copyright Taika Tech Oy 2024. Full license notice at bottom of the file.

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {
  Ring,
  initializeRing,
  onConnected,
  onDisconnected,
  onTouchEvent,
  onMotionEvent,
  ringEventHandler,
  RingMode,
} from 'ring-sdk-react-native';
import TouchpadDisplay from './src/TouchpadDisplay'
import IMUDataTable from './src/IMUDataTable'
import ModeConfig from './src/ModeConfig'
import styling from './src/Styling'

// Initialize a Bluetooth manager
const manager = new BleManager();

const App = () => {
  const [ring, setRing] = useState<Ring | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [sendData, setSendData] = useState(false);
  //const [isConfigVisible, setIsConfigVisible] = useState(false);
  //const [currentMode, setCurrentMode] = useState<RingMode>();
  const [sensorData, setSensorData] = useState({
    touchpad: { x: '0.00', y: '0.00' },
    imu: { x: '0.00', y: '0.00', z: '0.00' }
  });


  useEffect(() => {
    const initialize = async () => {
      try {
        // Setup the SDK by passing Bluetooth manager to initializeRing
        // Bluetooth manager must be initialized in the app.
        const {ring: ringInstance} = await initializeRing(manager);

        // Set the ring instance as a state variable so we can use it later in the app
        setRing(ringInstance);
        console.log('Ring SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Ring SDK:', error);
      }
    };

    initialize();

    return () => {
      // Cleanup on exit
      manager.destroy();
    };
  }, []);

  useEffect(() => {
    // Connection callbacks
    const handleConnected = () => {
      console.log('Ring connected');
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      console.log('Ring disconnected');
      setIsConnected(false);
      setSendData(false);
    };

    // Touch event callback
    const handleTouchEvent = (data: any) => {
      setSensorData((prev: any) => ({
        ...prev,
        touchpad: {
          x: data.x.toFixed(2),
          y: data.y.toFixed(2)
        }
      }));
    };

    // Motion event callback
    const handleMotionEvent = (data: any) => {
      setSensorData((prev: any) => ({
        ...prev,
        imu: {
          x: data.acc.x.toFixed(2),
          y: data.acc.y.toFixed(2),
          z: data.acc.z.toFixed(2)
        }
      }));
    };

    // Register callbacks
    onConnected(handleConnected);
    onDisconnected(handleDisconnected);
    onTouchEvent(handleTouchEvent);
    onMotionEvent(handleMotionEvent);

    // Clean up on dismount
    return () => {
      ringEventHandler.off('connected', handleConnected);
      ringEventHandler.off('disconnected', handleDisconnected);
      ringEventHandler.off('touchEvent', handleTouchEvent);
      ringEventHandler.off('motionEvent', handleMotionEvent);
    };
  }, []);

  const toggleSendData = () => {
    if (ring && isConnected) {
      const newSendData = !sendData;
      // This function currently enables both touch and motion data streaming
      ring.setTouchpadStreaming(newSendData);
      setSendData(newSendData);
    }
  };

  return (
    <SafeAreaView style={styling.container}>
      <View>
        <Text style={styling.h1}>Ring Data</Text>

        <View style={styling.pageContainer}>
          {/* Touchpad data visualization */}
          <View style={[styling.pageSection, styling.smallMarginRight]}>
            <Text style={styling.h2}>Touchpad</Text>
            <TouchpadDisplay currentPosition={sensorData.touchpad} />
          </View>

          {/* IMU data display */}
          <View style={styling.pageSection}>
            <Text style={styling.h2}>IMU</Text>
            <IMUDataTable data={sensorData.imu} />
          </View>
        </View>

        <View style={styling.buttonContainer}>
          {/* Button for toggling data streaming */}
          <TouchableOpacity 
            style={styling.button} 
            onPress={toggleSendData}
            disabled={!isConnected}>
            <Text style={styling.buttonText}>
              {sendData ? 'Stop Stream' : 'Start Stream'}
            </Text>
          </TouchableOpacity>

          {/* Button for opening the configuration menu 
          <TouchableOpacity 
            style={[styling.button, styling.configButton]} 
            onPress={() => setIsConfigVisible(true)}
            disabled={!isConnected}>
            <Text style={styling.buttonText}>Configure</Text>
          </TouchableOpacity> */}
        </View>

        {/* Configuration menu 
        <ModeConfig
          visible={isConfigVisible}
          onClose={() => setIsConfigVisible(false)}
        />*/}
      </View>
    </SafeAreaView>
  );
};

export default App;

/* App.tsx
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