// Weight conversion utility functions

export const convertWeight = (weightInKg: number, toUnit: 'kg' | 'lb'): number => {
  if (toUnit === 'lb') {
    return weightInKg * 2.20462; // Convert kg to pounds
  }
  return weightInKg; // Already in kg
};

export const formatWeight = (weightInKg: number, unit: 'kg' | 'lb'): string => {
  const convertedWeight = convertWeight(weightInKg, unit);
  return `${convertedWeight.toFixed(1)} ${unit}`;
};

export const convertWeightToKg = (weight: number, fromUnit: 'kg' | 'lb'): number => {
  if (fromUnit === 'lb') {
    return weight / 2.20462; // Convert pounds to kg
  }
  return weight; // Already in kg
};