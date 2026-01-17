// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'وافر';

  @override
  String get welcomeMessage => 'مرحباً بك في وافر';

  @override
  String get dashboard => 'لوحة المعلومات';

  @override
  String get budget => 'الميزانية';

  @override
  String get invest => 'استثمار';

  @override
  String get transactions => 'المعاملات';

  @override
  String get email => 'البريد الإلكتروني';

  @override
  String get password => 'كلمة المرور';

  @override
  String get login => 'تسجيل الدخول';

  @override
  String get logout => 'تسجيل خروج';

  @override
  String get totalNetWorth => 'إجمالي الأصول';

  @override
  String get noHoldings => 'لا توجد أصول. أضف أصولاً لترى إجمالي ثروتك.';

  @override
  String get offlineReady => 'تم تسجيل الدخول بنجاح! (جاهز للعمل دون اتصال)';

  @override
  String get welcomeToWafirMobile => 'مرحباً في تطبيق وافر';

  @override
  String get loginFailed => 'فشل تسجيل الدخول';

  @override
  String get connectionError => 'خطأ في الاتصال. هل الخادم يعمل؟';

  @override
  String get continueOffline => 'أكمل بدون انترنت (محلي فقط)';
}
