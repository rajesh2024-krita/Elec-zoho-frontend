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

  /* 🔁 Sync parent value → input */
  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  /* 🔍 API Search */
  useEffect(() => {
    if (search.length < 2) {
      setFiltered([]);
      setShowList(false);
      return;
    }

    const delay = setTimeout(() => {
      axios
        .get("https://elec-zoho-backend-snowy.vercel.app/vendors/search", {
          params: { q: search }
        })
        .then((res) => {
          setFiltered(res.data.vendors || []);
          setShowList(true);
        })
        .catch(() => setFiltered([]));
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

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

      {showList && filtered.length > 0 && (
        <ul className="absolute z-20 bg-white border border-gray-200 w-full max-h-[220px] overflow-y-auto rounded-xl shadow-md mt-1">
          {filtered.map((v) => (
            <li
              key={v.id}
              onClick={() => handleSelect(v)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm"
            >
              {v.Vendor_Name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
