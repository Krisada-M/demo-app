# Background Synchronization Flow

This diagram explains the background periodic sync mechanism using `react-native-background-fetch`.

```mermaid
sequenceDiagram
    participant OS as OS (Android/iOS)
    participant BF as BackgroundFetch
    participant HS as HealthSync
    participant HL as HealthLayer
    participant API as Health Sync API

    Note over OS, API: 1. Configuration
    HS->>BF: configure(interval: 60m)
    BF->>OS: Register Background Task

    Note over OS, API: 2. Execution (Periodic)
    OS->>BF: Wake up (per interval/conditions)
    BF->>HS: onFetch(taskId)
    HS->>HL: getDailyLast7Days()
    HL-->>HS: DailyMetrics[]
    HS->>HL: getTodayHourly()
    HL-->>HS: HourlyMetrics[]
    
    HS->>API: POST /sync/payload (Daily + Hourly)
    API-->>HS: 200 OK
    
    HS->>BF: finish(taskId)
    BF->>OS: Enter Sleep Mode
```

## Key Configuration

- **Interval**: Configured for 60 minutes (minimum allowed by most systems).
- **Persistence**: `stopOnTerminate: false` and `startOnBoot: true` ensure the sync survives app closures and device restarts.
- **Payload**: Includes unified daily and hourly data points for the last 7 days to ensure consistency between app and server records.
