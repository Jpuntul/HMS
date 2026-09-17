import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/Pagination";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import SearchBar from "../../components/SearchBar";
import { SkeletonTableRows } from "../../components/Skeleton";
import { API_ENDPOINTS, ROUTES } from "../../config/api";
import { PAGINATION, UI_TIMINGS } from "../../config/constants";
import {
  ExclamationTriangleIcon,
  PlusIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import FormCheck from "../../components/FormCheck";

interface Infection {
  person_uuid: string;
  ssn: number;
  date: string;
  type_id: number;
  person_name: string;
  infection_type_name: string;
}

const InfectionList: React.FC = () => {
  const location = useLocation();
  const [infections, setInfections] = useState<Infection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [infectionToDelete, setInfectionToDelete] = useState<Infection | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

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

  const fetchInfections = async (signal?: AbortSignal) => {
    try {
      const isInitialLoad = infections.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      }
      let url = API_ENDPOINTS.infections;
      const params = new URLSearchParams();

      params.append("page", currentPage.toString());
      params.append("page_size", itemsPerPage.toString());

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { signal });
      // Handle paginated response
      const data = response.data.results || response.data;
      setInfections(Array.isArray(data) ? data : []);
      setTotalCount(response.data.count || data.length);
      setTotalPages(
        Math.ceil((response.data.count || data.length) / itemsPerPage),
      );
      setLoading(false);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError("Failed to fetch infections");
      setLoading(false);
    }
  };

  // Success message from navigation state (e.g. after Add/Edit) is a
  // one-off tied to how we arrived here, not to search/page state - it has
  // its own effect so a page change doesn't re-trigger it.
  useEffect(() => {
    if (location.state?.message) {
      showSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Single source of truth for fetching: page reset on search change happens
  // synchronously in the change handler below (not a second effect reacting
  // to the same state), so this effect fires once per settled (search, page)
  // combination instead of twice. SearchBar debounces internally, so
  // searchTerm here is already the settled value. The AbortController
  // cancels a still-in-flight request if a newer one starts before it
  // resolves.
  useEffect(() => {
    const controller = new AbortController();
    fetchInfections(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentPage]);

  const handleDeleteClick = (infection: Infection) => {
    setInfectionToDelete(infection);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    fetchInfections();
    showSuccessMessage("Infection record deleted successfully!");
  };

  const handleDeleteCancel = () => {
    setInfectionToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto rounded border-[1.5px] border-ink bg-panel">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-[1.5px] border-ink text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3">Person</th>
                  <th className="px-5 py-3">Infection Type</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <SkeletonTableRows columns={4} />
              </tbody>
            </table>
          </div>
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
                <ExclamationTriangleIcon className="h-7 w-7 flex-shrink-0 text-ink" />
                <div>
                  <h1 className="text-2xl font-bold text-ink">
                    Infection Records
                  </h1>
                  <p className="mt-1 text-sm text-ink-soft">
                    Track and manage infection cases
                  </p>
                </div>
              </div>
              {user && (
                <div className="flex space-x-3">
                  <Link
                    to="/infections/add"
                    className="flex flex-none items-center gap-2 whitespace-nowrap rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Infection Record</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="border-b border-paper-line px-6 py-4">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              placeholder="Search by person name or infection type..."
              label="Search"
              id="infection-search"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-stretch border-t-[1.5px] border-ink">
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-ink">
                {totalCount}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                TOTAL INFECTIONS
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-verified-green-ink">
                {new Set(infections.map((i) => i.ssn)).size}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                UNIQUE PATIENTS
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-pending-amber-ink">
                {new Set(infections.map((i) => i.infection_type_name)).size}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                INFECTION TYPES
              </div>
            </div>
          </div>
        </div>

        {/* Infections Table */}
        <div className="overflow-x-auto rounded border-[1.5px] border-ink bg-panel">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-[1.5px] border-ink text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3">Person</th>
                <th className="px-5 py-3">Infection Type</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {infections.map((infection, index) => (
                <tr
                  key={index}
                  className="border-b border-paper-line last:border-b-0 hover:bg-ink/[0.02]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FormCheck />
                      <div>
                        <span className="block text-sm font-medium text-ink">
                          {infection.person_name}
                        </span>
                        <span className="font-mono text-xs text-ink-soft">
                          NO. {infection.person_uuid.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="badge-tag"
                      style={{ background: "var(--color-ink-soft)" }}
                    >
                      {infection.infection_type_name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 font-mono text-sm tabular-nums text-ink">
                      <CalendarIcon className="h-4 w-4 text-ink-soft" />
                      {new Date(infection.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={ROUTES.infectionDetail(
                          infection.person_uuid,
                          infection.date,
                          infection.type_id,
                        )}
                        className="text-ink-soft transition-colors hover:text-ink"
                        aria-label={`View infection record for ${infection.person_name}`}
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      {user && (
                        <>
                          <Link
                            to={ROUTES.infectionEdit(
                              infection.person_uuid,
                              infection.date,
                              infection.type_id,
                            )}
                            className="text-ink-soft transition-colors hover:text-verified-green-ink"
                            aria-label={`Edit infection record for ${infection.person_name}`}
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(infection)}
                            className="text-ink-soft transition-colors hover:text-stamp-red-ink"
                            aria-label={`Delete infection record for ${infection.person_name}`}
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {infections.length === 0 && (
            <div className="py-12 text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-ink-soft/30" />
              <h3 className="mt-2 text-sm font-medium text-ink">
                No infection records found
              </h3>
              <p className="mt-1 text-sm text-ink-soft">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by adding a new infection record"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {infections.length > 0 && (
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
        itemName={infectionToDelete?.person_name || "this infection record"}
        itemType="infection record"
        deleteEndpoint={
          infectionToDelete
            ? API_ENDPOINTS.infectionDetail(
                infectionToDelete.person_uuid,
                infectionToDelete.date,
                infectionToDelete.type_id,
              )
            : ""
        }
        onClose={handleDeleteCancel}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default InfectionList;
