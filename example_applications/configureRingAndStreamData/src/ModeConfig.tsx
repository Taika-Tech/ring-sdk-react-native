// ModeConfig.tsx
// Copyright Taika Tech Oy 2024. Full license notice at bottom of the file.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Overlay from './Overlay';

interface ModeConfigProps {
  visible: boolean;
  onClose: () => void;
}

export const ModeConfig: React.FC<ModeConfigProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Overlay
      visible={visible}
      onClose={onClose}
      title="Ring Configuration">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode Type</Text>
        <View style={styles.content}>
          <Text style={styles.placeholder}>Mode type options will go here</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeout</Text>
        <View style={styles.content}>
          <Text style={styles.placeholder}>Timeout options will go here</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.content}>
          <Text style={styles.placeholder}>Color options will go here</Text>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  content: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#7F2FEB',
  },
  placeholder: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

export default ModeConfig;

/* ModeConfig.tsx
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