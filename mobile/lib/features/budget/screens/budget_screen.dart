import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/budget_provider.dart';

class BudgetScreen extends ConsumerStatefulWidget {
  const BudgetScreen({super.key});

  @override
  ConsumerState<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends ConsumerState<BudgetScreen> {
  
  @override
  void initState() {
    super.initState();
    // Trigger sync on init
    Future.microtask(() => ref.read(budgetProvider.notifier).syncData());
  }

  @override
  Widget build(BuildContext context) {
    final budgetState = ref.watch(budgetProvider);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('My Budget', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.background,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
            onPressed: () => ref.read(budgetProvider.notifier).syncData(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
           // TODO: Add Transaction
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Add Transaction Todo')));
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: budgetState.when(
        data: (envelopes) {
          if (envelopes.isEmpty) {
            return const Center(child: Text('No Envelopes Created.'));
          }
          
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: envelopes.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final env = envelopes[index];
              return EnvelopeCard(envelope: env);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, s) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class EnvelopeCard extends StatelessWidget {
  final Map<String, dynamic> envelope;

  const EnvelopeCard({super.key, required this.envelope});

  @override
  Widget build(BuildContext context) {
    final name = envelope['name'] ?? 'Envelope';
    final limit = envelope['limit_amount'] as double? ?? 0.0;
    final spent = envelope['spent_amount'] as double? ?? 0.0;
    final remaining = limit - spent;
    final progress = limit > 0 ? (spent / limit).clamp(0.0, 1.0) : 0.0;
    
    final currencyFormatter = NumberFormat.currency(symbol: 'SAR ', decimalDigits: 0);

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: AppColors.card,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(
                  '${currencyFormatter.format(spent)} / ${currencyFormatter.format(limit)}',
                   style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14, color: AppColors.textPrimary),
                ),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: AppColors.muted,
              valueColor: AlwaysStoppedAnimation<Color>(
                spent > limit ? AppColors.error : AppColors.primary,
              ),
              minHeight: 8,
              borderRadius: BorderRadius.circular(4),
            ),
             const SizedBox(height: 8),
             Align(
               alignment: Alignment.centerRight,
               child: Text(
                 remaining >= 0 
                   ? 'Remaining: ${currencyFormatter.format(remaining)}'
                   : 'Overspent: ${currencyFormatter.format(remaining.abs())}',
                 style: TextStyle(
                   fontSize: 12, 
                   color: remaining >= 0 ? AppColors.textSecondary : AppColors.error
                 ),
               ),
             ),
          ],
        ),
      ),
    );
  }
}
