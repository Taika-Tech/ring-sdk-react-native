# RingSDK

RingSDK is a powerful and easy-to-use SDK for integrating the Taika Ring into your applications. This SDK provides functionalities to control the ring, configure settings, and interact with other devices via BLE (Bluetooth Low Energy).

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js (>=12.x)
- npm (>=6.x)
- TypeScript (>=4.x)

## Installation

### Installing RingSDK in an Existing Project

To install the RingSDK in your existing React Native project, follow these steps:

1. **Install the RingSDK Package:**

Make sure you are in the root of your project, then run:

  ```sh
   npm install ring-sdk-react-native
   cd ringsdk
  ```

2. **iOS Only: Install CocoaPods Dependencies:**

Change to the ios directory and install the CocoaPods dependencies:

  ```sh
  cd ios
  pod install
  cd ..
  ```

3. **Link Native Dependencies:**

For React Native versions 0.60 and above, the native dependencies are linked automatically. For older versions, you might need to link manually.

4. **Set up Bluetooth permissions**

If you project didn't use Bluetooth before adding RingSDK, you need to add Bluetooth usage permissions for the app.

To do this, follow the [Setting Up Bluetooth Permissions](#setting-up-bluetooth-permissions) section.

6. **Run the Project:**

To run your React Native project with the integrated RingSDK, use the following command:

  ```sh
  npx react-native run-ios --device "My Device Name"  # For iOS
  npx react-native run-android                        # For Android
  ```
### Creating a New Project and Installing RingSDK

To create a new React Native project and integrate the RingSDK, follow these steps:

1. **Initialize a New React Native Project:**

  ```sh
  npx react-native init myAppName
  cd myAppName
  ```

2. **Install the RingSDK Package:**

  ```sh
   npm install ring-sdk-react-native
  ```

3. **iOS Only: Install CocoaPods Dependencies:**

Change to the ios directory, install the CocoaPods dependencies, and configure Xcode for signing:

  ```sh
  cd ios
  pod install
  open myAppName.xcworkspace 
  ```
In Xcode, click on myAppName in the project navigator, go to the Signing & Capabilities tab, and select your team for signing.

After configuring signing in Xcode, return to the root directory:

  ```sh
  cd ..
  ```

4. **Set up Bluetooth permissions**

To use RingSDK in your new project, you need to add Bluetooth usage permissions for the app.

To do this, follow the [Setting Up Bluetooth Permissions](#setting-up-bluetooth-permissions) section.

5. **Run the Project:**

To run your React Native project with the integrated RingSDK, use the following command:

  ```sh
  npx react-native run-ios --device "My Device Name"  # For iOS
  npx react-native run-android                        # For Android
  ```


## Setting Up Bluetooth Permissions

If your project didn't use Bluetooth before adding the RingSDK or you are creating a new project, you need to add Bluetooth usage permissions for the app. The RingSDK will handle asking for the permissions, but you need to set them up in the podfile and/or Android manifest.

### iOS Setup

1. **Podfile Configuration**: Add the following lines to your `ios/Podfile` to include the necessary Bluetooth permissions.

   ```ruby
   target 'YourAppTarget' do
     # Add the following permissions for Bluetooth usage
     pod 'react-native-ble-plx', :path => '../node_modules/react-native-ble-plx'

     post_install do |installer|
       installer.pods_project.targets.each do |target|
         target.build_configurations.each do |config|
           config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
         end
       end
     end
   end
   ```

2. **Info.plist**: Add the following entries to your `ios/MyAppName/Info.plist` file to request Bluetooth permissions.

   ```xml
   <key>NSBluetoothAlwaysUsageDescription</key>
   <string>We need access to Bluetooth to connect to the ring.</string>
   <key>NSBluetoothPeripheralUsageDescription</key>
   <string>We need access to Bluetooth to connect to the ring.</string>
   <key>NSLocationAlwaysUsageDescription</key>
   <string>We need access to your location to use Bluetooth.</string>
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>We need access to your location to use Bluetooth.</string>
   ```

### Android Setup

1. **AndroidManifest.xml**: Add the following permissions to your `android/app/src/main/AndroidManifest.xml` file to request Bluetooth permissions.

   ```xml
   <uses-permission android:name="android.permission.BLUETOOTH" />
   <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
   <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

   <!-- Required for Bluetooth LE -->
   <uses-feature android:name="android.hardware.bluetooth_le" android:required="true"/>
   ```

2. **Gradle Configuration**: Ensure that your `android/build.gradle` and `android/app/build.gradle` files are configured to use the correct SDK versions.

   In `android/build.gradle`:

   ```gradle
   buildscript {
       ext {
           buildToolsVersion = "30.0.3"
           minSdkVersion = 21
           compileSdkVersion = 30
           targetSdkVersion = 30
       }
   }
   ```

   In `android/app/build.gradle`:

   ```gradle
   android {
       compileSdkVersion rootProject.ext.compileSdkVersion

       defaultConfig {
           minSdkVersion rootProject.ext.minSdkVersion
           targetSdkVersion rootProject.ext.targetSdkVersion
       }
   }
   ```

### Follow the react-native-ble-plx Setup Guide

For detailed setup instructions, follow the [react-native-ble-plx setup guide](https://github.com/Polidea/react-native-ble-plx/tree/master?tab=readme-ov-file#ios-example-setup) for both iOS and Android.


## Basic Setup

### Example App

Here’s a simplified example app that shows how to use the RingSDK to show live touch coordinates on the ring's touchpad.

  ```typescript
  import React, { useEffect, useState } from 'react';
  import { SafeAreaView, Text } from 'react-native';
  import { BleManager } from 'react-native-ble-plx';
  import { initializeRing, onTouchEvent } from 'ring-sdk-react-native';
  
  // Create a Bluetooth manager from the package react-native-ble-plx
  const manager = new BleManager();
  
  const App: React.FC = () => {
    const [touchpadXValue, setTouchpadXValue] = useState('0.00');
    const [touchpadYValue, setTouchpadYValue] = useState('0.00');
  
    useEffect(() => {
      const setupSDK = async () => {
        // Initialize the ring by passing the Bluetooth manager to the initializer function
        await initializeRing(manager);
        console.log('Ring is initialized.');
      };
      setupSDK();
  
      // Event handler for touch events
      const handleTouchEvent = (data: any) => {
        console.log('New touch data received:', data.x, data.y);
        setTouchpadXValue(data.x.toFixed(2));
        setTouchpadYValue(data.y.toFixed(2));
      };
  
      // Set the touch event callback
      onTouchEvent(handleTouchEvent);
  
      return () => {
        // Destroy Bluetooth manager upon exit
        manager.destroy();
      };
    }, []);
  
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Touchpad X: {touchpadXValue}</Text>
        <Text style={styles.text}>Touchpad Y: {touchpadYValue}</Text>
      </SafeAreaView>
    );
  };
  
  const styles = {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      margin: 10,
    },
  };
  
  export default App;

  ```

### Explanation

 - **Bluetooth Manager:** A Bluetooth manager is created using the react-native-ble-plx package.
 - **Initialization:** The initializeRing function is used to initialize the ring and set up the necessary Bluetooth connections.
 - **State Management:** The component maintains state for the touchpad values.
 - **Event Handlers:** Event handlers are set up to handle touch events from the ring.
   
For more comprehensive examples and advanced usage, please refer to the [example applications](https://github.com/Taika-Tech/ring-sdk-react-native/example_applications/) in the RingSDK GitHub repository.

## Contributing

We welcome contributions! 

If you would like to contribute to the RingSDK, please fork the repository and create a pull request with your changes.

Please see our CONTRIBUTING.md for more details on supporting our work.

## Licensing

This software is licensed under dual licensing terms:

1. **MIT License**: This license allows for free use, modification, and distribution of the Software for following use cases:
- when used with Taika Tech Oy's smart rings,
- when used for personal use,
- when used for educational use.

See the `LICENSE` file for the full text of the MIT License.

2. **Taika Software License 1 (TSL1)**: This license applies to the use of the Software with other manufacturers' smart rings, or other typically finger-worn or wrist-worn devices, and requires a separate commercial license from Taika Tech Oy. Contact sales@taikatech.fi to acquire such a license.

See the `COMMERCIAL_LICENSE` file for the full text of the TSL1.

## Contact
If you have any questions or need further assistance, please contact 
- dev@taikatech.fi for development related questions and feedback
- hello@taikatech.fi for general inquiries
