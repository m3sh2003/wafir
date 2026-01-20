import 'package:flutter/material.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/theme/app_colors.dart';

class RiskAssessmentScreen extends StatefulWidget {
  const RiskAssessmentScreen({super.key});

  @override
  State<RiskAssessmentScreen> createState() => _RiskAssessmentScreenState();
}

class _RiskAssessmentScreenState extends State<RiskAssessmentScreen> {
  int _step = 0;
  List<int> _answers = [];
  bool _submitting = false;

  final List<Map<String, dynamic>> _questions = [
    {
      "text": "What is your primary investment goal?",
      "options": [
        {"text": "Preserve Capital (Safety)", "score": 1},
        {"text": "Balanced Growth", "score": 2},
        {"text": "Aggressive Growth (Wealth)", "score": 3}
      ]
    },
    {
      "text": "How long do you plan to invest?",
      "options": [
        {"text": "Less than 3 years", "score": 1},
        {"text": "3 - 10 years", "score": 2},
        {"text": "More than 10 years", "score": 3}
      ]
    },
    {
      "text": "If your portfolio drops 20% in a month to market changes, you would:",
      "options": [
        {"text": "Sell everything immediately", "score": 1},
        {"text": "Wait it out", "score": 2},
        {"text": "Buy more at lower prices", "score": 3}
      ]
    }
  ];

  void _handleAnswer(int score) {
    setState(() {
      _answers.add(score);
      if (_step < _questions.length - 1) {
        _step++;
      } else {
        _submit();
      }
    });
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final totalScore = _answers.reduce((a, b) => a + b);
      await ApiClient().setRiskProfile(totalScore);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Risk Profile Updated!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
        setState(() {
          _submitting = false;
          _answers = [];
          _step = 0;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions[_step];

    return Scaffold(
      appBar: AppBar(
        title: Text('Risk Assessment (${_step + 1}/${_questions.length})'),
        backgroundColor: AppColors.background,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
      ),
      backgroundColor: Colors.grey[50],
      body: _submitting
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    question['text'],
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 32),
                  ...(question['options'] as List).map((opt) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: ElevatedButton(
                        onPressed: () => _handleAnswer(opt['score']),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.textPrimary,
                          padding: const EdgeInsets.all(16),
                          elevation: 1,
                          side: BorderSide(color: Colors.grey[300]!),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(opt['text'], style: const TextStyle(fontSize: 16)),
                            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
    );
  }
}
