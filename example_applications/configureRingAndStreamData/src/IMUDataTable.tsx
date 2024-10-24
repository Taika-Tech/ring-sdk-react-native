// IMUDataTable.tsx
// Copyright Taika Tech Oy 2024. Full license notice at bottom of the file.

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

// Interface supporting both number and string input
interface IMUDataTableProps {
  data: {
    x: number | string;
    y: number | string;
    z: number | string;
  };
}
interface DataRowProps {
  axis: 'X' | 'Y' | 'Z';
  value: string | number;
}

// Function for splitting the integer and decimal parts of value
const splitValue = (value: string) => {
  const [integer, decimal] = value.toString().split('.');
  return {integer, decimal: decimal || '00'};
};

// Component for one row of data
const DataRow: React.FC<DataRowProps> = ({axis, value}) => {
  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
  return (
    <View style={styles.tableRow}>
      <View style={styles.column1}>
        <Text style={styles.text}>{axis} =</Text>
      </View>
      <View style={styles.column2}>
        <Text
          style={[
            styles.text,
            styles.dataValue,
            styles.alignRight,
          ]}>
          {splitValue(formattedValue).integer}
        </Text>
      </View>
      <View style={styles.column3}>
        <Text style={[styles.text, styles.dataValue]}>.</Text>
      </View>
      <View style={styles.column4}>
        <Text style={[styles.text, styles.dataValue]}>
          {splitValue(formattedValue).decimal}
        </Text>
      </View>
    </View>
  );
};
  
// Data table component
export const IMUDataTable: React.FC<IMUDataTableProps> = ({data}) => {
  return (
    <View style={styles.table}>
      <DataRow axis="X" value={data.x} />
      <DataRow axis="Y" value={data.y} />
      <DataRow axis="Z" value={data.z} />
    </View>
  );
};

const styles = StyleSheet.create({
  alignCenter: {
    textAlign: "center"
  },
  alignRight: {
    textAlign: "right"
  },
  column1: {
    color: "white",
    fontSize: 18,
    width: 40,
  },
  column2: {
    width: 62,
  },
  column3: {
    width: 18,
  },
  column4: {
    fontSize: 18,
    width: 36,
  },
  dataValue: {
    color: '#7F2FEB',
    fontWeight: 'bold',
  },
  table: {
    flexDirection: 'column',
    width: 130,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: "flex-end",
    paddingVertical: 5,
  },
  text: {
    color: 'white',
    fontSize: 25,
    marginBottom: 2,
  },
});
  
export default IMUDataTable;

/* IMUDataTable.tsx
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