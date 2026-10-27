import React, { useState } from 'react';
import {
  CheckCircle,
  Globe,
  Laptop,
  Server,
  Database,
  HardDrive,
  Cloud,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';
import { DeploymentMode, StorageProviderType, WorkspaceMode } from '../../types';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetupWizardModal({ isOpen, onClose }: SetupWizardModalProps) {
  const { t, direction } = useI18n();
  const { config, updateConfig, testCurrentConnection } = useStorage();

  const [step, setStep] = useState<number>(1);
  const [selectedEnv, setSelectedEnv] = useState<DeploymentMode>(config.deploymentMode || 'github_pages');
  const [selectedUsage, setSelectedUsage] = useState<WorkspaceMode>(config.workspaceMode || 'single_device');
  const [selectedProvider, setSelectedProvider] = useState<StorageProviderType>(config.storageProvider || 'indexeddb');

  // Provider configuration inputs
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseConfig?.url || '');
  const [supabaseKey, setSupabaseKey] = useState(config.supabaseConfig?.anonKey || '');
  const [apiEndpoint, setApiEndpoint] = useState(config.postgresConfig?.apiEndpoint || config.restApiConfig?.baseUrl || '');

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
      setTestResult(null);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setTestResult(null);
    }
  };

  const runConnectionTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (selectedProvider === 'indexeddb' || selectedProvider === 'localstorage') {
        setTestResult({
          ok: true,
          message: t('wizardConfigIndexedDbReady'),
        });
      } else if (selectedProvider === 'supabase') {
        if (!supabaseUrl.trim() || !supabaseKey.trim()) {
          setTestResult({
            ok: false,
            message: 'يرجى إدخال رابط المشروع والمفتاح العام لـ Supabase.',
          });
        } else {
          try {
            new URL(supabaseUrl);
            const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/`, {
              headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
            });
            if (res.ok || res.status === 200 || res.status === 404) {
              setTestResult({ ok: true, message: t('wizardConnectionOk') });
            } else {
              setTestResult({ ok: false, message: `${t('wizardConnectionFail')} (HTTP ${res.status})` });
            }
          } catch (e) {
            setTestResult({ ok: false, message: `${t('wizardConnectionFail')}: ${(e as Error).message}` });
          }
        }
      } else {
        if (!apiEndpoint.trim()) {
          setTestResult({ ok: false, message: 'يرجى إدخال عنوان خادم الـ API.' });
        } else {
          try {
            new URL(apiEndpoint);
            const res = await fetch(apiEndpoint, { method: 'GET' });
            if (res.ok) {
              setTestResult({ ok: true, message: t('wizardConnectionOk') });
            } else {
              setTestResult({ ok: false, message: `${t('wizardConnectionFail')} (HTTP ${res.status})` });
            }
          } catch (e) {
            setTestResult({ ok: false, message: `${t('wizardConnectionFail')}: ${(e as Error).message}` });
          }
        }
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleFinish = async () => {
    await updateConfig({
      deploymentMode: selectedEnv,
      workspaceMode: selectedUsage,
      storageProvider: selectedProvider,
      setupCompleted: true,
      supabaseConfig: selectedProvider === 'supabase' ? {
        url: supabaseUrl.trim(),
        anonKey: supabaseKey.trim(),
        isConfigured: Boolean(supabaseUrl && supabaseKey),
      } : undefined,
      postgresConfig: selectedProvider === 'postgresql' ? {
        apiEndpoint: apiEndpoint.trim(),
        isConfigured: Boolean(apiEndpoint),
      } : undefined,
      restApiConfig: selectedProvider === 'rest_api' ? {
        baseUrl: apiEndpoint.trim(),
        isConfigured: Boolean(apiEndpoint),
      } : undefined,
    });
    onClose();
  };

  const NextIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#264653] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2a9d8f] text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="wizard-modal-title" className="text-lg font-bold text-white">
                {t('wizardTitle')}
              </h2>
              <p className="text-xs text-[#e5e9ec]/80 mt-0.5">
                {t('wizardSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="grid grid-cols-4 border-b border-gray-100 bg-[#f7f9f9] text-xs font-semibold text-center">
          {[
            { num: 1, label: t('wizardStep1') },
            { num: 2, label: t('wizardStep2') },
            { num: 3, label: t('wizardStep3') },
            { num: 4, label: t('wizardStep4') },
          ].map((s) => {
            const isCurrent = step === s.num;
            const isPassed = step > s.num;
            return (
              <div
                key={s.num}
                className={`py-3 px-2 border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'border-[#2a9d8f] text-[#264653] font-bold bg-white'
                    : isPassed
                    ? 'border-transparent text-[#2a9d8f]'
                    : 'border-transparent text-gray-400'
                }`}
              >
                {isPassed ? (
                  <Check className="w-3.5 h-3.5 stroke-3 text-[#2a9d8f]" />
                ) : (
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                    isCurrent ? 'bg-[#2a9d8f] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline truncate">{s.label.split('. ')[1] || s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Wizard Content Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* STEP 1: Deployment Environment */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#264653] mb-1">
                  {t('wizardEnvTitle')}
                </h3>
                <p className="text-xs text-[#62727b]">
                  حدد طبيعة النشر المستهدفة للتطبيق لتوفير النمط الأنسب للتخزين وحماية البيانات.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'github_pages',
                    title: t('wizardEnvGhPages'),
                    desc: t('wizardEnvGhPagesDesc'),
                    icon: Globe,
                    badge: 'نشر ثابت خفيف',
                  },
                  {
                    id: 'local_dev',
                    title: t('wizardEnvLocalDev'),
                    desc: t('wizardEnvLocalDevDesc'),
                    icon: Laptop,
                    badge: 'Node / Vite',
                  },
                  {
                    id: 'self_hosted',
                    title: t('wizardEnvSelfHosted'),
                    desc: t('wizardEnvSelfHostedDesc'),
                    icon: Server,
                    badge: 'خادم مخصص',
                  },
                ].map((item) => {
                  const isSelected = selectedEnv === item.id;
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedEnv(item.id as DeploymentMode)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-[#2a9d8f] bg-[#2a9d8f]/5 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isSelected ? 'bg-[#2a9d8f] text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-[#264653]">{item.title}</h4>
                          <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-gray-100 text-gray-600">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#62727b] mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Usage Mode */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#264653] mb-1">
                  {t('wizardUsageTitle')}
                </h3>
                <p className="text-xs text-[#62727b]">
                  هل ترغب في إدارة مهامك على جهازك فقط بشكل شخصي أم عبر المزامنة السحابية؟
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'single_device',
                    title: t('wizardUsageSingleDevice'),
                    desc: t('wizardUsageSingleDeviceDesc'),
                    icon: HardDrive,
                    recommended: true,
                  },
                  {
                    id: 'sync_devices',
                    title: t('wizardUsageSyncDevices'),
                    desc: t('wizardUsageSyncDevicesDesc'),
                    icon: Cloud,
                    recommended: false,
                  },
                  {
                    id: 'shared_team',
                    title: t('wizardUsageSharedTeam'),
                    desc: t('wizardUsageSharedTeamDesc'),
                    icon: Layers,
                    recommended: false,
                  },
                ].map((item) => {
                  const isSelected = selectedUsage === item.id;
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedUsage(item.id as WorkspaceMode);
                        if (item.id === 'single_device') {
                          setSelectedProvider('indexeddb');
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-[#2a9d8f] bg-[#2a9d8f]/5 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isSelected ? 'bg-[#2a9d8f] text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-[#264653]">{item.title}</h4>
                          {item.recommended && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-[#2a9d8f]/15 text-[#2a9d8f]">
                              موصى به
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#62727b] mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Storage Provider Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#264653] mb-1">
                  {t('wizardStorageTitle')}
                </h3>
                <p className="text-xs text-[#62727b]">
                  يقوم TaskDo بعزل تفاصيل التخزين خلف عقد برمجي موحد، مما يسمح بالتبديل مستقبلاً دون فقدان بياناتك.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'indexeddb',
                    title: t('wizardStorageIndexedDb'),
                    badge: t('wizardStorageIndexedDbBadge'),
                    desc: t('wizardStorageIndexedDbDesc'),
                    icon: Database,
                    recommended: true,
                  },
                  {
                    id: 'localstorage',
                    title: t('wizardStorageLocalStorage'),
                    badge: 'بسيط',
                    desc: t('wizardStorageLocalStorageDesc'),
                    icon: HardDrive,
                    recommended: false,
                  },
                  {
                    id: 'supabase',
                    title: t('wizardStorageSupabase'),
                    badge: 'سحابي API',
                    desc: t('wizardStorageSupabaseDesc'),
                    icon: Cloud,
                    recommended: false,
                  },
                  {
                    id: 'postgresql',
                    title: t('wizardStoragePostgres'),
                    badge: 'يتطلب خادم API',
                    desc: t('wizardStoragePostgresDesc'),
                    icon: Server,
                    recommended: false,
                  },
                  {
                    id: 'rest_api',
                    title: t('wizardStorageRestApi'),
                    badge: 'REST API',
                    desc: t('wizardStorageRestApiDesc'),
                    icon: Layers,
                    recommended: false,
                  },
                ].map((item) => {
                  const isSelected = selectedProvider === item.id;
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProvider(item.id as StorageProviderType)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-[#2a9d8f] bg-[#2a9d8f]/5 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isSelected ? 'bg-[#2a9d8f] text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-[#264653]">{item.title}</h4>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                              item.recommended
                                ? 'bg-[#2a9d8f]/15 text-[#2a9d8f]'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#62727b] mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Configuration & Connection Test */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-[#264653] mb-1">
                  تهيئة المزود والتحقق
                </h3>
                <p className="text-xs text-[#62727b]">
                  {selectedProvider === 'indexeddb'
                    ? 'المزود المختار يعمل محلياً في المتصفح دون الحاجة لأي مفاتيح أو ضبط إضافي.'
                    : 'أدخل معلومات الاتصال الخاصة بالمزود للتحقق من إمكانية الوصول.'}
                </p>
              </div>

              {/* Conditional Inputs */}
              {selectedProvider === 'indexeddb' && (
                <div className="p-4 rounded-2xl bg-[#2a9d8f]/10 border border-[#2a9d8f]/20 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2a9d8f] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#264653]">قاعدة بيانات IndexedDB جاهزة</h4>
                    <p className="text-xs text-[#62727b] mt-1 leading-relaxed">
                      يتم تخزين المهام والمشاريع بهيكلية تامة عبر Dexie.js مباشرة على جهازك. البيانات تدوم بعد إعادة تحميل الصفحة أو انقطاع الإنترنت.
                    </p>
                  </div>
                </div>
              )}

              {selectedProvider === 'localstorage' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">تخزين localStorage نشط</h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      تخزين بسيط مناسب للمجموعات الصغيرة من المهام. للتعامل مع كميات بيانات ضخمة يفضل IndexedDB.
                    </p>
                  </div>
                </div>
              )}

              {selectedProvider === 'supabase' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1">
                      {t('wizardConfigSupabaseUrlLabel')}
                    </label>
                    <input
                      type="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1">
                      {t('wizardConfigSupabaseKeyLabel')}
                    </label>
                    <input
                      type="text"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] outline-none"
                    />
                  </div>
                </div>
              )}

              {(selectedProvider === 'postgresql' || selectedProvider === 'rest_api') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1">
                      {t('wizardConfigApiEndpointLabel')}
                    </label>
                    <input
                      type="url"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      placeholder="https://api.yourcompany.com/v1/tasks"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] outline-none"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-800 leading-relaxed">
                    ملاحظة هامة: وفقاً لمعايير الأمان المتبعة في TaskDo، لا يتم الاتصال المباشر بقاعدة PostgreSQL عبر بيانات اعتماد الجذر من داخل المتصفح، بل يلزم وسيط API آمن.
                  </div>
                </div>
              )}

              {/* Honest Security Note */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t('wizardConfigHonestNote')}
                </p>
              </div>

              {/* Connection Test Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={runConnectionTest}
                  disabled={isTesting}
                  className="px-4 py-2 text-xs font-bold text-[#264653] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isTesting ? 'جاري الفحص...' : t('wizardTestConnectionBtn')}
                </button>

                {testResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      testResult.ok
                        ? 'bg-[#2a9d8f]/10 text-[#2a9d8f] border border-[#2a9d8f]/30'
                        : 'bg-[#e76f51]/10 text-[#e76f51] border border-[#e76f51]/30'
                    }`}
                  >
                    {testResult.ok ? (
                      <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <BackIcon className="w-4 h-4" />
                {t('wizardBackBtn')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t('wizardSkipBtn')}
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#264653] hover:bg-[#1d353f] rounded-xl shadow-xs transition-all"
              >
                {t('wizardNextBtn')}
                <NextIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-[#2a9d8f] hover:bg-[#238277] rounded-xl shadow-md transition-all"
              >
                <Check className="w-4 h-4 stroke-3" />
                {t('wizardFinishBtn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
