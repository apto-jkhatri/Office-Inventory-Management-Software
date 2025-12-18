import { PGlite } from "@electric-sql/pglite";
import { Asset, Employee, Assignment, MaintenanceLog, AssetRequest } from '../types';
import { INITIAL_ASSETS, INITIAL_EMPLOYEES, INITIAL_ASSIGNMENTS, INITIAL_MAINTENANCE, INITIAL_REQUESTS } from './mockData';

class DatabaseService {
  private db: PGlite | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    try {
      // Browsers require idb:// prefix for PGlite persistence
      this.db = new PGlite('idb://assetguard-v2-db');
      await this.db.waitReady;
      
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY,
          tag TEXT,
          name TEXT,
          "serialNumber" TEXT,
          category TEXT,
          vendor TEXT,
          "purchaseDate" TEXT,
          cost FLOAT,
          status TEXT,
          condition TEXT,
          location TEXT,
          "assignedTo" TEXT,
          image TEXT
        );
        
        CREATE TABLE IF NOT EXISTS employees (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT,
          department TEXT,
          role TEXT,
          "joinDate" TEXT,
          avatar TEXT
        );

        CREATE TABLE IF NOT EXISTS assignments (
          id TEXT PRIMARY KEY,
          "assetId" TEXT,
          "employeeId" TEXT,
          "borrowDate" TEXT,
          "expectedReturnDate" TEXT,
          "returnedDate" TEXT,
          notes TEXT,
          "isActive" BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS maintenance_logs (
          id TEXT PRIMARY KEY,
          "assetId" TEXT,
          description TEXT,
          vendor TEXT,
          cost FLOAT,
          date TEXT,
          status TEXT
        );

        CREATE TABLE IF NOT EXISTS requests (
          id TEXT PRIMARY KEY,
          "employeeId" TEXT,
          category TEXT,
          reason TEXT,
          status TEXT,
          "requestDate" TEXT
        );
      `);

      const { rows } = await this.db.query(`SELECT count(*) as count FROM assets`);
      // Use type assertion to avoid property access errors
      const count = parseInt((rows[0] as any).count as string || '0');
      
      if (count === 0) {
        await this.seedData();
      }
    } catch (err) {
      console.error("Database initialization failed:", err);
    }
  }

  private async seedData() {
    if (!this.db) return;
    
    console.log("Seeding initial data...");
    
    const insertAsset = async (a: Asset) => {
      await this.db!.query(
        `INSERT INTO assets (id, tag, name, "serialNumber", category, vendor, "purchaseDate", cost, status, condition, location, "assignedTo", image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [a.id, a.tag, a.name, a.serialNumber, a.category, a.vendor, a.purchaseDate, a.cost, a.status, a.condition, a.location, a.assignedTo, a.image]
      );
    };

    const insertEmployee = async (e: Employee) => {
      await this.db!.query(
        `INSERT INTO employees (id, name, email, department, role, "joinDate", avatar) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [e.id, e.name, e.email, e.department, e.role, e.joinDate, e.avatar]
      );
    };

    const insertAssignment = async (a: Assignment) => {
      await this.db!.query(
        `INSERT INTO assignments (id, "assetId", "employeeId", "borrowDate", "expectedReturnDate", "returnedDate", notes, "isActive") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [a.id, a.assetId, a.employeeId, a.borrowDate, a.expectedReturnDate, a.returnedDate, a.notes, a.isActive]
      );
    };

