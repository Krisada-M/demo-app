# Comprehensive Project Flow Documentation

This document provides a complete visual overview of the application's architecture, data handling, and user journey.

## 1. Navigation Flow
```mermaid
graph LR
    Home([Home Screen]) --> Hourly([Hourly Screen])
    Home --> Profile([Profile Screen])
    Home --> Debug([Debug Screen])
    Hourly --> Home
    Profile --> Home
    Debug --> Home
    subgraph MainStack [Main Navigation Stack]
        Home
        Hourly
        Profile
        Debug
    end
```

## 2. Component Architecture
```mermaid
graph TD
    subgraph Screens
        HS[HomeScreen]
        HRS[HourlyScreen]
        PS[ProfileScreen]
        DS[DebugScreen]
    end

    subgraph HomeComponents [Home Screen Components]
        HH[HomeHeader]
        MH[MetricHighlights]
        MC[MetricChart]
        SMT[SegmentedMetricTabs]
        SSC[SyncStatusCard]
        QAG[QuickActionsGrid]
    end

    subgraph HourlyComponents [Hourly Screen Components]
        HC[HourlyChart]
        MSC[MetricSummaryCard]
    end

    subgraph SharedComponents [Shared Components]
        NV[NativeVictory]
        WPI[WeeklyProgressIndicator]
    end

    HS --> HH
    HS --> MH
    HS --> MC
    HS --> SMT
    HS --> SSC
    HS --> QAG
    HRS --> HC
    HRS --> MSC
    HRS --> SMT
    MC --> NV
    HC --> NV
```

## 3. Functional Flow (User Journey)
```mermaid
graph TD
    Start([User Opens App]) --> Home{Home Screen}
    subgraph Dashboard [Dashboard & Quick View]
        Home -->|Auto‑Init| AutoSync[Auto‑Flush DB & Fetch Data]
        AutoSync --> Display[Show Daily Summary Cards]
        Display --> Charts[Interactive Weekly Charts]
        Charts -->|Select Metric| SwitchMetric[Switch: Steps / Calories / Distance]
        Home -->|Pull‑to‑Refresh| ForceSync[Force Sync & Reload]
    end
    subgraph DrillDown [Detailed Analysis]
        Home -->|Tap 'Hourly'| HourlyScreen[Hourly Detail Screen]
        HourlyScreen -->|Select Hour| FutureCheck{Is Future?}
        FutureCheck -->|Yes| ShowFuture[Shaded 'Future Zone']
        FutureCheck -->|No| ShowDetail[Show Precise Bar Data]
        HourlyScreen -->|Swipe/Scroll| NavigateHours[Navigate Timeline]
    end
    subgraph SystemTools [Tools & Settings]
        Home -->|Tap 'Debug'| DebugScreen[Debug & Sync Status]
        DebugScreen -->|Tap 'Flush DB'| ManualFlush[Manual Health Connect Write]
        DebugScreen -->|Tap 'Sync'| ManualRead[Manual Health Connect Read]
        Home -->|Tap 'Profile'| ProfileScreen[User Profile]
        ProfileScreen -->|Update Info| SaveProfile[Save Height/Weight/Stride]
        SaveProfile -->|Recalculate| UpdateCalcs[Update Calorie Formula]
    end
    ForceSync --> AutoSync
    ManualFlush --> AutoSync
    UpdateCalcs --> Home
```

## 4. Permissions & Authorization Flow
```mermaid
sequenceDiagram
    participant User
    participant UI as HomeScreen
    participant HL as HealthLayer
    participant NM as NativeModule (HealthTracking)
    participant OS as Android System

    User->>UI: App Startup / Pull‑to‑Refresh
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

## 5. Data Flow (Auto‑Flush)
```mermaid
sequenceDiagram
    participant UI as HomeScreen UI
    participant HL as HealthLayer
    participant NM as NativeModule (HealthTracking)
    participant DB as Local Database (Room)
    participant HC as Health Connect SDK

    Note over UI, HC: 1. Initialization & Auto‑Flush
    UI->>UI: Mount / Pull‑to‑Refresh
    UI->>NM: writeToHealthConnect()
    NM->>DB: Query pending buckets
    DB-->>NM: Return pending records
    NM->>HC: insertRecords(Steps, Calories, Distance)
    NM-->>UI: Success (Count written)

    Note over UI, HC: 2. Data Fetching
    UI->>HL: getDailyLast7Days()
    HL->>NM: getDailyLast7Days() (via Provider)
    NM->>HC: aggregateGroupByDuration("DAYS")
    HC-->>NM: Aggregated Data
    NM-->>HL: NativeDailyMetrics[]
    HL-->>UI: Display Data (Charts Updated)
```

## 6. Background Synchronization Flow
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

## 7. Data Export Flow
```mermaid
sequenceDiagram
    participant User
    participant DS as DebugScreen
    participant HL as HealthLayer
    participant HC as Health Connect
    participant Share as System Share

    User->>DS: Tap "Export Data (JSON)"
    DS->>HL: getDailyLast7Days()
    HL->>HC: aggregateGroupByDuration()
    HC-->>HL: DailyMetrics[]
    HL-->>DS: Data Array
    DS->>DS: JSON.stringify(data)
    DS->>Share: Share.share({ message: json })
    Share-->>User: Share Dialog (Save/Copy/Send)
```

## 8. Health Data Pipeline
```mermaid
flowchart TB
    subgraph Sensors [Device Sensors]
        ACC[Accelerometer]
        STEP[Step Detector]
    end

    subgraph NativeTracking [Native Tracking Layer]
        HT[HealthTracking Module]
        DB[(Room Database)]
    end

    subgraph HealthConnect [Health Connect SDK]
        HC[Health Connect Store]
        AGG[Aggregation API]
    end

    subgraph AppLayer [Application Layer]
        HL[HealthLayer]
        PROV[Provider: androidHealthConnect]
    end

    subgraph UI [User Interface]
        HOME[HomeScreen]
        HOURLY[HourlyScreen]
        CHARTS[Charts]
    end

    ACC --> HT
    STEP --> HT
    HT --> DB
    DB -->|writeToHealthConnect| HC
    HC --> AGG
    AGG --> PROV
    PROV --> HL
    HL --> HOME
    HL --> HOURLY
    HOME --> CHARTS
    HOURLY --> CHARTS
```
