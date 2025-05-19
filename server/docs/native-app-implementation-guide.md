# Rank It Pro - Native Mobile App Implementation Guide

This guide provides detailed instructions for developers building native mobile applications (iOS/Android) that integrate with the Rank It Pro API. 

## Overview

Rank It Pro provides a comprehensive API that allows technicians to perform all their field operations from a mobile device. This document outlines how to implement the core features in a native mobile application.

## API Base URL

All API endpoints are accessible via:

```
https://rankitpro.com/api/mobile/v1
```

## Authentication Flow

### 1. User Authentication

The Rank It Pro mobile API uses JWT-based authentication with refresh tokens. This approach ensures that:

- Users can remain logged in securely for extended periods
- Access tokens are short-lived to minimize security risks
- Refresh tokens provide a seamless experience without frequent logins

#### Implementation Steps:

1. **Login**

```swift
// Swift example
func login(email: String, password: String, deviceId: String) {
    let url = URL(string: "https://rankitpro.com/api/mobile/v1/auth/login")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body: [String: Any] = [
        "email": email,
        "password": password,
        "deviceId": deviceId,
        "deviceType": "ios" // or "android"
    ]
    
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        // Handle response, store tokens securely
    }.resume()
}
```

```kotlin
// Kotlin example
fun login(email: String, password: String, deviceId: String) {
    val url = "https://rankitpro.com/api/mobile/v1/auth/login"
    val json = JSONObject().apply {
        put("email", email)
        put("password", password)
        put("deviceId", deviceId)
        put("deviceType", "android") // or "ios"
    }
    
    val request = Request.Builder()
        .url(url)
        .post(json.toString().toRequestBody("application/json".toMediaType()))
        .build()
        
    okHttpClient.newCall(request).enqueue(object : Callback {
        // Handle response, store tokens securely
    })
}
```

2. **Token Storage**

Store tokens securely using platform-specific secure storage:

- iOS: Keychain Services
- Android: EncryptedSharedPreferences or Keystore

```swift
// Swift example using Keychain
func storeTokens(accessToken: String, refreshToken: String) {
    let accessTokenData = accessToken.data(using: .utf8)!
    let refreshTokenData = refreshToken.data(using: .utf8)!
    
    // Store access token
    let accessTokenQuery: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: "accessToken",
        kSecValueData as String: accessTokenData
    ]
    
    // Store refresh token
    let refreshTokenQuery: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: "refreshToken",
        kSecValueData as String: refreshTokenData
    ]
    
    // Implementation for storing in Keychain
}
```

```kotlin
// Kotlin example using EncryptedSharedPreferences
fun storeTokens(accessToken: String, refreshToken: String) {
    val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
        
    val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "secure_tokens",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    with(sharedPreferences.edit()) {
        putString("accessToken", accessToken)
        putString("refreshToken", refreshToken)
        apply()
    }
}
```

3. **Token Refresh Logic**

Implement automatic token refresh when API calls return 401 status:

```swift
// Swift example
func refreshToken(completion: @escaping (Bool) -> Void) {
    guard let refreshToken = getRefreshToken() else {
        completion(false)
        return
    }
    
    let url = URL(string: "https://rankitpro.com/api/mobile/v1/auth/refresh")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = ["refreshToken": refreshToken]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        // Handle response, update stored access token
        // Return success/failure via completion handler
    }.resume()
}
```

4. **API Request Wrapper**

Create a wrapper for all API requests that handles authentication and token refresh:

```swift
// Swift example
class APIClient {
    func request<T: Decodable>(endpoint: String, method: String = "GET", body: [String: Any]? = nil, completion: @escaping (Result<T, Error>) -> Void) {
        guard let accessToken = getAccessToken() else {
            // Handle not authenticated
            return
        }
        
        let url = URL(string: "https://rankitpro.com/api/mobile/v1\(endpoint)")!
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.addValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        if let body = body {
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        }
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let self = self else { return }
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 401 {
                // Token expired, attempt refresh
                self.refreshToken { success in
                    if success {
                        // Retry original request with new token
                        self.request(endpoint: endpoint, method: method, body: body, completion: completion)
                    } else {
                        // Handle authentication failure
                    }
                }
                return
            }
            
            // Handle regular response and parsing
        }.resume()
    }
}
```

