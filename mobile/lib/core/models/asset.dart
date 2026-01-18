class Asset {
  final String id;
  final String name;
  final String symbol;
  final String type;
  final String riskLevel;
  final double currentPrice;
  final double? expectedReturn;
  final double? minInvestment;
  final String? description;
  final bool isZakatable;
  final bool isShariaCompliant;

  Asset({
    required this.id,
    required this.name,
    required this.symbol,
    required this.type,
    required this.riskLevel,
    required this.currentPrice,
    this.expectedReturn,
    this.minInvestment,
    this.description,
    required this.isZakatable,
    required this.isShariaCompliant,
  });

  factory Asset.fromJson(Map<String, dynamic> json) {
    return Asset(
      id: json['id'],
      name: json['name'],
      symbol: json['symbol'],
      type: json['type'],
      riskLevel: json['riskLevel'] ?? json['risk_level'] ?? 'Medium',
      currentPrice: (json['currentPrice'] is String ? double.tryParse(json['currentPrice']) : (json['currentPrice'] as num?)?.toDouble()) ?? 
                    (json['current_price'] is String ? double.tryParse(json['current_price']) : (json['current_price'] as num?)?.toDouble()) ?? 0.0,
      expectedReturn: json['expectedReturn'] == null ? (json['expected_return'] is String ? double.tryParse(json['expected_return']) : (json['expected_return'] as num?)?.toDouble()) : (json['expectedReturn'] is String ? double.tryParse(json['expectedReturn']) : (json['expectedReturn'] as num?)?.toDouble()),
      minInvestment: json['minInvestment'] == null ? (json['min_investment'] is String ? double.tryParse(json['min_investment']) : (json['min_investment'] as num?)?.toDouble()) : (json['minInvestment'] is String ? double.tryParse(json['minInvestment']) : (json['minInvestment'] as num?)?.toDouble()),
      description: json['description'],
      isZakatable: json['isZakatable'] == 1 || json['isZakatable'] == true || json['is_zakatable'] == 1 || json['is_zakatable'] == true,
      isShariaCompliant: json['isShariaCompliant'] == 1 || json['isShariaCompliant'] == true || json['is_sharia_compliant'] == 1 || json['is_sharia_compliant'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'symbol': symbol,
      'type': type,
      'riskLevel': riskLevel,
      'currentPrice': currentPrice,
      'expectedReturn': expectedReturn,
      'minInvestment': minInvestment,
      'description': description,
      'isZakatable': isZakatable ? 1 : 0,
      'isShariaCompliant': isShariaCompliant ? 1 : 0,
    };
  }
}
