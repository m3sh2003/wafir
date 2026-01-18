import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../dashboard/providers/dashboard_provider.dart';
import '../../../core/theme/app_colors.dart';

class ZakatScreen extends ConsumerStatefulWidget {
  const ZakatScreen({super.key});

  @override
  ConsumerState<ZakatScreen> createState() => _ZakatScreenState();
}

class _ZakatScreenState extends ConsumerState<ZakatScreen> {
  // 'system' or 'manual'
  Set<String> _mode = {'system'}; 
  
  // Manual Inputs
  final _valuationController = TextEditingController(text: '10000');
  final _nisabController = TextEditingController(text: '22000');

  double? _manualResult;

  void _calculateManual() {
    final val = double.tryParse(_valuationController.text) ?? 0;
    final nisab = double.tryParse(_nisabController.text) ?? 0;
    
    setState(() {
      if (val >= nisab) {
        _manualResult = val * 0.025;
      } else {
        _manualResult = 0.0;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Zakat Calculator')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Mode Toggle
            SegmentedButton<String>(
              segments: const [
                 ButtonSegment(value: 'system', label: Text('System Assets'), icon: Icon(Icons.storage)),
                 ButtonSegment(value: 'manual', label: Text('Manual Input'), icon: Icon(Icons.edit)),
              ],
              selected: _mode,
              onSelectionChanged: (Set<String> newSelection) {
                setState(() {
                  _mode = newSelection;
                  _manualResult = null; // Reset manual result on switch
                });
              },
            ),
            const SizedBox(height: 24),

            if (_mode.contains('system')) 
              dashboardState.when(
                data: (data) => _buildSystemView(context, data),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e,s) => Text('Error loading data: $e'),
              )
            else 
              _buildManualView(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSystemView(BuildContext context, Map<String, dynamic> data) {
      final holdings = data['holdings'] as List<dynamic>;
      final zakatableHoldings = holdings.where((h) {
          final isZakatable = h['asset_isZakatable'];
          return isZakatable == 1 || isZakatable == true;
      }).toList();

      double totalZakatableValue = 0;
      for (var h in zakatableHoldings) {
        final units = h['units'] as double? ?? 0.0;
        final price = h['asset_currentPrice'] as double? ?? 0.0;
        totalZakatableValue += units * price;
      }

      final nisab = 22000.0; // Approx SAR
      final zakatDue = totalZakatableValue >= nisab ? totalZakatableValue * 0.025 : 0.0;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _ResultCard(
             dueAmount: zakatDue, 
             basis: '2.5% of System Assets', 
             isAboveNisab: totalZakatableValue >= nisab
          ),
          const SizedBox(height: 20),
          const Text('Zakatable Assets Breakdown', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),
          if (zakatableHoldings.isEmpty) 
             const Text('No Zakatable assets found in your portfolio.')
          else 
            ...zakatableHoldings.map((h) {
               final units = h['units'] as double? ?? 0.0;
               final price = h['asset_currentPrice'] as double? ?? 0.0;
               return ListTile(
                 contentPadding: EdgeInsets.zero,
                 title: Text(h['asset_name'] ?? 'Asset'),
                 trailing: Text(NumberFormat.currency(symbol: 'SAR ').format(units * price)),
               );
            }),
        ],
      );
  }

  Widget _buildManualView(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Card(
          elevation: 0,
          color: Colors.grey[50],
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade300)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                TextField(
                  controller: _valuationController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Total Net Assets (SAR)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _nisabController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Current Nisab (SAR)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _calculateManual,
                    child: const Text('Calculate Zakat'),
                  ),
                )
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        if (_manualResult != null)
           _ResultCard(
             dueAmount: _manualResult!, 
             basis: 'Manual Calculation', 
             isAboveNisab: double.parse(_valuationController.text) >= double.parse(_nisabController.text)
          ),
      ],
    );
  }
}

class _ResultCard extends StatelessWidget {
  final double dueAmount;
  final String basis;
  final bool isAboveNisab;

  const _ResultCard({required this.dueAmount, required this.basis, required this.isAboveNisab});

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(symbol: 'SAR ', decimalDigits: 2);
    final color = isAboveNisab ? Colors.green : Colors.orange;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(isAboveNisab ? 'Zakat Due' : 'Below Nisab', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            currencyFormatter.format(dueAmount),
            style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: color),
          ),
          const SizedBox(height: 8),
          Text(basis, style: TextStyle(color: color.withOpacity(0.8), fontSize: 12)),
        ],
      ),
    );
  }
}
