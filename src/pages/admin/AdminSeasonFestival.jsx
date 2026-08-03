import { Children, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Layers3, Package, Pencil, Search, Sparkles, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectCategories } from "../../store/categoriesSlice";
import { selectAllProducts, updateProduct } from "../../store/productsSlice";
import {
  createCustomFestival,
  createCustomSeason,
  deleteCustomFestival,
  deleteCustomSeason,
  selectCustomFestivals,
  selectCustomSeasons,
  updateCustomFestival,
  updateCustomSeason,
} from "../../store/festivalSlice";
import { festivals } from "../../data/festivals";
import { seasons } from "../../data/seasons";
import { getCategoryDisplayName } from "../../utils/categoryDisplay";

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatWindowLabel = (item) => {
  if (!item?.start || !item?.end) return "";
  const startMonth = monthOptions[item.start.month] || "";
  const endMonth = monthOptions[item.end.month] || "";
  return `${startMonth} ${item.start.day} - ${endMonth} ${item.end.day}`;
};

const emptyCustomFestival = {
  name: "",
  startMonth: "1",
  startDay: "1",
  endMonth: "1",
  endDay: "1",
  countdownFrom: "7",
};

const emptyCustomSeason = {
  name: "",
  startMonth: "1",
  startDay: "1",
  endMonth: "1",
  endDay: "1",
};

const readStoredJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredJson = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const adminSeasonOverridesKey = "astromart_admin_season_overrides";
const adminFestivalOverridesKey = "astromart_admin_festival_overrides";
const adminHiddenSeasonsKey = "astromart_admin_hidden_seasons";
const adminHiddenFestivalsKey = "astromart_admin_hidden_festivals";

const toCustomForm = (item, includeCountdown = false) => ({
  name: item.name || "",
  startMonth: String((item.start?.month ?? 0) + 1),
  startDay: String(item.start?.day || 1),
  endMonth: String((item.end?.month ?? 0) + 1),
  endDay: String(item.end?.day || 1),
  ...(includeCountdown ? { countdownFrom: String(item.countdownFrom || 7) } : {}),
});

const toStoredItem = (form, includeCountdown = false) => ({
  name: form.name.trim(),
  start: {
    month: Math.max(0, Number(form.startMonth) - 1),
    day: Number(form.startDay) || 1,
  },
  end: {
    month: Math.max(0, Number(form.endMonth) - 1),
    day: Number(form.endDay) || 1,
  },
  ...(includeCountdown ? { countdownFrom: Number(form.countdownFrom) || 7 } : {}),
});

