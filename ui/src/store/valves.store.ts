import { IValve, IValvesPending } from '@/interfaces';
import { create } from 'zustand';
import axios from 'axios';


interface ValvesStore {
  valves: IValve[];
  fetchValves: () => Promise<void>;
  updateValveStatus: (id: string, status: boolean) => void;
  setValves: (valves: IValve[]) => void;
}

export const useValveStore = create<ValvesStore>((set, get) => ({
  valves: [],

  fetchValves: async () => {
    let valvesPending = JSON.parse(sessionStorage.getItem('valvesPending') || '[]');
    try {
      const response = await axios.get(`http://${window.location.hostname}:5000/devices`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      const parsedData: IValve[] = response.data.devices?.map((valve: any) => ({
        name: valve.name ?? valve.devEui,
        status: valve.valveStatus === 'open',
        location: valve.location ?? 'Ubicación desconocida',
        devEui: valve.devEui,
        applicationId: valve.applicationId,
        lastUpdate: valve.lastUpdate,
        batteryLevel: valve.batteryLevel,
        totalConsumption: parseFloat(valve.totalConsumption),
        isLoading: valvesPending.some((v: IValvesPending) => v.devEui === valve.devEui),
        startedAt: valvesPending.find((v: IValvesPending) => v.devEui === valve.devEui)?.startedAt ?? null,
      }));

      set({ valves: parsedData});

    } catch (error) {
      console.error('Error fetching valves:', error);
    }
  },

  updateValveStatus: (id, status) => {
    set((state) => ({
      valves: state.valves.map((valve) =>
        valve.devEui === id ? { ...valve, status, isLoading: false, startedAt: null } : valve
      ),
    }));
    get();
  },


  setValves: (valves) => set({ valves }),
}));