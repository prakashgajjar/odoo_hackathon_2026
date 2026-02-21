import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function AnalyticsGraphs({ vehicles, expenses, trips, maintenanceLogs }) {
  // Bar chart: Revenue per vehicle
  const barData = {
    labels: vehicles.map(v => v.name),
    datasets: [
      {
        label: 'Revenue',
        data: vehicles.map(v =>
          trips.filter(t => t.vehicleId === v._id).reduce((sum, t) => sum + (t.revenue || 0), 0)
        ),
        backgroundColor: 'rgba(56, 189, 248, 0.7)',
      },
    ],
  };

  // Pie chart: Expense breakdown
  const totalFuel = expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
  const totalMaint = maintenanceLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
  const pieData = {
    labels: ['Fuel', 'Maintenance'],
    datasets: [
      {
        data: [totalFuel, totalMaint],
        backgroundColor: ['#f59e42', '#ef4444'],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="card p-6">
        <h3 className="font-bold text-zinc-900 mb-4">Revenue by Vehicle</h3>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div className="card p-6">
        <h3 className="font-bold text-zinc-900 mb-4">Expense Breakdown</h3>
        <Pie data={pieData} options={{ responsive: true }} />
      </div>
    </div>
  );
}
