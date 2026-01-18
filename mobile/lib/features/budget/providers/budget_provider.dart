import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/budget_repository.dart';

final budgetRepositoryProvider = Provider<BudgetRepository>((ref) {
  return BudgetRepository();
});

final budgetProvider = StateNotifierProvider<BudgetNotifier, AsyncValue<List<Map<String, dynamic>>>>((ref) {
  final repo = ref.watch(budgetRepositoryProvider);
  return BudgetNotifier(repo);
});

class BudgetNotifier extends StateNotifier<AsyncValue<List<Map<String, dynamic>>>> {
  final BudgetRepository _repository;

  BudgetNotifier(this._repository) : super(const AsyncValue.loading()) {
    _loadData(); // Load local data initially
  }

  Future<void> _loadData() async {
    try {
      final envelopes = await _repository.getEnvelopes();
      state = AsyncValue.data(envelopes);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> syncData() async {
    try {
      state = const AsyncValue.loading();
      await _repository.syncData();
      await _loadData();
    } catch (e, stack) {
       print('Budget sync failed, falling back to local data: $e');
       await _loadData();
    }
  }
}
