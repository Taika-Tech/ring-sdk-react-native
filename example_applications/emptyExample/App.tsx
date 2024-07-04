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

import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Image, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import {
  Ring,
  initializeRing,
  onConnected,
  onDisconnected,
  onTouchEvent,
  onMotionEvent,
  ringEventHandler,
} from 'ring-sdk-react-native';
import styling from './Styling/Styling.js';

// Create a Bluetooth manager
const manager = new BleManager();

const App: React.FC = () => {
  const [sendData, setSendData] = useState<boolean>(false);
  const [ring, setRing] = useState<Ring>();
  const [touchpadXValue, setTouchpadXValue] = useState('0.00');
  const [touchpadYValue, setTouchpadYValue] = useState('0.00');
  const [accXValue, setAccXValue] = useState('0.00');
  const [accYValue, setAccYValue] = useState('0.00');
  const [accZValue, setAccZValue] = useState('0.00');
  const [trail, setTrail] = useState<{ x: string, y: string }[]>([]);

  useEffect(() => {
    const setupSDK = async () => {
      // Initialize the ring by passing the Bluetooth manager
      const ringInstance = await initializeRing(manager);
      setRing(ringInstance.ring);
      console.log('Ring is initialized.');
    };
    setupSDK();
    return () => {
      // Destroy Bluetooth manager upon exit
      manager.destroy();
    };
  }, []);

  // Function to toggle data streaming
  const toggleSendData = () => {
    setSendData(prevSendData => {
      const newSendData = !prevSendData;
      if (ring !== undefined) {
        ring.setTouchpadStreaming(newSendData);
      }
      return newSendData;
    });
  };

  useEffect(() => {
    // Event handlers for ring events
    const handleConnected = () => console.log('Ring connected!');
    const handleDisconnected = () => console.log('Ring disconnected!');
    const handleTouchEvent = (data: any) => {
      //console.log('New touch data received:', data.x, data.y);
      setTouchpadXValue(data.x.toFixed(2));
      setTouchpadYValue(data.y.toFixed(2));
      setTrail(prevTrail => [...prevTrail, { x: data.x.toFixed(2), y: data.y.toFixed(2) }].slice(-20));
    };
    const handleMotionEvent = (data: any) => {
      setAccXValue(data[0].toFixed(2));
      setAccYValue(data[1].toFixed(2));
      setAccZValue(data[2].toFixed(2));
    };

    // Add event handlers as callbacks
    onConnected(handleConnected);
    onDisconnected(handleDisconnected);
    onTouchEvent(handleTouchEvent);
    onMotionEvent(handleMotionEvent);

    return () => {
      // Clean up the event listeners when the component unmounts
      ringEventHandler.off('connected', handleConnected);
      ringEventHandler.off('disconnected', handleDisconnected);
      ringEventHandler.off('touchEvent', handleTouchEvent);
      ringEventHandler.off('motionEvent', handleMotionEvent);
    };
  }, []);

  const splitValue = (value) => {
    const [integer, decimal] = value.split('.');
    return { integer, decimal };
  };

  return (
    <SafeAreaView style={styling.container}>
      <View>
        <Text style={styling.h1}>Ring Data</Text>
        <View style={styling.pageContainer}>
          <View style={[styling.pageSection, styling.smallMarginRight]}>
            <Text style={styling.h2}>Touchpad</Text>
            <View style={[styling.touchPad, { width: 756 / 8, height: 2048 / 8 }]}>
              {trail.map((point, index) => (
                <View
                  key={index}
                  style={[
                    styling.dot,
                    {
                      right: `${(parseFloat(point.x) / 756) * 100}%`,
                      bottom: `${(parseFloat(point.y) / 2048) * 100}%`,
                      opacity: (index + 1) / trail.length,
                      height: 6,
                      width: 6,
                    },
                  ]}
                />
              ))}
              <View
                style={[
                  styling.dot,
                  {
                    right: `${(parseFloat(touchpadXValue) / 756) * 100}%`,
                    bottom: `${(parseFloat(touchpadYValue) / 2048) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styling.pageSection}>
            <Text style={styling.h2}>IMU</Text>
            <View style={styling.table}>
              <View style={styling.tableRow}>
                <View style={styling.column1}>
                  <Text style={styling.text}>X =</Text>
                </View>
                <View style={styling.column2}>
                  <Text style={[styling.text, styling.dataValue, styling.alignRight]}>{splitValue(accXValue).integer}</Text>
                </View>
                <View style={styling.column3}>
                  <Text style={[styling.text, styling.dataValue]}>.</Text>
                </View>
                <View style={styling.column4}>
                  <Text style={[styling.text, styling.dataValue]}>{splitValue(accXValue).decimal}</Text>
                </View>
              </View>
              <View style={styling.tableRow}>
                <View style={styling.column1}>
                  <Text style={styling.text}>Y =</Text>
                </View>
                <View style={styling.column2}>
                  <Text style={[styling.text, styling.dataValue, styling.alignRight]}>{splitValue(accYValue).integer}</Text>
                </View>
                <View style={styling.column3}>
                  <Text style={[styling.text, styling.dataValue]}>.</Text>
                </View>
                <View style={styling.column4}>
                  <Text style={[styling.text, styling.dataValue]}>{splitValue(accYValue).decimal}</Text>
                </View>
              </View>
              <View style={styling.tableRow}>
                <View style={styling.column1}>
                  <Text style={styling.text}>Z =</Text>
                </View>
                <View style={styling.column2}>
                  <Text style={[styling.text, styling.dataValue, styling.alignRight]}>{splitValue(accZValue).integer}</Text>
                </View>
                <View style={styling.column3}>
                  <Text style={[styling.text, styling.dataValue]}>.</Text>
                </View>
                <View style={styling.column4}>
                  <Text style={[styling.text, styling.dataValue]}>{splitValue(accZValue).decimal}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styling.button} onPress={toggleSendData}>
          <Text style={styling.buttonText}>
            {sendData ? 'Stop Stream' : 'Start Stream'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;
