import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_colors.dart';

class RebalanceScreen extends ConsumerStatefulWidget {
  const RebalanceScreen({super.key});

  @override
  ConsumerState<RebalanceScreen> createState() => _RebalanceScreenState();
}

class _RebalanceScreenState extends ConsumerState<RebalanceScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _result;
  int _touchedIndex = -1;

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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Portfolio Health Check'),
        backgroundColor: AppColors.background,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
      ),
      backgroundColor: Colors.grey[50],
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildErrorView()
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildSummaryCard(),
                      const SizedBox(height: 24),
                      _buildChartSection(),
                      const SizedBox(height: 24),
                      _buildDetailedList(),
                      const SizedBox(height: 24),
                      _buildActionPlan(),
                    ],
                  ),
                ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.orange),
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
      ),
    );
  }

  Widget _buildSummaryCard() {
    final risk = _result?['riskProfile'] ?? 'Balanced';
    final totalValue = (_result?['totalValue'] ?? 0.0) as double;
    final currencyFormatter = NumberFormat.currency(symbol: 'SAR ', decimalDigits: 2);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total Value', style: TextStyle(color: Colors.white70)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  risk,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            currencyFormatter.format(totalValue),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartSection() {
    final current = _result?['currentAllocation'] as Map<String, dynamic>? ?? {};
    final equity = (current['Equity'] ?? 0.0) as double;
    final sukuk = (current['Sukuk'] ?? 0.0) as double;
    final cash = (current['Cash'] ?? 0.0) as double;
    final realEstate = (current['RealEstate'] ?? 0.0) as double;

    // Filter out zero values for cleaner chart
    final sections = <PieChartSectionData>[];
    if (equity > 0) sections.add(_buildPieSection(equity, Colors.blue, 'Equity'));
    if (sukuk > 0) sections.add(_buildPieSection(sukuk, Colors.green, 'Sukuk'));
    if (realEstate > 0) sections.add(_buildPieSection(realEstate, Colors.orange, 'Real Estate'));
    if (cash > 0) sections.add(_buildPieSection(cash, Colors.grey, 'Cash'));

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text('Current Allocation', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 24),
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sections: sections,
                  centerSpaceRadius: 50,
                  sectionsSpace: 2,
                  pieTouchData: PieTouchData(
                    touchCallback: (FlTouchEvent event, pieTouchResponse) {
                      setState(() {
                        if (!event.isInterestedForInteractions ||
                            pieTouchResponse == null ||
                            pieTouchResponse.touchedSection == null) {
                          _touchedIndex = -1;
                          return;
                        }
                        _touchedIndex = pieTouchResponse.touchedSection!.touchedSectionIndex;
                      });
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 16,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: sections.map((s) => _buildLegendItem(s.color, s.title)).toList(),
            ),
          ],
        ),
      ),
    );
  }

  PieChartSectionData _buildPieSection(double value, Color color, String title) {
    final isTouched = false; // Simplified touch logic
    final fontSize = isTouched ? 16.0 : 12.0;
    final radius = isTouched ? 60.0 : 50.0;

    return PieChartSectionData(
      color: color,
      value: value * 100,
      title: '${(value * 100).toStringAsFixed(0)}%',
      radius: radius,
      titleStyle: TextStyle(
        fontSize: fontSize,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildDetailedList() {
    final current = _result?['currentAllocation'] as Map<String, dynamic>? ?? {};
    final target = _result?['targetAllocation'] as Map<String, dynamic>? ?? {};
    final totalValue = (_result?['totalValue'] ?? 0.0) as double;
    final currencyFormatter = NumberFormat.currency(symbol: 'SAR ', decimalDigits: 0);

    final assets = ['Equity', 'Sukuk', 'RealEstate', 'Cash'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Detailed Analysis', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 8),
        ...assets.map((assetKey) {
          final curPct = (current[assetKey] ?? 0.0) as double;
          final tgtPct = (target[assetKey] ?? 0.0) as double;

          if (curPct == 0 && tgtPct == 0) return const SizedBox.shrink();

          final curVal = totalValue * curPct;
          final tgtVal = totalValue * tgtPct;
          final diff = tgtVal - curVal;
          final isBalanced = diff.abs() < (totalValue * 0.01);

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(assetKey, style: const TextStyle(fontWeight: FontWeight.bold)),
                      if (isBalanced)
                        const Chip(label: Text('Balanced', style: TextStyle(fontSize: 10)), backgroundColor: Colors.greenAccent, visualDensity: VisualDensity.compact)
                      else if (diff > 0)
                        Chip(label: Text('Buy ${currencyFormatter.format(diff)}', style: const TextStyle(fontSize: 10, color: Colors.white)), backgroundColor: Colors.green, visualDensity: VisualDensity.compact)
                      else
                        Chip(label: Text('Sell ${currencyFormatter.format(diff.abs())}', style: const TextStyle(fontSize: 10, color: Colors.white)), backgroundColor: Colors.red, visualDensity: VisualDensity.compact)
                    ],
                  ),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMetric('Current', currencyFormatter.format(curVal), '${(curPct * 100).toStringAsFixed(1)}%'),
                      const Icon(Icons.arrow_forward, size: 16, color: Colors.grey),
                      _buildMetric('Target', currencyFormatter.format(tgtVal), '${(tgtPct * 100).toStringAsFixed(0)}%'),
                    ],
                  )
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildMetric(String label, String value, String pct) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        Text(pct, style: const TextStyle(fontSize: 12, color: AppColors.primary)),
      ],
    );
  }

  Widget _buildActionPlan() {
    final actions = (_result?['recommendedActions'] as List?)?.map((e) => e.toString()).toList() ?? [];

    return Card(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.checklist, color: AppColors.primary),
                SizedBox(width: 8),
                Text('Action Plan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary)),
              ],
            ),
            const SizedBox(height: 16),
            if (actions.isEmpty)
              const Padding(
                padding: EdgeInsets.all(8.0),
                child: Text('Your portfolio is perfectly balanced!', style: TextStyle(color: Colors.green)),
              )
            else
              ...actions.map((action) => Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.arrow_right, color: AppColors.primary),
                    Expanded(child: Text(action)),
                  ],
                ),
              )).toList(),
          ],
        ),
      ),
    );
  }
}
