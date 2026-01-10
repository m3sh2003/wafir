plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    // يمكنك إزالة كود Compose إذا لم تعد بحاجة إليه لتقليل حجم التطبيق
}

android {
    namespace = "com.example.wafir"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.wafir"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    // ... بقية الإعدادات
}

// --- إضافة مهمة الأتمتة هنا ---
tasks.register<Exec>("npmBuild") {
    group = "build"
    workingDir = file("../wafir-app")
    if (System.getProperty("os.name").lowercase().contains("windows")) {
        commandLine("cmd", "/c", "npm run build")
    } else {
        commandLine("npm", "run", "build")
    }
}

tasks.register<Copy>("syncWebAssets") {
    group = "build"
    dependsOn("npmBuild")
    from("../wafir-app/dist")
    into("src/main/assets/public")
}

// اجعل الأندرويد يقوم بتحديث ملفات الويب قبل كل بناء
tasks.named("preBuild") {
    dependsOn("syncWebAssets")
}
// ----------------------------

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)

    // استخدام إصدار 7.0.0 ليتوافق مع نظام أندرويد المستهدف
    implementation("com.capacitorjs:core:7.0.0")
    implementation("com.capacitorjs:android:7.0.0")
}