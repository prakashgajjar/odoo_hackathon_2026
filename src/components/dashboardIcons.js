// Professional icon set for dashboard KPIs
import { TruckIcon, WrenchIcon, ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline';

export const dashboardIcons = {
  activeFleet: <TruckIcon className="w-10 h-10 text-blue-600" />,
  maintenanceAlerts: <WrenchIcon className="w-10 h-10 text-amber-500" />,
  utilizationRate: <ChartBarIcon className="w-10 h-10 text-green-600" />,
  pendingCargo: <CubeIcon className="w-10 h-10 text-purple-600" />,
};
