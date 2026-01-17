class Holding {
  final int id;
  final String instrumentCode;
  final String? assetId;
  final double units;
  final bool isPrimaryHome;
  final int accountId;

  Holding({
    required this.id,
    required this.instrumentCode,
    this.assetId,
    required this.units,
    required this.isPrimaryHome,
    required this.accountId,
  });

  factory Holding.fromJson(Map<String, dynamic> json) {
    return Holding(
      id: json['id'],
      instrumentCode: json['instrumentCode'] ?? json['instrument_code'],
      assetId: json['assetId'] ?? json['asset_id'],
      units: (json['units'] is String ? double.tryParse(json['units']) : (json['units'] as num?)?.toDouble()) ?? 0.0,
      isPrimaryHome: json['isPrimaryHome'] == 1 || json['isPrimaryHome'] == true || json['is_primary_home'] == 1,
      accountId: json['accountId'] ?? json['account_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'instrument_code': instrumentCode,
      'asset_id': assetId,
      'units': units,
      'is_primary_home': isPrimaryHome ? 1 : 0,
      'account_id': accountId,
    };
  }
}
