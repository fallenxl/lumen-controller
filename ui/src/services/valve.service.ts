// services/valveService.ts
import axios from "axios";

export interface ValveData {
  name: string;
  valveStatus: string;
  location?: string;
  devEui: string;
  applicationId: string;
  lastUpdate?: string;
  batteryLevel?: number;
  totalConsumption: number;
}

export const getValves = async (hostname: string): Promise<ValveData[]> => {
  const response = await axios.get(`http://${hostname}:5000/devices`);
  return response.data.devices;
};
