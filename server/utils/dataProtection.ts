import { db } from "../db";
import { 
  dataBackups, auditLogs, dataProtectionSettings, clinics, cities, districts, packages, services,
  type InsertDataBackup, type InsertAuditLog, type InsertDataProtectionSetting
} from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface BackupOptions {
  backupType: 'full' | 'clinics' | 'cities' | 'manual';
  description?: string;
  createdBy?: string;
}

export interface AuditLogOptions {
  tableName: string;
  recordId: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  oldData?: any;
  newData?: any;
  changedFields?: string[];
  userId?: string;
  userIp?: string;
  userAgent?: string;
}

export class DataProtection {
  // Create backup of specified data
  static async createBackup(options: BackupOptions): Promise<string> {
    let backupData: any = {};
    let recordCount = 0;

    switch (options.backupType) {
      case 'full':
        const [clinicsData, citiesData, districtsData, packagesData, servicesData] = await Promise.all([
          db.select().from(clinics),
          db.select().from(cities),
          db.select().from(districts),
          db.select().from(packages),
          db.select().from(services),
        ]);
        
        backupData = {
          clinics: clinicsData,
          cities: citiesData,
          districts: districtsData,
          packages: packagesData,
          services: servicesData,
        };
        recordCount = clinicsData.length + citiesData.length + districtsData.length + packagesData.length + servicesData.length;
        break;

      case 'clinics':
        const clinicsDataOnly = await db.select().from(clinics);
        backupData = { clinics: clinicsDataOnly };
        recordCount = clinicsDataOnly.length;
        break;

      case 'cities':
        const [citiesDataOnly, districtsDataOnly] = await Promise.all([
          db.select().from(cities),
          db.select().from(districts),
        ]);
        backupData = { cities: citiesDataOnly, districts: districtsDataOnly };
        recordCount = citiesDataOnly.length + districtsDataOnly.length;
        break;

      case 'manual':
        // For manual backups, data should be provided separately
        backupData = {};
        recordCount = 0;
        break;
    }

    const dataSize = JSON.stringify(backupData).length;

    const backup: InsertDataBackup = {
      backupType: options.backupType,
      description: options.description || `Automatic ${options.backupType} backup`,
      dataSize,
      recordCount,
      backupData,
      createdBy: options.createdBy || 'system',
    };

    const [newBackup] = await db.insert(dataBackups).values(backup).returning();
    return newBackup.id;
  }

  // Restore data from backup
  static async restoreFromBackup(backupId: string, options: { 
    restoreType?: 'full' | 'partial';
    tables?: string[];
    userId?: string;
  } = {}): Promise<void> {
    const [backup] = await db.select().from(dataBackups).where(eq(dataBackups.id, backupId));
    
    if (!backup) {
      throw new Error('Backup not found');
    }

    const { restoreType = 'full', tables = [], userId } = options;
    const backupData = backup.backupData as any;

    // Log the restore action
    await this.logAudit({
      tableName: 'backup_restore',
      recordId: backupId,
      action: 'restore',
      newData: { restoreType, tables },
      userId,
      userAgent: 'system',
    });

    if (restoreType === 'full') {
      // Full restore - clear and restore all data
      await db.delete(services);
      await db.delete(packages);
      await db.delete(clinics);
      await db.delete(districts);
      await db.delete(cities);

      if (backupData.cities) {
        await db.insert(cities).values(backupData.cities);
      }
      if (backupData.districts) {
        await db.insert(districts).values(backupData.districts);
      }
      if (backupData.clinics) {
        await db.insert(clinics).values(backupData.clinics);
      }
      if (backupData.packages) {
        await db.insert(packages).values(backupData.packages);
      }
      if (backupData.services) {
        await db.insert(services).values(backupData.services);
      }
    } else {
      // Partial restore - only specified tables
      for (const table of tables) {
        switch (table) {
          case 'cities':
            if (backupData.cities) {
              await db.delete(cities);
              await db.insert(cities).values(backupData.cities);
            }
            break;
          case 'districts':
            if (backupData.districts) {
              await db.delete(districts);
              await db.insert(districts).values(backupData.districts);
            }
            break;
          case 'clinics':
            if (backupData.clinics) {
              await db.delete(services);
              await db.delete(packages);
              await db.delete(clinics);
              await db.insert(clinics).values(backupData.clinics);
            }
            break;
        }
      }
    }
  }

