/* BleLogs.tsx
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
import { logBLE } from './TaikaLog';
import { TouchpadReadType } from '../../Interfaces/Enums';
import { ControlToClientNames, taikaFileNames } from '../../Services/ControlService';

const IQS7211E_ATI_ERROR_BIT = 3;
const IQS7211E_ALP_ATI_ERROR_BIT = 5;
const IQS7211E_TP_RE_ATI_BIT = 4;
const IQS7211E_ALP_RE_ATI_BIT = 6;
const trackpadSettings01 = 8;
const trackpadSettings10 = 3;
let tooManyFingers = false;

class BleLogs {
    private static instance: BleLogs;
    public bleHasPermissions: boolean = false;
    public isBLEManagerReady: boolean = false;
    public scanningInProgress: boolean = false;
    public serviceDiscoveryComplete: boolean = false;

    private constructor() {}

    public static getInstance(): BleLogs {
        if (!BleLogs.instance) {
            BleLogs.instance = new BleLogs();
        }
        return BleLogs.instance;
    }

    public logRingError(data: number[]) {
        if (data.length < 12) {
            console.error("Insufficient data length to extract all fields.");
            return;
        }
    
        const taikaStatusCode = (data[0] | (data[1] << 8)).toString(16);
        const slStatusCode = (data[2] | (data[3] << 8) | (data[4] << 16) | (data[5] << 24)).toString(16);
        const taikaRingFile = taikaFileNames[data[6]]
        const index = (data[7] | (data[8] << 8)).toString(16);
        const count = data[9].toString(16);
        const reserved = (data[10] | (data[11] << 8) | (data[12] << 16) | (data[13] << 24)).toString(16);
        
        logBLE(" ----------------------------------")
        logBLE("|                                  |")
        logBLE(`|   File: ${taikaRingFile.padStart(2, '0')}          |`);
        logBLE(`|   Taika Status Code: 0x${taikaStatusCode.padStart(4, '0')}      |`);
        logBLE(`|   SL Status Code: 0x${slStatusCode.padStart(8, '0')}     |`);
        logBLE(`|   Index: 0x${index.padStart(4, '0')}                  |`);
        logBLE(`|   Count: 0x${count.padStart(2, '0')}                    |`);
        logBLE(`|   Reserved: 0x${reserved.padStart(8, '0')}           |`);
        logBLE("|                                  |")
        logBLE(" ----------------------------------")      
    }

    public controlToClient(byteArray: number[]) {
        if (byteArray.length < 1) {
            logBLE("Control to client signal empty.");    
            return;
        }
        const newArray = byteArray.slice(1);
        logBLE(ControlToClientNames[byteArray[0]], ": ", newArray);
    }


    public logTouchpadData(logType: TouchpadReadType, byteArray: number[]) {
        const counter = byteArray[1] << 8 | byteArray[0];
        const timestampMs = byteArray[5] << 24 | byteArray[4] << 16 | byteArray[3] << 8 | byteArray[2];
        byteArray = byteArray.slice(6)

        //logBLE("Counter:", counter, ". Timestamp: ", timestampMs, ". Len: ", byteArray.length);
        switch (logType) {
            case TouchpadReadType.TP_default:
                logBLE("\t\t\t\t\t-TP-DEBUG-DATA-");
                logTouchpadInfo(byteArray);
                break;
                
            case TouchpadReadType.TP_counts:
                logBLE("\t\t\t\t\t-TP-COUNTS-");
                printChannelData(byteArray);
                break;
                
            case TouchpadReadType.TP_references:
                logBLE("\t\t\t\t\t-TP-REFERENCES-");
                printChannelData(byteArray);
                break;
                
            case TouchpadReadType.TP_compensation:
                logBLE("\t\t\t\t\t-TP-COMPENSATION-");
                printChannelData(byteArray);
                break;
                
            case TouchpadReadType.TP_deltas:
                logBLE("\t\t\t\t\t-TP-DELTAS-");
                printChannelDataSigned(byteArray);
                break;
                
        }

    }
}

function printChannelData(byteArray: number[]): void {
    const length = trackpadSettings01 * trackpadSettings10;
    let log = '\n';

    for (let i = 0; i < length; i++) {
        const value = (byteArray[i * 2] | (byteArray[i * 2 + 1] << 8)) >>> 0;
        log += `${value.toString().padStart(5, ' ')} `;

        if (i % trackpadSettings01 === (trackpadSettings01 - 1)) {
            log += '\n';
        }
    }
    log += '\n';
    logBLE(log);
}

function printChannelDataSigned(byteArray: number[]): void {
    const length = trackpadSettings01 * trackpadSettings10;
    let log = '\n';

    for (let i = 0; i < length; i++) {
        const value = (byteArray[i * 2] | (byteArray[i * 2 + 1] << 8)) << 16 >> 16; // Ensures signed 16-bit integer
        log += `${value.toString().padStart(5, ' ')} `;

        if (i % trackpadSettings01 === (trackpadSettings01 - 1)) {
            log += '\n';
        }
    }
    log += '\n';
    logBLE(log);
}


function logTouchpadInfo(transferBytes: number[]): void {
  log_ATI_errors(transferBytes);
  printInfo(transferBytes);
  //printLowPowerData(transferBytes);
  //printTouchpad(transferBytes);
  printFingerLocation(transferBytes);
  if (tooManyFingers) {
    printTouchpad(transferBytes);
  }
}

function log_ATI_errors(transferBytes: number[]): void {
  const infoFlags = transferBytes[10];

  if (infoFlags & (1 << IQS7211E_ATI_ERROR_BIT)) {
    logBLE("ATI error.");
  }
  if (infoFlags & (1 << IQS7211E_ALP_ATI_ERROR_BIT)) {
    logBLE("ALP ATI error.");
  }
  if (infoFlags & (1 << IQS7211E_TP_RE_ATI_BIT)) {
    logBLE("ReATI.");
  }
  if (infoFlags & (1 << IQS7211E_ALP_RE_ATI_BIT)) {
    logBLE("ALP ReATI.");
  }
}

function printInfo(transferBytes: number[]): void {
  const buf0 = transferBytes[10];
  const buf1 = transferBytes[11];

  if (buf0 & 0x08) {
    logBLE("Info: Ati error.");
  }
  if (buf0 & 0x10) {
    logBLE("Info: ReAti occured.");
  }
  if (buf0 & 0x20) {
    logBLE("Info: ALP Ati error.");
  }
  if (buf0 & 0x40) {
    logBLE("Info: ALP ReAti occured.");
  }
  if (buf0 & 0x80) {
    logBLE("Info: Reset occured.");
  }

  if (buf1 & 0x01) {
    logBLE("Info: 1 finger.");
  }
  if (buf1 & 0x02) {
    logBLE("Info: 2 fingers.");
  }
  if (buf1 & 0x04) {
    logBLE("Info: TP movement.");
  }
  if (buf1 & 0x10) {
    logBLE("Info: Too many fingers.");
    tooManyFingers = true;
  } else {
    tooManyFingers = false;
  }
  if (buf1 & 0x40) {
    logBLE("Info: ALP output.");
  }
}

function printLowPowerData(transferBytes: number[]): void {
  const ALP_ATI_COMP_A = (transferBytes[43] << 8) | transferBytes[42];
  const ALP_ATI_COMP_B = (transferBytes[45] << 8) | transferBytes[44];
  const ALP_CHANNEL_COUNT_A = (transferBytes[39] << 8) | transferBytes[38];
  const ALP_CHANNEL_COUNT_B = (transferBytes[41] << 8) | transferBytes[40];
  const ALP_CHANNEL_COUNT = (transferBytes[35] << 8) | transferBytes[34];
  const ALP_CHANNEL_LTA = (transferBytes[37] << 8) | transferBytes[36];

  logBLE(`ALP ATI comp A: ${ALP_ATI_COMP_A}`);
  logBLE(`ALP ATI comp B: ${ALP_ATI_COMP_B}`);
  logBLE(`ALP count A: ${ALP_CHANNEL_COUNT_A}`);
  logBLE(`ALP count B: ${ALP_CHANNEL_COUNT_B}`);
  logBLE(`ALP count: ${ALP_CHANNEL_COUNT}`);
  logBLE(`ALP count LTA: ${ALP_CHANNEL_LTA}`);
  logBLE("\n\n");
}

function printTouchpad(transferBytes: number[]): void {
  const tpStatus = (transferBytes[30] << 16) | (transferBytes[29] << 8) | (transferBytes[28]);
  if (tpStatus == 0) {
    return;
  }
  const length = trackpadSettings01 * trackpadSettings10;
  let log = '\n';
  let value=0;

  for (let i = 0; i < length; i++) {
    if (tpStatus & (1 << i)) {
        value = 1;
        log += `${value.toString().padStart(5, ' ')} `;
    } else {
        value = 0;
        log += `${value.toString().padStart(5, ' ')} `;
    }

    if (i % trackpadSettings01 === (trackpadSettings01 - 1)) {
        log += '\n';
    }
    }
    log += '\n';
    logBLE(log); 
}

function printFingerLocation(byteArray: number[]): void {
    const finger_x = byteArray[13] << 8 | byteArray[12];
    const finger_y = byteArray[15] << 8 | byteArray[14];
    
    if (finger_x == 65535 && finger_y == 65535) {
        // No new data
        return;
    }

    logBLE("Finger location: X: ", finger_x, "y: ", finger_y); 
}

export default BleLogs;