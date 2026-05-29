"use client"

import { mockAssets, type GeoAsset } from "@/data/mockAssets"
import {
  ClipboardList,
  AlertTriangle,
  Users,
  Bell,
  Search,
  Menu,
  LayoutDashboard,
  Wrench,
  BarChart3,
  Settings,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Droplets,
  FlaskConical,
  Construction,
  CloudRain,
  type LucideIcon,
} from "lucide-react"
import dynamic from "next/dynamic"
import {
  useState,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// --- Primitives ---

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost"
  size?: "default" | "icon"
}

function Button({
  variant = "default",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:pointer-events-none disabled:opacity-50"
  const variants = {
    default: "bg-cyan-600 text-white hover:bg-cyan-500",
    ghost: "hover:bg-zinc-800 text-zinc-100",
  }
  const sizes = {
    default: "h-9 px-4 py-2",
    icon: "h-9 w-9",
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${className}`}
      {...props}
    />
  )
}

// --- KPI Card ---

type KPICardProps = {
  title: string
  value: number
  icon: LucideIcon
  variant?: "default" | "warning" | "success"
  trend?: { value: number; label: string }
}

function KPICard({ title, value, icon: Icon, variant = "default", trend }: KPICardProps) {
  const variantStyles = {
    default: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30",
    warning: "from-amber-500/20 to-orange-600/10 border-amber-500/30",
    success: "from-emerald-500/20 to-green-600/10 border-emerald-500/30",
  }
  const iconStyles = {
    default: "text-cyan-400",
    warning: "text-amber-400",
    success: "text-emerald-400",
  }

  return (
    <div
      className={`rounded-lg border bg-gradient-to-br p-3 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-zinc-400 sm:text-xs">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold text-zinc-50 sm:text-2xl">{value}</p>
          {trend && (
            <div className="mt-1 flex items-center gap-1">
              {trend.value >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span
                className={`text-[10px] sm:text-xs ${
                  trend.value >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="truncate text-[10px] text-zinc-500 sm:text-xs">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={`shrink-0 rounded-md bg-zinc-900/60 p-2 ${iconStyles[variant]}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  )
}

// --- Tabs & sidebar nav ---

type ActiveTab = "dashboard" | "work-orders" | "analytics" | "settings"

const NAV_ITEMS: { label: string; tab: ActiveTab; icon: LucideIcon }[] = [
  { label: "Dashboard", tab: "dashboard", icon: LayoutDashboard },
  { label: "Work Orders", tab: "work-orders", icon: Wrench },
  { label: "Analytics", tab: "analytics", icon: BarChart3 },
  { label: "Settings", tab: "settings", icon: Settings },
]

type SidebarNavProps = {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <nav className="space-y-1">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Navigation
      </p>
      {NAV_ITEMS.map(({ label, tab, icon: Icon }) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
              isActive
                ? "border-cyan-500/40 bg-cyan-500/15 font-medium text-cyan-400 shadow-sm shadow-cyan-500/10"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}

type WorkOrderStatus = GeoAsset["status"] | "Completed"

type WorkOrderRecord = {
  id: string
  type: GeoAsset["type"]
  status: WorkOrderStatus
  latitude: number
  longitude: number
  description: string
  /** Most recent activity for open/in-progress orders */
  activityDate?: string
  /** Completion date for archived orders */
  completedAt?: string
  /** ISO datetime for real-time activity feed (May 28–29, 2026 timeline) */
  updatedAt?: string
}

const ACTIVE_ORDER_ACTIVITY_DATES: Record<string, string> = {
  "W-102": "May 29, 2026",
  "S-504": "May 29, 2026",
  "WW-301": "May 20, 2026",
  "ST-881": "May 29, 2026",
}

/** Precise timestamps for the 24-hour activity feed */
const WORK_ORDER_UPDATED_AT: Record<string, string> = {
  "W-102": "2026-05-29T13:00:00",
  "S-504": "2026-05-29T10:15:00",
  "ST-881": "2026-05-29T08:00:00",
  "W-245": "2026-05-28T17:30:00",
  "WW-415": "2026-05-29T06:45:00",
}

/** Active field assets + historical completed projects (self-contained for reporting). */
const COMPLETED_WORK_ORDERS: WorkOrderRecord[] = [
  {
    id: "S-401",
    type: "Streets",
    status: "Completed",
    latitude: 35.921,
    longitude: -95.952,
    description: "Completed Pothole Patching - Elm St",
    completedAt: "May 7, 2026",
  },
  {
    id: "W-088",
    type: "Water",
    status: "Completed",
    latitude: 35.915,
    longitude: -95.968,
    description: "Completed Valve Replacement - Oak Ave",
    completedAt: "May 14, 2026",
  },
  {
    id: "WW-220",
    type: "Wastewater",
    status: "Completed",
    latitude: 35.908,
    longitude: -95.975,
    description: "Completed Sewer Line Flush - District 3",
    completedAt: "April 30, 2026",
  },
  {
    id: "ST-712",
    type: "Stormwater",
    status: "Completed",
    latitude: 35.928,
    longitude: -95.945,
    description: "Completed Culvert Inspection - Creek Bend Rd",
    completedAt: "May 1, 2026",
  },
  {
    id: "S-318",
    type: "Streets",
    status: "Completed",
    latitude: 35.919,
    longitude: -95.949,
    description: "Completed Traffic Signal Calibration - 91st & Memorial",
    completedAt: "May 18, 2026",
  },
  // Recent completions (within last 7 days — May 26–28, 2026)
  {
    id: "W-245",
    type: "Water",
    status: "Completed",
    latitude: 35.916,
    longitude: -95.963,
    description: "Completed Hydrant Flow Test - Riverside Dr",
    completedAt: "May 28, 2026",
    updatedAt: "2026-05-28T17:30:00",
  },
  {
    id: "ST-902",
    type: "Stormwater",
    status: "Completed",
    latitude: 35.925,
    longitude: -95.938,
    description: "Completed Drainage Grate Replacement - Peoria Ave",
    completedAt: "May 27, 2026",
  },
  {
    id: "WW-415",
    type: "Wastewater",
    status: "Completed",
    latitude: 35.910,
    longitude: -95.972,
    description: "Completed Manhole Rehabilitation - 81st St",
    completedAt: "May 26, 2026",
    updatedAt: "2026-05-29T06:45:00",
  },
]

const ALL_WORK_ORDERS: WorkOrderRecord[] = [
  ...mockAssets.map((asset) => ({
    ...asset,
    activityDate: ACTIVE_ORDER_ACTIVITY_DATES[asset.id],
    updatedAt: WORK_ORDER_UPDATED_AT[asset.id],
  })),
  ...COMPLETED_WORK_ORDERS.map((order) => ({
    ...order,
    updatedAt: order.updatedAt ?? WORK_ORDER_UPDATED_AT[order.id],
  })),
]

/** Fixed "now" for the May 28–29, 2026 demo timeline */
const ACTIVITY_FEED_NOW = new Date("May 29, 2026 15:00:00")
const ACTIVITY_LOOKBACK_MS = 24 * 60 * 60 * 1000

type DashboardKpis = {
  totalWorkOrdersLast7Days: number
  activeAssetAlerts: number
  crewsDeployed: number
}

const KPI_LOOKBACK_DAYS = 7

function parseWorkOrderDate(value: string): Date {
  return new Date(value)
}

function getWorkOrderReferenceDate(order: WorkOrderRecord): Date | null {
  const raw = order.status === "Completed" ? order.completedAt : order.activityDate
  if (!raw) return null
  return parseWorkOrderDate(raw)
}

function getWorkOrderDisplayDate(order: WorkOrderRecord): string {
  if (order.status === "Completed") {
    return order.completedAt ?? "—"
  }
  return order.activityDate ?? "In progress"
}

function sortWorkOrdersByDateDesc(orders: WorkOrderRecord[]): WorkOrderRecord[] {
  return [...orders].sort((a, b) => {
    const dateA = getWorkOrderReferenceDate(a)
    const dateB = getWorkOrderReferenceDate(b)
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1
    return dateB.getTime() - dateA.getTime()
  })
}

function sortWorkOrdersByDate(
  orders: WorkOrderRecord[],
  order: "desc" | "asc"
): WorkOrderRecord[] {
  const sorted = sortWorkOrdersByDateDesc(orders)
  return order === "desc" ? sorted : [...sorted].reverse()
}

type DepartmentFilter = "All" | GeoAsset["type"]
type StatusFilter = "All" | "Critical" | "Under Maintenance" | "Completed"
type DateSortOrder = "desc" | "asc"

type WorkOrderTableFilters = {
  tabFilter: WorkOrderFilter
  department: DepartmentFilter
  status: StatusFilter
  search: string
  dateSort: DateSortOrder
}

function applyWorkOrderTableFilters(
  orders: WorkOrderRecord[],
  filters: WorkOrderTableFilters
): WorkOrderRecord[] {
  let result = filterWorkOrders(orders, filters.tabFilter)

  if (filters.department !== "All") {
    result = result.filter((order) => order.type === filters.department)
  }

  if (filters.status !== "All") {
    result = result.filter((order) => order.status === filters.status)
  }

  const query = filters.search.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.type.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        order.description.toLowerCase().includes(query) ||
        getWorkOrderDisplayDate(order).toLowerCase().includes(query)
    )
  }

  return sortWorkOrdersByDate(result, filters.dateSort)
}

function isWithinLastNDays(date: Date, days: number, reference = new Date()): boolean {
  const cutoff = new Date(reference)
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - days)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const end = new Date(reference)
  end.setHours(23, 59, 59, 999)
  return target >= cutoff && target <= end
}

function isReportableWorkOrderStatus(order: WorkOrderRecord) {
  return (
    order.status === "Completed" ||
    order.status === "Critical" ||
    order.status === "Under Maintenance"
  )
}

function isWorkOrderInLast7Days(order: WorkOrderRecord, reference = new Date()): boolean {
  const date = getWorkOrderReferenceDate(order)
  if (!date) return false
  return isWithinLastNDays(date, KPI_LOOKBACK_DAYS, reference)
}

function getMapVisibleWorkOrders(
  orders: WorkOrderRecord[],
  reference = new Date()
): WorkOrderRecord[] {
  return orders.filter(
    (order) =>
      isReportableWorkOrderStatus(order) && isWorkOrderInLast7Days(order, reference)
  )
}

function computeDashboardKpis(
  orders: WorkOrderRecord[],
  reference = new Date()
): DashboardKpis {
  const activeOrders = orders.filter(isActiveWorkOrder)

  const totalWorkOrdersLast7Days = orders.filter(
    (order) =>
      isReportableWorkOrderStatus(order) && isWorkOrderInLast7Days(order, reference)
  ).length

  const activeAssetAlerts = activeOrders.length

  const uniqueActiveLocations = new Set(
    activeOrders.map((order) => `${order.latitude.toFixed(3)},${order.longitude.toFixed(3)}`)
  )
  const uniqueActiveTypes = new Set(activeOrders.map((order) => order.type))
  const crewsDeployed = Math.max(uniqueActiveLocations.size, uniqueActiveTypes.size)

  return {
    totalWorkOrdersLast7Days,
    activeAssetAlerts,
    crewsDeployed,
  }
}

type WorkOrderFilter = "active" | "completed" | "all"

function isActiveWorkOrder(order: WorkOrderRecord) {
  return order.status === "Critical" || order.status === "Under Maintenance"
}

function getWorkOrderCategoryCounts() {
  return {
    active: ALL_WORK_ORDERS.filter(isActiveWorkOrder).length,
    completed: ALL_WORK_ORDERS.filter((o) => o.status === "Completed").length,
    all: ALL_WORK_ORDERS.length,
  }
}

function filterWorkOrders(orders: WorkOrderRecord[], filter: WorkOrderFilter) {
  switch (filter) {
    case "active":
      return orders.filter(isActiveWorkOrder)
    case "completed":
      return orders.filter((o) => o.status === "Completed")
    case "all":
      return orders
  }
}

const WORK_ORDER_FILTER_OPTIONS: {
  id: WorkOrderFilter
  label: string
  countKey: keyof ReturnType<typeof getWorkOrderCategoryCounts>
}[] = [
  { id: "active", label: "Active (Last 7 Days)", countKey: "active" },
  { id: "completed", label: "Completed Archive", countKey: "completed" },
  { id: "all", label: "All History", countKey: "all" },
]

function SidebarKpiCards({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="space-y-3">
      <KPICard
        title="Total Work Orders"
        value={kpis.totalWorkOrdersLast7Days}
        icon={ClipboardList}
      />
      <KPICard
        title="Active Asset Alerts"
        value={kpis.activeAssetAlerts}
        icon={AlertTriangle}
        variant="warning"
      />
      <KPICard
        title="Crews Deployed"
        value={kpis.crewsDeployed}
        icon={Users}
        variant="success"
      />
    </div>
  )
}

function MobileKpiCards({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:hidden">
      <KPICard title="Work Orders" value={kpis.totalWorkOrdersLast7Days} icon={ClipboardList} />
      <KPICard
        title="Alerts"
        value={kpis.activeAssetAlerts}
        icon={AlertTriangle}
        variant="warning"
      />
      <KPICard title="Crews" value={kpis.crewsDeployed} icon={Users} variant="success" />
    </div>
  )
}

function StatusTag({ status }: { status: WorkOrderStatus }) {
  const styles: Record<WorkOrderStatus, string> = {
    Critical:
      "border-red-400/60 bg-red-500/25 text-red-200 shadow-sm shadow-red-500/20 ring-1 ring-red-500/30",
    "Under Maintenance":
      "border-amber-400/60 bg-amber-500/25 text-amber-100 shadow-sm shadow-amber-500/20 ring-1 ring-amber-500/30",
    Operational:
      "border-emerald-400/60 bg-emerald-500/25 text-emerald-100 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-500/30",
    Completed:
      "border-emerald-400/60 bg-emerald-600/30 text-emerald-200 shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-500/40",
  }
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  )
}

const DEPARTMENT_COLORS: Record<GeoAsset["type"], string> = {
  Water: "text-cyan-300 bg-cyan-500/10 border-cyan-500/25",
  Wastewater: "text-violet-300 bg-violet-500/10 border-violet-500/25",
  Streets: "text-orange-300 bg-orange-500/10 border-orange-500/25",
  Stormwater: "text-blue-300 bg-blue-500/10 border-blue-500/25",
}

function DepartmentTag({ type }: { type: GeoAsset["type"] }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${DEPARTMENT_COLORS[type]}`}
    >
      {type}
    </span>
  )
}

const FILTER_SELECT_CLASS =
  "h-10 w-full cursor-pointer appearance-none rounded-md border border-zinc-700 bg-zinc-950 bg-[length:16px] bg-[right_0.65rem_center] bg-no-repeat px-3 pr-9 text-sm text-zinc-100 transition-colors hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"

type FilterSelectProps = {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  children: ReactNode
}

function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    <label className="flex min-w-[160px] flex-1 flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className={FILTER_SELECT_CLASS}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        {children}
      </select>
    </label>
  )
}

// --- Work Orders Chart ---

const WORK_ORDER_DATA = [
  { day: "Mon", open: 24, closed: 18 },
  { day: "Tue", open: 28, closed: 22 },
  { day: "Wed", open: 22, closed: 26 },
  { day: "Thu", open: 31, closed: 19 },
  { day: "Fri", open: 27, closed: 24 },
  { day: "Sat", open: 12, closed: 14 },
  { day: "Sun", open: 8, closed: 10 },
]

function WorkOrdersChart() {
  return (
    <div className="flex h-full min-h-[180px] flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="mb-2">
        <h3 className="text-xs font-semibold text-zinc-100">Work Orders</h3>
        <p className="text-[10px] text-zinc-500">Open vs closed — 7 days</p>
      </div>
      <div className="min-h-[140px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={WORK_ORDER_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Bar dataKey="open" name="Open" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="closed" name="Closed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-500" />
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Closed
        </span>
      </div>
    </div>
  )
}

// --- Recent Activity ---

function getWorkOrderUpdatedAt(order: WorkOrderRecord): Date | null {
  if (!order.updatedAt) return null
  const parsed = new Date(order.updatedAt)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isOnMay2829Timeline(date: Date): boolean {
  return (
    date.getFullYear() === 2026 &&
    date.getMonth() === 4 &&
    (date.getDate() === 28 || date.getDate() === 29)
  )
}

function isWithinActivityLookback(date: Date, now: Date): boolean {
  const diffMs = now.getTime() - date.getTime()
  return diffMs >= 0 && diffMs <= ACTIVITY_LOOKBACK_MS
}

function formatRelativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  if (diffMinutes < 1) return "just now"
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  }
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
}

function buildActivityHeadline(order: WorkOrderRecord): string {
  switch (order.status) {
    case "Critical":
      return `${order.id} critical status reported`
    case "Under Maintenance":
      return `${order.id} maintenance update logged`
    case "Completed":
      return `${order.id} work order completed`
    case "Operational":
      return `${order.id} operational check-in recorded`
  }
}

const DEPARTMENT_ACTIVITY_ICONS: Record<
  GeoAsset["type"],
  { Icon: LucideIcon; iconClass: string; bgClass: string }
> = {
  Water: { Icon: Droplets, iconClass: "text-cyan-400", bgClass: "bg-cyan-500/15 ring-cyan-500/30" },
  Wastewater: {
    Icon: FlaskConical,
    iconClass: "text-violet-400",
    bgClass: "bg-violet-500/15 ring-violet-500/30",
  },
  Streets: {
    Icon: Construction,
    iconClass: "text-orange-400",
    bgClass: "bg-orange-500/15 ring-orange-500/30",
  },
  Stormwater: {
    Icon: CloudRain,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/15 ring-blue-500/30",
  },
}

function getRecentActivityFeed(
  orders: WorkOrderRecord[],
  now = ACTIVITY_FEED_NOW
) {
  return orders
    .map((order) => {
      const updatedAt = getWorkOrderUpdatedAt(order)
      if (!updatedAt) return null
      if (!isOnMay2829Timeline(updatedAt) || !isWithinActivityLookback(updatedAt, now)) {
        return null
      }
      return { order, updatedAt }
    })
    .filter((entry): entry is { order: WorkOrderRecord; updatedAt: Date } => entry !== null)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

function RecentActivity() {
  const feedItems = getRecentActivityFeed(ALL_WORK_ORDERS)

  return (
    <div className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <h3 className="text-xs font-semibold text-zinc-100">Recent Activity</h3>
      <p className="mb-2 text-[10px] text-zinc-500">Last 24 hours · May 28–29, 2026</p>
      {feedItems.length === 0 ? (
        <p className="py-4 text-center text-xs text-zinc-500">No field updates in the last 24 hours.</p>
      ) : (
        <ul className="space-y-3">
          {feedItems.map(({ order, updatedAt }) => {
            const { Icon, iconClass, bgClass } = DEPARTMENT_ACTIVITY_ICONS[order.type]
            const relativeTime = formatRelativeTime(updatedAt, ACTIVITY_FEED_NOW)
            const headline = buildActivityHeadline(order)

            return (
              <li key={`${order.id}-${updatedAt.toISOString()}`} className="flex gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${bgClass}`}
                >
                  <Icon className={`h-4 w-4 ${iconClass}`} strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-zinc-200">
                    {headline}
                    <span className="text-zinc-500"> · {relativeTime}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {order.type} · {order.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// --- Map markers ---

const PIN_CONFIG: Record<
  WorkOrderStatus,
  {
    Icon: LucideIcon
    pinClass: string
    iconClass: string
    tailClass: string
    pulse: boolean
  }
> = {
  Critical: {
    Icon: AlertTriangle,
    pinClass: "border-red-300 bg-red-600 shadow-red-500/40",
    iconClass: "text-white",
    tailClass: "border-t-red-600",
    pulse: true,
  },
  "Under Maintenance": {
    Icon: Wrench,
    pinClass: "border-amber-300 bg-amber-500 shadow-amber-500/40",
    iconClass: "text-amber-950",
    tailClass: "border-t-amber-500",
    pulse: false,
  },
  Operational: {
    Icon: CheckCircle2,
    pinClass: "border-emerald-300 bg-emerald-500 shadow-emerald-500/40",
    iconClass: "text-emerald-950",
    tailClass: "border-t-emerald-500",
    pulse: false,
  },
  Completed: {
    Icon: CheckCircle2,
    pinClass:
      "border-emerald-300 bg-emerald-600 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-400/40",
    iconClass: "text-emerald-50",
    tailClass: "border-t-emerald-600",
    pulse: false,
  },
}

function AssetPin({ status }: { status: WorkOrderStatus }) {
  const { Icon, pinClass, iconClass, tailClass, pulse } = PIN_CONFIG[status]

  return (
    <div className="group flex cursor-pointer flex-col items-center">
      {pulse && (
        <span className="absolute h-10 w-10 animate-ping rounded-full bg-red-500/60" />
      )}
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg transition-transform group-hover:scale-110 ${pinClass}`}
      >
        <Icon className={`h-5 w-5 ${iconClass}`} strokeWidth={2.25} />
      </div>
      <div
        className={`-mt-0.5 h-0 w-0 border-x-[7px] border-t-[9px] border-x-transparent ${tailClass}`}
      />
    </div>
  )
}

function AssetPopupCard({ asset }: { asset: WorkOrderRecord }) {
  const statusBadge: Record<WorkOrderStatus, string> = {
    Critical: "bg-red-500/20 text-red-400",
    "Under Maintenance": "bg-amber-500/20 text-amber-400",
    Operational: "bg-emerald-500/20 text-emerald-400",
    Completed: "bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/30",
  }

  return (
    <div className="min-w-[200px] max-w-[240px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-bold tracking-wide text-zinc-50">
          {asset.id}
        </span>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${statusBadge[asset.status]}`}
        >
          {asset.status}
        </span>
      </div>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {asset.type}
      </p>
      <p className="mt-2 text-sm leading-snug text-zinc-200">{asset.description}</p>
    </div>
  )
}

// --- Map ---

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const OKLAHOMA_VIEW = {
  latitude: 35.5,
  longitude: -97.5,
  zoom: 7,
} as const

function OperationsMap() {
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-sm text-zinc-400">
          Set{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </code>{" "}
          in{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200">
            .env.local
          </code>{" "}
          to load the map.
        </p>
      </div>
    )
  }

  return <OperationsMapCanvas />
}

const OperationsMapCanvas = dynamic(
  () =>
    import("react-map-gl/mapbox").then(({ default: Map, Marker, Popup }) => {
      function Canvas() {
        const [selectedAsset, setSelectedAsset] = useState<WorkOrderRecord | null>(null)
        const mapVisibleOrders = getMapVisibleWorkOrders(ALL_WORK_ORDERS)

        return (
          <div className="geo-map-shell h-full min-h-0 overflow-hidden rounded-lg border border-zinc-700/80 shadow-[0_0_40px_-12px_rgba(6,182,212,0.15)]">
            <Map
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={OKLAHOMA_VIEW}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              style={{ width: "100%", height: "100%" }}
              onClick={() => setSelectedAsset(null)}
            >
              {mapVisibleOrders.map((asset) => (
                <Marker
                  key={asset.id}
                  longitude={asset.longitude}
                  latitude={asset.latitude}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    setSelectedAsset(asset)
                  }}
                >
                  <AssetPin status={asset.status} />
                </Marker>
              ))}

              {selectedAsset && (
                <Popup
                  longitude={selectedAsset.longitude}
                  latitude={selectedAsset.latitude}
                  anchor="bottom"
                  offset={16}
                  closeOnClick={false}
                  onClose={() => setSelectedAsset(null)}
                >
                  <AssetPopupCard asset={selectedAsset} />
                </Popup>
              )}
            </Map>
          </div>
        )
      }

      return { default: Canvas }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50">
        <p className="text-sm text-zinc-500">Loading map…</p>
      </div>
    ),
  }
)

// --- Tab views ---

function DashboardView({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid h-auto xl:h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(220px,3fr)]">
      <div className="h-full min-h-[55vh] min-w-0 xl:min-h-0">
        <OperationsMap />
      </div>

      <aside className="flex min-w-0 flex-col gap-4 w-full h-auto">
        <MobileKpiCards kpis={kpis} />

        <div className="min-h-[180px] shrink-0 xl:min-h-[160px] xl:flex-1">
          <WorkOrdersChart />
        </div>

        <RecentActivity />
      </aside>
    </div>
  )
}

