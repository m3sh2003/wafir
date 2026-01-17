import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import 'package:intl/intl.dart';

class AccountCard extends StatelessWidget {
  final Map<String, dynamic> account;
  final List<dynamic> holdings;

  const AccountCard({
    super.key,
    required this.account,
    required this.holdings,
  });

  @override
  Widget build(BuildContext context) {
    final name = account['name'] ?? 'Account';
    final type = account['type'] ?? 'bank';
    final currency = account['currency'] ?? 'SAR';
    
    // Calculate total value from holdings if needed, or use balance logic from Web
    // Web: Sums holdings units. If currency is USD/EGP it converts.
    // For MVP Mobile: We'll show the SUM of holdings values as the "Balance" for this card, or the account balance column if populated.
    // The account 'balance' column in DB might be old or 0 if it's dynamic.
    // Web logic: "getAccountTotal(acc.holdings)".
    // Let's sum the holdings for display.
    
    double totalValue = 0;
    for (var h in holdings) {
      final units = h['units'] as double? ?? 0.0;
      final price = h['asset_currentPrice'] as double? ?? 1.0; // Default 1 if missing
      totalValue += units * price; // Simplified valuation
    }
    
    final currencyFormatter = NumberFormat.currency(symbol: '$currency ', decimalDigits: 2);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: AppColors.card,
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.muted,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _getIcon(type),
                        color: AppColors.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.muted,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            type.toString().toUpperCase(),
                            style: const TextStyle(
                              fontSize: 10,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      currencyFormatter.format(totalValue),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      currency,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const Divider(height: 1, color: Color(0xFFE5E7EB)),

          // Holdings List
          if (holdings.isNotEmpty)
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: holdings.length,
              separatorBuilder: (_, __) => const Divider(height: 1, indent: 16, endIndent: 16),
              itemBuilder: (context, index) {
                final h = holdings[index];
                final code = h['instrument_code'] ?? h['asset_symbol'] ?? 'UNKNOWN';
                final units = h['units'] ?? 0;
                final isPrimary = h['is_primary_home'] == 1; // SQLite stores bool as 1/0
                
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.pie_chart_outline, size: 16, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Text(
                            code,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                          ),
                          if (isPrimary)
                            Container(
                              margin: const EdgeInsets.only(left: 8),
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                              decoration: BoxDecoration(
                                color: Colors.blue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(2),
                              ),
                              child: const Text('Home', style: TextStyle(fontSize: 9, color: Colors.blue)),
                            ),
                        ],
                      ),
                      Text(
                        NumberFormat.decimalPattern().format(units),
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 14),
                      ),
                    ],
                  ),
                );
              },
            )
          else
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'No holdings',
                style: const TextStyle(fontStyle: FontStyle.italic, color: AppColors.textSecondary, fontSize: 13),
              ),
            ),
            
           // Footer
           Container(
             width: double.infinity,
             padding: const EdgeInsets.all(12),
             color: AppColors.muted.withOpacity(0.3),
             alignment: Alignment.centerRight,
             child: Text(
               '+ Add Asset',
               style: TextStyle(
                 fontSize: 12,
                 fontWeight: FontWeight.bold,
                 color: AppColors.primary,
               ),
             ),
           ),
        ],
      ),
    );
  }

  IconData _getIcon(String type) {
    switch (type.toLowerCase()) {
      case 'bank': return Icons.account_balance;
      case 'broker': return Icons.business;
      case 'real_estate': return Icons.home;
      case 'cash': return Icons.money;
      default: return Icons.account_balance_wallet;
    }
  }
}
