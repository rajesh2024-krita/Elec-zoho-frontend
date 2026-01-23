import { useEffect, useState } from "react";
import axios from "axios";

interface Vendor {
  id: number;
  Vendor_Name: string;
}

interface Props {
  value: string;
  label?: string;
  onSelect: (vendor: Vendor) => void;
}

export default function VendorSearchSelect({
  value,
  label = "",
  onSelect
}: Props) {
  const [search, setSearch] = useState(value || "");
  const [filtered, setFiltered] = useState<Vendor[]>([]);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);     // 🔥 NEW
  const [noResult, setNoResult] = useState(false);   // 🔥 NEW

  /** 🔁 Sync parent → input */
  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  /** 🔍 API Search */
  useEffect(() => {
    if (search.length < 2) {
      setFiltered([]);
      setShowList(false);
      setNoResult(false);
      return;
    }

    setLoading(true);
    setNoResult(false);

    const delay = setTimeout(() => {
      axios
        .get("https://elec-zoho-backend-snowy.vercel.app/vendors/search", { params: { q: search } })
        .then((res) => {
          const list = res.data.vendors || [];
          setFiltered(list);
          setShowList(true);
          setNoResult(list.length === 0);
        })
        .catch(() => {
          setFiltered([]);
          setNoResult(true);
        })
        .finally(() => setLoading(false));   // ⬅ stop spinner
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  /** ✔ Select Vendor */
  const handleSelect = (vendor: Vendor) => {
    setSearch(vendor.Vendor_Name);
    setShowList(false);
    onSelect(vendor);
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="text-[10px] font-bold text-gray-600 ml-1 uppercase tracking-tighter">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Input */}
        <input
          type="text"
          placeholder="Search vendor..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowList(true);
          }}
          className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all
          ${
            label.includes("*") && !value
              ? "border-red-200 bg-red-50/50"
              : "border-gray-200 focus:ring-2 focus:ring-blue-500"
          }`}
        />

        {/* ⏳ Spinner inside input */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 
                   5.373 0 12h4zm2 5.291A7.962 7.962 
                   0 014 12H0c0 3.042 1.135 5.824 
                   3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {showList && (filtered.length > 0 || loading || noResult) && (
        <ul className="absolute z-20 bg-white border border-gray-200 w-full max-h-[220px] overflow-y-auto rounded-xl shadow-md mt-1">
          
          {/* 🌀 While Searching */}
          {loading && (
            <li className="px-4 py-2 text-sm text-gray-500">Searching...</li>
          )}

          {/* ✔ Search Results */}
          {!loading &&
            filtered.map((v) => (
              <li
                key={v.id}
                onClick={() => handleSelect(v)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm"
              >
                {v.Vendor_Name}
              </li>
            ))}

          {/* ❌ No Results */}
          {!loading && noResult && (
            <li className="px-4 py-2 text-sm text-gray-400 italic">
              No vendor found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
