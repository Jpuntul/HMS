import { useCallback, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/Pagination";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { SkeletonCards } from "../../components/Skeleton";
import ScheduleCard, { type Schedule } from "../../components/ScheduleCard";
import { roleMeta } from "../../utils/roleMeta";
import SearchBar from "../../components/SearchBar";
import FilterDropdown from "../../components/FilterDropdown";
import { API_ENDPOINTS } from "../../config/api";
import { PAGINATION, UI_TIMINGS, GRID_LAYOUTS } from "../../config/constants";
import {
  ClockIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "../../hooks/useDebounce";

const ScheduleList: React.FC = () => {
  const location = useLocation();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const debouncedSearchTerm = useDebounce(
    searchTerm,
    UI_TIMINGS.SEARCH_DEBOUNCE_MS,
  );

  const itemsPerPage = PAGINATION.CARD_GRID_PAGE_SIZE;

  // Tracks the pending "clear success message" timer so a second message
  // (or an unmount) can cancel a still-pending one instead of leaking it.
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuccessMessage = (message: string) => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setSuccessMessage(message);
    successTimerRef.current = setTimeout(
      () => setSuccessMessage(""),
      UI_TIMINGS.SUCCESS_MESSAGE_DURATION_MS,
    );
  };

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const fetchSchedules = async (signal?: AbortSignal) => {
    try {
      const isInitialLoad = schedules.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      }

      let url = API_ENDPOINTS.schedules;
      const params = new URLSearchParams();

      params.append("page", currentPage.toString());
      params.append("page_size", itemsPerPage.toString());

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }
      if (selectedRole) {
        params.append("role", selectedRole);
      }
      if (selectedFacility) {
        params.append("facility", selectedFacility);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { signal });
      // Handle paginated response
      const data = response.data.results || response.data;
      setSchedules(Array.isArray(data) ? data : []);
      setTotalCount(response.data.count || data.length);
      setTotalPages(
        Math.ceil((response.data.count || data.length) / itemsPerPage),
      );
      setLoading(false);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError("Failed to fetch schedules");
      setLoading(false);
    }
  };

  // Success message from navigation state (e.g. after Add/Edit) is a
  // one-off tied to how we arrived here, not to search/filter/page state -
  // it has its own effect so filter changes don't re-trigger it.
  useEffect(() => {
    if (location.state?.message) {
      showSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Single source of truth for fetching: page reset on filter/search change
  // happens synchronously in the change handlers below (not a second effect
  // reacting to the same value) so this effect fires once per settled
  // (search, filters, page) combination instead of twice. The AbortController
  // cancels a still-in-flight request if a newer one starts before it
  // resolves, so a slow earlier response can never overwrite a later one.
  useEffect(() => {
    const controller = new AbortController();
    fetchSchedules(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedRole, selectedFacility, currentPage]);

  // Stable reference so ScheduleCard's React.memo isn't defeated by a new
  // function identity on every ScheduleList render.
  const handleDeleteClick = useCallback((schedule: Schedule) => {
    setScheduleToDelete(schedule);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = () => {
    fetchSchedules();
    showSuccessMessage("Schedule deleted successfully!");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    setCurrentPage(1);
  };

  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value);
    setCurrentPage(1);
  };

  const handleDeleteCancel = () => {
    setScheduleToDelete(null);
    setDeleteModalOpen(false);
  };

  // Get unique roles and facilities for filters. Preserved exactly as
  // before (derived from the currently-loaded page of schedules, not a
  // dedicated filter-options endpoint) - a pre-existing limitation (options
  // only reflect what's on the current page), out of scope for this visual
  // pass to change.
  const uniqueRoles = [
    ...new Set(schedules.map((s) => s.employee_role)),
  ].sort();
  const uniqueFacilities = [
    ...new Set(schedules.map((s) => s.facility_name)),
  ].sort();

  const roleOptions = uniqueRoles.map((role) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  }));
  const facilityOptions = uniqueFacilities.map((facility) => ({
    value: facility,
    label: facility,
  }));

  // Group schedules by date for list view
  const groupedSchedules = schedules.reduce(
    (acc, schedule) => {
      const date = schedule.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(schedule);
      return acc;
    },
    {} as Record<string, Schedule[]>,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-paper py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonCards columns={GRID_LAYOUTS.CARD_GRID} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="rounded border border-stamp-red/30 bg-stamp-red/5 px-6 py-4 text-stamp-red-ink">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded border border-verified-green/30 bg-verified-green/5 p-4">
            <p className="text-sm font-medium text-verified-green-ink">
              {successMessage}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 rounded border-[1.5px] border-ink bg-panel">
          <div className="border-b border-paper-line px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-7 w-7 flex-shrink-0 text-ink" />
                <div>
                  <h1 className="text-2xl font-bold text-ink">Schedules</h1>
                  <p className="mt-1 text-sm text-ink-soft">
                    Manage work schedules and shifts
                  </p>
                </div>
              </div>
              {user && (
                <div className="flex space-x-3">
                  <Link
                    to="/schedules/add"
                    className="flex flex-none items-center gap-2 whitespace-nowrap rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Schedule</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="border-b border-paper-line px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Search by employee name..."
                  label="Search"
                  id="schedule-search"
                />
              </div>
              <FilterDropdown
                label="Role"
                value={selectedRole}
                onChange={handleRoleChange}
                options={roleOptions}
                id="schedule-role-filter"
              />
              <FilterDropdown
                label="Facility"
                value={selectedFacility}
                onChange={handleFacilityChange}
                options={facilityOptions}
                id="schedule-facility-filter"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-ink-soft">
                Total Schedules:{" "}
                <span className="font-medium text-ink">{totalCount}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded border-[1.5px] px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "border-ink bg-ink text-paper"
                      : "border-paper-line text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded border-[1.5px] px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "border-ink bg-ink text-paper"
                      : "border-paper-line text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  List by Date
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-stretch border-t-[1.5px] border-ink">
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-ink">
                {totalCount}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                TOTAL SCHEDULES
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-verified-green-ink">
                {new Set(schedules.map((s) => s.essn)).size}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                SCHEDULED EMPLOYEES
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-pending-amber-ink">
                {new Set(schedules.map((s) => s.fid)).size}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                ACTIVE FACILITIES
              </div>
            </div>
          </div>
        </div>

        {/* Schedules Display */}
        {viewMode === "grid" ? (
          <div className={`grid ${GRID_LAYOUTS.CARD_GRID} gap-6`}>
            {schedules.map((schedule) => (
              <ScheduleCard
                key={`${schedule.person_uuid}-${schedule.fid}-${schedule.date}-${schedule.start_time}`}
                schedule={schedule}
                canWrite={!!user}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules)
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
              .map(([date, daySchedules]) => (
                <div
                  key={date}
                  className="overflow-hidden rounded border-[1.5px] border-ink bg-panel"
                >
                  <div className="border-b border-paper-line px-6 py-4">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-5 w-5 text-ink-soft" />
                      <h3 className="text-sm font-bold uppercase tracking-wide text-ink">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <span className="ml-auto font-mono text-xs text-ink-soft">
                        {daySchedules.length} shifts
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-paper-line">
                    {daySchedules.map((schedule, idx) => (
                      <div
                        key={idx}
                        className="px-6 py-4 transition-colors hover:bg-ink/[0.02]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center">
                              <ClockIcon className="mr-2 h-4 w-4 text-ink-soft" />
                              <span className="font-mono tabular-nums text-ink">
                                {schedule.start_time.slice(0, 5)} -{" "}
                                {schedule.end_time
                                  ? schedule.end_time.slice(0, 5)
                                  : "Ongoing"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <UserIcon className="mr-2 h-4 w-4 text-ink-soft" />
                              <span className="text-ink">
                                {schedule.employee_name}
                              </span>
                            </div>
                            <span
                              className="badge-tag"
                              style={{
                                background: roleMeta(schedule.employee_role)
                                  .color,
                              }}
                            >
                              {roleMeta(schedule.employee_role).abbr}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-ink-soft">
                            <BuildingOfficeIcon className="mr-2 h-4 w-4 text-ink-soft" />
                            {schedule.facility_name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {schedules.length === 0 && (
          <div className="rounded border border-dashed border-paper-line bg-paper p-12 text-center">
            <FunnelIcon className="mx-auto h-12 w-12 text-ink-soft/30" />
            <h3 className="mt-2 text-sm font-medium text-ink">
              No schedules found
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              {searchTerm || selectedRole || selectedFacility
                ? "Try adjusting your filters"
                : "Get started by adding a new schedule"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {schedules.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        itemName={scheduleToDelete?.employee_name || "this schedule"}
        itemType="schedule"
        deleteEndpoint={
          scheduleToDelete
            ? API_ENDPOINTS.scheduleDetail(
                scheduleToDelete.person_uuid,
                scheduleToDelete.fid,
                scheduleToDelete.date,
                scheduleToDelete.start_time,
              )
            : ""
        }
        onClose={handleDeleteCancel}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default ScheduleList;
