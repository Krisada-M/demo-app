import { DailyMetrics, HourlyMetrics, MetricSources } from '../models';
import { getStrideLengthMeters, getWeightKg } from '../userProfile';

type FallbackStats = {
  missingDistance: boolean;
  missingCalories: boolean;
  distanceEstimated: number;
  caloriesEstimated: number;
  caloriesClamped: number;
};

const CALORIES_PER_KM_PER_KG = 0.53;
const MAX_KCAL_PER_HOUR = 800;

const cloneSources = (sources: MetricSources): MetricSources => ({
  steps: sources.steps,
  activeCalories: sources.activeCalories,
  distance: sources.distance,
});

const estimateDistanceMeters = (steps: number, strideLengthMeters: number) =>
  Math.max(0, steps) * strideLengthMeters;

const estimateCalories = (distanceMeters: number, weightKg: number) =>
  (Math.max(0, distanceMeters) / 1000) * weightKg * CALORIES_PER_KM_PER_KG;

const clampCalories = (
  value: number,
  hours: number,
): { value: number; clamped: boolean } => {
  const max = MAX_KCAL_PER_HOUR * hours;
  if (value > max) return { value: max, clamped: true };
  return { value, clamped: false };
};

export const applyDailyFallbacks = (daily: DailyMetrics[]) => {
  const hasDistance = daily.some(day => day.distanceMeters > 0);
  const hasCalories = daily.some(day => day.activeCaloriesKcal > 0);
  const hasSteps = daily.some(day => day.steps > 0);
  const stride = getStrideLengthMeters();
  const weight = getWeightKg();

  const stats: FallbackStats = {
    missingDistance: !hasDistance,
    missingCalories: !hasCalories,
    distanceEstimated: 0,
    caloriesEstimated: 0,
    caloriesClamped: 0,
  };

  const data = daily.map(day => {
    const sources = cloneSources(day.sources);
    let distanceMeters = day.distanceMeters;
    let activeCaloriesKcal = day.activeCaloriesKcal;

    if (!hasDistance && hasSteps && day.steps > 0) {
      distanceMeters = estimateDistanceMeters(day.steps, stride);
      sources.distance = 'estimated';
      stats.distanceEstimated += 1;
    }

    if (!hasCalories) {
      const distanceForCalories = distanceMeters > 0 ? distanceMeters : 0;
      if (distanceForCalories > 0 || (day.steps > 0 && !hasDistance)) {
        const baseDistance =
          distanceForCalories > 0
            ? distanceForCalories
            : estimateDistanceMeters(day.steps, stride);
        const estimated = estimateCalories(baseDistance, weight);
        const capped = clampCalories(estimated, 24);
        activeCaloriesKcal = capped.value;
        sources.activeCalories = 'estimated';
        stats.caloriesEstimated += 1;
        if (capped.clamped) stats.caloriesClamped += 1;
      }
    }

    return {
      ...day,
      distanceMeters,
      activeCaloriesKcal,
      sources,
    };
  });

  return { data, stats };
};

export const applyHourlyFallbacks = (hourly: HourlyMetrics[]) => {
  const hasDistance = hourly.some(hour => hour.distanceMeters > 0);
  const hasCalories = hourly.some(hour => hour.activeCaloriesKcal > 0);
  const hasSteps = hourly.some(hour => hour.steps > 0);
  const stride = getStrideLengthMeters();
  const weight = getWeightKg();

  const stats: FallbackStats = {
    missingDistance: !hasDistance,
    missingCalories: !hasCalories,
    distanceEstimated: 0,
    caloriesEstimated: 0,
    caloriesClamped: 0,
  };

  const data = hourly.map(hour => {
    const sources = cloneSources(hour.sources);
    let distanceMeters = hour.distanceMeters;
    let activeCaloriesKcal = hour.activeCaloriesKcal;

    if (!hasDistance && hasSteps && hour.steps > 0) {
      distanceMeters = estimateDistanceMeters(hour.steps, stride);
      sources.distance = 'estimated';
      stats.distanceEstimated += 1;
    }

    if (!hasCalories) {
      const distanceForCalories = distanceMeters > 0 ? distanceMeters : 0;
      if (distanceForCalories > 0 || (hour.steps > 0 && !hasDistance)) {
        const baseDistance =
          distanceForCalories > 0
            ? distanceForCalories
            : estimateDistanceMeters(hour.steps, stride);
        const estimated = estimateCalories(baseDistance, weight);
        const capped = clampCalories(estimated, 1);
        activeCaloriesKcal = capped.value;
        sources.activeCalories = 'estimated';
        stats.caloriesEstimated += 1;
        if (capped.clamped) stats.caloriesClamped += 1;
      }
    }

    return {
      ...hour,
      distanceMeters,
      activeCaloriesKcal,
      sources,
    };
  });

  return { data, stats };
};
