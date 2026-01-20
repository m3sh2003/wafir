import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/screens/login_screen.dart';
import '../../../core/utils/file_utils.dart';
import 'dart:convert';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController(); // Email is often read-only, but let's allow edit if backend supports
  final _phoneController = TextEditingController();
  final _ageController = TextEditingController();
  
  bool _isLoading = false;
  bool _isBioEnabled = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
     setState(() => _isLoading = true);
     try {
       final response = await ApiClient().getProfile(); // Now exists
       if (response.data != null) {
         final data = response.data;
         _nameController.text = data['name'] ?? '';
         _emailController.text = data['email'] ?? '';
         
         // Handle nested profile data if any, or flat
         // Our backend returns flat user object or user.settings.profile
         // Adjust based on actual response structure. 
         // Assuming flat for name/email, maybe nested for phone/age
         
         final settings = data['settings'] ?? {};
         final profile = settings['profile'] ?? {};
         
         _phoneController.text = data['phone'] ?? profile['phone'] ?? '';
         _ageController.text = (data['age'] ?? profile['age'] ?? '').toString();
       }
     } catch (e) {
       print('Error loading profile: $e'); 
       // Silent fail or snackbar
     } finally {
       if (mounted) setState(() => _isLoading = false);
     }
  }

  Future<void> _saveProfile() async {
    setState(() => _isLoading = true);
    try {
      final data = {
        if (_nameController.text.isNotEmpty) 'name': _nameController.text,
        if (_emailController.text.isNotEmpty) 'email': _emailController.text,
        if (_phoneController.text.isNotEmpty) 'phone': _phoneController.text,
        if (_ageController.text.isNotEmpty) 'age': int.tryParse(_ageController.text) ?? 0,
      };
      
      await ApiClient().updateProfile(data);
      if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile Saved Successfully')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _logout() async {
    await ApiClient().logout();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );
    }
  }

    Future<void> _changeServer() async {
      final controller = TextEditingController(text: ApiClient.baseUrl);
      await showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Server Settings'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              labelText: 'API Base URL',
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
                ApiClient().updateBaseUrl();
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
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(color: AppColors.primary)),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveProfile, 
            child: const Text('Save')
          )
        ],
      ),
      backgroundColor: Colors.grey[50],
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('Personal Information'),
          _buildTextField('Name', _nameController, Icons.person),
          const SizedBox(height: 12),
          _buildTextField('Email', _emailController, Icons.email),
          const SizedBox(height: 12),
          _buildTextField('Phone', _phoneController, Icons.phone),
           const SizedBox(height: 12),
          _buildTextField('Age', _ageController, Icons.cake, isNumber: true),

          const SizedBox(height: 24),
          _buildSectionHeader('Security'),
          SwitchListTile(
            title: const Text('Enable Biometrics'),
            secondary: const Icon(Icons.fingerprint),
            value: _isBioEnabled, 
            onChanged: (val) => setState(() => _isBioEnabled = val),
            activeColor: AppColors.primary,
          ),
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: const Text('Change App PIN'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
               ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PIN Change not implemented in MVP')));
            },
          ),

          const SizedBox(height: 24),
          _buildSectionHeader('Data Management'),
          ListTile(
            leading: const Icon(Icons.download),
            title: const Text('Export Data (CSV)'),
            onTap: () async {
              // Dummy CSV generation
              final csv = 'Name,Email,Phone\n${_nameController.text},${_emailController.text},${_phoneController.text}';
              await FileUtils.exportData(csv, 'wafir_data.csv', mimeType: 'text/csv');
            },
          ),
           ListTile(
            leading: const Icon(Icons.data_object),
            title: const Text('Backcup Data (JSON)'),
            onTap: () async {
               // Dummy JSON generation
               final data = {
                 'name': _nameController.text,
                 'email': _emailController.text,
                 'phone': _phoneController.text,
                 'age': _ageController.text,
                 'timestamp': DateTime.now().toIso8601String(),
               };
               await FileUtils.exportData(jsonEncode(data), 'wafir_backup.json', mimeType: 'application/json');
            },
          ),

          const SizedBox(height: 24),
          _buildSectionHeader('App Preferences'),
          ListTile(
            leading: const Icon(Icons.dns),
            title: const Text('Server Configuration'),
            subtitle: Text(ApiClient.baseUrl, style: const TextStyle(fontSize: 10)),
            trailing: const Icon(Icons.edit, size: 16),
            onTap: _changeServer,
          ),
          
          const Divider(height: 32),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Logout', style: TextStyle(color: Colors.red)),
            onTap: _logout,
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, IconData icon, {bool isNumber = false}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 2)],
      ),
      child: TextField(
        controller: controller,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: Colors.grey),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }
}
