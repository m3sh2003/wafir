import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../budget/providers/budget_provider.dart';

class AddTransactionScreen extends ConsumerStatefulWidget {
  const AddTransactionScreen({super.key});

  @override
  ConsumerState<AddTransactionScreen> createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends ConsumerState<AddTransactionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _amountController = TextEditingController();
  
  String? _selectedEnvelopeId;
  String _transactionType = 'Expense';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Refresh budget data to ensure we have latest envelopes
    Future.microtask(() => ref.read(budgetProvider.notifier).syncData());
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedEnvelopeId == null && _transactionType == 'Expense') {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select an envelope')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final double amount = double.parse(_amountController.text);
      final apiClient = ApiClient();
      
      // We Post to /budget/transactions
      // Since specific repository logic for transaction might not exist separately, we use ApiClient directly here for expediency, 
      // or we should add addTransaction to BudgetRepository. Direct API for now.
      
      await apiClient.request(
        '/budget/transactions',
        method: 'POST',
        data: {
          'description': _descriptionController.text,
          'amount': amount,
          'type': _transactionType, // 'Expense' or 'Income'
          'currency': 'SAR',
          'date': DateTime.now().toIso8601String(),
          if (_transactionType == 'Expense') 'envelopeId': _selectedEnvelopeId,
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Transaction Added Successfully')));
        Navigator.pop(context);
        // Trigger refresh
        ref.read(budgetProvider.notifier).syncData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Get envelopes from Budget Provider
    final budgetState = ref.watch(budgetProvider);
    
    return Scaffold(
      appBar: AppBar(title: const Text('Add Transaction')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Type Toggle
              SegmentedButton<String>(
                segments: const [
                   ButtonSegment(value: 'Expense', label: Text('Expense'), icon: Icon(Icons.outbound)),
                   ButtonSegment(value: 'Income', label: Text('Income'), icon: Icon(Icons.attach_money)),
                ],
                selected: {_transactionType},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() {
                    _transactionType = newSelection.first;
                    // If Income, clear envelope
                    if (_transactionType == 'Income') _selectedEnvelopeId = null;
                  });
                },
              ),
              const SizedBox(height: 20),

              // Description
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),

              // Amount
              TextFormField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Amount (SAR)', border: OutlineInputBorder()),
                 validator: (v) {
                  if (v == null || v.isEmpty) return 'Required';
                  if (double.tryParse(v) == null) return 'Invalid Number';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Envelope Dropdown (Only for Expense)
              if (_transactionType == 'Expense')
                budgetState.when(
                  data: (envelopes) {
                    if (envelopes.isEmpty) return const Text('No Envelopes Found');
                    return DropdownButtonFormField<String>(
                      value: _selectedEnvelopeId,
                      decoration: const InputDecoration(labelText: 'Envelope', border: OutlineInputBorder()),
                      items: envelopes.map((e) {
                        return DropdownMenuItem(
                          value: e['id'].toString(), // Ensure string ID
                          child: Text(e['name']),
                        );
                      }).toList(),
                      onChanged: (v) => setState(() => _selectedEnvelopeId = v),
                    );
                  },
                  loading: () => const LinearProgressIndicator(),
                  error: (e, s) => Text('Error loading envelopes: $e'),
                ),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading ? const CircularProgressIndicator() : const Text('Save Transaction'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
