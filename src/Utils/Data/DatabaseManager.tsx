/* DatabaseManager.tsx
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
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { tableConfigurations } from '../../Config/TableConfigurations';
import { logSQL } from '../Logging/TaikaLog';
import { TableColumn } from '../../Interfaces/Interfaces';
import { DataConfiguration } from '../../Interfaces/Interfaces';

class DatabaseManager {
    private static instance: DatabaseManager | null = null;
    private db: SQLiteDatabase | null = null;
    private dbReady: Promise<void> = Promise.resolve();  // Promise to track database readiness

    private constructor() {
        this.connectToDb();  // Initiate database connection and table creation
    }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public awaitReady(): Promise<void> {
        return this.dbReady;
    }

    private connectToDb() {
        this.dbReady = new Promise((resolve, reject) => {
            SQLite.openDatabase(
                { name: 'my.db', location: 'default' },
                db => {
                    this.db = db;
                    logSQL("Database successfully opened");
                    this.initializeTables(tableConfigurations).then(resolve).catch(reject);
                },
                error => {
                    console.error('Failed to open database:', error);
                    reject(error);
                }
            );
        });
    }

    public async initializeTables(configurations: {[key: string]: DataConfiguration}): Promise<void> {
        if (!this.db) {
            console.error("Database initialization failed: Database instance is not ready.");
            throw new Error("Database instance is not ready.");
        }

        logSQL("Starting table initialization in DatabaseManager initialization.");

        for (const key in configurations) {
            const config = configurations[key as keyof typeof configurations];
            if (await this.checkTableExists(config.tableName)) {
                logSQL(`Table '${config.tableName}' already exists, moving to next table.`);
            } else {
                logSQL(`Preparing to create table '${config.tableName}' with configuration:`, config);
                const fields = config.fields.map((field, index) => ({
                    name: field,
                    type: this.validateSqlType(config.types[index]),
                    primaryKey: config.primaryKey.includes(field),
                    notNull: true
                }));

                logSQL(`Creating table '${config.tableName}' with fields:`, fields);
                await this.createTable(config.tableName, fields);

                if (Object.keys(config.defaultData).length > 0) {
                    logSQL(`Inserting default data into table '${config.tableName}':`, config.defaultData);
                    await this.insertRow(config.tableName, config.defaultData);
                }  else {
                    logSQL(`No default data needed or table '${config.tableName}' is not empty.`);
                }
            }

        }
        logSQL("Table initialization completed.");
    }

    private createTable(tableName: string, columns: TableColumn[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db?.transaction(tx => {
                tx.executeSql(
                    `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
                    [tableName],
                    (tx, results) => {
                        if (results.rows.length > 0) {
                            logSQL(`${tableName} table already exists`);
                            resolve();
                        } else {
                            let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
                            sql += columns.map(col => {
                                return `${col.name} ${col.type}` +
                                    (col.notNull ? ' NOT NULL' : '');
                            }).join(', ');
    
                            // Handle composite primary key
                            const primaryKeys = columns.filter(col => col.primaryKey).map(col => col.name);
                            if (primaryKeys.length > 0) {
                                sql += `, PRIMARY KEY (${primaryKeys.join(', ')})`;
                            }
    
                            sql += ');';
    
                            tx.executeSql(sql, [], () => {
                                logSQL(`${tableName} table created successfully`);
                                resolve();
                            }, (error) => {
                                console.error(`Error creating ${tableName} table:`, error);
                                reject(new Error(`Error creating ${tableName} table`));
                            });
                        }
                    },
                    (error) => {
                        console.error(`${tableName} table Transaction error:`, error);
                        reject(new Error(`${tableName} table Transaction error: ${error}`));
                    }
                );
            });
        });
    }

    public getTable(tableName: string): Promise<any[]> {
        if (!this.db) {
            return Promise.reject(new Error("Database connection is not established."));
        }

        return new Promise((resolve, reject) => {
            this.db?.transaction(tx => {
                tx.executeSql(`SELECT * FROM ${tableName};`, [], (tx, results) => {
                    const rows = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        rows.push(results.rows.item(i));
                    }
                    resolve(rows);
                }, (error) => {
                    console.error(`Transaction error while retrieving data from ${tableName}:`, error);
                    reject(new Error(`Transaction error while retrieving data from ${tableName}: ${error}`));
                });
            });
        });
    }

    public insertRow(tableName: string, rowData: {[key: string]: any}): Promise<void> {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(rowData);
            const values = Object.values(rowData);
            const placeholders = keys.map(() => '?').join(', ');

            const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders});`;

            this.db?.transaction(tx => {
                tx.executeSql(sql, values, () => {
                    logSQL(`SQL: Inserted into ${tableName} successfully`);
                    resolve();
                }, (error) => {
                    logSQL(`Error inserting ${JSON.stringify(rowData)} into ${tableName}:`, error);
                    reject(new Error(`Error inserting into ${tableName}: ${error}`));
                });
            });
        });
    }

    public updateRow(tableName: string, rowData: {[key: string]: any}, condition: string, conditionParams: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database connection is not established."));
            }
    
            // Build the SET part of the SQL command
            const keys = Object.keys(rowData);
            const setCommands = keys.map(key => `${key} = ?`).join(', ');
            const values = Object.values(rowData);
    
            // Append condition parameters after row data values for the SQL execution
            const sql = `UPDATE ${tableName} SET ${setCommands} WHERE ${condition};`;
    
            logSQL("updateRow conditionParams", conditionParams);

            this.db.transaction(tx => {
                tx.executeSql(sql, [...values, ...conditionParams], () => {
                    logSQL(`SQL: Updated rows in ${tableName} successfully`);
                    resolve();
                }, (txError) => {
                    console.error(`Error updating ${tableName}:`, txError);
                    reject(new Error(`Error updating ${tableName}: ${txError}`));
                });
            });
        });
    }

    public deleteRow(tableName: string, condition: string, conditionParams: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database connection is not established."));
            }
    
            const sql = `DELETE FROM ${tableName} WHERE ${condition};`;
    
            this.db.transaction(tx => {
                tx.executeSql(sql, conditionParams, (_, result) => {
                    logSQL(`Deleted rows from ${tableName} successfully`);
                    resolve();
                }, (txError) => {
                    console.error(`Error deleting from ${tableName}:`, txError);
                    reject(new Error(`Error deleting from ${tableName}: ${txError}`));
                });
            });
        });
    }

    public customQuery(sql: string, params: any[] = [], tx?: SQLite.Transaction): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const performQuery = (transaction: SQLite.Transaction) => {
                transaction.executeSql(sql, params, (transaction, results) => {
                    const rows = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        rows.push(results.rows.item(i));
                    }
                    resolve(rows);
                }, (transaction, error) => {
                    console.error(`Transaction error while executing custom query:`, error);
                    reject(new Error(`Transaction error while executing custom query: ${error.message}`));
                });
            };
    
            if (tx) {
                performQuery(tx);
            } else {
                if (!this.db) {
                    return reject(new Error("Database connection is not established."));
                }
                this.db.transaction(performQuery, reject);
            }
        });
    }

    public async checkTableExists(tableName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db?.transaction(tx => {
                tx.executeSql(
                    `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
                    [tableName],
                    (tx, results) => {
                        if (results.rows.length > 0) {
                            resolve(true); // The table exists
                        } else {
                            resolve(false); // The table does not exist
                        }
                    },
                    (error) => {
                        console.error(`Transaction error when checking for ${tableName}:`, error);
                        reject(new Error(`Transaction error when checking for ${tableName}: ${error}`));
                    }
                );
            });
        });
    }
    
    private validateSqlType(type: string): 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB' {
        const validTypes = ['INTEGER', 'TEXT', 'REAL', 'BLOB'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid SQL type: ${type}`);
        }
        return type as 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB';
    }
}

export default DatabaseManager;