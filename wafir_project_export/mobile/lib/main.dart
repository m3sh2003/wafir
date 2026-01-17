import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const ProviderScope(child: WafirApp()));
}

class WafirApp extends ConsumerWidget {
  const WafirApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'Wafir',
      debugShowCheckedModeBanner: false,
      
      // Localization
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ar', 'SA'), // Default
        Locale('en', 'US'),
      ],
      locale: const Locale('ar', 'SA'),

      // Theme
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F766E)), // Teal
        useMaterial3: true,
        fontFamily: GoogleFonts.cairo().fontFamily,
      ),
      
      home: const Scaffold(
        body: Center(child: Text('مرحباً بك في وافر')),
      ),
    );
  }
}
