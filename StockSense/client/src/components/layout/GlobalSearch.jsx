import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ClipboardList,
  Package,
  Search,
  Warehouse,
  X,
} from "lucide-react";
import Modal from "../ui/Modal";
import { useWorkspace } from "../../lib/workspaceContext";
import { navigationGroups, operationPaths } from "./navigation";

export default function GlobalSearch({ onClose }) {
  const { state, error } = useWorkspace();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();
  const term = query.trim().toLowerCase();
  const matches = (...fields) => fields.join(" ").toLowerCase().includes(term);
  const pages = navigationGroups
    .flatMap((group) => group.items)
    .filter((page) => matches(page.label));
  const groups = [
    {
      label: term ? "Pages" : "Quick navigation",
      items: pages.map((page) => ({
        ...page,
        id: page.to,
        title: page.label,
        subtitle: "Open page",
      })),
    },
    {
      label: "Products",
      items: term
        ? (state?.products || [])
            .filter((p) => matches(p.name, p.sku, p.category))
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              title: p.name,
              subtitle: `${p.sku} · ${p.category}`,
              to: `/products?q=${encodeURIComponent(p.sku)}`,
              icon: Package,
            }))
        : [],
    },
    {
      label: "Operations",
      items: term
        ? (state?.operations || [])
            .filter((o) =>
              matches(
                o.reference,
                o.partner,
                o.type,
                o.status,
                state.warehouses.find((w) => w.id === o.warehouseId)?.name,
              ),
            )
            .slice(0, 5)
            .map((o) => ({
              id: o.id,
              title: o.reference,
              subtitle: `${o.type} · ${o.partner || "Internal"} · ${o.status}`,
              to: `${operationPaths[o.type]}?operation=${encodeURIComponent(o.id)}`,
              icon: ClipboardList,
            }))
        : [],
    },
    {
      label: "Warehouses",
      items: term
        ? (state?.warehouses || [])
            .filter((w) => matches(w.name, w.code, w.location))
            .slice(0, 5)
            .map((w) => ({
              id: w.id,
              title: w.name,
              subtitle: `${w.code} · ${w.location}`,
              to: `/warehouses?q=${encodeURIComponent(w.code)}`,
              icon: Warehouse,
            }))
        : [],
    },
  ].filter((group) => group.items.length);
  const first = groups[0]?.items[0];

  function resultKeys(event) {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const links = [...resultsRef.current.querySelectorAll("a")];
    const index = links.indexOf(document.activeElement);
    if (event.key === "ArrowUp" && index === 0) inputRef.current?.focus();
    else
      links[
        (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) %
          links.length
      ]?.focus();
  }

  return (
    <Modal
      title="Search"
      description="Find products, operations, warehouses, or pages."
      onClose={onClose}
    >
      <form
        role="search"
        aria-label="Global search"
        onSubmit={(event) => {
          event.preventDefault();
          if (first) {
            navigate(first.to);
            onClose();
          }
        }}
      >
        <div className="flex items-center gap-2.5 rounded-lg border border-[#d9e4d2] bg-[#f9fbf6] px-3.5 text-[#839676] focus-within:border-[#789d65]">
          <Search size={18} />
          <input
            autoFocus
            ref={inputRef}
            type="search"
            aria-label="Search across StockSense"
            placeholder="Search by name, SKU, or reference..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                onClose();
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                resultsRef.current?.querySelector("a")?.focus();
              }
            }}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none! placeholder:text-[#9baa90] max-sm:text-base [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="flex size-6 items-center justify-center rounded hover:bg-[#eaf1e2]"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </form>
      {error && (
        <p role="status" className="mt-3 text-xs text-[#a47d48]">
          Inventory data is unavailable. Page navigation is still available.
        </p>
      )}
      {!state && !error && (
        <p role="status" className="mt-3 text-xs text-[#8a9c7d]">
          Loading inventory…
        </p>
      )}
      <div
        ref={resultsRef}
        onKeyDown={resultKeys}
        className="mt-4 max-h-[min(380px,50dvh)] overflow-y-auto overscroll-contain"
      >
        {groups.length ? (
          groups.map((group) => (
            <section key={group.label} className="mb-4 last:mb-0">
              <h3 className="px-2 pb-2 text-[9px] font-semibold tracking-[1.3px] text-[#97a489] uppercase">
                {group.label}
              </h3>
              <ul>
                {group.items.map(({ id, title, subtitle, to, icon: Icon }) => (
                  <li key={id}>
                    <Link
                      to={to}
                      onClick={onClose}
                      className="group flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-[#f2f7ec] focus:bg-[#f2f7ec]"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#e5eddd] bg-[#f6f9f1] text-[#86a16f]">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-xs font-medium text-[#48613b]">
                          {title}
                        </strong>
                        <small className="mt-1 block truncate text-[10px] text-[#98a68c]">
                          {subtitle}
                        </small>
                      </span>
                      <ArrowUpRight
                        size={14}
                        className="text-[#a6b398] group-hover:text-[#628748]"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <div className="py-10 text-center">
            <Search size={25} className="mx-auto mb-3 text-[#aebca0]" />
            <p className="text-sm font-medium text-[#627c50]">
              No results found
            </p>
            <p className="mt-2 text-xs text-[#98a68b]">
              Try a different name, SKU, or reference.
            </p>
          </div>
        )}
      </div>
      <p className="mt-4 border-t border-[#edf1e6] pt-3 text-[10px] text-[#a0ad92]">
        ↑ ↓ to browse · Enter to open · Esc to close
      </p>
    </Modal>
  );
}