  // Log audit trail
  static async logAudit(options: AuditLogOptions): Promise<void> {
    const auditLog: InsertAuditLog = {
      tableName: options.tableName,
      recordId: options.recordId,
      action: options.action,
      oldData: options.oldData,
      newData: options.newData,
      changedFields: options.changedFields,
      userId: options.userId,
      userIp: options.userIp,
      userAgent: options.userAgent,
    };

    await db.insert(auditLogs).values(auditLog);
  }

  // Get audit logs with filtering
  static async getAuditLogs(filters: {
    tableName?: string;
    recordId?: string;
    action?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ logs: any[]; total: number }> {
    let query = db.select().from(auditLogs);
    const conditions = [];

    if (filters.tableName) {
      conditions.push(eq(auditLogs.tableName, filters.tableName));
    }
    if (filters.recordId) {
      conditions.push(eq(auditLogs.recordId, filters.recordId));
    }
    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.reduce((acc, condition) => acc && condition));
    }

    const total = await db.select({ count: count() }).from(auditLogs);
    
    const logs = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return {
      logs,
      total: total[0].count,
    };
  }

  // Get available backups
  static async getBackups(limit = 20): Promise<any[]> {
    return await db.select()
      .from(dataBackups)
      .orderBy(desc(dataBackups.createdAt))
      .limit(limit);
  }

  // Delete old backups (keep only recent ones)
  static async cleanupOldBackups(keepDays = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);

    const result = await db.delete(dataBackups)
      .where(sql`${dataBackups.createdAt} < ${cutoffDate}`)
      .returning();

    return result.length;
  }

  // Set data protection setting
  static async setProtectionSetting(key: string, value: string, description?: string): Promise<void> {
    const setting: InsertDataProtectionSetting = {
      key,
      value,
      description,
    };

    await db.insert(dataProtectionSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: dataProtectionSettings.key,
        set: { value, description, updatedAt: new Date() },
      });
  }

  // Get data protection setting
  static async getProtectionSetting(key: string): Promise<string | null> {
    const [setting] = await db.select()
      .from(dataProtectionSettings)
      .where(eq(dataProtectionSettings.key, key));
    
    return setting?.value || null;
  }

  // Check if deletion is allowed (based on protection settings)
  static async isDeletionAllowed(tableName: string): Promise<boolean> {
    const setting = await this.getProtectionSetting(`protect_${tableName}`);
    return setting !== 'true';
  }

  // Soft delete instead of hard delete
  static async softDelete(tableName: string, recordId: string, userId?: string): Promise<void> {
    // Log the soft delete
    await this.logAudit({
      tableName,
      recordId,
      action: 'delete',
      userId,
      userAgent: 'system',
    });

    // Instead of actually deleting, mark as deleted
    // This would require adding a 'deleted' column to tables
    // For now, we'll just log the action
  }

  // Get data protection statistics
  static async getProtectionStats(): Promise<{
    totalBackups: number;
    totalAuditLogs: number;
    lastBackupDate: string | null;
    protectedTables: string[];
  }> {
    const [backupStats] = await db.select({ count: count() }).from(dataBackups);
    const [auditStats] = await db.select({ count: count() }).from(auditLogs);
    
    const [lastBackup] = await db.select()
      .from(dataBackups)
      .orderBy(desc(dataBackups.createdAt))
      .limit(1);

    const protectionSettings = await db.select()
      .from(dataProtectionSettings)
      .where(sql`${dataProtectionSettings.key} LIKE 'protect_%'`);

    const protectedTables = protectionSettings
      .filter(setting => setting.value === 'true')
      .map(setting => setting.key.replace('protect_', ''));

    return {
      totalBackups: backupStats.count,
      totalAuditLogs: auditStats.count,
      lastBackupDate: lastBackup?.createdAt?.toISOString() || null,
      protectedTables,
    };
  }
}
