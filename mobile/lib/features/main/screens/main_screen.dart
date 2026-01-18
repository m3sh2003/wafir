import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../dashboard/screens/home_screen.dart';
import '../../budget/screens/budget_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../../dashboard/screens/dashboard_screen.dart';
import '../../zakat/screens/zakat_screen.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(), // 0: Assets (Current Home)
    const BudgetScreen(), // 1: Budget
    const DashboardScreen(), // 2: Overview
    const ZakatScreen(), // 3: Zakat
    const SettingsScreen(), // 4: Settings
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        backgroundColor: Colors.white,
        indicatorColor: AppColors.muted,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.pie_chart_outline),
            selectedIcon: Icon(Icons.pie_chart, color: AppColors.primary),
            label: 'Assets',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_outlined),
            selectedIcon: Icon(Icons.account_balance_wallet, color: AppColors.primary),
            label: 'Budget',
          ),
           NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard, color: AppColors.primary),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.volunteer_activism_outlined),
            selectedIcon: Icon(Icons.volunteer_activism, color: AppColors.primary),
            label: 'Zakat',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings, color: AppColors.primary),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
