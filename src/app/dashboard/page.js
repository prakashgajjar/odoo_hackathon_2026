"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Radar,
  Truck,
  Wrench,
  BarChart3,
  Package,
  Search,
  Car,
  Plane,
  Filter,
} from "lucide-react";

export default function DashboardPage() {
  const [kpis, setKpis] = useState({
    activeFleet: 0,
    maintenanceAlerts: 0,
    utilizationRate: 0,
    pendingCargo: 0,
  });
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    region: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch vehicles
        const vehicleQuery = new URLSearchParams();
        if (filters.type) vehicleQuery.append("type", filters.type);
        if (filters.status) vehicleQuery.append("status", filters.status);
        if (filters.region) vehicleQuery.append("region", filters.region);

        const vehiclesRes = await fetch(`/api/vehicles?${vehicleQuery}`);
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData.vehicles || []);

        // Fetch trips
        const tripsRes = await fetch("/api/trips");
        const tripsData = await tripsRes.json();
        setTrips(tripsData.trips || []);

        // Calculate KPIs
        const activeFleet =
          vehiclesData.vehicles?.filter((v) => v.status === "on_trip").length ||
          0;

        const maintenanceAlerts =
          vehiclesData.vehicles?.filter((v) => v.status === "in_shop").length ||
          0;

        const totalVehicles = vehiclesData.vehicles?.length || 1;
        const utilizationRate = Math.round(
          ((activeFleet + maintenanceAlerts) / totalVehicles) * 100,
        );

        const pendingCargo =
          tripsData.trips?.filter((t) => t.status === "draft").length || 0;

        setKpis({
          activeFleet,
          maintenanceAlerts,
          utilizationRate,
          pendingCargo,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const vehicleColumns = [
    { key: "name", label: "Vehicle Name" },
    { key: "licensePlate", label: "License Plate" },
    { key: "type", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (status) => <StatusBadge status={status} />,
    },
    { key: "maxCapacity", label: "Max Capacity (kg)" },
  ];

  const tripColumns = [
    { key: "tripNumber", label: "Trip #" },
    {
      key: "vehicleId",
      label: "Vehicle",
      render: (_, row) => row.vehicleId?.name || "N/A",
    },
    {
      key: "driverId",
      label: "Driver",
      render: (_, row) => row.driverId?.name || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (status) => <StatusBadge status={status} />,
    },
    { key: "cargoWeight", label: "Cargo (kg)" },
  ];

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative w-16 h-16 mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-zinc-200" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-zinc-900 border-r-zinc-900" />
            </motion.div>
            <p className="text-zinc-600 font-semibold">Loading dashboard...</p>
          </motion.div>
        </div>
      </ProtectedLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <ProtectedLayout
      requiredRoles={["manager", "dispatcher", "safety_officer", "driver"]}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* Icon Badge */}
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
              <Radar className="w-7 h-7" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              Command Center
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-zinc-500 text-lg md:text-xl ml-14">
            Fleet Overview & Real-time Analytics
          </p>
        </motion.div>

        {/* KPIs Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <KPICard
            title="Active Fleet"
            value={kpis.activeFleet}
            icon={<Truck className="w-8 h-8 text-blue-600" />}
            trend={5}
          />
          <KPICard
            title="Maintenance Alerts"
            value={kpis.maintenanceAlerts}
            icon={<Wrench className="w-8 h-8 text-amber-500" />}
            trend={-2}
          />
          <KPICard
            title="Utilization Rate"
            value={`${kpis.utilizationRate}%`}
            icon={<BarChart3 className="w-8 h-8 text-green-600" />}
            trend={3}
          />
          <KPICard
            title="Pending Cargo"
            value={kpis.pendingCargo}
            icon={<Package className="w-8 h-8 text-purple-600" />}
            trend={8}
          />
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-500" /> Advanced Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Vehicle Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="on_trip">On Trip</option>
                <option value="in_shop">In Shop</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div>
              <label className="label">Region</label>
              <input
                type="text"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                placeholder="e.g., North, South"
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Vehicles Table */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-500" /> Fleet Vehicles
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              {vehicles.length}
            </span>
          </h2>
          <DataTable columns={vehicleColumns} data={vehicles} />
        </motion.div>

        {/* Recent Trips */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Plane className="w-5 h-5 text-green-500" /> Recent Trips
          </h2>
          <DataTable columns={tripColumns} data={trips.slice(0, 10)} />
        </motion.div>
      </motion.div>
    </ProtectedLayout>
  );
}
