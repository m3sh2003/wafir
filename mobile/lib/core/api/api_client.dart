import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../database/database_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';

class ApiClient {
  static String? _customBaseUrl;

  static Future<void> loadBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    _customBaseUrl = prefs.getString('custom_base_url');
  }

  static Future<void> setBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('custom_base_url', url);
    _customBaseUrl = url;
  }

  // Dynamic Base URL based on platform
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:3090/api';
    // For Windows/Linux/Mac local development, use localhost
    if (!kIsWeb && (Platform.isWindows || Platform.isLinux || Platform.isMacOS)) {
       return _customBaseUrl ?? 'http://localhost:3090/api';
    }
    if (!kIsWeb && Platform.isAndroid) {
      return _customBaseUrl ?? 'http://10.0.2.2:3000/api';
    }
    return _customBaseUrl ?? 'https://wafir.onrender.com/api';
  }

  Future<bool> get isOfflineMode async {
    final token = await getToken();
    return token == 'OFFLINE_MODE_TOKEN';
  }
  
  final Dio _dio;

  ApiClient() : _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  )) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add Bearer Token from Supabase Session
        final session = Supabase.instance.client.auth.currentSession;
        if (session != null) {
          options.headers['Authorization'] = 'Bearer ${session.accessToken}';
        }
        return handler.next(options);
      },
    ));
  }

  void updateBaseUrl() {
    _dio.options.baseUrl = baseUrl;
  }

  Future<Response> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }



  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await DatabaseService().clearData();
  }

  Future<Response> getHoldings() async {
    final token = await getToken();
    return _dio.get('/assets/holdings', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }

  Future<Response> getAccounts() async {
    final token = await getToken();
    return _dio.get('/assets/accounts', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }
  
  Future<Response> getAssets() async {
    final token = await getToken();
    return _dio.get('/investments/products', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }
  Future<Response> request(String endpoint, {required String method, dynamic data}) async {
    final token = await getToken();
    return _dio.request(
      endpoint,
      data: data,
      options: Options(
        method: method,
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      ),
    );
  }

  // Investments
  Future<Response> rebalancePortfolio() async {
    final token = await getToken();
    return _dio.post('/investments/portfolio/rebalance', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }

  Future<Response> getRiskProfile() async {
    final token = await getToken();
    return _dio.get('/investments/risk-profile', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }

  Future<Response> setRiskProfile(int score) async {
    final token = await getToken();
    return _dio.post('/investments/risk-profile', 
      data: {'score': score},
      options: Options(
        headers: {'Authorization': 'Bearer $token'},
      )
    );
  }

  // Zakat
  Future<Response> calculateZakatManual(Map<String, dynamic> data) async {
    final token = await getToken();
    return _dio.post('/zakat/calculate', 
      data: data,
      options: Options(
        headers: {'Authorization': 'Bearer $token'},
      )
    );
  }

  Future<Response> calculateZakatSystem() async {
    final token = await getToken();
    return _dio.get('/zakat/calculate/system', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }

  Future<Response> updateProfile(Map<String, dynamic> data) async {
    final token = await getToken();
    return _dio.patch('/users/profile', 
      data: data,
      options: Options(
        headers: {'Authorization': 'Bearer $token'},
      )
    );
  }

  Future<Response> getProfile() async {
    final token = await getToken();
    return _dio.get('/users/profile', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }

  Future<Response> getPortfolio() async {
    final token = await getToken();
    return _dio.get('/investments/portfolio', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }

  Future<Response> getEnvelopes() async {
    final token = await getToken();
    return _dio.get('/budget/envelopes', options: Options(
      headers: {'Authorization': 'Bearer $token'},
    ));
  }

  Future<Map<String, dynamic>> chatWithAi(String message) async {
    final token = await getToken(); // Changed _getToken() to getToken()
    if (token == null) throw Exception('Not authenticated');

    final response = await http.post(
      Uri.parse('$baseUrl/ai/chat'), // Removed extra /api prefix as baseUrl includes it
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'message': message}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to chat with AI: ${response.statusCode} ${response.body}');
    }
  }
}
