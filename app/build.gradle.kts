plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.example.wafir"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.wafir"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }
}

// --- مهمة أتمتة بناء الويب ونسخ الملفات ---
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

tasks.named("preBuild") {
    dependsOn("syncWebAssets")
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.capacitor.core)

    // إصلاح أخطاء الـ Test لتصدير الـ APK
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
