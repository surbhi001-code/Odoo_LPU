const metricColors = {
  green: "green bg-[#edf5e9] text-[#688958]",
  amber: "amber bg-[#fff5e6] text-[#c29751]",
  blue: "bg-[#eaf2f8] text-[#7198b8]",
  purple: "bg-[#f0edfa] text-[#9b87bd]",
  gray: "bg-[#edf2ef] text-[#769582]",
};
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  TriangleAlert,
  Plus,
  ArrowUpRight,
  ChevronRight,
  SlidersHorizontal,
  Check,
  Warehouse,
  Activity,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import { useWorkspace } from "../../lib/workspaceContext";
import {
  operationTypes,
  statuses,
  totalStock,
  stockStatus,
  formatDate,
} from "../../lib/inventory";
import OperationsTable from "../operations/components/OperationsTable";
import OperationForm from "../operations/components/OperationForm";
import OperationDetails from "../operations/components/OperationDetails";
export default function DashboardPage() {
  const { state } = useWorkspace();
  const [createType, setCreateType] = useState("");
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    warehouse: "",
    category: "",
  });
  const pending = (type) =>
    state.operations.filter(
      (o) => o.type === type && !["Done", "Canceled"].includes(o.status),
    ).length;
  const attention = state.products.filter((p) => stockStatus(p) !== "In stock");
  const metrics = [
    [
      "Products in stock",
      state.products.filter((p) => totalStock(p) > 0).length,
      Package,
      "green",
      `${state.products.length} products in your catalog`,
      "/products",
    ],
    [
      "Stock alerts",
      attention.length,
      TriangleAlert,
      "amber",
      "Low stock & out of stock",
      "/products?stock=attention",
    ],
    [
      "Pending receipts",
      pending("Receipt"),
      ArrowDownToLine,
      "blue",
      "Incoming stock to receive",
      "/operations/receipts",
    ],
    [
      "Pending deliveries",
      pending("Delivery"),
      ArrowUpFromLine,
      "purple",
      "Orders awaiting dispatch",
      "/operations/deliveries",
    ],
    [
      "Scheduled transfers",
      pending("Transfer"),
      ArrowLeftRight,
      "gray",
      "Moving between locations",
      "/operations/transfers",
    ],
  ];
  const filtered = Object.values(filters).some(Boolean);
  const rows = state.operations.filter(
    (o) =>
      (!filters.type || o.type === filters.type) &&
      (!filters.status || o.status === filters.status) &&
      (!filters.warehouse ||
        o.warehouseId === filters.warehouse ||
        o.destinationId === filters.warehouse) &&
      (!filters.category ||
        o.lines.some(
          (line) =>
            state.products.find((p) => p.id === line.productId)?.category ===
            filters.category,
        )),
  );
  const filter = (key) => ({
    value: filters[key],
    onChange: (e) => setFilters({ ...filters, [key]: e.target.value }),
  });
  const steps = [
    {
      title: "Set up a warehouse",
      text: "Give your inventory a home",
      done: state.warehouses.length > 0,
      to: "/warehouses",
      icon: Warehouse,
    },
    {
      title: "Add your products",
      text: "Build your product catalog",
      done: state.products.length > 0,
      to: "/products",
      icon: Package,
    },
    {
      title: "Receive your first stock",
      text: "Bring your workspace to life",
      done: state.operations.some(
        (o) => o.type === "Receipt" && o.status === "Done",
      ),
      to: "/operations/receipts",
      icon: ArrowDownToLine,
    },
  ];
  const completed = steps.filter((s) => s.done).length;
  return (
    <>
      <PageHeader
        title="Inventory overview"
      >
        <Button onClick={() => setCreateType("Receipt")}>
          <Plus size={17} />
          New operation
        </Button>
      </PageHeader>
      <div className="grid grid-cols-10 gap-3.5 mb-5 max-[1250px]:grid-cols-6 max-[800px]:grid-cols-2 max-[800px]:gap-3 max-[520px]:gap-2.5 max-[520px]:mb-4">
        {metrics.map(([title, value, Icon, color, caption, link], index) => (
          <Link
            to={link}
            className={`metric-card group relative col-span-2 flex min-h-[140px] flex-col overflow-hidden rounded-xl border border-[#dce5df] bg-white p-4 shadow-[0_3px_10px_#173b2910] transition duration-200 hover:-translate-y-0.5 hover:border-[#94b39c] hover:shadow-[0_8px_22px_#173b2914] max-[1250px]:min-h-[132px] max-[800px]:col-span-1 max-[520px]:min-h-[128px] max-[520px]:p-3.5 ${
              index > 2
                ? "max-[1250px]:col-span-3 max-[800px]:col-span-1"
                : "max-[1250px]:col-span-2"
            } ${index === metrics.length - 1 ? "max-[520px]:col-span-2" : ""}`}
            key={title}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[#7fa487]" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-[9px] ${metricColors[color]}`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <p className="text-[12px] leading-[1.35] font-semibold text-[#43594b]">
                  {title}
                </p>
              </div>
              <span className="grid size-7 shrink-0 place-items-center rounded-full text-[#8fa096] transition group-hover:bg-[#edf4ef] group-hover:text-[#426b50]">
                <ArrowUpRight size={15} />
              </span>
            </div>
            <strong className="mt-2.5 block font-sans text-[30px] leading-none font-[750] tracking-[-1.2px] text-[#1f3b2d] max-[520px]:text-[28px]">
              {value.toLocaleString()}
            </strong>
            <span className="mt-auto border-t border-[#edf1ee] pt-2 text-[10px] leading-[1.4] font-medium text-[#6c7d72] max-[520px]:text-[9px]">
              {caption}
            </span>
          </Link>
        ))}
      </div>
      {completed < 3 && (
        <section className="relative overflow-hidden bg-[#edf3e8] border border-[#d7e3cf] grid grid-cols-[1fr_1.13fr_0.66fr] gap-5 py-5 px-6 rounded-[9px] min-h-[190px] mb-4 [&_.eyebrow]:text-[9px] [&_.eyebrow]:text-[#5f7955] [&_h2]:text-[21px] [&_h2]:leading-[1.4] [&_h2]:tracking-[-0.7px] [&_h2]:text-[#294a31] [&_h2]:font-[750] [&_p]:text-[11px] [&_p]:text-[#65775f] [&_p]:mt-1.5 min-[1600px]:grid-cols-[1fr_1.2fr_0.8fr] max-[1250px]:gap-4 max-[1250px]:p-5 max-[1250px]:grid-cols-[1fr_1.15fr_0.6fr] max-[1250px]:[&_h2]:text-[20px] max-[1050px]:grid-cols-[1fr_1.15fr] max-[800px]:p-5 max-[800px]:gap-4 max-[800px]:[&_h2]:text-[20px] max-[520px]:block max-[520px]:p-5 max-[520px]:[&_h2]:text-[20px] max-[520px]:[&_h2]:leading-[1.4] max-[520px]:[&_h2_br]:hidden max-[520px]:[&_p]:mt-[7px]">
          <div>
            <span className="eyebrow text-[9px] font-[650] tracking-[1.55px] text-[#7f9587] mb-[7px]">
              LET’S GET YOU STARTED
            </span>
            <h2>
              A well-organized
              <br />
              {" inventory starts here."}
            </h2>
            <p>Three small steps. One clear picture.</p>
            <div className="flex items-center gap-2 mt-3 [&>div]:w-[83px] [&>div]:h-1 [&>div]:rounded-[5px] [&>div]:bg-[#d9e5cf] [&>div]:overflow-hidden [&>div>span]:block [&>div>span]:h-full [&>div>span]:bg-[#678b55] [&_small]:text-[10px] [&_small]:font-medium [&_small]:text-[#65785d] max-[520px]:mt-[13px]">
              <div>
                <span
                  className={["w-0", "w-1/3", "w-2/3", "w-full"][completed]}
                />
              </div>
              <small>{completed} of 3 complete</small>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 justify-center max-[520px]:mt-[19px]">
            {steps.map((step, index) => (
              <Link
                to={step.to}
                className={`flex items-center gap-3 bg-[#ffffffb8] border border-[#d8e3d2] rounded-[7px] py-2.5 px-3 transition duration-150 hover:bg-white [&_strong]:text-[11px] [&_strong]:text-[#314b38] [&_strong]:font-semibold [&_strong]:block [&_small]:text-[10px] [&_small]:text-[#6f7f69] [&_small]:block [&_small]:mt-0.5 [&>svg]:ml-auto [&>svg]:text-[#78906b] [&.done_.step-number]:bg-[#d3e8bd] [&.done_.step-number]:text-[#3b6537] max-[520px]:p-3 max-[520px]:[&_strong]:text-[11px] max-[520px]:[&_small]:text-[10px] ${step.done ? "done" : ""}`}
                key={step.title}
              >
                <span className="step-number h-[27px] w-[27px] grid place-items-center bg-[#ecf2e5] rounded-[6px] text-[#87a26e] text-[10px] font-semibold">
                  {step.done ? <Check size={17} /> : `0${index + 1}`}
                </span>
                <div>
                  <strong>{step.title}</strong>
                  <small>{step.text}</small>
                </div>
                <ChevronRight size={17} />
              </Link>
            ))}
          </div>
          <div
            className="relative self-center h-42.5 min-w-37.5 min-[1600px]:justify-self-center min-[1600px]:w-47.5 max-[1250px]:scale-85 max-[1250px]:origin-left max-[1050px]:hidden"
            aria-hidden="true"
          >
            <div className="absolute h-[165px] w-[165px] border border-[#cbd9c0] border-dashed rounded-full left-0 top-0" />
            <div className="absolute bottom-[15px] left-3 w-37.5 h-15 rounded-full bg-[#dfe9d1] rotate-[-10deg]" />
            <div className="absolute grid place-items-center rounded-[13px] border border-[#aec798] shadow-[8px_9px_0_#92ad752b] rotate-[10deg] bg-[linear-gradient(140deg,_#eef3df,_#d6e3bb)] text-[#86a36b] [&_svg]:w-[57px] [&_svg]:h-[57px] [&_svg]:stroke-1 w-[73px] h-19 left-[73px] top-5.5">
              <Package />
            </div>
            <div className="absolute grid place-items-center rounded-[13px] border border-[#aec798] shadow-[8px_9px_0_#92ad752b] rotate-[-8deg] bg-[linear-gradient(140deg,_#e3eed3,_#c3d9a7)] text-[#86a36b] [&_svg]:w-[71px] [&_svg]:h-[71px] [&_svg]:stroke-1 w-[91px] h-22 left-6 top-[57px]">
              <Package />
            </div>
            <span className="absolute bg-white text-[#6a9551] w-8 h-8 rounded-full border border-[#dde7d4] grid place-items-center left-[117px] top-24.5 shadow-[0_5px_8px_#72945a14]">
              <Check size={20} />
            </span>
            <span className="absolute left-[21px] top-5 text-[21px] text-[#a5bb88]">
              ✦
            </span>
            <span className="absolute w-[5px] h-[5px] bg-[#b8ca9f] rounded-full left-[149px] top-16.5" />
          </div>
        </section>
      )}
      <section className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502]">
        <div className="panel-heading pt-4.5 px-5 pb-3.5 flex items-center justify-between gap-3 [&_p]:text-[11px] [&_p]:text-[#6f7d73] [&_p]:mt-1 [&_h2]:text-[17px] [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2 max-[1050px]:p-4 max-[520px]:pt-4 max-[520px]:px-[15px] max-[520px]:pb-3 max-[520px]:[&_h2]:text-[15px]">
          <div>
            <h2>
              Operations overview{" "}
              <span className="font-sans inline-flex items-center justify-center text-[9px] min-w-[21px] h-5 py-0 px-1.5 bg-[#f0f4ef] border border-[#e7eee3] text-[#89997e] rounded-[5px] tracking-[0]">
                {state.operations.length}
              </span>
            </h2>
            <p>Every incoming, outgoing, and in-between.</p>
          </div>
          <span className="text-[#68776b] text-[10px] font-medium whitespace-nowrap [&_.live-dot]:w-[5px] [&_.live-dot]:h-[5px] [&_.live-dot]:bg-[#87ad74] max-[1050px]:hidden">
            <span className="live-dot w-1.5 h-1.5 bg-[#82af70] rounded-full inline-block mr-1.5" />
            Your latest operations
          </span>
        </div>
        <div className="pt-0 px-5 pb-3.5 flex items-center gap-2 flex-wrap [&_select]:appearance-auto [&_select]:border [&_select]:border-[#dce5df] [&_select]:rounded-[5px] [&_select]:py-[7px] [&_select]:pr-[23px] [&_select]:pl-2.5 [&_select]:bg-white [&_select]:text-[11px] [&_select]:font-medium [&_select]:text-[#52665a] [&_select]:min-w-30.5 [&_select]:max-w-55 [&_select]:h-8.5 [&_select:first-of-type]:min-w-[153px] max-[520px]:pt-0 max-[520px]:px-[15px] max-[520px]:pb-[15px] max-[520px]:grid max-[520px]:grid-cols-2 max-[520px]:gap-2 max-[520px]:[&_select]:min-w-0 max-[520px]:[&_select]:w-full max-[520px]:[&_select]:max-w-full max-[520px]:[&_select]:text-[10px] max-[520px]:[&_select]:p-[7px] max-[520px]:[&_select]:h-8 max-[520px]:[&_select:first-of-type]:min-w-0 max-[520px]:[&_select:first-of-type]:w-full max-[520px]:[&_select:first-of-type]:max-w-full max-[520px]:[&_select:first-of-type]:text-[10px] max-[520px]:[&_select:first-of-type]:p-[7px] max-[520px]:[&_select:first-of-type]:h-8">
          <span className="flex items-center gap-[7px] text-[11px] font-medium text-[#607166] mr-1 max-[1050px]:hidden">
            <SlidersHorizontal size={16} />
            Filter by
          </span>
          <select aria-label="Filter by document type" {...filter("type")}>
            <option value="">All document types</option>
            {operationTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <select aria-label="Filter by status" {...filter("status")}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select aria-label="Filter by warehouse" {...filter("warehouse")}>
            <option value="">All warehouses</option>
            {state.warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select aria-label="Filter by category" {...filter("category")}>
            <option value="">All categories</option>
            {[...new Set(state.products.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {filtered && (
            <button
              className="text-link bg-transparent border-0 border-transparent p-0 inline-flex items-center gap-1.5 text-[#648853] text-[10px] font-[550] hover:text-[#254f2d] hover:underline"
              onClick={() =>
                setFilters({
                  type: "",
                  status: "",
                  warehouse: "",
                  category: "",
                })
              }
            >
              Clear
            </button>
          )}
        </div>
        <OperationsTable
          rows={rows.slice(0, 8)}
          state={state}
          onSelect={setSelected}
          filtered={filtered}
          onCreate={() => setCreateType("Receipt")}
        />
        <div className="py-3 px-[21px] border-t border-t-[#edf0e9] flex justify-between gap-3 text-[9px] text-[#a0ab98] [&>span]:text-[8px] [&>span]:text-[#a8b19f] max-[520px]:py-3 max-[520px]:px-[15px] max-[520px]:[&>span]:hidden">
          Showing {Math.min(rows.length, 8)} of {rows.length} operations
          <span>All your stock activity, in one place</span>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-[19px] mt-[21px] [&_.panel-heading]:pt-4.5 [&_.panel-heading]:px-5 [&_.panel-heading]:pb-3 [&_.text-link]:text-[9px] max-[1050px]:gap-3.5 max-[1050px]:[&_.panel-heading]:flex-wrap max-[520px]:grid-cols-1 max-[520px]:gap-4">
        <section className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502]">
          <div className="panel-heading pt-[21px] px-[21px] pb-4.5 flex items-center justify-between gap-3 [&_p]:text-[10px] [&_p]:text-[#909a92] [&_p]:mt-[7px] [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px] max-[1050px]:p-4.5 max-[520px]:pt-4.5 max-[520px]:px-[15px] max-[520px]:pb-[15px] max-[520px]:[&_h2]:text-[14px]">
            <div className="flex items-center gap-[9px] text-[#9bad88] [&_h2]:text-[#405437] [&_h2]:text-[13px]">
              <TriangleAlert size={18} />
              <h2>Stock watch</h2>
              {attention.length > 0 && (
                <span className="font-sans inline-flex items-center justify-center text-[9px] min-w-[21px] h-5 py-0 px-1.5 bg-[#f0f4ef] border border-[#e7eee3] text-[#89997e] rounded-[5px] tracking-[0]">
                  {attention.length}
                </span>
              )}
            </div>
            <Link
              to="/products?stock=attention"
              className="text-link bg-transparent border-0 border-transparent p-0 inline-flex items-center gap-1.5 text-[#648853] text-[10px] font-[550] hover:text-[#254f2d] hover:underline"
            >
              View products
              <ArrowUpRight size={14} />
            </Link>
          </div>
          {attention.length ? (
            <div className="pt-0 px-5 pb-3 [&>a]:flex [&>a]:items-center [&>a]:justify-between [&>a]:py-3.5 [&>a]:px-0 [&>a]:border-b [&>a]:border-b-[#edf1e8] [&>a]:text-[11px] [&>a]:gap-2.5 [&_strong]:block [&_strong]:text-[11px] [&_strong]:font-medium [&_small]:block [&_small]:text-[9px] [&_small]:text-[#99a48c] [&_small]:mt-1.5">
              {attention.slice(0, 4).map((p) => (
                <Link
                  to={`/products?q=${encodeURIComponent(p.sku)}`}
                  key={p.id}
                >
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {totalStock(p)} {p.unit} on hand · Reorder at{" "}
                      {p.reorderLevel}
                    </small>
                  </span>
                  <Badge>{stockStatus(p)}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              icon={Package}
              title={
                state.products.length
                  ? "Your stock is in good shape"
                  : "Stay a step ahead of low stock"
              }
              description={
                state.products.length
                  ? "All products are above their reorder levels."
                  : "Add products and reorder levels to see stock alerts here."
              }
            />
          )}
        </section>
        <section className="bg-white border border-[#e7ece9] rounded-[9px] overflow-hidden shadow-[0_2px_3px_#153a2502]">
          <div className="panel-heading pt-[21px] px-[21px] pb-4.5 flex items-center justify-between gap-3 [&_p]:text-[10px] [&_p]:text-[#909a92] [&_p]:mt-[7px] [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px] max-[1050px]:p-4.5 max-[520px]:pt-4.5 max-[520px]:px-[15px] max-[520px]:pb-[15px] max-[520px]:[&_h2]:text-[14px]">
            <div className="flex items-center gap-[9px] text-[#9bad88] [&_h2]:text-[#405437] [&_h2]:text-[13px]">
              <Activity size={18} />
              <h2>Recent activity</h2>
            </div>
            <Link
              to="/movements"
              className="text-link bg-transparent border-0 border-transparent p-0 inline-flex items-center gap-1.5 text-[#648853] text-[10px] font-[550] hover:text-[#254f2d] hover:underline"
            >
              View history
              <ArrowUpRight size={14} />
            </Link>
          </div>
          {state.movements.length ? (
            <div className="pt-0 px-5 pb-3 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:py-3.5 [&>div]:px-0 [&>div]:border-b [&>div]:border-b-[#edf1e8] [&>div]:text-[11px] [&>div]:gap-2.5 [&_strong]:block [&_strong]:text-[11px] [&_strong]:font-medium [&_small]:block [&_small]:text-[9px] [&_small]:text-[#99a48c] [&_small]:mt-1.5 [&>div>span:nth-child(2)]:flex-1 [&_b]:text-[11px] [&_b]:text-[#729357]">
              {state.movements.slice(0, 4).map((m) => (
                <div key={m.id}>
                  <span className="bg-[#f0f5e9] rounded-[7px] w-[31px] h-[31px] grid place-items-center text-[#8ea47b]">
                    <ArrowLeftRight size={16} />
                  </span>
                  <span>
                    <strong>
                      {state.products.find((p) => p.id === m.productId)?.name}
                    </strong>
                    <small>
                      {m.reference} · {formatDate(m.createdAt)}
                    </small>
                  </span>
                  <b>
                    {m.quantity > 0 ? "+" : ""}
                    {m.quantity}
                  </b>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              icon={Activity}
              title="Your story is just getting started"
              description="Validated stock movements will appear here as your inventory grows."
            />
          )}
        </section>
      </div>
      {createType && (
        <OperationForm
          initialType={createType}
          onClose={() => setCreateType("")}
        />
      )}
      {selected && (
        <OperationDetails id={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
