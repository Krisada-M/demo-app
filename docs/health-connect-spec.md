# RN (No-Expo) Self-Measurement -> Health Connect (Steps / Distance / ActiveCaloriesBurned)

Timezone: Asia/Bangkok (store timestamps in UTC; convert for UI)

## 1) What this is

This document contains:

1. A Codex prompt you can paste to generate an implementation plan + code,
2. The key formulas for Steps / Distance / ActiveCaloriesBurned,
3. References you can cite in PRs/specs,
4. A validation protocol (how to re-check accuracy).

## 2) Formula reference set (with sources)

### 2.1 Steps (Android step sensor)

Best sensor source (when available):

- Android Sensor.TYPE_STEP_COUNTER (cumulative steps since device boot; compute deltas/buckets yourself).

Permission note:

- Activity recognition permission is required before accessing the step counter sensor.

Bucket logic (hourly)

- steps_hour = max(0, stepCounter_end - stepCounter_start)
- Handle reboot/reset by detecting counter going backwards and resetting baseline.

### 2.2 Distance (two practical options)

Option A) GPS distance (outdoor accuracy; battery cost)

- Haversine formula:
  d = R _ c
  a = sin^2(dPhi/2) + cos(phi1) _ cos(phi2) _ sin^2(dLambda/2)
  c = 2 _ atan2(sqrt(a), sqrt(1-a))
  R ~= 6,371,000 m

Recommended sanity filters (quality gates)

- Drop points with poor accuracy (e.g., > 20-30m)
- Drop spikes with unrealistic speed (e.g., > 8 m/s for walking/running use cases)

Option B) Step-based distance (battery-friendly; estimate)

- distance_m = steps \* stepLength_m

Step length calibration (recommended)
Measure a known distance (e.g., 20-50 ft or 10-20 m), count steps, then:

- stepLength = knownDistance / steps

Height-based fallback (rough estimate only)

- strideLength ~= height_in \* 0.41-0.415
- stepLength ~= strideLength / 2

Recommendation: Prefer calibration. Use height-based only as a last-resort default.

### 2.3 ActiveCaloriesBurned (MET-based estimate)

Core formula

- kcal_per_min = 0.0175 _ MET _ weight_kg
- kcal = kcal_per_min \* duration_min

MET lookup

- Use the Compendium of Physical Activities MET tables for activity intensity references.

Practical mapping approach (common for phone-only)

1. Determine activity band (walking vs running) from cadence or speed,
2. Map speed band -> MET (from Compendium),
3. Apply MET formula using user weight (ask user; otherwise default + mark as estimate).

## 3) Health Connect writing best practices (must-follow)

### 3.1 Do not write misleading zeros

For steps/distance/calories, write zero only when it truly indicates inactivity while the
device was worn; otherwise omit missing data.

### 3.2 Metadata is required (recording method + device type rules)

Health Connect requires specifying a recording method, and for auto/active recordings
you must include a device type.

### 3.3 RN library write API

Use insertRecords() from react-native-health-connect to write records; it returns UUIDs
store them for future delete/replace strategies.

### 3.4 Integration testing tool

Use Health Connect Toolbox to read/write records directly and validate app integration.

## 4) Validation protocol (accuracy re-check)

### 4.1 Steps

- Ground truth: manual count or video count for a controlled walk
- Metric: MAPE = |pred-true| / true \* 100

### 4.2 Distance

- Ground truth options:
  - Track of known length (e.g., 400m track)
  - Measured route (surveyed distance)
- Report:
  - MAE (meters)
  - MAPE (%)
  - Drift vs time (for GPS)

### 4.3 Calories

- Treat as estimate; validate directionality + reasonableness:
  - If speed/intensity increases, kcal/min should increase
  - Compare against a reference device if available (wearable) but do not claim clinical accuracy

## 5) Codex prompt (paste to generate plan + code)

```
## ROLE
You are Codex acting as a Senior Mobile Engineer (React Native CLI, NO Expo) specializing in Android Health Connect and production-grade sensor/background pipelines.

## GOAL
Implement a production-grade flow to:
1) Measure/estimate Steps, Distance, ActiveCaloriesBurned inside our app (Android).
2) Aggregate into hourly buckets for "today" (Asia/Bangkok), storing timestamps in UTC.
3) Write hourly buckets into Health Connect using react-native-health-connect insertRecords().
4) Ensure battery-conscious behavior, correctness, and idempotent writes.

## HARD CONSTRAINTS
- React Native CLI only (NO Expo).
- Metrics: Steps, Distance (meters), ActiveCaloriesBurned (kilocalories)
- Hourly drill-down required for current day.
- Health Connect stores/shares; it does NOT measure. Our app is the data origin.
- Do not write misleading zero values (write only when true inactivity; otherwise omit).
- Must include required Health Connect metadata (recording method + device type rules).

## FORMULAS (USE THESE)
1) Calories (MET-based):
   kcal_per_min = 0.0175 * MET * weight_kg
   kcal = kcal_per_min * duration_min
2) Distance:
   A) GPS: Haversine formula for lat/lng consecutive points
   B) Step-based: distance_m = steps * stepLength_m
      - stepLength calibration: stepLength = knownDistance / steps
      - height fallback (rough): strideLength ~= height_in * 0.41-0.415; stepLength ~= stride/2
3) Steps:
   Prefer Android Sensor.TYPE_STEP_COUNTER (cumulative since boot) and compute deltas per bucket.
   Handle reboot/reset (counter decreases) by resetting baseline.

## REQUIRED DELIVERABLES
A) Architecture: data flow + components (RN, native modules, storage, aggregator, Health Connect writer).
B) Permissions & capability checks.
C) Data model + idempotency.
D) Implementation plan.
E) Code examples (TS + Kotlin).
F) Testing plan.

## OUTPUT FORMAT
Return sections A-F with clear bullets and code blocks.
Make conservative assumptions and label them explicitly.
Keep the solution minimal, stable, and battery-conscious.
```

## 6) References (quick list)

- Android step sensor + activity recognition permission
- Health Connect write-data best practices (including zeros)
- Health Connect metadata requirements (recording method + device type)
- react-native-health-connect insertRecords()
- MET constant (0.0175) + Compendium MET table
- Haversine formula
- Step length calibration method
- Health Connect Toolbox
