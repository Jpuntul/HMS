import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import SearchBar from "../../components/SearchBar";
import FilterDropdown from "../../components/FilterDropdown";
import Pagination from "../../components/Pagination";
import { SkeletonCards } from "../../components/Skeleton";
import PersonCard from "../../components/PersonCard";
import { API_ENDPOINTS } from "../../config/api";
import { PAGINATION, UI_TIMINGS, GRID_LAYOUTS } from "../../config/constants";
import { UserIcon, PlusIcon } from "@heroicons/react/24/outline";

export interface Person {
  uuid: string;
  medicare: string;
  ssn: number;
  first_name: string;
  last_name: string;
  dob: string;
  telephone?: string;
  citizenship?: string;
  email?: string;
  occupation?: string;
}

const PersonList: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [persons, setPersons] = useState<Person[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [citizenshipFilter, setCitizenshipFilter] = useState("");
  const [occupationFilter, setOccupationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [citizenshipOptions, setCitizenshipOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [occupationOptions, setOccupationOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // SearchBar debounces internally now and only calls setSearchTerm once
  // typing settles, so searchTerm here is already the settled value.

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.personsFilterOptions);
        const citizenships = response.data.citizenships.map((c: string) => ({
          value: c,
          label: c,
        }));
        const occupations = response.data.occupations.map((o: string) => ({
          value: o,
          label: o,
        }));
        setCitizenshipOptions(citizenships);
        setOccupationOptions(occupations);
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

  const fetchPersons = async (signal?: AbortSignal) => {
    try {
      // Only show loading screen on initial load
      const isInitialLoad = persons.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      }

      let url = API_ENDPOINTS.persons;
      const params = new URLSearchParams();

      params.append("page", currentPage.toString());
      params.append("page_size", itemsPerPage.toString());

      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (citizenshipFilter) {
        params.append("citizenship", citizenshipFilter);
      }
      if (occupationFilter) {
        params.append("occupation", occupationFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { signal });
      const data = response.data.results || response.data;
      setPersons(data);
      setFilteredPersons(data);
      setTotalCount(response.data.count || data.length);
      setTotalPages(
        Math.ceil((response.data.count || data.length) / itemsPerPage),
      );
      setLoading(false);
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error(error);
      setLoading(false);
    }
  };

  // Success message from navigation state (e.g. after Add/Edit) is a
  // one-off tied to how we arrived here, not to search/filter/page state -
  // it has its own effect so filter changes don't re-trigger it.
  useEffect(() => {
    if (location.state?.message) {
      showSuccessMessage(location.state.message);
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
    fetchPersons(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, citizenshipFilter, occupationFilter, currentPage]);

  // Stable reference so PersonCard's React.memo isn't defeated by a new
  // function identity on every PersonList render.
  const handleDeleteClick = useCallback((person: Person) => {
    setPersonToDelete(person);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = () => {
    // Refresh the list after deletion
    fetchPersons();
    showSuccessMessage("Person deleted successfully!");
  };

  const handleDeleteCancel = () => {
    setPersonToDelete(null);
    setDeleteModalOpen(false);
  };

  // Reset to page 1 synchronously with the filter/search change itself
  // (rather than in a separate effect reacting to the new value) so the
  // fetch effect above sees the settled (filter, page) pair in one go.
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCitizenshipChange = (value: string) => {
    setCitizenshipFilter(value);
    setCurrentPage(1);
  };

  const handleOccupationChange = (value: string) => {
    setOccupationFilter(value);
    setCurrentPage(1);
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

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded border-[1.5px] border-ink bg-panel">
          <div className="border-b border-paper-line px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserIcon className="h-7 w-7 flex-shrink-0 text-ink" />
                <div>
                  <h1 className="text-2xl font-bold text-ink">Patients</h1>
                  <p className="mt-1 text-sm text-ink-soft">
                    Manage patient records and personal information
                  </p>
                </div>
              </div>
              {user && (
                <div className="flex space-x-3">
                  <Link
                    to="/persons/add"
                    className="flex flex-none items-center gap-2 whitespace-nowrap rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Person</span>
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
                  placeholder="Search by name, SSN, Medicare, email..."
                  label="Search"
                  id="person-search"
                />
              </div>
              <FilterDropdown
                label="Citizenship"
                value={citizenshipFilter}
                onChange={handleCitizenshipChange}
                options={citizenshipOptions}
                id="person-citizenship-filter"
              />
              <FilterDropdown
                label="Occupation"
                value={occupationFilter}
                onChange={handleOccupationChange}
                options={occupationOptions}
                id="person-occupation-filter"
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
                TOTAL PERSONS
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-verified-green-ink">
                {persons.filter((p) => p.email).length}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                WITH EMAIL
              </div>
            </div>
            <div className="min-w-[140px] flex-1 border-r border-paper-line px-6 py-3.5 last:border-r-0">
              <div className="font-mono text-xl font-bold tabular-nums text-pending-amber-ink">
                {persons.filter((p) => p.occupation).length}
              </div>
              <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
                WITH OCCUPATION
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

        {/* Person Grid */}
        <div className={`grid ${GRID_LAYOUTS.CARD_GRID} gap-6`}>
          {filteredPersons.map((person) => (
            <PersonCard
              key={person.medicare}
              person={person}
              canWrite={!!user}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>

        {persons.length === 0 && (
          <div className="rounded-xl border border-dashed border-paper-line bg-paper p-12 text-center">
            <UserIcon className="mx-auto mb-4 h-16 w-16 text-ink-soft/30" />
            <div className="mb-2 text-xl font-medium text-ink">
              No persons found
            </div>
            <div className="text-ink-soft">
              There are no persons in the system.
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredPersons.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          itemName={
            personToDelete
              ? `${personToDelete.first_name} ${personToDelete.last_name}`
              : ""
          }
          itemType="person"
          deleteEndpoint={
            personToDelete
              ? API_ENDPOINTS.personDetail(personToDelete.uuid)
              : ""
          }
          onClose={handleDeleteCancel}
          onDelete={handleDeleteConfirm}
        />
      </div>
    </div>
  );
};

export default PersonList;