const AssignmentDropdown = ({ label, value, onChange, options, onEditOption, onDeleteOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label || "No Change";

  return (
    <div className="relative flex min-w-0 flex-col gap-1 text-xs font-bold uppercase tracking-wide text-gray-500">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-medium normal-case tracking-normal text-gray-900 outline-none transition hover:border-brand/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        <span className="truncate">{selectedLabel}</span>
        {isOpen ? (
          <X size={16} className="shrink-0 text-gray-500" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-gray-500 transition-transform" />
        )}
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-sm font-medium normal-case tracking-normal text-gray-900 shadow-xl">
          {options.map((option) => (
            <div
              key={option.value}
              className={`flex w-full items-center gap-2 transition hover:bg-brand/10 ${
                option.value === value ? "bg-brand text-white hover:bg-brand" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="min-w-0 flex-1 px-3 py-2 text-left"
              >
                {option.label}
              </button>
              {option.item && (
                <div className="mr-2 flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditOption?.(option);
                      setIsOpen(false);
                    }}
                    className={`rounded-md p-1.5 transition ${
                      option.value === value
                        ? "text-white hover:bg-white/15"
                        : "text-gray-500 hover:bg-gray-100 hover:text-brand"
                    }`}
                    title={`Edit ${option.type}`}
                    aria-label={`Edit ${option.label}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteOption?.(option);
                      setIsOpen(false);
                    }}
                    className={`rounded-md p-1.5 transition ${
                      option.value === value
                        ? "text-white hover:bg-white/15"
                        : "text-gray-500 hover:bg-red-50 hover:text-red-600"
                    }`}
                    title={`Delete ${option.type}`}
                    aria-label={`Delete ${option.label}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SelectAssignment = ({ children, ...props }) => {
  const options = Children.toArray(children)
    .filter((child) => child?.props)
    .map((child) => ({
      value: child.props.value ?? "",
      label: child.props.children,
    }));

  return <AssignmentDropdown {...props} options={options} />;
};

export default function AdminSeasonFestival() {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const categories = useSelector(selectCategories);
  const customFestivals = useSelector(selectCustomFestivals);
  const customSeasons = useSelector(selectCustomSeasons);
  const [seasonOverrides, setSeasonOverrides] = useState(() =>
    readStoredJson(adminSeasonOverridesKey, {}),
  );
  const [festivalOverrides, setFestivalOverrides] = useState(() =>
    readStoredJson(adminFestivalOverridesKey, {}),
  );
  const [hiddenSeasonIds, setHiddenSeasonIds] = useState(() =>
    readStoredJson(adminHiddenSeasonsKey, []),
  );
  const [hiddenFestivalIds, setHiddenFestivalIds] = useState(() =>
    readStoredJson(adminHiddenFestivalsKey, []),
  );
  const [activeTab, setActiveTab] = useState("product");
  const [query, setQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkSeason, setBulkSeason] = useState("__no_change__");
  const [bulkFestival, setBulkFestival] = useState("__no_change__");
  const [customFestivalForm, setCustomFestivalForm] = useState(emptyCustomFestival);
  const [customSeasonForm, setCustomSeasonForm] = useState(emptyCustomSeason);
  const [inlineCustomType, setInlineCustomType] = useState("");
  const [editingCustom, setEditingCustom] = useState(null);
  const [editingCustomForm, setEditingCustomForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingCustomFestival, setSavingCustomFestival] = useState(false);
  const [savingCustomSeason, setSavingCustomSeason] = useState(false);
  const [savingCustomEdit, setSavingCustomEdit] = useState(false);

  const festivalOptions = useMemo(
    () => [
      ...festivals
        .filter((festival) => !hiddenFestivalIds.includes(festival.id))
        .map((festival) => ({
          ...festival,
          ...(festivalOverrides[festival.id] || {}),
          custom: false,
        })),
      ...customFestivals,
    ],
    [customFestivals, festivalOverrides, hiddenFestivalIds],
  );
  const seasonOptions = useMemo(
    () => [
      ...seasons
        .filter((season) => !hiddenSeasonIds.includes(season.id))
        .map((season) => ({
          ...season,
          ...(seasonOverrides[season.id] || {}),
          custom: false,
        })),
      ...customSeasons,
    ],
    [customSeasons, hiddenSeasonIds, seasonOverrides],
  );
  const seasonById = useMemo(
    () => new Map(seasonOptions.map((season) => [season.id, season])),
    [seasonOptions],
  );
  const festivalById = useMemo(
    () => new Map(festivalOptions.map((festival) => [festival.id, festival])),
    [festivalOptions],
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryName = getCategoryDisplayName(product, categories);
      const seasonName = seasonById.get(product.season)?.name || "";
      const festivalName = festivalById.get(product.festival)?.name || "";
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        seasonName.toLowerCase().includes(q) ||
        festivalName.toLowerCase().includes(q);

      const matchesAssignment = (() => {
        if (assignmentFilter === "all") return true;
        if (assignmentFilter === "unassigned") return !product.season && !product.festival;
        const [type, value] = assignmentFilter.split(":");
        if (type === "season") return product.season === value;
        if (type === "festival") return product.festival === value;
        return true;
      })();

      return matchesQuery && matchesAssignment;
    });
  }, [assignmentFilter, categories, festivalById, products, query, seasonById]);

  const categoryGroups = useMemo(() => {
    const groups = new Map();
    filteredProducts.forEach((product) => {
      const categoryName = getCategoryDisplayName(product, categories);
      const key = product.category || "uncategorized";
      if (!groups.has(key)) {
        groups.set(key, { id: key, name: categoryName || "Uncategorized", products: [] });
      }
      groups.get(key).products.push(product);
    });
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, filteredProducts]);

  const selectedProducts = filteredProducts.filter((product) =>
    selectedIds.includes(product.id),
  );

  const toggleSelected = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleAllFiltered = () => {
    setSelectedIds((current) =>
      current.length === filteredProducts.length
        ? []
        : filteredProducts.map((product) => product.id),
    );
  };

  const updateProducts = async (targetProducts, patch) => {
    setSaving(true);
    const failures = [];
    for (const product of targetProducts) {
      const result = await dispatch(updateProduct({ id: product.id, patch: { ...product, ...patch } }));
      if (result.type?.endsWith("/rejected")) {
        failures.push(product.name);
      }
    }
    setSaving(false);
    if (failures.length) {
      alert(`Some products could not be updated:\n${failures.join("\n")}`);
      return;
    }
    setSelectedIds([]);
  };

  const applyBulkUpdate = async (targets = selectedProducts) => {
    if (targets.length === 0) {
      alert("Please select at least one product.");
      return;
    }
    const patch = {};
    if (bulkSeason !== "__no_change__") patch.season = bulkSeason;
    if (bulkFestival !== "__no_change__") patch.festival = bulkFestival;
    if (!Object.keys(patch).length) {
      alert("Please choose a season or festival to apply.");
      return;
    }
    const confirmed = window.confirm(
      `Update ${targets.length} products with the selected season/festival?`,
    );
    if (!confirmed) return;
    await updateProducts(targets, patch);
  };

  const updateSingleProduct = async (product, patch) => {
    await updateProducts([product], patch);
  };

  const handleCreateCustomSeason = async () => {
    if (!customSeasonForm.name.trim()) {
      alert("Please enter a season name.");
      return;
    }
    setSavingCustomSeason(true);
    const result = await dispatch(createCustomSeason(customSeasonForm));
    setSavingCustomSeason(false);
    if (result.type?.endsWith("/rejected")) {
      alert(result.payload || "Season could not be created.");
      return;
    }
    setBulkSeason(result.payload.id);
    setCustomSeasonForm(emptyCustomSeason);
    setInlineCustomType("");
  };

  const handleCreateInlineCustomFestival = async () => {
    if (!customFestivalForm.name.trim()) {
      alert("Please enter a festival name.");
      return;
    }
    setSavingCustomFestival(true);
    const result = await dispatch(createCustomFestival(customFestivalForm));
    setSavingCustomFestival(false);
    if (result.type?.endsWith("/rejected")) {
      alert(result.payload || "Festival could not be created.");
      return;
    }
    setBulkFestival(result.payload.id);
    setCustomFestivalForm(emptyCustomFestival);
    setInlineCustomType("");
  };

  const startEditCustom = (option) => {
    if (!option.item || !option.type) return;
    setEditingCustom({
      type: option.type,
      id: option.value,
      isCustom: Boolean(option.item.custom),
    });
    setEditingCustomForm(
      toCustomForm(option.item, option.type === "festival"),
    );
    setInlineCustomType("");
  };

  const handleSaveCustomEdit = async () => {
    if (!editingCustom || !editingCustomForm) return;
    if (!editingCustomForm.name.trim()) {
      alert(`Please enter a ${editingCustom.type} name.`);
      return;
    }

    setSavingCustomEdit(true);
    if (!editingCustom.isCustom) {
      const storedItem = toStoredItem(editingCustomForm, editingCustom.type === "festival");
      if (editingCustom.type === "season") {
        setSeasonOverrides((current) => {
          const next = { ...current, [editingCustom.id]: storedItem };
          writeStoredJson(adminSeasonOverridesKey, next);
          return next;
        });
      } else {
        setFestivalOverrides((current) => {
          const next = { ...current, [editingCustom.id]: storedItem };
          writeStoredJson(adminFestivalOverridesKey, next);
          return next;
        });
      }
      setSavingCustomEdit(false);
      setEditingCustom(null);
      setEditingCustomForm(null);
      return;
    }

    const result =
      editingCustom.type === "season"
        ? await dispatch(updateCustomSeason({ id: editingCustom.id, seasonData: editingCustomForm }))
        : await dispatch(updateCustomFestival({ id: editingCustom.id, festivalData: editingCustomForm }));
    setSavingCustomEdit(false);

    if (result.type?.endsWith("/rejected")) {
      alert(result.payload || `${editingCustom.type === "season" ? "Season" : "Festival"} could not be updated.`);
      return;
    }

    setEditingCustom(null);
    setEditingCustomForm(null);
  };

  const handleDeleteCustom = async (option) => {
    if (!option.item || !option.type) return;

    const labelText = option.type === "season" ? "season" : "festival";
    const confirmed = window.confirm(
      `Delete ${option.item.name}? Products using this ${labelText} will be cleared.`,
    );
    if (!confirmed) return;

    if (!option.item.custom) {
      if (option.type === "season") {
        setHiddenSeasonIds((current) => {
          const next = [...new Set([...current, option.value])];
          writeStoredJson(adminHiddenSeasonsKey, next);
          return next;
        });
        setSeasonOverrides((current) => {
          const next = { ...current };
          delete next[option.value];
          writeStoredJson(adminSeasonOverridesKey, next);
          return next;
        });
      } else {
        setHiddenFestivalIds((current) => {
          const next = [...new Set([...current, option.value])];
          writeStoredJson(adminHiddenFestivalsKey, next);
          return next;
        });
        setFestivalOverrides((current) => {
          const next = { ...current };
          delete next[option.value];
          writeStoredJson(adminFestivalOverridesKey, next);
          return next;
        });
      }
    } else {
    const result =
      option.type === "season"
        ? await dispatch(deleteCustomSeason(option.value))
        : await dispatch(deleteCustomFestival(option.value));

    if (result.type?.endsWith("/rejected")) {
      alert(result.payload || `${labelText} could not be deleted.`);
      return;
    }
    }

    const assignedProducts = products.filter((product) =>
      option.type === "season"
        ? product.season === option.value
        : product.festival === option.value,
    );

    if (assignedProducts.length) {
      await updateProducts(
        assignedProducts,
        option.type === "season" ? { season: "" } : { festival: "" },
      );
    }

    if (option.type === "season" && bulkSeason === option.value) setBulkSeason("__no_change__");
    if (option.type === "festival" && bulkFestival === option.value) setBulkFestival("__no_change__");
    if (editingCustom?.id === option.value) {
      setEditingCustom(null);
      setEditingCustomForm(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-950">Season & Festival</h1>
            <p className="mt-0.5 text-xs font-semibold text-gray-500">
              Manage seasonal and festival assignments for homepage product visibility.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex w-max items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700">
              <CalendarDays size={14} /> {products.length} products
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("product")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${activeTab === "product" ? "bg-white text-brand shadow-sm" : "text-gray-600"}`}
            >
              <Package size={16} /> Product
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("category")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${activeTab === "category" ? "bg-white text-brand shadow-sm" : "text-gray-600"}`}
            >
              <Layers3 size={16} /> Category
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-72">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search product, season, festival..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <select
              value={assignmentFilter}
              onChange={(e) => {
                setAssignmentFilter(e.target.value);
                setSelectedIds([]);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-64"
            >
              <option value="all">All Seasons & Festivals</option>
              <option value="unassigned">Unassigned Products</option>
              <optgroup label="Seasons">
                {seasonOptions.map((season) => (
                  <option key={season.id} value={`season:${season.id}`}>
                    {season.name} ({formatWindowLabel(season)})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Festivals">
                {festivalOptions.map((festival) => (
                  <option key={festival.id} value={`festival:${festival.id}`}>
                    {festival.name} ({formatWindowLabel(festival)})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Bulk manage</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {selectedProducts.length} selected
                <span className="font-semibold text-gray-500"> from {filteredProducts.length} matching products</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setInlineCustomType("season")}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  <Sparkles size={15} /> Create Custom Season
                </button>
                <button
                  type="button"
                  onClick={() => setInlineCustomType("festival")}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
                >
                  <Sparkles size={15} /> Create Custom Festival
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(180px,220px)_minmax(180px,220px)_auto] sm:items-end">
              <AssignmentDropdown
                label="Set Season"
                value={bulkSeason}
                onChange={setBulkSeason}
                options={[
                  { value: "__no_change__", label: "No Change" },
                  { value: "", label: "Clear Season" },
                  ...seasonOptions.map((season) => ({
                    value: season.id,
                    label: `${season.name} (${formatWindowLabel(season)})`,
                    type: "season",
                    item: season,
                    editable: season.custom,
                  })),
                ]}
                onEditOption={startEditCustom}
                onDeleteOption={handleDeleteCustom}
              />
              <AssignmentDropdown
                label="Set Festival"
                value={bulkFestival}
                onChange={setBulkFestival}
                options={[
                  { value: "__no_change__", label: "No Change" },
                  { value: "", label: "Clear Festival" },
                  ...festivalOptions.map((festival) => ({
                    value: festival.id,
                    label: `${festival.name} (${formatWindowLabel(festival)})`,
                    type: "festival",
                    item: festival,
                    editable: festival.custom,
                  })),
                ]}
                onEditOption={startEditCustom}
                onDeleteOption={handleDeleteCustom}
              />
              <button
                type="button"
                onClick={() => applyBulkUpdate()}
                disabled={saving || selectedProducts.length === 0}
                className="h-11 rounded-xl bg-brand px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Selected"}
              </button>
            </div>
          </div>
          {inlineCustomType && (
            <div className="mt-3 rounded-xl border border-dashed border-brand/40 bg-gradient-to-r from-indigo-50 via-white to-amber-50 p-4 shadow-inner">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand">
                <Sparkles size={16} />
                {inlineCustomType === "season" ? "Create Custom Season Duration" : "Create Custom Festival Duration"}
              </div>
              <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_1fr_0.8fr_auto_auto] md:items-end">
                <label className="text-xs font-bold uppercase tracking-wide text-amber-900">
                  {inlineCustomType === "season" ? "Custom Season Name" : "Custom Festival Name"}
                  <input
                    value={
                      inlineCustomType === "season"
                        ? customSeasonForm.name
                        : customFestivalForm.name
                    }
                    onChange={(e) =>
                      inlineCustomType === "season"
                        ? setCustomSeasonForm({ ...customSeasonForm, name: e.target.value })
                        : setCustomFestivalForm({ ...customFestivalForm, name: e.target.value })
                    }
                    placeholder={inlineCustomType === "season" ? "Custom Season Name" : "Custom Festival Name"}
                    className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-amber-900">
                  Start Month
                  <select
                    value={
                      inlineCustomType === "season"
                        ? customSeasonForm.startMonth
                        : customFestivalForm.startMonth
                    }
                    onChange={(e) =>
                      inlineCustomType === "season"
                        ? setCustomSeasonForm({ ...customSeasonForm, startMonth: e.target.value })
                        : setCustomFestivalForm({ ...customFestivalForm, startMonth: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium normal-case text-gray-900"
                  >
                    {monthOptions.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-amber-900">
                  Start Day
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={
                      inlineCustomType === "season"
                        ? customSeasonForm.startDay
                        : customFestivalForm.startDay
                    }
                    onChange={(e) =>
                      inlineCustomType === "season"
                        ? setCustomSeasonForm({ ...customSeasonForm, startDay: e.target.value })
                        : setCustomFestivalForm({ ...customFestivalForm, startDay: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-gray-900"
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-amber-900">
                  End Month
                  <select
                    value={
                      inlineCustomType === "season"
                        ? customSeasonForm.endMonth
                        : customFestivalForm.endMonth
                    }
                    onChange={(e) =>
                      inlineCustomType === "season"
                        ? setCustomSeasonForm({ ...customSeasonForm, endMonth: e.target.value })
                        : setCustomFestivalForm({ ...customFestivalForm, endMonth: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium normal-case text-gray-900"
                  >
                    {monthOptions.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-amber-900">
                  End Day
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={
                      inlineCustomType === "season"
                        ? customSeasonForm.endDay
                        : customFestivalForm.endDay
                    }
                    onChange={(e) =>
                      inlineCustomType === "season"
                        ? setCustomSeasonForm({ ...customSeasonForm, endDay: e.target.value })
                        : setCustomFestivalForm({ ...customFestivalForm, endDay: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-gray-900"
                  />
                </label>
                <button
                  type="button"
                  onClick={
                    inlineCustomType === "season"
                      ? handleCreateCustomSeason
                      : handleCreateInlineCustomFestival
                  }
                  disabled={savingCustomSeason || savingCustomFestival}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {savingCustomSeason || savingCustomFestival ? "Adding..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInlineCustomType("");
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {editingCustom && editingCustomForm && (
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-inner">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-900">
                <Pencil size={16} />
                {editingCustom.type === "season" ? "Edit Season Duration" : "Edit Festival Duration"}
              </div>
              <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_1fr_0.8fr_auto_auto] md:items-end">
                <label className="text-xs font-bold uppercase tracking-wide text-blue-900">
                  {editingCustom.type === "season" ? "Season Name" : "Festival Name"}
                  <input
                    value={editingCustomForm.name}
                    onChange={(e) => setEditingCustomForm({ ...editingCustomForm, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-blue-900">
                  Start Month
                  <select
                    value={editingCustomForm.startMonth}
                    onChange={(e) => setEditingCustomForm({ ...editingCustomForm, startMonth: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium normal-case text-gray-900"
                  >
                    {monthOptions.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-blue-900">
                  Start Day
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingCustomForm.startDay}
                    onChange={(e) => setEditingCustomForm({ ...editingCustomForm, startDay: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-gray-900"
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-blue-900">
                  End Month
                  <select
                    value={editingCustomForm.endMonth}
                    onChange={(e) => setEditingCustomForm({ ...editingCustomForm, endMonth: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium normal-case text-gray-900"
                  >
                    {monthOptions.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold uppercase tracking-wide text-blue-900">
                  End Day
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingCustomForm.endDay}
                    onChange={(e) => setEditingCustomForm({ ...editingCustomForm, endDay: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-gray-900"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSaveCustomEdit}
                  disabled={savingCustomEdit}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {savingCustomEdit ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCustom(null);
                    setEditingCustomForm(null);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {activeTab === "product" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                      onChange={toggleAllFiltered}
                    />
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Season</th>
                  <th className="px-4 py-3">Festival</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-indigo-50/30">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelected(product.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <p className="text-xs font-medium text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-600">
                      {getCategoryDisplayName(product, categories)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={product.season || ""}
                        onChange={(e) => updateSingleProduct(product, { season: e.target.value })}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">No Season</option>
                {seasonOptions.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatWindowLabel(seasonById.get(product.season))}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={product.festival || ""}
                        onChange={(e) => updateSingleProduct(product, { festival: e.target.value })}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">No Festival</option>
                        {festivalOptions.map((festival) => (
                          <option key={festival.id} value={festival.id}>
                            {festival.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatWindowLabel(festivalById.get(product.festival))}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-emerald-700">
                      Auto saves
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="py-16 text-center text-sm font-semibold text-gray-500">
                No matching products found.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {categoryGroups.map((group) => {
              const groupSelected = group.products.every((product) => selectedIds.includes(product.id));
              return (
                <div key={group.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                      <p className="text-sm font-medium text-gray-500">
                        {group.products.length} matching products
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIds((current) => {
                            const groupIds = group.products.map((product) => product.id);
                            return groupSelected
                              ? current.filter((id) => !groupIds.includes(id))
                              : [...new Set([...current, ...groupIds])];
                          });
                        }}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700"
                      >
                        {groupSelected ? "Unselect Category" : "Select Category"}
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBulkUpdate(group.products)}
                        disabled={saving}
                        className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                      >
                        Update This Category
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.products.slice(0, 12).map((product) => (
                      <span key={product.id} className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                        {product.name}
                      </span>
                    ))}
                    {group.products.length > 12 && (
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-brand">
                        +{group.products.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {categoryGroups.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm font-semibold text-gray-500">
                No category groups found for this filter.
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-900">
          <Sparkles size={17} className="mt-0.5 shrink-0" />
          Products updated here will automatically appear on the homepage when their assigned season or festival becomes active.
        </div>
      </div>
    </div>
  );
}
