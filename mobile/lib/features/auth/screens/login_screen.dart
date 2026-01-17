import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../main/screens/main_screen.dart';
import '../../../core/database/database_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'ahmed@example.com');
  final _passwordController = TextEditingController(text: 'password123');
  final _apiClient = ApiClient();
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _handleLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiClient.login(
        _emailController.text,
        _passwordController.text,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final token = response.data['access_token'];
        await _apiClient.saveToken(token);
        
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const MainScreen()),
          );
        }
      }
    } on DioException catch (e) {
       if (mounted) {
         setState(() {
           _isLoading = false;
         });
         String msg = 'Connection Error: ${e.message}';
         if (e.response != null) {
           msg = 'Server Error (${e.response?.statusCode}): ${e.response?.data}';
         }
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text(msg), backgroundColor: Colors.red),
         );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _handleOfflineLogin() async {
    try {
      setState(() => _isLoading = true);
      
      // Save offline token
      await _apiClient.saveToken('OFFLINE_MODE_TOKEN');
      
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MainScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _showSettingsDialog() async {
    final controller = TextEditingController(text: ApiClient.baseUrl);
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Server Settings'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'API Base URL',
            hintText: 'http://192.168.x.x:3000/api',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              await ApiClient.setBaseUrl(controller.text);
              _apiClient.updateBaseUrl();
              if (mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Server URL updated')),
                );
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Positioned(
              top: 16,
              right: 16,
              child: IconButton(
                icon: const Icon(Icons.settings),
                onPressed: _showSettingsDialog,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    AppLocalizations.of(context)!.appTitle,
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF0F766E)),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 48),
                  TextField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: AppLocalizations.of(context)!.email,
                      border: const OutlineInputBorder(),
                      prefixIcon: const Icon(Icons.email),
                    ),
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      labelText: AppLocalizations.of(context)!.password,
                      border: const OutlineInputBorder(),
                      prefixIcon: const Icon(Icons.lock),
                    ),
                    obscureText: true,
                  ),
                  if (_errorMessage != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E),
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey[300],
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Text(AppLocalizations.of(context)!.login),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: _isLoading ? null : _handleOfflineLogin,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF0F766E),
                      side: BorderSide(color: _isLoading ? Colors.grey : const Color(0xFF0F766E)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(AppLocalizations.of(context)!.continueOffline),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
