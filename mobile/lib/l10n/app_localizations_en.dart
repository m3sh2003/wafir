// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Wafir';

  @override
  String get welcomeMessage => 'Welcome to Wafir';

  @override
  String get dashboard => 'Dashboard';

  @override
  String get budget => 'Budget';

  @override
  String get invest => 'Invest';

  @override
  String get transactions => 'Transactions';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get login => 'Login';

  @override
  String get logout => 'Log Out';

  @override
  String get totalNetWorth => 'Total Net Worth';

  @override
  String get noHoldings =>
      'No holdings found. Add assets to see your Net Worth.';

  @override
  String get offlineReady => 'You are successfully logged in! (Offline Ready)';

  @override
  String get welcomeToWafirMobile => 'Welcome to Wafir Mobile';

  @override
  String get loginFailed => 'Login Failed';

  @override
  String get connectionError => 'Connection Error. Is the backend running?';

  @override
  String get continueOffline => 'Continue Offline (No Sync)';
}
