import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart'; // Keep for future use
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/main/screens/main_screen.dart';

import 'l10n/app_localizations.dart';
import 'core/api/api_client.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient.loadBaseUrl();

  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://uustktapnkmmbvzcpdxn.supabase.co',
    anonKey: 'sb_publishable_cDmyKeNgWnLcocdXLt9Z-Q_2INoo6i0',
  );
  
  // Check for existing token (Legacy/Migration check)
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');
  
  // Check Supabase Auth State
  final session = Supabase.instance.client.auth.currentSession;
  final isLoggedIn = session != null || (token != null && token.isNotEmpty);

  runApp(ProviderScope(child: WafirApp(isLoggedIn: isLoggedIn)));
}

class WafirApp extends StatelessWidget {
  final bool isLoggedIn;
  
  const WafirApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      onGenerateTitle: (context) => AppLocalizations.of(context)!.appTitle,
      debugShowCheckedModeBanner: false,
      
      // Localization
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      locale: const Locale('ar', 'SA'),

      // Theme
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F766E)), // Teal
        useMaterial3: true,
        fontFamily: GoogleFonts.cairo().fontFamily,
      ),
      
      home: isLoggedIn ? const MainScreen() : const LoginScreen(),
    );
  }
}
