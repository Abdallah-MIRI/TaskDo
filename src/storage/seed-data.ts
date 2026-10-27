import { Task, Project } from '../types';
import { formatDateKey } from '../domain/task-rules';

export function getInitialSeedData(): { projects: Project[]; tasks: Task[] } {
  const now = new Date();
  
  const today = formatDateKey(now);
  
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDateKey(tomorrowDate);

  const in3DaysDate = new Date(now);
  in3DaysDate.setDate(in3DaysDate.getDate() + 3);
  const in3Days = formatDateKey(in3DaysDate);

  const in5DaysDate = new Date(now);
  in5DaysDate.setDate(in5DaysDate.getDate() + 5);
  const in5Days = formatDateKey(in5DaysDate);

  const projects: Project[] = [
    {
      id: 'proj-mobile-app',
      name: 'تطوير تطبيق الهواتف الذكية',
      description: 'إطلاق الإصدار الأول من تطبيق TaskDo للهواتف بنظامي iOS و Android',
      color: '#2a9d8f', // Primary accent
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'proj-brand-identity',
      name: 'الهوية البصرية والموقع التعريفي',
      description: 'تجهيز مواد التسويق ودليل الهوية وتحديث صفحات الهبوط',
      color: '#e76f51', // Coral
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'proj-infrastructure',
      name: 'البنية السحابية وقواعد البيانات',
      description: 'تهيئة طبقة التخزين وعزل الصلاحيات وحماية مفاتيح API',
      color: '#264653', // Primary dark
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'مراجعة معمارية محول التخزين المحلي (Dexie / IndexedDB)',
      description: 'التأكد من حفظ المهام محلياً دون اشتراط حساب مستخدم أو خادم خارجي',
      status: 'completed',
      priority: 'high',
      dueDate: yesterday,
      projectId: 'proj-infrastructure',
      tags: ['تخزين', 'معمارية'],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'task-2',
      title: 'اعتماد خط Cairo في التصميم ودعم التبديل السلس للغة العربية',
      description: 'فحص اتجاه النصوص LTR و RTL وتوافق جميع الأزرار والرموز مع المعايير',
      status: 'in_progress',
      priority: 'urgent',
      dueDate: today,
      projectId: 'proj-brand-identity',
      tags: ['تصميم', 'RTL', 'خطوط'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'إعداد شاشات معالج التهيئة الأولي (Setup Wizard)',
      description: 'عرض خيارات GitHub Pages، التطوير المحلي، والاستضافة الذاتية بشفافية تامة',
      status: 'todo',
      priority: 'high',
      dueDate: today,
      projectId: 'proj-mobile-app',
      tags: ['واجهة', 'إعداد'],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'إجراء اختبارات الأداء واستجابة الشاشات على الهواتف والأجهزة اللوحية',
      description: 'التأكد من عدم وجود تمرير أفقي غير مقصود وسهولة لمس العناصر بحد أدنى 44px',
      status: 'todo',
      priority: 'medium',
      dueDate: tomorrow,
      projectId: 'proj-mobile-app',
      tags: ['أجهزة', 'استجابة'],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'إعداد نموذج تصدير واستيراد النسخ الاحتياطية (JSON)',
      description: 'تمكين المستخدم من تنزيل كامل بياناته واسترجاعها بنقرة زر واحدة',
      status: 'todo',
      priority: 'medium',
      dueDate: in3Days,
      projectId: 'proj-infrastructure',
      tags: ['نسخ_احتياطي', 'بيانات'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'توثيق قيود قواعد البيانات المباشرة من المتصفح',
      description: 'توضيح أسباب وجوب وجود خادم API وسيط للاتصال بقواعد بيانات PostgreSQL بدلاً من المفاتيح المباشرة',
      status: 'todo',
      priority: 'low',
      dueDate: in5Days,
      projectId: 'proj-infrastructure',
      tags: ['أمان', 'توثيق'],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { projects, tasks };
}
