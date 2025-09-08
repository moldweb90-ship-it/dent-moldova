#!/usr/bin/env tsx

import { DataProtection } from '../server/utils/dataProtection';

async function setupDataProtection() {
  console.log('🔒 Настройка системы защиты данных...');

  try {
    // Создаем начальную резервную копию
    console.log('📦 Создание начальной резервной копии...');
    const backupId = await DataProtection.createBackup({
      backupType: 'full',
      description: 'Начальная резервная копия после настройки защиты данных',
      createdBy: 'system',
    });
    console.log(`✅ Резервная копия создана: ${backupId}`);

    // Настраиваем защиту по умолчанию
    console.log('🛡️ Настройка защиты по умолчанию...');
    await DataProtection.setProtectionSetting('protect_clinics', 'true', 'Защита от удаления клиник');
    await DataProtection.setProtectionSetting('protect_cities', 'true', 'Защита от удаления городов');
    await DataProtection.setProtectionSetting('protect_districts', 'false', 'Защита от удаления районов');
    await DataProtection.setProtectionSetting('auto_backup_enabled', 'true', 'Автоматическое резервное копирование');
    await DataProtection.setProtectionSetting('backup_retention_days', '30', 'Количество дней хранения резервных копий');
    await DataProtection.setProtectionSetting('audit_log_retention_days', '90', 'Количество дней хранения журнала аудита');

    // Получаем статистику
    const stats = await DataProtection.getProtectionStats();
    console.log('📊 Статистика защиты данных:');
    console.log(`   - Резервных копий: ${stats.totalBackups}`);
    console.log(`   - Записей аудита: ${stats.totalAuditLogs}`);
    console.log(`   - Защищенных таблиц: ${stats.protectedTables.length}`);
    console.log(`   - Последняя резервная копия: ${stats.lastBackupDate || 'Нет'}`);

    console.log('✅ Система защиты данных настроена успешно!');
    console.log('');
    console.log('📋 Что было настроено:');
    console.log('   - Создана начальная резервная копия всех данных');
    console.log('   - Включена защита от удаления клиник и городов');
    console.log('   - Настроен аудит всех изменений');
    console.log('   - Включено автоматическое резервное копирование');
    console.log('');
    console.log('🔧 Управление через админ панель:');
    console.log('   - Перейдите в раздел "Защита данных"');
    console.log('   - Создавайте резервные копии вручную');
    console.log('   - Просматривайте журнал аудита');
    console.log('   - Настраивайте параметры защиты');

  } catch (error) {
    console.error('❌ Ошибка при настройке защиты данных:', error);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  setupDataProtection();
}
