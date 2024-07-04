/* GenericDataController.tsx
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
import DatabaseManager from './DatabaseManager';
import { DataConfiguration } from '../../Interfaces/Interfaces';

class GenericDataController {
    private dbManager: DatabaseManager;
    private config: DataConfiguration;

    constructor(config: DataConfiguration) {
        this.config = config;
        this.dbManager = DatabaseManager.getInstance();
    }

    // Ensure database readiness and check if the table exists
    private async checkTableExistsAndReady(): Promise<void> {
        await this.dbManager.awaitReady();
        const tableExists = await this.dbManager.checkTableExists(this.config.tableName);
        if (!tableExists) {
            console.error(`Table does not exist: ${this.config.tableName}`);
            throw new Error(`Table does not exist: ${this.config.tableName}`);
        }
    }

    // Saves or updates data in a specified table based on the provided condition; 
    // Use condition like "id = ?" and [data.id] for upsert (update or insert) behavior.
    async saveData(data: any, condition?: string, conditionParams: any[] = []): Promise<void> {
        try {
            await this.checkTableExistsAndReady();
            if (condition) {
                const existingData = await this.getData(condition, conditionParams);
                if (existingData.length > 0) {
                    // Update if condition is met and data exists
                    await this.dbManager.updateRow(this.config.tableName, data, condition, conditionParams);
                } else {
                    // Insert if condition is provided but no data exists
                    await this.dbManager.insertRow(this.config.tableName, data);
                }
            } else {
                // Insert if no condition is provided (generic fallback)
                await this.dbManager.insertRow(this.config.tableName, data);
            }
        } catch (error) {
            console.error("Failed to save data in ", this.config.tableName, " with condition ", condition, " Error: ", error);
        }
    }

    // Retrieve data
    async getData(condition?: string, conditionParams: any[] = []): Promise<any[]> {
        try {
            await this.checkTableExistsAndReady();
            if (condition) {
                return this.dbManager.customQuery(`SELECT * FROM ${this.config.tableName} WHERE ${condition};`, conditionParams);
            } else {
                return this.dbManager.getTable(this.config.tableName);
            }
        } catch (error) {
            console.error("Failed to fetch data from ", this.config.tableName, " with condition ", condition, " Error: ", error);
            return [];
        }
    }

    // Delete data
    async deleteData(condition: string, conditionParams: any[]): Promise<void> {
        try {
            await this.checkTableExistsAndReady();
            await this.dbManager.deleteRow(this.config.tableName, condition, conditionParams);
        } catch (error) {
            console.error("Failed to delete data from ", this.config.tableName, " with condition ", condition, " Error: ", error);
        }
    }
}

export default GenericDataController;
