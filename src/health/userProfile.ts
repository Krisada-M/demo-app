export type UserSex = 'male' | 'female' | 'unknown';

export type UserProfile = {
  heightCm?: number;
  weightKg?: number;
  sex?: UserSex;
  strideLengthMeters?: number;
};

const DEFAULT_WEIGHT_KG = 60;
const DEFAULT_STRIDE_METERS = 0.75;
const STRIDE_RATIO_MALE = 0.415;
const STRIDE_RATIO_FEMALE = 0.413;

let profile: UserProfile = {};

export const setUserProfile = (next: UserProfile) => {
  profile = { ...profile, ...next };
};

export const getUserProfile = (): UserProfile => ({ ...profile });

export const getWeightKg = (): number => profile.weightKg ?? DEFAULT_WEIGHT_KG;

export const getStrideLengthMeters = (): number => {
  if (profile.strideLengthMeters && profile.strideLengthMeters > 0) {
    return profile.strideLengthMeters;
  }

  if (profile.heightCm && profile.heightCm > 0) {
    const heightMeters = profile.heightCm / 100;
    if (profile.sex === 'male') {
      return heightMeters * STRIDE_RATIO_MALE;
    }
    if (profile.sex === 'female') {
      return heightMeters * STRIDE_RATIO_FEMALE;
    }
    return (heightMeters * (STRIDE_RATIO_MALE + STRIDE_RATIO_FEMALE)) / 2;
  }

  return DEFAULT_STRIDE_METERS;
};
