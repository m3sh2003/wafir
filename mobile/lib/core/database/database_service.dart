import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:flutter/foundation.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  static Database? _database;

  factory DatabaseService() {
    return _instance;
  }

  DatabaseService._internal();

  Future<Database> get database async {
    if (kIsWeb) {
      throw UnsupportedError('SQLite is not supported on Web/Chrome Simulator');
    }
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  Future<Database> _initDB() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'wafir_mobile.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Accounts Table
    await db.execute('''
      CREATE TABLE accounts (
        id INTEGER PRIMARY KEY,
        name TEXT,
        type TEXT,
        currency TEXT,
        balance REAL,
        user_id TEXT,
        is_primary INTEGER
      )
    ''');

    // Assets Table
    await db.execute('''
      CREATE TABLE assets (
        id TEXT PRIMARY KEY,
        name TEXT,
        symbol TEXT,
        type TEXT,
        riskLevel TEXT,
        currentPrice REAL,
        expectedReturn REAL,
        minInvestment REAL,
        description TEXT,
        isZakatable INTEGER,
        isShariaCompliant INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      )
    ''');

    // Holdings Table
    await db.execute('''
      CREATE TABLE holdings (
        id INTEGER PRIMARY KEY,
        instrument_code TEXT,
        asset_id TEXT,
        units REAL,
        is_primary_home INTEGER,
        account_id INTEGER,
        FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE
      )
    ''');

    // Envelopes Table
    await db.execute('''
      CREATE TABLE envelopes (
        id TEXT PRIMARY KEY,
        name TEXT,
        limit_amount REAL,
        spent_amount REAL,
        period TEXT,
        reoccurs INTEGER,
        userId TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    ''');

    // Transactions Table
    await db.execute('''
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        description TEXT,
        amount REAL,
        currency TEXT,
        date TEXT,
        type TEXT,
        userId TEXT,
        envelopeId TEXT,
        accountId INTEGER,
        createdAt TEXT
      )
    ''');

    // Pending Actions Table (for Offline Write)
    await db.execute('''
      CREATE TABLE pending_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        payload TEXT,
        createdAt INTEGER NOT NULL
      )
    ''');
  }

  Future<void> clearData() async {
    if (kIsWeb) return; // Do nothing on web
    final db = await database;
    await db.delete('transactions');
    await db.delete('holdings');
    await db.delete('assets');
    await db.delete('accounts');
    await db.delete('envelopes');
    await db.delete('pending_actions');
  }

  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
    }
  }
}
