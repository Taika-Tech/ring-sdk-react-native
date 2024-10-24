# Example RingSDK App

This example app demonstrates how to use the RingSDK to integrate and interact with a Taika Ring in a React Native application. The app shows a live visualization of touch coordinates on the ring's touchpad and displays live IMU data. It also includes a button to toggle data streaming from the ring.

## Overview

### Key Features

1. **Initialization**: The app initializes the RingSDK by creating a Bluetooth manager and passing it to the `initializeRing` function.
2. **State Management**: The app maintains the state for touchpad values, IMU values, and the streaming status.
3. **Event Handling**: The app sets up event handlers for ring connection, disconnection, touch events, and motion events.
4. **Data Visualization**: The app visualizes touchpad data as a trail of dots and displays IMU data in text format.
5. **Toggle Streaming**: A button in the UI toggles the data streaming from the ring.

## Code Explanation

### Initialization

The `useEffect` hook initializes the RingSDK by creating a Bluetooth manager and setting up the ring instance. It also ensures that the Bluetooth manager is destroyed when the component unmounts.

   ```typescript
   useEffect(() => {
     const setupSDK = async () => {
       const ringInstance = await initializeRing(manager);
       setRing(ringInstance.ring);
       console.log('Ring is initialized.');
     };
     setupSDK();
     return () => {
       manager.destroy();
     };
   }, []);
   ```

### Event Handling

Event handlers are set up for ring connection, disconnection, touch events, and motion events. These handlers update the state with the new data received from the ring.

   ```typescript
   useEffect(() => {
     const handleConnected = () => console.log('Ring connected!');
     const handleDisconnected = () => console.log('Ring disconnected!');
     const handleTouchEvent = (data: any) => {
       setTouchpadXValue(data.x.toFixed(2));
       setTouchpadYValue(data.y.toFixed(2));
       setTrail(prevTrail => [...prevTrail, { x: data.x.toFixed(2), y: data.y.toFixed(2) }].slice(-20));
     };
     const handleMotionEvent = (data: any) => {
       setAccXValue(data[0].toFixed(2));
       setAccYValue(data[1].toFixed(2));
       setAccZValue(data[2].toFixed(2));
     };
   
     onConnected(handleConnected);
     onDisconnected(handleDisconnected);
     onTouchEvent(handleTouchEvent);
     onMotionEvent(handleMotionEvent);
   
     return () => {
       ringEventHandler.off('connected', handleConnected);
       ringEventHandler.off('disconnected', handleDisconnected);
       ringEventHandler.off('touchEvent', handleTouchEvent);
       ringEventHandler.off('motionEvent', handleMotionEvent);
     };
   }, []);
   ```

### Toggle Data Streaming

The `toggleSendData` function toggles the data streaming from the ring when the button is pressed. It updates the `sendData` state and calls the `setTouchpadStreaming` method on the ring instance.

   ```typescript
   const toggleSendData = () => {
     setSendData(prevSendData => {
       const newSendData = !prevSendData;
       if (ring !== undefined) {
         ring.setTouchpadStreaming(newSendData);
       }
       return newSendData;
     });
   };
   ```

### UI Components

The UI consists of a `SafeAreaView` that contains a header, sections for touchpad and IMU data, and a button to toggle data streaming. The touchpad data is visualized as a trail of dots, and the IMU data is displayed in text format.

   ```typescript
   return (
     <SafeAreaView style={styles.container}>
       <View>
         <Text style={styles.h1}>Ring Data</Text>
         <View style={styles.pageSection}>
           <Text style={styles.h2}>Touchpad</Text>
           <View style={[styles.touchPad, { height: 756 / 8, width: 2048 / 8 }]}>
             {trail.map((point, index) => (
               <View
                 key={index}
                 style={[
                   styles.dot,
                   {
                     left: `${(parseFloat(point.x) / 2048) * 100}%`,
                     top: `${(parseFloat(point.y) / 756) * 100}%`,
                     opacity: (index + 1) / trail.length,
                     height: 6,
                     width: 6,
                   },
                 ]}
               />
             ))}
             <View
               style={[
                 styles.dot,
                 {
                   left: `${(parseFloat(touchpadXValue) / 2048) * 100}%`,
                   top: `${(parseFloat(touchpadYValue) / 756) * 100}%`,
                 },
               ]}
             />
           </View>
         </View>
         <View style={styles.pageSection}>
           <Text style={styles.h2}>IMU</Text>
           <Text style={styles.text}>
             X = <Text style={styles.dataValue}>{accXValue}</Text>
           </Text>
           <Text style={styles.text}>
             Y = <Text style={styles.dataValue}>{accYValue}</Text>
           </Text>
           <Text style={styles.text}>
             Z = <Text style={styles.dataValue}>{accZValue}</Text>
           </Text>
         </View>
         <TouchableOpacity style={styles.button} onPress={toggleSendData}>
           <Text style={styles.buttonText}>
             {sendData ? 'Stop Stream' : 'Start Stream'}
           </Text>
         </TouchableOpacity>
       </View>
     </SafeAreaView>
   );
   ```

For more details of the SDK, please refer to the [RingSDK](https://github.com/Taika-Tech/ring-sdk-react-native/) GitHub repository.
