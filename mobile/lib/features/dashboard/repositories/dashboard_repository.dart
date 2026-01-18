import 'package:sqflite/sqflite.dart';
import '../../../core/api/api_client.dart';
import '../../../core/database/database_service.dart';
import '../../../core/network/network_info.dart';
import '../../../core/models/holding.dart';
import '../../../core/models/asset.dart';
import '../../../core/sync/sync_service.dart';

class DashboardRepository {
  final ApiClient _apiClient;
  final DatabaseService _databaseService;
  final NetworkInfo _networkInfo;
  final SyncService _syncService;

  DashboardRepository({
    ApiClient? apiClient,
    DatabaseService? databaseService,
    NetworkInfo? networkInfo,
    SyncService? syncService,
  })  : _apiClient = apiClient ?? ApiClient(),
        _databaseService = databaseService ?? DatabaseService(),
        _networkInfo = networkInfo ?? NetworkInfo(),
        _syncService = syncService ?? SyncService();

  Future<void> syncData() async {
    // If offline, we still want to load local data. 
    // If online, we sync then load.
    
    if (await _networkInfo.isConnected && !(await _apiClient.isOfflineMode)) {
      try { await _syncService.syncPendingActions(); } catch (e) { print('Sync Pending actions failed: $e'); }
      
      try { await _syncAccounts(); } catch (e) { print('Sync Accounts failed: $e'); }
      
      try { await _syncAssets(); } catch (e) { print('Sync Assets failed: $e'); }
      
      // Sync Holdings might fail if Assets failed (FK), but we try anyway
      try { await _syncHoldings(); } catch (e) { print('Sync Holdings failed: $e'); }
    }
    
    // Always load local data to update the UI
  }

  Future<void> _syncAccounts() async {
    final response = await _apiClient.getAccounts();
    final List<dynamic> data = response.data;
    
    final db = await _databaseService.database;
    final batch = db.batch();
    
    for (var json in data) {
      batch.insert(
        'accounts',
        {
          'id': json['id'],
          'name': json['name'],
          'type': json['type'],
          'currency': json['currency_code'] ?? json['currencyCode'], // Handle both just in case
          'balance': json['balance'],
          'user_id': json['user_id'] ?? json['userId'],
          'is_primary': (json['is_primary'] ?? json['isPrimary']) == true ? 1 : 0,
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<void> _syncAssets() async {
    final response = await _apiClient.getAssets();
    final List<dynamic> data = response.data;
    final assets = data.map((json) => Asset.fromJson(json)).toList();

    final db = await _databaseService.database;
    final batch = db.batch();
    
    // Ideally we should differentiate between insert and update, or use conflict algorithm
    // For simplicity, we use INSERT OR REPLACE logic if supported, or just INSERT with conflict replace
    for (var asset in assets) {
      batch.insert(
        'assets',
        asset.toJson(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    print('Synced ${assets.length} assets');
    await batch.commit(noResult: true);
  }

  Future<void> _syncHoldings() async {
    final response = await _apiClient.getHoldings();
    final List<dynamic> data = response.data;
    
    final db = await _databaseService.database;
    
    // For holdings, we might want to clear old ones for this account/user or just upsert.
    // If we receive the full list, we can replace all for the user/account.
    // Since we don't have user ID handy here easily without decoding token, 
    // we'll assume we replace all holdings (or handle carefully).
    // For MVP, lets just upsert. But if a holding is deleted on server, it won't be deleted here.
    // Improved logic: Delete all holdings and re-insert (if we are sure we get ALL holdings).
    // Let's use upsert for now to be safe against partials, but 'delete all' is cleaner for full sync.
    // 'findAllHoldings' returns all holdings for the user. So safe to delete all? 
    // Maybe too risky if we support multiple accounts and only fetch one.
    // But findAllHoldings fetches ALL for user. So we can `DELETE FROM holdings`.
    // Wait, we need to be careful not to delete pending offline transactions if we had them.
    // For now we don't support offline write. So we can clear table or clear for user.
    // Since we lack User context here easily, and table is global? 
    // We should probably clear table? Or just upsert. Upsert is safer.
    
    final holdings = data.map((json) {
       // If the API holding has nested asset, we might want to extract it?
       // But we already synced assets separately.
       return Holding.fromJson(json);
    }).toList();

    final batch = db.batch();
     // Optional: batch.delete('holdings'); // Only if we are sure
    for (var holding in holdings) {
      batch.insert(
        'holdings',
        holding.toJson(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Holding>> getLocalHoldings() async {
    final db = await _databaseService.database;
    final maps = await db.query('holdings');
    return maps.map((e) => Holding.fromJson(e)).toList();
  }
  
  Future<List<Asset>> getLocalAssets() async {
    final db = await _databaseService.database;
    final maps = await db.query('assets');
    return maps.map((e) => Asset.fromJson(e)).toList();
  }

  Future<List<Map<String, dynamic>>> getLocalAccounts() async {
    final db = await _databaseService.database;
    return await db.query('accounts');
  }

  // Helper to get holdings enriched with asset data if needed
  // And now we should fetch all enriched holdings to group them by account in the provider/controller.
  Future<List<Map<String, dynamic>>> getEnrichedHoldings() async {
    final db = await _databaseService.database;
    return await db.rawQuery('''
      SELECT h.*, a.name as asset_name, a.symbol as asset_symbol, a.currentPrice as asset_currentPrice, a.type as asset_type, a.isZakatable as asset_isZakatable, a.isShariaCompliant as asset_isShariaCompliant
      FROM holdings h
      LEFT JOIN assets a ON h.asset_id = a.id
    ''');
  }

  Future<void> addHolding(Map<String, dynamic> holdingData) async {
    if (await _networkInfo.isConnected && !(await _apiClient.isOfflineMode)) {
      // Online: Send to API
      await _apiClient.request(
        '/assets/accounts/${holdingData['accountId']}/holdings',
        method: 'POST',
        data: holdingData,
      );
      // Refresh local data to get the real ID and any server-side calculations
      await syncData();
    } else {
      // Offline: Queue and Optimistic Update
      
      // 1. Add to Sync Queue
      await _syncService.addToQueue(
        action: 'ADD_HOLDING',
        endpoint: '/assets/accounts/${holdingData['accountId']}/holdings',
        method: 'POST',
        payload: holdingData,
      );

      // 2. Optimistic Local Insert
      final db = await _databaseService.database;
      // Use negative ID to indicate temporary/offline
      final tempId = -1 * DateTime.now().millisecondsSinceEpoch; 
      
      final holding = Holding(
        id: tempId,
        instrumentCode: holdingData['instrumentCode'] ?? '',
        units: (holdingData['units'] as num).toDouble(),
        isPrimaryHome: holdingData['isPrimaryHome'] ?? false,
        accountId: holdingData['accountId'],
        assetId: holdingData['assetId'], // Optional, might be null if unknown
      );

      await db.insert(
        'holdings',
        holding.toJson(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }
}
