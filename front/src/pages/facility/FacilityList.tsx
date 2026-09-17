import { useCallback, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { PAGINATION, UI_TIMINGS } from "../../config/constants";
import { BuildingOffice2Icon, PlusIcon } from "@heroicons/react/24/outline";
import SearchBar from "../../components/SearchBar";
import FilterDropdown from "../../components/FilterDropdown";
import SearchResultsHeader from "../../components/SearchResultsHeader";
import Pagination from "../../components/Pagination";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { SkeletonCards } from "../../components/Skeleton";
import FacilityCard, { type Facility } from "../../components/FacilityCard";
import { useAuth } from "../../contexts/AuthContext";

const FacilityList: React.FC = () => {
  const location = useLocation();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  // SearchBar debounces internally and only calls setSearchTerm once typing
  // settles, so searchTerm here is already the settled value.

  const itemsPerPage = PAGINATION.TABLE_PAGE_SIZE;

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

  const fetchFacilities = async (signal?: AbortSignal) => {
    try {
      const isInitialLoad = facilities.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      }

      let url = API_ENDPOINTS.facilities;
      const params = new URLSearchParams();

      params.append("page", currentPage.toString());
      params.append("page_size", itemsPerPage.toString());

      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (typeFilter) {
        params.append("type", typeFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { signal });
      // Handle paginated response
      const data = response.data.results || response.data;
      setFacilities(Array.isArray(data) ? data : []);
      setTotalCount(response.data.count || data.length);
      setTotalPages(
        Math.ceil((response.data.count || data.length) / itemsPerPage),
      );
      setLoading(false);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError("Failed to fetch facilities");
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
    fetchFacilities(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, typeFilter, currentPage]);

  // Stable reference so FacilityCard's React.memo isn't defeated by a new
  // function identity on every FacilityList render.
  const handleDeleteClick = useCallback((facility: Facility) => {
    setFacilityToDelete(facility);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = () => {
    fetchFacilities();
    showSuccessMessage("Facility deleted successfully!");
  };

  const handleDeleteCancel = () => {
    setFacilityToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const totalCapacity = facilities.reduce(
    (sum, facility) => sum + (facility.capacity || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-paper py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonCards columns="grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" />
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
                <BuildingOffice2Icon className="h-7 w-7 flex-shrink-0 text-ink" />
                <div>
                  <h1 className="text-2xl font-bold text-ink">Facilities</h1>
                  <p className="mt-1 text-sm text-ink-soft">
                    Healthcare facilities across the network
                  </p>
                </div>
              </div>
              {user && (
                <Link
                  to="/facilities/add"
                  className="flex flex-none items-center gap-2 whitespace-nowrap rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Facility</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="border-b border-paper-line px-6 py-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Search facilities by name, address, or city..."
                  label="Search"
                  id="facility-search"
                />
              </div>
              <div className="w-full sm:w-64">
                <FilterDropdown
                  label="Type"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  id="facility-type-filter"
                  options={[
                    {
                      value: "Hospital",
                      label: "Hospital",
                      count: facilities.filter((f) => f.type === "Hospital")
                        .length,
                    },
                    {
                      value: "CLSC",
                      label: "CLSC",
                      count: facilities.filter((f) => f.type === "CLSC").length,
                    },
                    {
                      value: "Clinic",
                      label: "Clinic",
                      count: facilities.filter((f) => f.type === "Clinic")
                        .length,
                    },
                    {
                      value: "Pharmacy",
                      label: "Pharmacy",
                      count: facilities.filter((f) => f.type === "Pharmacy")
                        .length,
                    },
                    {
                      value: "Special installment",
                      label: "Special installment",
                      count: facilities.filter(
                        (f) => f.type === "Special installment",
                      ).length,
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Search Results Header */}
          {(searchTerm || typeFilter) && (
            <div className="border-b border-paper-line bg-ink/[0.03] px-6 py-3">
              <SearchResultsHeader
                totalResults={facilities.length}
                searchTerm={searchTerm}
                filterCount={typeFilter ? 1 : 0}
                onClearFilters={() => {
                  setSearchTerm("");
                  setTypeFilter("");
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-stretch border-t-[1.5px] border-ink">
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-ink">
                {facilities.length}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                TOTAL FACILITIES
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-stamp-red-ink">
                {facilities.filter((f) => f.type === "Hospital").length}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                HOSPITALS
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-verified-green-ink">
                {
                  facilities.filter(
                    (f) => f.type === "Clinic" || f.type === "CLSC",
                  ).length
                }
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                CLINICS &amp; CLSCS
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-pending-amber-ink">
                {totalCapacity.toLocaleString()}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                TOTAL CAPACITY
              </div>
            </div>
          </div>
        </div>

        {/* Facility Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.fid}
              facility={facility}
              canWrite={!!user}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>

        {facilities.length === 0 && (
          <div className="rounded-xl border border-dashed border-paper-line bg-paper p-12 text-center">
            <BuildingOffice2Icon className="mx-auto mb-4 h-16 w-16 text-ink-soft/30" />
            <div className="mb-2 text-xl font-medium text-ink">
              No facilities found
            </div>
            <div className="text-ink-soft">
              There are no facilities in the system.
            </div>
          </div>
        )}

        {/* Pagination */}
        {facilities.length > 0 && (
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
        itemName={facilityToDelete?.name || "this facility"}
        itemType="facility"
        deleteEndpoint={`${API_ENDPOINTS.facilities}${facilityToDelete?.fid}/`}
        onClose={handleDeleteCancel}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default FacilityList;
