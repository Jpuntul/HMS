import { useCallback, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import SearchBar from "../../components/SearchBar";
import FilterDropdown from "../../components/FilterDropdown";
import Pagination from "../../components/Pagination";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { SkeletonCards } from "../../components/Skeleton";
import EmployeeCard, { type Employee } from "../../components/EmployeeCard";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import { PAGINATION, UI_TIMINGS, GRID_LAYOUTS } from "../../config/constants";
import { UserGroupIcon, PlusIcon } from "@heroicons/react/24/outline";

const EmployeeList: React.FC = () => {
  const location = useLocation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roleOptions, setRoleOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const { user } = useAuth();

  // SearchBar debounces internally and only calls setSearchTerm once typing
  // settles, so searchTerm here is already the settled value.

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.employeesFilterOptions);
        const roles = response.data.roles.map((r: string) => ({
          value: r,
          label: r.charAt(0).toUpperCase() + r.slice(1),
        }));
        setRoleOptions(roles);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

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

  const fetchEmployees = async (signal?: AbortSignal) => {
    try {
      const isInitialLoad = employees.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      }

      let url = API_ENDPOINTS.employees;
      const params = new URLSearchParams();

      params.append("page", currentPage.toString());
      params.append("page_size", itemsPerPage.toString());

      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (roleFilter) {
        params.append("role", roleFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { signal });
      // Handle paginated response
      const data = response.data.results || response.data;
      setEmployees(Array.isArray(data) ? data : []);
      setTotalCount(response.data.count || data.length);
      setTotalPages(
        Math.ceil((response.data.count || data.length) / itemsPerPage),
      );
      setLoading(false);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError("Failed to fetch employees");
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
  // reacting to the same state), so this effect fires once per settled
  // (search, filters, page) combination instead of twice. The AbortController
  // cancels a still-in-flight request if a newer one starts before it
  // resolves, so a slow earlier response can never overwrite a later one.
  useEffect(() => {
    const controller = new AbortController();
    fetchEmployees(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, currentPage]);

  // Stable reference so EmployeeCard's React.memo isn't defeated by a new
  // function identity on every EmployeeList render.
  const handleDeleteClick = useCallback((employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = () => {
    fetchEmployees();
    showSuccessMessage("Employee deleted successfully!");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleDeleteCancel = () => {
    setEmployeeToDelete(null);
    setDeleteModalOpen(false);
  };

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
        <div className="rounded-lg border border-stamp-red/30 bg-stamp-red/5 px-6 py-4 text-stamp-red-ink">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded border-[1.5px] border-ink bg-panel">
          <div className="border-b border-paper-line px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-7 w-7 flex-shrink-0 text-ink" />
                <div>
                  <h1 className="text-2xl font-bold text-ink">Staff</h1>
                  <p className="mt-1 text-sm text-ink-soft">
                    Manage healthcare facility staff members
                  </p>
                </div>
              </div>
              {user && (
                <div className="flex space-x-3">
                  <Link
                    to="/employees/add"
                    className="flex flex-none items-center gap-2 whitespace-nowrap rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Employee</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="border-b border-paper-line px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Search by name, role..."
                  label="Search"
                  id="employee-search"
                />
              </div>
              <FilterDropdown
                label="Role"
                value={roleFilter}
                onChange={handleRoleFilterChange}
                options={roleOptions}
                id="employee-role-filter"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-stretch border-t-[1.5px] border-ink">
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-ink">
                {totalCount}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                TOTAL STAFF
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-verified-green-ink">
                {
                  employees.filter(
                    (emp) => emp.role === "doctor" || emp.role === "nurse",
                  ).length
                }
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                MEDICAL STAFF
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-pending-amber-ink">
                {new Set(employees.map((emp) => emp.role)).size}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                DIFFERENT ROLES
              </div>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 rounded border border-verified-green/30 bg-verified-green/5 p-4">
            <p className="text-sm font-medium text-verified-green-ink">
              {successMessage}
            </p>
          </div>
        )}

        {/* Employee Grid */}
        <div className={`grid ${GRID_LAYOUTS.CARD_GRID} gap-6`}>
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.ssn}
              employee={employee}
              canWrite={!!user}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>

        {employees.length === 0 && (
          <div className="rounded-xl border border-dashed border-paper-line bg-paper p-12 text-center">
            <UserGroupIcon className="mx-auto mb-4 h-16 w-16 text-ink-soft/30" />
            <div className="mb-2 text-xl font-medium text-ink">
              No employees found
            </div>
            <div className="text-ink-soft">
              There are no employees in the system.
            </div>
          </div>
        )}

        {/* Pagination */}
        {employees.length > 0 && (
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
        itemName={employeeToDelete?.person_name || "this employee"}
        itemType="employee"
        deleteEndpoint={
          employeeToDelete
            ? API_ENDPOINTS.employeeDetail(employeeToDelete.uuid)
            : ""
        }
        onClose={handleDeleteCancel}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default EmployeeList;
