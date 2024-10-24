// Overlay.tsx
// Copyright Taika Tech Oy 2024. Full license notice at bottom of the file.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface BaseOverlayProps {
  visible: boolean;
  onClose: () => void;
  title: string;
}

interface OverlayProps extends BaseOverlayProps {
  children: React.ReactNode;
}

interface OverlayStyles {
  overlayStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  closeButtonStyle?: ViewStyle;
  closeButtonTextStyle?: TextStyle;
}

export const Overlay = ({
  visible,
  onClose,
  title,
  children,
}: OverlayProps): React.ReactElement => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          
          <ScrollView style={styles.scrollView}>
            {children}
          </ScrollView>

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: '80%',
  },
  closeButton: {
    backgroundColor: '#7F2FEB',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Overlay;

/* Overlay.tsx
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