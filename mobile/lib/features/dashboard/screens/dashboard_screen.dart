import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../dashboard/providers/dashboard_provider.dart';
import '../../budget/providers/budget_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../transactions/screens/add_transaction_screen.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardProvider);
    final budgetAsync = ref.watch(budgetProvider);
    final currencyFormatter = NumberFormat.currency(symbol: 'SAR ', decimalDigits: 0);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Welcome Section
            const Text('Welcome back', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),

            // KPI Grid
            dashboardAsync.when(
              data: (data) {
                final holdings = data['holdings'] as List<dynamic>;
                final netWorth = data['netWorth'] as double? ?? 0.0;
                
                // Compliance Calc
                double compliantValue = 0;
                for (var h in holdings) {
                  final isCompliant = (h['asset_isShariaCompliant'] == 1 || h['asset_isShariaCompliant'] == true);
                  if (isCompliant) {
                     final units = h['units'] as double? ?? 0.0;
                     final price = h['asset_currentPrice'] as double? ?? 0.0;
                     compliantValue += units * price;
                  }
                }
                final compliancePct = netWorth > 0 ? (compliantValue / netWorth * 100).round() : 100;

                return Column(
                  children: [
                    // Net Worth Card
                    _KpiCard(
                      title: 'Total Net Worth',
                      value: currencyFormatter.format(netWorth),
                      subtitle: '▲ Updated just now',
                      subtitleColor: Colors.green,
                    ),
                    const SizedBox(height: 12),
                    
                    // Budget & Compliance Row
                    Row(
                      children: [
                        Expanded(
                          child: budgetAsync.when(
                            data: (envelopes) {
                              double spent = 0;
                              double limit = 0;
                              for (var e in envelopes) {
                                spent += e['spent_amount'] as double? ?? 0;
                                limit += e['limit_amount'] as double? ?? 0;
                              }
                              final usage = limit > 0 ? (spent / limit * 100).round() : 0;
                              return _KpiCard(
                                title: 'Monthly Expenses',
                                value: currencyFormatter.format(spent),
                                customContent: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 8),
                                    LinearProgressIndicator(
                                      value: limit > 0 ? (spent / limit).clamp(0.0, 1.0) : 0.0,
                                      backgroundColor: Colors.grey[200],
                                      color: usage > 90 ? Colors.red : Colors.orange,
                                      minHeight: 6,
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                    const SizedBox(height: 4),
                                    Text('$usage% of budget', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                  ],
                                ),
                              );
                            },
                            loading: () => const _KpiLoading(),
                            error: (_,__) => const _KpiCard(title: 'Expenses', value: 'Error'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _KpiCard(
                            title: 'Compliant Inv.',
                            value: '$compliancePct%',
                            subtitle: 'View Portfolio',
                            subtitleColor: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, s) => Text('Error: $e'),
            ),

            const SizedBox(height: 24),

            // Quick Actions
            const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _QuickActionBtn(icon: '💸', label: 'Add Transaction', onTap: () {
                   Navigator.push(context, MaterialPageRoute(builder: (_) => const AddTransactionScreen()));
                }),
                _QuickActionBtn(icon: '⚖️', label: 'Rebalance', onTap: () {
                   // Placeholder for Rebalance
                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Rebalance Feature needs Implementation')));
                }),
                 // Zakat is already a tab, but adding shortcut is fine
                _QuickActionBtn(icon: '🕌', label: 'Zakat Calc', onTap: () {
                    // Navigate to Zakat Tab (index 3) is hard from here without context/provider for TabController. 
                    // Just showing a msg or maybe navigating to ZakatScreen directly as a page
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please use the Zakat Tab')));
                }),
                _QuickActionBtn(icon: '🏠', label: 'Add Asset', onTap: () {
                    // Placeholder
                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Add Asset Feature needs Implementation')));
                }),
              ],
            ),

            const SizedBox(height: 24),
             
            // Analytics / Pie Chart (Reserved from previous impl)
            const Text('Analytics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            dashboardAsync.when(
               data: (data) => _buildPieChart(context, data),
               loading: () => const SizedBox(),
               error: (_, __) => const SizedBox(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPieChart(BuildContext context, Map<String, dynamic> data) {
    final holdings = data['holdings'] as List<dynamic>;
    if (holdings.isEmpty) return const Text('No data for charts');
    
     // Group by Asset Type
    final Map<String, double> allocation = {};
    for (var h in holdings) {
      final type = h['asset_type'] as String? ?? 'Other';
      final units = h['units'] as double? ?? 0.0;
      final price = h['asset_currentPrice'] as double? ?? 0.0;
      final value = units * price;
      allocation[type] = (allocation[type] ?? 0) + value;
    }
    
    final totalValue = allocation.values.fold(0.0, (sum, val) => sum + val);
    if (totalValue == 0) return const SizedBox();

    final List<PieChartSectionData> sections = [];
    int i = 0;
    allocation.forEach((key, value) {
      final isLarge = value / totalValue > 0.15;
      sections.add(
        PieChartSectionData(
          color: _getColor(i++),
          value: value,
          title: '${(value / totalValue * 100).round()}%',
          radius: isLarge ? 50 : 40,
          titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      );
    });

    return SizedBox(
      height: 200,
      child: PieChart(
        PieChartData(sections: sections, centerSpaceRadius: 30, sectionsSpace: 2),
      ),
    );
  }

   Color _getColor(int index) {
      const colors = [Colors.blue, Colors.red, Colors.green, Colors.orange, Colors.purple];
      return colors[index % colors.length];
   }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final Color? subtitleColor;
  final Widget? customContent;

  const _KpiCard({required this.title, required this.value, this.subtitle, this.subtitleColor, this.customContent});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          if (subtitle != null) ...[
             const SizedBox(height: 4),
             Text(subtitle!, style: TextStyle(fontSize: 10, color: subtitleColor ?? Colors.grey)),
          ],
          if (customContent != null) customContent!,
        ],
      ),
    );
  }
}

class _KpiLoading extends StatelessWidget {
  const _KpiLoading();
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100, 
      decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
      child: const Center(child: CircularProgressIndicator()),
    );
  }
}

class _QuickActionBtn extends StatelessWidget {
  final String icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionBtn({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Text(icon, style: const TextStyle(fontSize: 24)),
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
