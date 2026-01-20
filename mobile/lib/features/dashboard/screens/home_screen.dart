import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../auth/screens/login_screen.dart';
import '../providers/dashboard_provider.dart';
import '../../../core/database/database_service.dart';
import '../../../core/theme/app_colors.dart';
import '../widgets/account_card.dart';
import '../../investments/screens/rebalance_screen.dart';
import '../../investments/screens/risk_assessment_screen.dart';
import '../../zakat/screens/zakat_calculator_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  
  @override
  void initState() {
    super.initState();
    // Trigger sync on load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(dashboardProvider.notifier).syncData();
    });
  }

  Future<void> _logout(BuildContext context) async {
    final apiClient = ApiClient();
    await apiClient.logout();
    if (context.mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: false,
        title: Text(
          AppLocalizations.of(context)!.dashboard,
          style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
            onPressed: () => ref.read(dashboardProvider.notifier).syncData(),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.textSecondary),
            onPressed: () => _logout(context),
            tooltip: AppLocalizations.of(context)!.logout,
          ),
        ],
      ),
      body: dashboardState.when(
        data: (data) {
          final netWorth = data['netWorth'] as double;
          final holdings = data['holdings'] as List<dynamic>;
          final accounts = (data['accounts'] as List<dynamic>?) ?? [];
          
          final currencyFormatter = NumberFormat.currency(symbol: 'SAR ', decimalDigits: 2);

          // Group holdings by account
          final holdingsByAccount = <int, List<dynamic>>{};
          for (var h in holdings) {
            final accId = h['account_id'] as int?;
            if (accId != null) {
              holdingsByAccount.putIfAbsent(accId, () => []).add(h);
            }
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header Status
                Row(
                  children: [
                    const Icon(Icons.check_circle, size: 20, color: AppColors.success),
                    const SizedBox(width: 8),
                    FutureBuilder<bool>(
                      future: ApiClient().isOfflineMode,
                      builder: (context, snapshot) {
                        final isOffline = snapshot.data ?? false;
                        return Text(
                          isOffline ? AppLocalizations.of(context)!.offlineReady : 'Online Mode',
                          style: TextStyle(
                            color: isOffline ? Colors.orange : AppColors.success,
                            fontWeight: FontWeight.w500,
                          ),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Net Worth Section
                Text(
                  AppLocalizations.of(context)!.totalNetWorth,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
                ),
                Text(
                  currencyFormatter.format(netWorth),
                  style: const TextStyle(
                    fontSize: 32, 
                    fontWeight: FontWeight.bold, 
                    color: AppColors.textPrimary,
                    fontFamily: 'Roboto', // Or App Font
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Tools Section
                const SizedBox(height: 24),
                Text(
                  'Quick Tools',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 100,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildToolCard(
                        context, 
                        'Rebalance', 
                        Icons.scale, 
                        Colors.blue,
                        () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RebalanceScreen())),
                      ),
                      _buildToolCard(
                        context, 
                        'Zakat Calc', 
                        Icons.calculate, 
                        Colors.green,
                        () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ZakatCalculatorScreen())),
                      ),
                      _buildToolCard(
                        context, 
                        'Assessment', 
                        Icons.assessment, 
                        Colors.orange,
                        () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RiskAssessmentScreen())),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
                
                // Accounts List
                ...accounts.map((acc) {
                  final accId = acc['id'] as int;
                  final accHoldings = holdingsByAccount[accId] ?? [];
                  return AccountCard(account: acc, holdings: accHoldings);
                }).toList(),

                if (accounts.isEmpty)
                   Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(Icons.account_balance_wallet_outlined, size: 48, color: Colors.grey[300]),
                          const SizedBox(height: 16),
                          Text(
                            AppLocalizations.of(context)!.noHoldings + '\n(Syncing...)', 
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildToolCard(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return Container(
      width: 100,
      margin: const EdgeInsets.only(right: 12),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        elevation: 2,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(height: 8),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
