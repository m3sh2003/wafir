
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class FileUtils {
  static Future<void> exportData(String content, String filename, {String mimeType = 'text/plain'}) async {
    try {
      final directory = await getTemporaryDirectory();
      final file = File('${directory.path}/$filename');
      await file.writeAsString(content);
      
      await Share.shareXFiles(
        [XFile(file.path, mimeType: mimeType)],
        text: 'Exported from Wafir',
      );
    } catch (e) {
      print('Export Error: $e');
      rethrow;
    }
  }

  static Future<void> exportBinary(List<int> bytes, String filename, {String mimeType = 'application/octet-stream'}) async {
    try {
      final directory = await getTemporaryDirectory();
      final file = File('${directory.path}/$filename');
      await file.writeAsBytes(bytes);
      
      await Share.shareXFiles(
        [XFile(file.path, mimeType: mimeType)],
        text: 'Exported from Wafir',
      );
    } catch (e) {
      print('Export Error: $e');
      rethrow;
    }
  }
}
