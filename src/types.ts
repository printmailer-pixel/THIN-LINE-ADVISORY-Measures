export type MeasureData = Record<string, number | string>;

export interface AppState {
  demographics: {
    callSign: string;
    email: string;
    age: string;
    gender: string;
    role: string;
    status: string;
    years: string;
    leadership: string;
    military: string;
    combat: string;
    orgType: string;
    setting: string;
  };
  springer: MeasureData;
  cape: MeasureData;
  pcl5: MeasureData;
  gad7: MeasureData;
  phq9: MeasureData;
  cssrs: MeasureData;
}