    const insertLog = async (l: MaintenanceLog) => {
      await this.db!.query(
        `INSERT INTO maintenance_logs (id, "assetId", description, vendor, cost, date, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [l.id, l.assetId, l.description, l.vendor, l.cost, l.date, l.status]
      );
    };
    
    const insertRequest = async (r: AssetRequest) => {
      await this.db!.query(
        `INSERT INTO requests (id, "employeeId", category, reason, status, "requestDate") VALUES ($1, $2, $3, $4, $5, $6)`,
        [r.id, r.employeeId, r.category, r.reason, r.status, r.requestDate]
      );
    };

    await Promise.all(INITIAL_ASSETS.map(insertAsset));
    await Promise.all(INITIAL_EMPLOYEES.map(insertEmployee));
    await Promise.all(INITIAL_ASSIGNMENTS.map(insertAssignment));
    await Promise.all(INITIAL_MAINTENANCE.map(insertLog));
    await Promise.all(INITIAL_REQUESTS.map(insertRequest));
  }

  async getAssets(): Promise<Asset[]> {
    await this.initPromise;
    const { rows } = await this.db!.query(`SELECT * FROM assets`);
    return rows as unknown as Asset[];
  }

  async saveAsset(asset: Asset): Promise<void> {
    await this.initPromise;
    await this.db!.query(`
      INSERT INTO assets (id, tag, name, "serialNumber", category, vendor, "purchaseDate", cost, status, condition, location, "assignedTo", image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
      tag = EXCLUDED.tag,
      name = EXCLUDED.name,
      "serialNumber" = EXCLUDED."serialNumber",
      category = EXCLUDED.category,
      vendor = EXCLUDED.vendor,
      "purchaseDate" = EXCLUDED."purchaseDate",
      cost = EXCLUDED.cost,
      status = EXCLUDED.status,
      condition = EXCLUDED.condition,
      location = EXCLUDED.location,
      "assignedTo" = EXCLUDED."assignedTo",
      image = EXCLUDED.image
    `, [asset.id, asset.tag, asset.name, asset.serialNumber, asset.category, asset.vendor, asset.purchaseDate, asset.cost, asset.status, asset.condition, asset.location, asset.assignedTo, asset.image]);
  }

  async deleteAsset(id: string): Promise<void> {
    await this.initPromise;
    await this.db!.query(`DELETE FROM assets WHERE id = $1`, [id]);
  }

  async getEmployees(): Promise<Employee[]> {
    await this.initPromise;
    const { rows } = await this.db!.query(`SELECT * FROM employees`);
    return rows as unknown as Employee[];
  }

  async saveEmployee(employee: Employee): Promise<void> {
    await this.initPromise;
    await this.db!.query(`
      INSERT INTO employees (id, name, email, department, role, "joinDate", avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      department = EXCLUDED.department,
      role = EXCLUDED.role,
      "joinDate" = EXCLUDED."joinDate",
      avatar = EXCLUDED.avatar
    `, [employee.id, employee.name, employee.email, employee.department, employee.role, employee.joinDate, employee.avatar]);
  }

  async getAssignments(): Promise<Assignment[]> {
    await this.initPromise;
    const { rows } = await this.db!.query(`SELECT * FROM assignments`);
    return rows as unknown as Assignment[];
  }

  async saveAssignment(assignment: Assignment): Promise<void> {
    await this.initPromise;
    await this.db!.query(`
      INSERT INTO assignments (id, "assetId", "employeeId", "borrowDate", "expectedReturnDate", "returnedDate", notes, "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
      "assetId" = EXCLUDED."assetId",
      "employeeId" = EXCLUDED."employeeId",
      "borrowDate" = EXCLUDED."borrowDate",
      "expectedReturnDate" = EXCLUDED."expectedReturnDate",
      "returnedDate" = EXCLUDED."returnedDate",
      notes = EXCLUDED.notes,
      "isActive" = EXCLUDED."isActive"
    `, [assignment.id, assignment.assetId, assignment.employeeId, assignment.borrowDate, assignment.expectedReturnDate, assignment.returnedDate, assignment.notes, assignment.isActive]);
  }

  async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    await this.initPromise;
    const { rows } = await this.db!.query(`SELECT * FROM maintenance_logs`);
    return rows as unknown as MaintenanceLog[];
  }

  async saveMaintenanceLog(log: MaintenanceLog): Promise<void> {
    await this.initPromise;
    await this.db!.query(`
      INSERT INTO maintenance_logs (id, "assetId", description, vendor, cost, date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
      "assetId" = EXCLUDED."assetId",
      description = EXCLUDED.description,
      vendor = EXCLUDED.vendor,
      cost = EXCLUDED.cost,
      date = EXCLUDED.date,
      status = EXCLUDED.status
    `, [log.id, log.assetId, log.description, log.vendor, log.cost, log.date, log.status]);
  }

  async getRequests(): Promise<AssetRequest[]> {
    await this.initPromise;
    const { rows } = await this.db!.query(`SELECT * FROM requests`);
    return rows as unknown as AssetRequest[];
  }

  async saveRequest(req: AssetRequest): Promise<void> {
    await this.initPromise;
    await this.db!.query(`
      INSERT INTO requests (id, "employeeId", category, reason, status, "requestDate")
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
      "employeeId" = EXCLUDED."employeeId",
      category = EXCLUDED.category,
      reason = EXCLUDED.reason,
      status = EXCLUDED.status,
      "requestDate" = EXCLUDED."requestDate"
    `, [req.id, req.employeeId, req.category, req.reason, req.status, req.requestDate]);
  }
}

export const db = new DatabaseService();