## Core Features Implementation

### 1. Offline Support

Rank It Pro's API is designed to support offline operations. Implement these key components:

#### Local Database

Use a local database to store pending operations:
- iOS: Core Data or Realm
- Android: Room Database

```kotlin
// Android Room Database example
@Entity(tableName = "pending_check_ins")
data class PendingCheckIn(
    @PrimaryKey val offlineId: String,
    val data: String, // JSON serialized data
    val createdAt: Long,
    val attemptCount: Int = 0
)

@Dao
interface PendingCheckInDao {
    @Insert
    fun insert(checkIn: PendingCheckIn)
    
    @Query("SELECT * FROM pending_check_ins ORDER BY createdAt ASC")
    fun getAll(): List<PendingCheckIn>
    
    @Delete
    fun delete(checkIn: PendingCheckIn)
}
```

#### Synchronization Manager

Create a service that handles syncing when connectivity is restored:

```swift
// Swift example
class SyncManager {
    func syncPendingCheckIns() {
        // Detect network availability
        guard isOnline() else { return }
        
        // Get pending check-ins from local database
        let pendingCheckIns = getPendingCheckIns()
        
        if pendingCheckIns.isEmpty { return }
        
        // Prepare for bulk sync
        let apiClient = APIClient()
        apiClient.request(
            endpoint: "/check-ins/sync",
            method: "POST",
            body: ["checkIns": pendingCheckIns]
        ) { (result: Result<SyncResponse, Error>) in
            // Process successful syncs and remove from local DB
            // Handle failures and potentially retry later
        }
    }
}
```

#### Connection Monitoring

Monitor network status to trigger synchronization when connection is restored:

```kotlin
// Android example
class NetworkMonitor(private val context: Context) {
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    
    fun startMonitoring(syncCallback: () -> Unit) {
        val networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                // Network is available, trigger sync
                syncCallback()
            }
        }
        
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
            
        connectivityManager.registerNetworkCallback(request, networkCallback)
    }
}
```

### 2. Check-In Workflow

The core functionality of the mobile app revolves around creating check-ins. Implement this workflow:

#### Location Services

Initialize and request permission for location services:

```swift
// Swift example
func setupLocationServices() {
    locationManager.delegate = self
    locationManager.desiredAccuracy = kCLLocationAccuracyBest
    
    switch locationManager.authorizationStatus {
    case .notDetermined:
        locationManager.requestWhenInUseAuthorization()
    case .authorizedWhenInUse, .authorizedAlways:
        locationManager.startUpdatingLocation()
    default:
        // Handle denied or restricted access
        break
    }
}
```

```kotlin
// Android example
private fun requestLocationPermission() {
    ActivityCompat.requestPermissions(
        this,
        arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ),
        LOCATION_PERMISSION_REQUEST_CODE
    )
}
```

#### Photo Capture and Gallery Integration

Implement photo capture and select from gallery:

```swift
// Swift example using UIImagePickerController
func showImageOptions() {
    let alertController = UIAlertController(title: "Add Photo", message: nil, preferredStyle: .actionSheet)
    
    if UIImagePickerController.isSourceTypeAvailable(.camera) {
        alertController.addAction(UIAlertAction(title: "Take Photo", style: .default) { _ in
            self.presentImagePicker(sourceType: .camera)
        })
    }
    
    alertController.addAction(UIAlertAction(title: "Choose from Library", style: .default) { _ in
        self.presentImagePicker(sourceType: .photoLibrary)
    })
    
    alertController.addAction(UIAlertAction(title: "Cancel", style: .cancel))
    
    present(alertController, animated: true)
}

func presentImagePicker(sourceType: UIImagePickerController.SourceType) {
    let imagePicker = UIImagePickerController()
    imagePicker.delegate = self
    imagePicker.sourceType = sourceType
    present(imagePicker, animated: true)
}
```

