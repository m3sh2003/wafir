import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/dashboard_repository.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository();
});

final dashboardProvider = AsyncNotifierProvider<DashboardController, Map<String, dynamic>>(() {
  return DashboardController();
});

class DashboardController extends AsyncNotifier<Map<String, dynamic>> {
  @override
  Future<Map<String, dynamic>> build() async {
    return _fetchLocalData();
  }

  Future<Map<String, dynamic>> _fetchLocalData() async {
    final repo = ref.read(dashboardRepositoryProvider);
    final enrichedHoldings = await repo.getEnrichedHoldings();
    final accounts = await repo.getLocalAccounts();
    
    // Calculate global net worth
    double totalNetWorth = 0;
    // We can sum account balances OR sum holding values. 
    // Web sums: accounts?.reduce((sum, acc) => sum + getNormalizedAccountTotal(acc), 0)
    // where getNormalizedAccountTotal sums holdings.
    
    // Let's sum holdings
    for (var row in enrichedHoldings) {
      final units = row['units'] as double? ?? 0.0;
      final price = row['asset_currentPrice'] as double? ?? 0.0;
      totalNetWorth += units * price;
    }
    
    return {
      'netWorth': totalNetWorth,
      'holdings': enrichedHoldings,
      'accounts': accounts,
    };
  }

  Future<void> syncData() async {
    state = const AsyncValue.loading();
    try {
      final repo = ref.read(dashboardRepositoryProvider);
      await repo.syncData();
      state = await AsyncValue.guard(() => _fetchLocalData());
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}
