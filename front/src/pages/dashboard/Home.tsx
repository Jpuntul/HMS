import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import {
  BuildingOffice2Icon,
  ChartBarIcon,
  UserIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  overview: {
    total_persons: number;
    total_employees: number;
    total_facilities: number;
    total_capacity: number;
  };
}

/** One tabular-mono figure in the system-counts ledger line - same pattern
 * as Dashboard.tsx's Metric, reproduced locally since that one isn't
 * exported (each page owns its own small presentational pieces here). */
const Metric: React.FC<{ value: string | number; label: string }> = ({
  value,
  label,
}) => (
  <div className="min-w-[120px] flex-1 border-r border-paper-line px-5 py-3.5 last:border-r-0">
    <div className="font-mono text-xl font-bold tabular-nums text-ink sm:text-2xl">
      {value}
    </div>
    <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
      {label}
    </div>
  </div>
);

interface NavCardProps {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
  cta: string;
}

/** Icon sits beside the heading in a plain row, not stacked above it in an
 * icon-tile - the icon-tile-above-heading arrangement is a banned generic
 * pattern for this system (see craft-floor.md). */
const NavCard: React.FC<NavCardProps> = ({
  to,
  icon: Icon,
  title,
  description,
  cta,
}) => (
  <Link
    to={to}
    className="group badge-card flex flex-col justify-between p-5 transition-colors hover:bg-paper"
  >
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-5 w-5 flex-none text-ink-soft" aria-hidden="true" />
        <h3 className="text-base font-bold text-ink">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-ink-soft">{description}</p>
    </div>
    <div className="flex items-center text-sm font-semibold text-ink">
      {cta}
      <ArrowRightIcon
        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
    </div>
  </Link>
);

const Home: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.analytics.dashboard);
      setStats(response.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Healthcare Management System
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">
            Comprehensive healthcare management with real patient data, employee
            records, and facility information.
          </p>
        </div>

        {/* System counts ledger line */}
        {!loading && stats && (
          <div className="mb-10 flex flex-wrap items-stretch border-y-[1.5px] border-ink">
            <Metric
              value={stats.overview.total_persons.toLocaleString()}
              label="PATIENTS"
            />
            <Metric
              value={stats.overview.total_employees.toLocaleString()}
              label="STAFF"
            />
            <Metric
              value={stats.overview.total_facilities.toString()}
              label="FACILITIES"
            />
            <Metric
              value={stats.overview.total_capacity.toLocaleString()}
              label="BED CAPACITY"
            />
          </div>
        )}

        {/* Main Navigation */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <NavCard
            to="/dashboard"
            icon={ChartBarIcon}
            title="Analytics Dashboard"
            description="View comprehensive system analytics and insights"
            cta="View Dashboard"
          />
          <NavCard
            to="/persons"
            icon={UserIcon}
            title="Patient Records"
            description="Manage patient records and personal information"
            cta="View Patients"
          />
          <NavCard
            to="/employees"
            icon={UserGroupIcon}
            title="Staff Management"
            description="Track healthcare staff and their roles"
            cta="View Employees"
          />
          <NavCard
            to="/facilities"
            icon={BuildingOffice2Icon}
            title="Facility Network"
            description="Oversee hospitals, clinics, and healthcare centers"
            cta="View Facilities"
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink/90"
          >
            <ChartBarIcon className="h-4 w-4" aria-hidden="true" />
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
