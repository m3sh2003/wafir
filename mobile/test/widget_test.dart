// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:wafir_mobile/main.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: WafirApp(isLoggedIn: false)));

    // Verify that our counter starts at 0.
    expect(find.text('0'), findsNothing); // We don't have a counter anymore
    expect(find.text('1'), findsNothing);

    // Verify Login Screen content
    expect(find.text('Wafir'), findsOneWidget); 
  });
}
