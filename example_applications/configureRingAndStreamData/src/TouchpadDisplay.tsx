// TouchpadDisplay.tsx
// Copyright Taika Tech Oy 2024. Full license notice at bottom of the file.

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';

interface Point {
  x: string | number;
  y: string | number;
}

interface TouchpadDisplayProps {
  currentPosition: Point;
  maxTrailPoints?: number;
  touchpadWidth?: number;
  touchpadHeight?: number;
  dotSize?: number;
  trailDotSize?: number;
}

interface Coordinates {
  right: DimensionValue;
  bottom: DimensionValue;
}

// Circular buffer implementation for efficient FIFO
class CircularTrailBuffer {
  private buffer: Point[];
  private head: number = 0;
  private size: number = 0;
  
  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(point: Point) {
    const index = (this.head + this.size) % this.capacity;
    this.buffer[index] = point;
    
    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  getPoints(): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % this.capacity;
      points.push(this.buffer[index]);
    }
    return points;
  }
}

export const TouchpadDisplay: React.FC<TouchpadDisplayProps> = ({
  currentPosition,
  maxTrailPoints = 20,
  touchpadWidth = 756,
  touchpadHeight = 2048,
  dotSize = 10,
  trailDotSize = 6,
}) => {
  // Use ref for trail buffer to persist between renders
  const trailBufferRef = useRef(new CircularTrailBuffer(maxTrailPoints));

  // Memoized coordinate calculation
  const calculateCoordinates = useCallback((point: Point): Coordinates => {
    const x = typeof point.x === 'string' ? parseFloat(point.x) : point.x;
    const y = typeof point.y === 'string' ? parseFloat(point.y) : point.y;
    
    return {
      right: `${(x / touchpadWidth) * 100}%`,
      bottom: `${(y / touchpadHeight) * 100}%`,
    };
  }, [touchpadWidth, touchpadHeight]);

  // Update trail with current position
  React.useEffect(() => {
    trailBufferRef.current.push(currentPosition);
  }, [currentPosition.x, currentPosition.y]);

  // Get current trail points
  const trailPoints = trailBufferRef.current.getPoints();

  // Function for styling the dots based on age (i.e. dimming older points)
  const getTrailDotStyle = useCallback((coords: Coordinates, index: number): ViewStyle => {
    return {
      ...styles.dot,
      right: coords.right,
      bottom: coords.bottom,
      opacity: (index + 1) / trailPoints.length,
      height: trailDotSize,
      width: trailDotSize,
    };
  }, [trailPoints.length, trailDotSize]);

  const getCurrentDotStyle = useCallback((coords: Coordinates): ViewStyle => {
    return {
      ...styles.dot,
      right: coords.right,
      bottom: coords.bottom,
      height: dotSize,
      width: dotSize,
    };
  }, [dotSize]);

  return (
    <View
      style={[
        styles.touchPad,
        {
          width: touchpadWidth / 8,
          height: touchpadHeight / 8,
        },
      ]}>
      {trailPoints.map((point, index) => {
        const coords = calculateCoordinates(point);
        return (
          <View
            key={index}
            style={getTrailDotStyle(coords, index)}
          />
        );
      })}
      <View
        style={getCurrentDotStyle(calculateCoordinates(currentPosition))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  touchPad: {
    borderColor: 'white',
    borderWidth: 1,
    position: 'relative',
  },
  dot: {
    backgroundColor: '#7F2FEB',
    borderRadius: 5,
    position: 'absolute',
  },
});

export default TouchpadDisplay;

/* TouchpadDisplay.tsx
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