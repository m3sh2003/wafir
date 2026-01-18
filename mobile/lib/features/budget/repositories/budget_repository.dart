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
    // Assuming backend endpoint /budget/envelopes based on standard REST
    // Verified: BudgetController is @Controller('budget')
    final response = await _apiClient.request('/budget/envelopes', method: 'GET');
    final List<dynamic> data = response.data;
    
    final db = await _databaseService.database;
    final batch = db.batch();
    
    for (var json in data) {
      batch.insert(
        'envelopes',
        {
          'id': json['id'],
          'name': json['name'],
          'limit_amount': json['limitAmount'] ?? json['limit_amount'] ?? 0.0,
          'spent_amount': json['spent'] ?? json['spent_amount'] ?? 0.0,
          'period': json['period'],
          'userId': json['userId'] ?? json['user_id'],
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