```kotlin
// Android example using modern camera and gallery APIs
private fun captureImage() {
    val options = ImageCaptureOptions.Builder()
        .setTargetAspectRatio(AspectRatio.RATIO_4_3)
        .build()
    
    imageCapture.takePicture(
        options,
        ContextCompat.getMainExecutor(this),
        object : ImageCapture.OnImageCapturedCallback() {
            override fun onCaptureSuccess(image: ImageProxy) {
                // Process the captured image
            }
            
            override fun onError(exception: ImageCaptureException) {
                // Handle error
            }
        }
    )
}

private fun selectImagesFromGallery() {
    val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
    selectImagesLauncher.launch(intent)
}
```

#### Form Validation

Implement client-side validation:

```swift
// Swift example
func validateCheckInForm() -> Bool {
    guard !jobTypeField.text!.isEmpty else {
        showError(message: "Job type is required")
        return false
    }
    
    if let email = customerEmailField.text, !email.isEmpty {
        guard isValidEmail(email) else {
            showError(message: "Please enter a valid email address")
            return false
        }
    }
    
    // Additional validation rules
    
    return true
}
```

#### Check-In Submission

Handle the submission process:

```kotlin
// Kotlin example
fun submitCheckIn(checkIn: CheckIn) {
    // First save to local database with offline ID
    val offlineId = UUID.randomUUID().toString()
    val pendingCheckIn = PendingCheckIn(
        offlineId = offlineId,
        data = gson.toJson(checkIn),
        createdAt = System.currentTimeMillis()
    )
    database.pendingCheckInDao().insert(pendingCheckIn)
    
    // If online, attempt immediate submission
    if (isOnline()) {
        apiClient.request(
            endpoint = "/check-ins",
            method = "POST",
            body = checkIn.copy(offlineId = offlineId)
        ) { result ->
            if (result.isSuccess) {
                // Remove from pending database
                database.pendingCheckInDao().delete(pendingCheckIn)
                
                // Handle photo uploads separately
                if (checkIn.photos.isNotEmpty()) {
                    uploadPhotos(result.getOrNull()?.id, checkIn.photos)
                }
            }
        }
    } else {
        // Show offline saved confirmation
        showMessage("Check-in saved offline and will sync when connection is available")
    }
}
```

### 3. Photo Upload Management

Implement efficient photo handling:

#### Image Compression

Compress images before upload to save bandwidth and storage:

```swift
// Swift example
func compressImage(_ image: UIImage, quality: CGFloat) -> Data? {
    return image.jpegData(compressionQuality: quality)
}
```

```kotlin
// Kotlin example
fun compressImage(bitmap: Bitmap, quality: Int): ByteArray {
    val outputStream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)
    return outputStream.toByteArray()
}
```

#### Chunked Upload for Multiple Photos

Upload photos in chunks or as a multipart form:

```swift
// Swift example
func uploadPhotos(checkInId: Int, photos: [Data]) {
    let url = URL(string: "https://rankitpro.com/api/mobile/v1/check-ins/\(checkInId)/photos")!
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    
    guard let accessToken = getAccessToken() else { return }
    request.addValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
    
    let boundary = "Boundary-\(UUID().uuidString)"
    request.addValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    
    var data = Data()
    
    // Add each photo to the multipart form data
    for (index, photo) in photos.enumerated() {
        data.append("--\(boundary)\r\n".data(using: .utf8)!)
        data.append("Content-Disposition: form-data; name=\"photos[\(index)]\"; filename=\"photo\(index).jpg\"\r\n".data(using: .utf8)!)
        data.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        data.append(photo)
        data.append("\r\n".data(using: .utf8)!)
    }
    
    data.append("--\(boundary)--\r\n".data(using: .utf8)!)
    
    request.httpBody = data
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        // Handle response
    }.resume()
}
```

### 4. Push Notifications Setup

#### iOS Push Notifications

```swift
// Swift example
func registerForPushNotifications() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
        guard granted else { return }
        
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    
    // Register token with Rank It Pro API
    apiClient.request(
        endpoint: "/notifications/register-device",
        method: "POST",
        body: [
            "token": tokenString,
            "platform": "ios"
        ]
    ) { result in
        // Handle result
    }
}
```