function WorkOrdersView() {
  const [orderFilter, setOrderFilter] = useState<WorkOrderFilter>("active")
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>("All")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [dateSort, setDateSort] = useState<DateSortOrder>("desc")
  const [searchQuery, setSearchQuery] = useState("")

  const categoryCounts = getWorkOrderCategoryCounts()
  const filteredOrders = applyWorkOrderTableFilters(ALL_WORK_ORDERS, {
    tabFilter: orderFilter,
    department: departmentFilter,
    status: statusFilter,
    search: searchQuery,
    dateSort,
  })

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 shadow-xl shadow-black/20">
      <div className="border-b border-zinc-800 p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-zinc-50">Work Orders &amp; History</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Active field work and archived municipal project records
        </p>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search by ID, type, status, or description…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 border-zinc-700 bg-zinc-950 pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:flex-1 lg:gap-3">
            <FilterSelect
              label="Sort by Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as DepartmentFilter)}
            >
              <option value="All">All</option>
              <option value="Water">Water</option>
              <option value="Wastewater">Wastewater</option>
              <option value="Streets">Streets</option>
              <option value="Stormwater">Stormwater</option>
            </FilterSelect>

            <FilterSelect
              label="Sort by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Completed">Completed</option>
            </FilterSelect>

            <FilterSelect
              label="Sort by Date"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value as DateSortOrder)}
            >
              <option value="desc">Newest to Oldest</option>
              <option value="asc">Oldest to Newest</option>
            </FilterSelect>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Work order history filters"
          >
            {WORK_ORDER_FILTER_OPTIONS.map(({ id, label, countKey }) => {
              const isSelected = orderFilter === id
              const count = categoryCounts[countKey]
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setOrderFilter(id)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-cyan-500/50 bg-cyan-500/15 font-medium text-cyan-400"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                      isSelected
                        ? "bg-cyan-500/25 text-cyan-300"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-zinc-500 sm:ml-auto">
            Showing{" "}
            <span className="font-medium text-zinc-300">{filteredOrders.length}</span> matching
            record{filteredOrders.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-2 pb-2 lg:px-4 lg:pb-4">
        {filteredOrders.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-sm text-zinc-500">
            No records match this filter.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700/80 bg-zinc-900/90 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-4 min-w-[100px]">Order ID</th>
                  <th className="px-5 py-4 min-w-[120px]">Department</th>
                  <th className="px-5 py-4 min-w-[120px]">Status</th>
                  <th className="px-5 py-4 min-w-[140px]">Activity Date</th>
                  <th className="px-5 py-4 min-w-[150px]">Location</th>
                  <th className="px-5 py-4 min-w-[250px]">Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`group border-b border-zinc-800/70 transition-all duration-150 last:border-b-0 hover:bg-cyan-500/[0.06] hover:shadow-[inset_3px_0_0_0] hover:shadow-cyan-500 ${
                      index % 2 === 1 ? "bg-zinc-900/25" : "bg-transparent"
                    }`}
                  >
                    <td className="px-5 py-5 align-middle lg:px-6 whitespace-nowrap">
                      <span className="font-mono text-sm font-bold tracking-wide text-cyan-400 group-hover:text-cyan-300">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-5 py-5 align-middle whitespace-nowrap">
                      <DepartmentTag type={order.type} />
                    </td>
                    <td className="px-5 py-5 align-middle whitespace-nowrap">
                      <StatusTag status={order.status} />
                    </td>
                    <td className="px-5 py-5 align-middle whitespace-nowrap">
                      <span className="text-sm font-medium text-zinc-300">
                        {getWorkOrderDisplayDate(order)}
                      </span>
                    </td>
                    <td className="px-5 py-5 align-middle font-mono text-xs text-zinc-500 whitespace-nowrap">
                      {order.latitude.toFixed(3)}, {order.longitude.toFixed(3)}
                    </td>
                    <td className="max-w-xs px-5 py-5 align-middle text-sm leading-relaxed text-zinc-300 lg:max-w-md lg:px-6 whitespace-nowrap">
                      {order.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const STATUS_COLORS: Record<GeoAsset["status"], string> = {
  Critical: "#ef4444",
  "Under Maintenance": "#f59e0b",
  Operational: "#10b981",
}

const TYPE_COLORS: Record<GeoAsset["type"], string> = {
  Water: "#06b6d4",
  Wastewater: "#8b5cf6",
  Streets: "#f97316",
  Stormwater: "#3b82f6",
}

function buildStatusChartData() {
  const counts: Record<GeoAsset["status"], number> = {
    Critical: 0,
    "Under Maintenance": 0,
    Operational: 0,
  }
  mockAssets.forEach((a) => {
    counts[a.status] += 1
  })
  return (Object.keys(counts) as GeoAsset["status"][]).map((name) => ({
    name,
    value: counts[name],
    fill: STATUS_COLORS[name],
  }))
}

function buildTypeChartData() {
  const counts: Record<GeoAsset["type"], number> = {
    Water: 0,
    Wastewater: 0,
    Streets: 0,
    Stormwater: 0,
  }
  mockAssets.forEach((a) => {
    counts[a.type] += 1
  })
  return (Object.keys(counts) as GeoAsset["type"][]).map((name) => ({
    name,
    count: counts[name],
    fill: TYPE_COLORS[name],
  }))
}

const HEALTH_TREND_DATA = [
  { month: "Jan", health: 78 },
  { month: "Feb", health: 81 },
  { month: "Mar", health: 76 },
  { month: "Apr", health: 83 },
  { month: "May", health: 79 },
  { month: "Jun", health: 85 },
]

const chartTooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  fontSize: "12px",
}

function AnalyticsView() {
  const statusData = buildStatusChartData()
  const typeData = buildTypeChartData()
  const operationalPct = Math.round(
    (mockAssets.filter((a) => a.status === "Operational").length / mockAssets.length) * 100
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Municipal Asset Health</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Portfolio-wide status, department mix, and health index trends
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Assets", value: mockAssets.length },
          { label: "Critical", value: mockAssets.filter((a) => a.status === "Critical").length },
          {
            label: "In Maintenance",
            value: mockAssets.filter((a) => a.status === "Under Maintenance").length,
          },
          { label: "Health Index", value: `${operationalPct}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-50">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-[320px] flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 lg:min-h-[360px]">
          <h3 className="text-sm font-semibold text-zinc-100">Status Distribution</h3>
          <p className="mb-2 text-xs text-zinc-500">Share of assets by operational state</p>
          <div className="min-h-[260px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex min-h-[320px] flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 lg:min-h-[360px]">
          <h3 className="text-sm font-semibold text-zinc-100">Assets by Department</h3>
          <p className="mb-2 text-xs text-zinc-500">Work orders grouped by utility type</p>
          <div className="min-h-[260px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" name="Assets" radius={[6, 6, 0, 0]}>
                  {typeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex min-h-[280px] flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 lg:col-span-2 lg:min-h-[300px]">
          <h3 className="text-sm font-semibold text-zinc-100">Portfolio Health Index</h3>
          <p className="mb-2 text-xs text-zinc-500">Rolling 6-month composite score (target: 85+)</p>
          <div className="min-h-[220px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HEALTH_TREND_DATA} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[70, 90]}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="health"
                  name="Health Index"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: "#06b6d4", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center">
      <div>
        <Settings className="mx-auto h-10 w-10 text-zinc-600" />
        <h2 className="mt-4 text-lg font-semibold text-zinc-200">Settings</h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          Department preferences, notification rules, and map defaults will be configured here.
        </p>
      </div>
    </div>
  )
}

function getCriticalAlerts(orders: WorkOrderRecord[]): WorkOrderRecord[] {
  return orders.filter((order) => order.status === "Critical")
}

function getCriticalAlertTimestamp(order: WorkOrderRecord): Date | null {
  return getWorkOrderUpdatedAt(order) ?? getWorkOrderReferenceDate(order)
}

function HeaderAlertsBell({ orders }: { orders: WorkOrderRecord[] }) {
  const [showAlerts, setShowAlerts] = useState(false)
  const [hasViewedAlerts, setHasViewedAlerts] = useState(false)
  const [acknowledgedCriticalIds, setAcknowledgedCriticalIds] = useState<string[]>([])
  const alertsRef = useRef<HTMLDivElement>(null)

  const criticalAlerts = getCriticalAlerts(orders)
  const hasUnacknowledgedCritical = criticalAlerts.some(
    (alert) => !acknowledgedCriticalIds.includes(alert.id)
  )
  const showNotificationBadge =
    criticalAlerts.length > 0 && (!hasViewedAlerts || hasUnacknowledgedCritical)

  useEffect(() => {
    if (!showAlerts) return

    function handleClickOutside(event: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlerts(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showAlerts])

  function handleBellClick() {
    setShowAlerts((open) => !open)
    setHasViewedAlerts(true)
    setAcknowledgedCriticalIds(criticalAlerts.map((alert) => alert.id))
  }

  return (
    <div ref={alertsRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Critical asset alerts"
        aria-expanded={showAlerts}
        onClick={handleBellClick}
      >
        <Bell className="h-5 w-5" />
        {showNotificationBadge && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm shadow-red-500/50">
            {criticalAlerts.length}
          </span>
        )}
      </Button>

      {showAlerts && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/40 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="border-b border-zinc-800 px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-100">Critical Alerts</h3>
            <p className="text-[11px] text-zinc-500">Active field emergencies</p>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {criticalAlerts.length === 0 ? (
              <div className="flex items-center gap-3 rounded-md px-3 py-4 text-sm text-zinc-400">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>All systems nominal</span>
              </div>
            ) : (
              <ul className="space-y-1">
                {criticalAlerts.map((alert) => {
                  const timestamp = getCriticalAlertTimestamp(alert)
                  const timeLabel = timestamp
                    ? formatRelativeTime(timestamp, ACTIVITY_FEED_NOW)
                    : "Recently"

                  return (
                    <li
                      key={alert.id}
                      className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-3 transition-colors hover:bg-red-500/10"
                    >
                      <div className="flex gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-bold text-red-300">{alert.id}</p>
                          <p className="mt-1 text-sm leading-snug text-zinc-200">
                            {alert.description}
                          </p>
                          <p className="mt-1.5 text-[11px] text-zinc-500">{timeLabel}</p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Dashboard ---

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")

  const kpis = computeDashboardKpis(ALL_WORK_ORDERS)

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <span className="text-sm font-bold text-white">GO</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold">GeoOps</h1>
                <p className="hidden text-[10px] text-zinc-500 sm:block">Public Works Dept.</p>
              </div>
            </div>
          </div>

          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search work orders, assets, locations..."
                className="h-9 border-zinc-700 bg-zinc-800 pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderAlertsBell orders={ALL_WORK_ORDERS} />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-medium text-white">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 lg:flex">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <SidebarKpiCards kpis={kpis} />
            <div className="flex-1 border-t border-zinc-800 pt-4">
              <SidebarNav activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed top-14 inset-x-0 bottom-0 z-40 lg:hidden h-[calc(100vh-3.5rem)]">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute bottom-0 left-0 top-0 w-72 overflow-y-auto border-r border-zinc-800 bg-zinc-900 p-4">
              <SidebarKpiCards kpis={kpis} />
              <div className="mt-4 border-t border-zinc-800 pt-4">
                <SidebarNav activeTab={activeTab} onTabChange={handleTabChange} />
              </div>
            </aside>
          </div>
        )} 

        <main className="min-w-0 flex-1 p-3 lg:p-4">
          <div className="h-[calc(100vh-3.5rem-1.5rem)] min-h-0 lg:h-[calc(100vh-3.5rem-2rem)]">
            {activeTab === "dashboard" && <DashboardView kpis={kpis} />}
            {activeTab === "work-orders" && <WorkOrdersView />}
            {activeTab === "analytics" && <AnalyticsView />}
            {activeTab === "settings" && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  )
}
