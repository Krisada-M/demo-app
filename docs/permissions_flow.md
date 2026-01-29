# Permissions & Authorization Flow

This diagram illustrates how the application handles Android system permissions for activity recognition and notifications.

```mermaid
sequenceDiagram
    participant User
    participant UI as HomeScreen
    participant HL as HealthLayer
    participant NM as NativeModule (HealthTracking)
    participant OS as Android System

    User->>UI: App Startup / Pull-to-Refresh
    UI->>HL: ensurePermissions()
    HL->>NM: checkPermissions()
    
    alt Permissions Granted
        NM-->>HL: Status: OK
        HL-->>UI: Proceed to Data Fetch
    else Permissions Missing
        HL->>NM: requestPermissions()
        NM->>OS: Request ACTIVITY_RECOGNITION
        alt Android 13+
            NM->>OS: Request POST_NOTIFICATIONS
        end
        OS-->>User: Permission Dialog
        User->>OS: Allow / Deny
        OS-->>NM: Results
        NM-->>HL: Status (OK / NOT_AUTHORIZED)
        HL-->>UI: Update UI State
    end
```

## Required Permissions

1.  **ACTIVITY_RECOGNITION**: Required for the background tracking module to receive step and movement updates from device sensors.
2.  **POST_NOTIFICATIONS** (Android 13+): Required if the app needs to show sync status or alerts to the user.
3.  **Health Connect Permissions**: (Handled by the Health Connect SDK) Required for reading/writing data to the system-wide health store.
