import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { UserPlusIcon } from "@heroicons/react/24/outline";

interface PersonFormData {
  ssn: string;
  medicare: string;
  first_name: string;
  last_name: string;
  dob: string;
  telephone?: string;
  citizenship?: string;
  email?: string;
  occupation?: string;
}

const fieldClass = (hasError: boolean) =>
  `block w-full border-0 border-b-2 bg-transparent px-0 py-2 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-0 disabled:opacity-50 ${
    hasError ? "border-stamp-red" : "border-paper-line focus:border-ink"
  }`;

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

const AddPerson: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PersonFormData>({
    ssn: "",
    medicare: "",
    first_name: "",
    last_name: "",
    dob: "",
    telephone: "",
    citizenship: "",
    email: "",
    occupation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ssn.trim()) newErrors.ssn = "SSN is required";
    if (!formData.medicare.trim())
      newErrors.medicare = "Medicare number is required";
    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";

    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.persons, formData);
      navigate("/persons", {
        state: { message: "Person added successfully!" },
      });
    } catch (error) {
      console.error("Error adding person:", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        // Handle different error formats from backend
        if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else if (errorData.non_field_errors) {
          setErrors({ general: errorData.non_field_errors[0] });
        } else {
          setErrors(errorData);
        }
      } else {
        setErrors({ general: "Failed to add person. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/persons");
  };

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="badge-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <UserPlusIcon className="h-7 w-7 flex-shrink-0 text-ink" />
            <h1 className="text-2xl font-bold text-ink">Add New Person</h1>
          </div>

          {errors.general && (
            <div
              role="alert"
              className="mb-6 rounded border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm font-medium text-stamp-red-ink"
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="first_name" className={labelClass}>
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={fieldClass(!!errors.first_name)}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className={labelClass}>
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={fieldClass(!!errors.last_name)}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="ssn" className={labelClass}>
                  SSN *
                </label>
                <input
                  type="text"
                  id="ssn"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  className={fieldClass(!!errors.ssn)}
                  placeholder="xxx-xx-xxxx"
                />
                {errors.ssn && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.ssn}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="medicare" className={labelClass}>
                  Medicare Number *
                </label>
                <input
                  type="text"
                  id="medicare"
                  name="medicare"
                  value={formData.medicare}
                  onChange={handleInputChange}
                  className={fieldClass(!!errors.medicare)}
                  placeholder="Enter Medicare number"
                />
                {errors.medicare && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.medicare}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="dob" className={labelClass}>
                Date of Birth *
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className={fieldClass(!!errors.dob)}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-stamp-red-ink">{errors.dob}</p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="border-t border-paper-line pt-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Optional Information
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.email)}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="telephone" className={labelClass}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className={fieldClass(false)}
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="citizenship" className={labelClass}>
                    Citizenship
                  </label>
                  <input
                    type="text"
                    id="citizenship"
                    name="citizenship"
                    value={formData.citizenship}
                    onChange={handleInputChange}
                    className={fieldClass(false)}
                    placeholder="e.g., US Citizen"
                  />
                </div>

                <div>
                  <label htmlFor="occupation" className={labelClass}>
                    Occupation
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className={fieldClass(false)}
                    placeholder="Enter occupation"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 border-t border-paper-line pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border-[1.5px] border-paper-line px-6 py-2 text-ink-soft transition-colors hover:bg-ink/[0.04] focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded border-[1.5px] border-ink bg-ink px-6 py-2 text-paper transition-colors hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Person"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPerson;
