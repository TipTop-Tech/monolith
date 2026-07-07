// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.0"),
        .package(name: "CapacitorCommunityAppleSignIn", path: "..\..\..\node_modules\@capacitor-community\apple-sign-in"),
        .package(name: "CapacitorCommunityNativeAudio", path: "..\..\..\node_modules\@capacitor-community\native-audio"),
        .package(name: "CapacitorCommunitySqlite", path: "..\..\..\node_modules\@capacitor-community\sqlite"),
        .package(name: "CapacitorHaptics", path: "..\..\..\node_modules\@capacitor\haptics"),
        .package(name: "PowersyncCapacitor", path: "..\..\..\node_modules\@powersync\capacitor"),
        .package(name: "RevenuecatPurchasesCapacitor", path: "..\..\..\node_modules\@revenuecat\purchases-capacitor"),
        .package(name: "RevenuecatPurchasesCapacitorUi", path: "..\..\..\node_modules\@revenuecat\purchases-capacitor-ui")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCommunityAppleSignIn", package: "CapacitorCommunityAppleSignIn"),
                .product(name: "CapacitorCommunityNativeAudio", package: "CapacitorCommunityNativeAudio"),
                .product(name: "CapacitorCommunitySqlite", package: "CapacitorCommunitySqlite"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "PowersyncCapacitor", package: "PowersyncCapacitor"),
                .product(name: "RevenuecatPurchasesCapacitor", package: "RevenuecatPurchasesCapacitor"),
                .product(name: "RevenuecatPurchasesCapacitorUi", package: "RevenuecatPurchasesCapacitorUi")
            ]
        )
    ]
)
