import 'dart:convert';
import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../database/database_service.dart';
import '../network/network_info.dart';

class SyncService {
  final ApiClient _apiClient;
  final DatabaseService _databaseService;
  final NetworkInfo _networkInfo;

  SyncService({
    ApiClient? apiClient,
    DatabaseService? databaseService,
    NetworkInfo? networkInfo,
  })  : _apiClient = apiClient ?? ApiClient(),
        _databaseService = databaseService ?? DatabaseService(),
        _networkInfo = networkInfo ?? NetworkInfo();

  Future<void> addToQueue({
    required String action,
    required String endpoint,
    required String method,
    Map<String, dynamic>? payload,
  }) async {
    final db = await _databaseService.database;
    await db.insert('pending_actions', {
      'action': action,
      'endpoint': endpoint,
      'method': method,
      'payload': payload != null ? jsonEncode(payload) : null,
      'createdAt': DateTime.now().millisecondsSinceEpoch,
    });
  }

  Future<void> syncPendingActions() async {
    if (!await _networkInfo.isConnected) return;

    final db = await _databaseService.database;
    final pending = await db.query('pending_actions', orderBy: 'createdAt ASC');

    if (pending.isEmpty) return;

    print('Syncing ${pending.length} pending actions...');

    for (var action in pending) {
      final id = action['id'] as int;
      final endpoint = action['endpoint'] as String;
      final method = action['method'] as String;
      final payloadStr = action['payload'] as String?;
      final payload = payloadStr != null ? jsonDecode(payloadStr) : null;

      try {
        await _performRequest(endpoint, method, payload);
        await db.delete('pending_actions', where: 'id = ?', whereArgs: [id]);
        print('Synced action $id: $method $endpoint');
      } catch (e) {
        print('Failed to sync action $id: $e');
        // Decide: Keep in queue? Retry count? Delete?
        // For now, if 4xx error we should probably delete. If 5xx or network, keep.
        // Simple logic: keep it.
      }
    }
  }

  Future<void> _performRequest(String endpoint, String method, dynamic data) async {
    // We can use the dio instance from ApiClient if we expose it, or just use ApiClient methods if mapped.
    // Since we stored generic endpoint/method, we need a generic request method.
    // ApiClient doesn't expose generic request currently.
    // We can access public dio if we change ApiClient, or just create a new Dio here with same config.
    // Better to add a generic 'request' method to ApiClient.
    // For now, assuming ApiClient has a method or we can add one.
    // Let's assume we modify ApiClient to expose a `request` method or we just use a new Dio here but reusing tokens.
    
    // Actually, ApiClient handles headers/tokens. We should use it.
    await _apiClient.request(endpoint, method: method, data: data);
  }
}
