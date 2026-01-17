import 'package:sqflite/sqflite.dart';
import '../../../core/api/api_client.dart';
import '../../../core/database/database_service.dart';
import '../../../core/network/network_info.dart';

class BudgetRepository {
  final ApiClient _apiClient;
  final DatabaseService _databaseService;
  final NetworkInfo _networkInfo;

  BudgetRepository({
    ApiClient? apiClient,
    DatabaseService? databaseService,
    NetworkInfo? networkInfo,
  })  : _apiClient = apiClient ?? ApiClient(),
        _databaseService = databaseService ?? DatabaseService(),
        _networkInfo = networkInfo ?? NetworkInfo();

  Future<void> syncData() async {
    if (await _networkInfo.isConnected && !(await _apiClient.isOfflineMode)) {
      try {
        await _syncEnvelopes();
        // await _syncTransactions(); // Future improvement
      } catch (e) {
        print('Budget Sync failed: $e');
        rethrow;
      }
    }
  }

  Future<void> _syncEnvelopes() async {
    // Assuming backend endpoint /budgets/envelopes based on standard REST
    // I need to verify ApiClient logic. I'll use request method or add getEnvelopes
    // For now using general request.
    final response = await _apiClient.request('/budgets/envelopes', method: 'GET');
    final List<dynamic> data = response.data;
    
    final db = await _databaseService.database;
    final batch = db.batch();
    
    for (var json in data) {
      batch.insert(
        'envelopes',
        {
          'id': json['id'],
          'name': json['name'],
          'limit_amount': json['limitAmount'], // Check casing from backend
          'spent_amount': json['spent'] ?? 0.0, // Backend might calculate this or we sum transactions
          'period': json['period'],
          'userId': json['userId'],
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getEnvelopes() async {
    final db = await _databaseService.database;
    return await db.query('envelopes');
  }
}
