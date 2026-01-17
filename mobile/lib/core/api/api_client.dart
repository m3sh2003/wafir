import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
    if (kIsWeb) return 'http://localhost:3000/api';
    // Use stored URL if available, otherwise default to Computer's IP
    return _customBaseUrl ?? 'http://192.168.88.41:3000/api';
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
  ));

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
}
