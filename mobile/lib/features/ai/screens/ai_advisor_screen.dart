import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/api/api_client.dart';

class AiAdvisorScreen extends ConsumerStatefulWidget {
  const AiAdvisorScreen({super.key});

  @override
  ConsumerState<AiAdvisorScreen> createState() => _AiAdvisorScreenState();
}

class _AiAdvisorScreenState extends ConsumerState<AiAdvisorScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;
  final ApiClient _apiClient = ApiClient();
  
  final List<Message> _messages = [
    Message(
      text: "Hello! I am your Wafir AI Advisor. I can assist you with your finances using real-time insights. How can I help today?",
      isUser: false,
      timestamp: DateTime.now(),
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(Message(text: text, isUser: true, timestamp: DateTime.now()));
      _controller.clear();
      _isTyping = true;
    });

    _scrollToBottom();

    try {
      final response = await _apiClient.chatWithAi(text);
      if (mounted) {
        setState(() {
          _isTyping = false;
          _messages.add(
            Message(
              text: response['response'] ?? "I received your message but couldn't process it.",
              isUser: false,
              timestamp: DateTime.now(),
            ),
          );
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
         setState(() {
          _isTyping = false;
          _messages.add(
            Message(
              text: "I'm having trouble connecting to the server. Please check your internet connection.",
              isUser: false,
              timestamp: DateTime.now(),
            ),
          );
        });
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Advisor (Live)', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      backgroundColor: Colors.grey[50],
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                   return const _TypingIndicator();
                }
                final msg = _messages[index];
                return _MessageBubble(message: msg);
              },
            ),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'Ask AI anything...',
                hintStyle: TextStyle(color: Colors.grey[400]),
                filled: true,
                fillColor: Colors.grey[50],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: AppColors.primary,
            child: IconButton(
              icon: const Icon(Icons.send, color: Colors.white, size: 20),
              onPressed: _sendMessage,
            ),
          ),
        ],
      ),
    );
  }
}

class Message {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  Message({required this.text, required this.isUser, required this.timestamp});
}

class _MessageBubble extends StatelessWidget {
  final Message message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: message.isUser ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: message.isUser ? const Radius.circular(16) : Radius.zero,
            bottomRight: message.isUser ? Radius.zero : const Radius.circular(16),
          ),
          boxShadow: [
             if (!message.isUser)
               BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: TextStyle(
                color: message.isUser ? Colors.white : Colors.black87,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "${message.timestamp.hour}:${message.timestamp.minute.toString().padLeft(2, '0')}",
              style: TextStyle(
                color: message.isUser ? Colors.white70 : Colors.grey,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomRight: Radius.circular(16),
            bottomLeft: Radius.zero,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _dot(),
            const SizedBox(width: 4),
            _dot(),
            const SizedBox(width: 4),
            _dot(),
          ],
        ),
      ),
    );
  }

  Widget _dot() {
    return Container(
      width: 6,
      height: 6,
      decoration: BoxDecoration(color: Colors.grey[400], shape: BoxShape.circle),
    );
  }
}
