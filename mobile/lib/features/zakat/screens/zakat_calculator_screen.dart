import 'package:flutter/material.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import 'package:intl/intl.dart';

class ZakatCalculatorScreen extends StatefulWidget {
  const ZakatCalculatorScreen({super.key});

  @override
  State<ZakatCalculatorScreen> createState() => _ZakatCalculatorScreenState();
}

class _ZakatCalculatorScreenState extends State<ZakatCalculatorScreen> {
  bool _isSystemMode = true;
  bool _isLoading = false;
  Map<String, dynamic>? _result;

  // Manual inputs
  final _valuationController = TextEditingController(text: '10000');
  final _nisabController = TextEditingController(text: '6000');

  String get _currency =>  'SAR'; // Default to SAR for display

  @override
  void dispose() {
    _valuationController.dispose();
    _nisabController.dispose();
    super.dispose();
  }

  Future<void> _calculate() async {
    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final client = ApiClient();
      final response = _isSystemMode
          ? await client.calculateZakatSystem()
          : await client.calculateZakatManual({
              'portfolio_valuation_usd': double.tryParse(_valuationController.text) ?? 0,
              'nisab_usd': double.tryParse(_nisabController.text) ?? 0,
              'non_zakat_assets': []
            });

      if (mounted) {
        setState(() {
          _result = response.data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Calculation failed: $e')));
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Zakat Calculator'),
        backgroundColor: AppColors.background,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
      ),
      backgroundColor: Colors.grey[50],
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildModeToggle(),
            const SizedBox(height: 24),
            _isSystemMode ? _buildSystemInfo() : _buildManualForm(),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _calculate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(_isSystemMode ? 'Calculate My Zakat' : 'Calculate', style: const TextStyle(fontSize: 16, color: Colors.white)),
              ),
            ),
            const SizedBox(height: 32),
            if (_result != null) _buildResult(),
          ],
        ),
      ),
    );
  }

  Widget _buildModeToggle() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() { _isSystemMode = true; _result = null; }),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: _isSystemMode
                    ? BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 2)])
                    : null,
                alignment: Alignment.center,
                child: Text('System Assets', style: TextStyle(fontWeight: _isSystemMode ? FontWeight.bold : FontWeight.normal)),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() { _isSystemMode = false; _result = null; }),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: !_isSystemMode
                    ? BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 2)])
                    : null,
                alignment: Alignment.center,
                child: Text('Manual Input', style: TextStyle(fontWeight: !_isSystemMode ? FontWeight.bold : FontWeight.normal)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSystemInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey[200]!)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Automatic Calculation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Calculates Zakat based on your current portfolio holdings classified as Zakatable assets.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: AppColors.primary, size: 20),
                SizedBox(width: 8),
                Expanded(child: Text('Only liquid assets and specific investments are included.', style: TextStyle(color: AppColors.primary, fontSize: 12))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildManualForm() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey[200]!)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Manual Entry (USD)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildInput('Total Net Assets', _valuationController),
          const SizedBox(height: 16),
          _buildInput('Current Nisab', _nisabController),
        ],
      ),
    );
  }

  Widget _buildInput(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            prefixText: '\$ ',
          ),
        ),
      ],
    );
  }

  Widget _buildResult() {
    final zakatDueUSD = _result?['zakat_due_usd'] ?? 0.0;
    final zakatDueSAR = _result?['zakat_due_sar']; // Might be null in Manual mode? Web logic checks both.

    // If System mode, we prefer SAR if available. Manual is USD input so result might be USD.
    // Web logic: if zakat_due_sar exists, show it, else USD.
    
    final displayValue = zakatDueSAR != null ? (zakatDueSAR is num ? zakatDueSAR.toDouble() : double.parse(zakatDueSAR.toString())) : (zakatDueUSD is num ? zakatDueUSD.toDouble() : 0.0);
    final isSAR = zakatDueSAR != null;
    final currency = isSAR ? 'SAR' : 'USD';
    final formatter = NumberFormat.currency(symbol: '$currency ');

    final basis = _result?['calculation_basis'] ?? '2.5% of Zakatable Assets';
    final status = _result?['nisab_status'] ?? (_result?['is_above_nisab'] == true ? 'Above Nisab' : 'Below Nisab');
    final isDue = displayValue > 0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5))],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: isDue ? Colors.green[100] : Colors.amber[100],
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(status, style: TextStyle(color: isDue ? Colors.green[800] : Colors.amber[800], fontWeight: FontWeight.bold, fontSize: 12)),
          ),
          const SizedBox(height: 16),
          Text(
            isDue ? formatter.format(displayValue) : 'No Zakat Due',
            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
          if (isDue) ...[
            const SizedBox(height: 8),
            Text('Zakat Due ($basis)', style: const TextStyle(color: Colors.grey)),
          ],
          if (_result?['breakdown'] != null) ...[
            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 12),
            _buildBreakdownItem('Cash & Bank', _result!['breakdown']['cash_sar']),
            _buildBreakdownItem('Investments', _result!['breakdown']['investments_sar']),
            const SizedBox(height: 8),
            _buildBreakdownItem('Total Assets', _result!['total_assets_sar'], isBold: true),
          ]
        ],
      ),
    );
  }

  Widget _buildBreakdownItem(String label, dynamic value, {bool isBold = false}) {
    final val = value != null ? NumberFormat.currency(symbol: 'SAR ').format(value is num ? value : double.tryParse(value.toString()) ?? 0) : '-';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(val, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }
}
