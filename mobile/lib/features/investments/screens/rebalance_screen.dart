import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../l10n/app_localizations.dart';

class RebalanceScreen extends ConsumerStatefulWidget {
  const RebalanceScreen({super.key});

  @override
  ConsumerState<RebalanceScreen> createState() => _RebalanceScreenState();
}

class _RebalanceScreenState extends ConsumerState<RebalanceScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _result;

  @override
  void initState() {
    super.initState();
    _fetchRebalanceData();
  }

  Future<void> _fetchRebalanceData() async {
    try {
      final response = await ApiClient().rebalancePortfolio();
      if (mounted) {
        setState(() {
          _result = response.data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Localizations fallback (hardcoded for now if l10n missing keys, but structure is there)
    // Assuming keys: rebalance, portfolio_health_check, allocation_strategy, etc. exist or using English fallbacks.
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rebalance Portfolio'),
        backgroundColor: AppColors.background,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
      ),
      backgroundColor: Colors.grey[50],
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Analysis Failed: $_error', textAlign: TextAlign.center),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _isLoading = true;
                            _error = null;
                          });
                          _fetchRebalanceData();
                        },
                        child: const Text('Retry'),
                      )
                    ],
                  ),
                ))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 24),
                      _buildAllocationSection(),
                      const SizedBox(height: 24),
                      _buildActionsSection(),
                    ],
                  ),
                ),
    );
  }

  Widget _buildHeader() {
    final risk = _result?['riskProfile'] ?? 'Balanced';
    final totalValue = _result?['totalValue'] ?? 0.0;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Portfolio Health Check',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text('Optimized based on $risk risk profile', style: const TextStyle(color: Colors.grey)),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total Portfolio Value'),
                Text(
                  'SAR ${totalValue.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAllocationSection() {
    final current = _result?['currentAllocation'] ?? {};
    final target = _result?['targetAllocation'] ?? {};

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.pie_chart, color: AppColors.primary),
                SizedBox(width: 8),
                Text('Allocation Strategy', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 16),
            _buildBar('Equity / ETF', current['Equity'], target['Equity'], Colors.blue),
            const SizedBox(height: 16),
            _buildBar('Fixed Income (Sukuk)', current['Sukuk'], target['Sukuk'], Colors.green),
          ],
        ),
      ),
    );
  }

  Widget _buildBar(String label, dynamic current, dynamic target, Color color) {
    final curVal = (current is num ? current.toDouble() : 0.0) * 100;
    final tgtVal = (target is num ? target.toDouble() : 0.0) * 100;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label),
            Text.rich(
              TextSpan(
                children: [
                  TextSpan(text: 'Current: ${curVal.toStringAsFixed(0)}%'),
                  const TextSpan(text: ' / ', style: TextStyle(color: Colors.grey)),
                  TextSpan(text: 'Target: ${tgtVal.toStringAsFixed(0)}%'),
                ],
                style: const TextStyle(fontSize: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Stack(
          children: [
            Container(height: 10, width: double.infinity, color: Colors.grey[200]),
            FractionallySizedBox(
              widthFactor: (curVal / 100).clamp(0.0, 1.0),
              child: Container(height: 10, color: color),
            ),
            // Target marker
            Positioned(
              left: 0,
              right: 0,
              child: Align(
                alignment: Alignment((tgtVal / 50) - 1, 0), // alignment is from -1 to 1
                child: Container(
                  width: 2,
                  height: 14,
                  color: Colors.black,
                ),
              ),
            )
          ],
        ),
      ],
    );
  }

  Widget _buildActionsSection() {
    final actions = (_result?['recommendedActions'] as List?)?.map((e) => e.toString()).toList() ?? [];

    return Card(
      color: actions.isEmpty ? Colors.green[50] : AppColors.card,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.check_circle, color: AppColors.primary),
                SizedBox(width: 8),
                Text('Recommended Actions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 16),
            if (actions.isEmpty || (actions.length == 1 && actions[0].toLowerCase().contains('balanced')))
              const Center(
                child: Column(
                  children: [
                    Icon(Icons.thumb_up, color: Colors.green, size: 40),
                    SizedBox(height: 8),
                    Text('Perfectly Balanced!', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                    Text('No actions needed.', style: TextStyle(color: Colors.green)),
                  ],
                ),
              )
            else
              ListView.separated(
                physics: const NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                itemCount: actions.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  return Row(
                    children: [
                      const Icon(Icons.arrow_right, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Expanded(child: Text(actions[index])),
                    ],
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