#### Android Push Notifications

```kotlin
// Kotlin example using Firebase Cloud Messaging
override fun onNewToken(token: String) {
    super.onNewToken(token)
    
    // Register FCM token with Rank It Pro API
    apiClient.request(
        endpoint = "/notifications/register-device",
        method = "POST",
        body = mapOf(
            "token" to token,
            "platform" to "android"
        )
    ) { result ->
        // Handle result
    }
}
```

### 5. User Interface Considerations

#### Responsive Design

Ensure your app works well on various device sizes:

- Use constraint-based layouts (iOS Auto Layout, Android ConstraintLayout)
- Support both portrait and landscape orientations
- Account for notches, dynamic islands, and other device-specific features

#### Accessibility

Implement accessibility features:

- Support dynamic font sizing
- Include proper content descriptions for screen readers
- Ensure sufficient color contrast
- Test with VoiceOver (iOS) and TalkBack (Android)

#### Branded Experience

Incorporate Rank It Pro branding:

- Use the standard color scheme (#0088d2 blue, #00b05c green, #2e3538 dark gray)
- Follow Material Design (Android) or Human Interface Guidelines (iOS)
- Maintain a consistent look and feel with the web application

### 6. Advanced Features

#### Digital Signature Capture

Add functionality for capturing customer signatures:

```swift
// Swift example using PencilKit
func setupSignatureView() {
    let canvas = PKCanvasView(frame: signatureContainerView.bounds)
    canvas.tool = PKInkingTool(.pen, color: .black, width: 3)
    canvas.backgroundColor = .white
    canvas.delegate = self
    
    signatureContainerView.addSubview(canvas)
    self.canvas = canvas
}

func saveSignature() {
    guard let canvas = canvas else { return }
    
    let image = canvas.drawing.image(from: canvas.bounds, scale: UIScreen.main.scale)
    let data = image.jpegData(compressionQuality: 0.8)
    
    // Send signature to API
}
```

#### QR Code/Barcode Scanning

Implement scanning functionality for equipment or inventory tracking:

```kotlin
// Kotlin example using ML Kit
private fun startBarcodeScanner() {
    val options = BarcodeScannerOptions.Builder()
        .setBarcodeFormats(Barcode.FORMAT_QR_CODE, Barcode.FORMAT_CODE_128)
        .build()
        
    val scanner = BarcodeScanning.getClient(options)
    
    cameraProvider.bindToLifecycle(
        this,
        cameraSelector,
        imageAnalysis.apply {
            setAnalyzer(cameraExecutor) { imageProxy ->
                val mediaImage = imageProxy.image
                if (mediaImage != null) {
                    val image = InputImage.fromMediaImage(
                        mediaImage,
                        imageProxy.imageInfo.rotationDegrees
                    )
                    
                    scanner.process(image)
                        .addOnSuccessListener { barcodes ->
                            // Process detected barcodes
                        }
                        .addOnFailureListener { exception ->
                            // Handle failure
                        }
                        .addOnCompleteListener {
                            imageProxy.close()
                        }
                }
            }
        },
        preview
    )
}
```

## Deployment Tips

### 1. Testing Strategy

Implement a comprehensive testing strategy:

- Unit tests for business logic
- UI tests for critical user flows
- Mock API responses for testing offline behavior
- Test on a variety of devices and OS versions

### 2. Analytics Integration

Consider adding analytics to track user behavior and app performance:

- Screen views and user flows
- Feature usage (which features are most/least used)
- Error rates and types
- Sync success/failure rates

### 3. Gradual Rollout

Plan for a phased rollout:

- Internal testing
- Beta testing with select users
- Limited production release
- Full release

### 4. App Store Considerations

Prepare for app store submissions:

- iOS: App Store Review Guidelines compliance
- Android: Google Play Store policies compliance
- Privacy policy and terms of service
- App store listing assets (screenshots, descriptions, etc.)

## API Reference

For complete API documentation, refer to our [Mobile API Documentation](mobile-api.md).

## Support

For implementation assistance, contact our developer support team at dev-support@rankitpro.com.

---

Document Version: 1.0  
Last Updated: May 19, 2025