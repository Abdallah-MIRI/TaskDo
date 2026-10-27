import React, { useRef, useState } from 'react';
import {
  Globe,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Server,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';
import { useToast } from '../ui/ToastProvider';
import { ConfirmModal } from '../ui/ConfirmModal';

interface SettingsViewProps {
  onOpenWizard: () => void;
}

export function SettingsView({ onOpenWizard }: SettingsViewProps) {
  const { t, language, setLanguage, formatNumber } = useI18n();
  const {
    activeAdapterName,
    tasks,
    projects,
    exportBackup,
    importBackup,
    resetAllData,
    testCurrentConnection,
  } = useStorage();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleExport = async () => {
    try {
      const json = await exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskdo-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('toastDataExported'), 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importBackup(text);
      showToast(
        `${t('toastDataImported')} (${formatNumber(res.tasksCount)} مهام، ${formatNumber(res.projectsCount)} مشاريع)`,
        'success'
      );
    } catch {
      showToast(t('toastDataImportError'), 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmReset = async () => {
    try {
      await resetAllData();
      setIsResetModalOpen(false);
      showToast(t('toastDataResetSuccess'), 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testCurrentConnection();
      setTestResult(res);
      if (res.ok) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#264653]">
          {t('settingsPageTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[#62727b] mt-0.5">
          {t('settingsPageSubtitle')}
        </p>
      </div>

      {/* 2. Section: Language & Display */}
      <section className="bg-white p-6 rounded-3xl border border-[#e5e9ec] space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#264653]/10 text-[#264653] shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#264653]">
              {t('languageSectionTitle')}
            </h3>
            <p className="text-xs text-[#62727b] mt-0.5 leading-relaxed">
              {t('languageSectionDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`p-4 rounded-2xl border-2 text-start transition-all flex items-center justify-between ${
              language === 'ar'
                ? 'border-[#2a9d8f] bg-[#2a9d8f]/5 text-[#264653] shadow-xs'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div>
              <span className="font-bold text-sm block">العربية (Arabic)</span>
              <span className="text-xs text-gray-500">الاتجاه من اليمين لليسار (RTL) مع خط Cairo</span>
            </div>
            {language === 'ar' && <CheckCircle2 className="w-5 h-5 text-[#2a9d8f] shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border-2 text-start transition-all flex items-center justify-between ${
              language === 'en'
                ? 'border-[#2a9d8f] bg-[#2a9d8f]/5 text-[#264653] shadow-xs'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div>
              <span className="font-bold text-sm block">English (US)</span>
              <span className="text-xs text-gray-500">Left-to-Right (LTR) layout with Cairo font</span>
            </div>
            {language === 'en' && <CheckCircle2 className="w-5 h-5 text-[#2a9d8f] shrink-0" />}
          </button>
        </div>
      </section>

      {/* 3. Section: Storage Provider Architecture */}
      <section className="bg-white p-6 rounded-3xl border border-[#e5e9ec] space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#264653]">
                {t('storageSectionTitle')}
              </h3>
              <p className="text-xs text-[#62727b] mt-0.5 leading-relaxed">
                {t('storageSectionDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#264653] hover:bg-[#1d353f] text-white text-xs font-bold transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('storageChangeProviderBtn')}</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">{t('storageCurrentProvider')}</span>
              <span className="text-sm font-extrabold text-[#264653]">{activeAdapterName}</span>
            </div>
            <div className="text-xs text-[#62727b]">
              <span>{t('storageDataCountInfo')} </span>
              <span className="font-bold text-[#2a9d8f]">
                {formatNumber(tasks.length)} {t('projectTasksCount')}
              </span>
              <span>، </span>
              <span className="font-bold text-[#2a9d8f]">
                {formatNumber(projects.length)} {t('navProjects')}
              </span>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            {isTesting ? 'جاري الفحص...' : t('wizardTestConnectionBtn')}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              testResult.ok
                ? 'bg-[#2a9d8f]/10 text-[#2a9d8f] border border-[#2a9d8f]/30'
                : 'bg-[#e76f51]/10 text-[#e76f51] border border-[#e76f51]/30'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </section>

      {/* 4. Section: Data Backup & Restore */}
      <section className="bg-white p-6 rounded-3xl border border-[#e5e9ec] space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#e9c46a]/20 text-[#b78917] shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#264653]">
              {t('storageExportTitle')}
            </h3>
            <p className="text-xs text-[#62727b] mt-0.5 leading-relaxed">
              {t('storageExportDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export Button */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-[#f7f9f9] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wider mb-1">
                تصدير نسخة احتياطية
              </h4>
              <p className="text-xs text-gray-500">
                تنزيل ملف JSON آمن يحتوي على كافة مهامك ومشاريعك.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#264653] hover:bg-gray-50 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-[#2a9d8f]" />
              <span>{t('storageExportBtn')}</span>
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-[#f7f9f9] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wider mb-1">
                {t('storageImportTitle')}
              </h4>
              <p className="text-xs text-gray-500">
                {t('storageImportDesc')}
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-backup-input"
              />
              <label
                htmlFor="import-backup-input"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#264653] hover:bg-gray-50 transition-colors shadow-xs cursor-pointer text-center"
              >
                <Upload className="w-4 h-4 text-[#2a9d8f]" />
                <span>{t('storageImportBtn')}</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Architecture & Honest Deployment Notice */}
      <section className="bg-white p-6 rounded-3xl border border-[#e5e9ec] space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#264653]">
          <Info className="w-4 h-4 text-[#2a9d8f]" />
          <span>هيكلية النشر الثابت وقيود المتصفح</span>
        </div>
        <p className="text-xs text-[#62727b] leading-relaxed">
          {t('envGhPagesNotice')}
        </p>
        <div className="p-3.5 rounded-xl bg-[#264653]/5 border border-[#264653]/10 text-xs text-[#264653] space-y-1">
          <span className="font-bold block">مبدأ التصميم الخالي من الوهم (Zero-Faux Architecture):</span>
          <p className="leading-relaxed text-[#62727b]">
            لا يقوم TaskDo بادعاء تنفيذ استعلامات SQL حية مباشرة من المتصفح دون وجود خادم وسيط معتمد، كما يضمن حفظ المهام والمشاريع بهيكلية تامة عبر IndexedDB عند انعدام الاتصال بالإنترنت.
          </p>
        </div>
      </section>

      {/* 6. Section: Danger Zone (Reset Data) */}
      <section className="bg-red-50/50 p-6 rounded-3xl border border-red-100 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#e76f51]/10 text-[#e76f51] shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#e76f51]">
                {t('storageResetTitle')}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                {t('storageResetDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e76f51] hover:bg-[#d55e42] text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('storageResetBtn')}</span>
          </button>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title={t('storageResetConfirmTitle')}
        description={t('storageResetConfirmDesc')}
        confirmLabel={t('storageResetBtn')}
        cancelLabel={t('cancel')}
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
