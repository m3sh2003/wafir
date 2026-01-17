package com.example.wafir

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Capacitor سيتولى تحميل واجهة الويب تلقائياً من مجلد assets/public
    }
}
