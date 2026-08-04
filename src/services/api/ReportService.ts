import ApiService from "../ApiService"
import type {
  ReportAggregateResponse,
  ReportFilterRequest,
  ReportListResponse,
} from "./@types/report"
import type {
  EmployeeAttendanceData,
  EmployeeCommissionData,
  EmployeeCommissionItemData,
  EmployeePayrollData,
  EmployeeSummaryData,
  EmployeeTrainerData,
} from "./@types/report-employee"
import type {
  FinanceCashFlowData,
  FinanceLedgerData,
  FinanceReceivableData,
  FinanceRekeningData,
  FinanceSummaryData,
  FinanceTaxData,
} from "./@types/report-finance"
import type {
  MemberAttendanceData,
  MemberLoyaltyData,
  MemberRetentionData,
  MemberSummaryData,
  MemberValueData,
} from "./@types/report-members"
import type {
  ClassData,
  FreezeData,
  MembershipData,
  PackageBreakdownData,
  PackageSummaryData,
  SessionData,
} from "./@types/report-packages"
import type {
  ProductBreakdownData,
  ProductRefundData,
  ProductStockData,
  ProductSummaryData,
  ProductVelocityData,
} from "./@types/report-products"
import type {
  SalesAnalyticData,
  SalesDiscountTaxData,
  SalesEmployeeData,
  SalesItemData,
  SalesPaymentData,
  SalesRefundVoidData,
  SalesSummaryData,
} from "./@types/report-sales"

export type ReportDomain =
  "sales" | "packages" | "products" | "finance" | "members" | "employee"

interface ReportEnvelope<T> {
  data: T
  success: boolean
  status: number
}

function fetchReport<T>(
  domain: ReportDomain,
  slug: string,
  params: ReportFilterRequest
) {
  return ApiService.fetchDataWithAxios<ReportEnvelope<T>>({
    url: `/report/${domain}/${slug}`,
    method: "get",
    params,
  })
}

export async function apiGetSalesSummary(params: ReportFilterRequest) {
  return fetchReport<SalesSummaryData>("sales", "summary", params)
}

export async function apiGetSalesByItem(params: ReportFilterRequest) {
  return fetchReport<SalesItemData>("sales", "by-item", params)
}

export async function apiGetSalesByEmployee(params: ReportFilterRequest) {
  return fetchReport<SalesEmployeeData>("sales", "by-employee", params)
}

export async function apiGetSalesPayment(params: ReportFilterRequest) {
  return fetchReport<SalesPaymentData>("sales", "payment", params)
}

export async function apiGetSalesDiscountTax(params: ReportFilterRequest) {
  return fetchReport<SalesDiscountTaxData>("sales", "discount-tax", params)
}

export async function apiGetSalesRefundVoid(params: ReportFilterRequest) {
  return fetchReport<SalesRefundVoidData>("sales", "refund-void", params)
}

export async function apiGetSalesAnalytic(params: ReportFilterRequest) {
  return fetchReport<SalesAnalyticData>("sales", "analytic", params)
}

export async function apiGetFinanceSummary(params: ReportFilterRequest) {
  return fetchReport<FinanceSummaryData>("finance", "summary", params)
}

export async function apiGetFinanceCashFlow(params: ReportFilterRequest) {
  return fetchReport<FinanceCashFlowData>("finance", "cash-flow", params)
}

export async function apiGetFinanceIncome(params: ReportFilterRequest) {
  return fetchReport<FinanceLedgerData>("finance", "income", params)
}

export async function apiGetFinanceExpense(params: ReportFilterRequest) {
  return fetchReport<FinanceLedgerData>("finance", "expense", params)
}

export async function apiGetFinanceRekening(params: ReportFilterRequest) {
  return fetchReport<FinanceRekeningData>("finance", "rekening", params)
}

export async function apiGetFinanceReceivable(params: ReportFilterRequest) {
  return fetchReport<FinanceReceivableData>("finance", "receivable", params)
}

export async function apiGetFinanceTax(params: ReportFilterRequest) {
  return fetchReport<FinanceTaxData>("finance", "tax", params)
}

export async function apiGetPackageSummary(params: ReportFilterRequest) {
  return fetchReport<PackageSummaryData>("packages", "summary", params)
}

export async function apiGetPackageByPackage(params: ReportFilterRequest) {
  return fetchReport<PackageBreakdownData>("packages", "by-package", params)
}

export async function apiGetPackageMembership(params: ReportFilterRequest) {
  return fetchReport<MembershipData>("packages", "membership", params)
}

export async function apiGetPackageSessions(params: ReportFilterRequest) {
  return fetchReport<SessionData>("packages", "sessions", params)
}

export async function apiGetPackageFreeze(params: ReportFilterRequest) {
  return fetchReport<FreezeData>("packages", "freeze", params)
}

export async function apiGetPackageClasses(params: ReportFilterRequest) {
  return fetchReport<ClassData>("packages", "classes", params)
}

export async function apiGetMemberSummary(params: ReportFilterRequest) {
  return fetchReport<MemberSummaryData>("members", "summary", params)
}

export async function apiGetMemberRetention(params: ReportFilterRequest) {
  return fetchReport<MemberRetentionData>("members", "retention", params)
}

export async function apiGetMemberMembership(params: ReportFilterRequest) {
  return fetchReport<MembershipData>("members", "membership", params)
}

export async function apiGetMemberAttendance(params: ReportFilterRequest) {
  return fetchReport<MemberAttendanceData>("members", "attendance", params)
}

export async function apiGetMemberValue(params: ReportFilterRequest) {
  return fetchReport<MemberValueData>("members", "value", params)
}

export async function apiGetMemberLoyalty(params: ReportFilterRequest) {
  return fetchReport<MemberLoyaltyData>("members", "loyalty", params)
}

export async function apiGetEmployeeSummary(params: ReportFilterRequest) {
  return fetchReport<EmployeeSummaryData>("employee", "summary", params)
}

export async function apiGetEmployeeCommission(params: ReportFilterRequest) {
  return fetchReport<EmployeeCommissionData>("employee", "commission", params)
}

export async function apiGetEmployeeCommissionItem(
  params: ReportFilterRequest
) {
  return fetchReport<EmployeeCommissionItemData>(
    "employee",
    "commission-item",
    params
  )
}

export async function apiGetEmployeeSalesPerformance(
  params: ReportFilterRequest
) {
  return fetchReport<SalesEmployeeData>("employee", "sales-performance", params)
}

export async function apiGetEmployeeTrainer(params: ReportFilterRequest) {
  return fetchReport<EmployeeTrainerData>("employee", "trainer", params)
}

export async function apiGetEmployeeAttendance(params: ReportFilterRequest) {
  return fetchReport<EmployeeAttendanceData>("employee", "attendance", params)
}

export async function apiGetEmployeePayroll(params: ReportFilterRequest) {
  return fetchReport<EmployeePayrollData>("employee", "payroll", params)
}

export async function apiGetProductSummary(params: ReportFilterRequest) {
  return fetchReport<ProductSummaryData>("products", "summary", params)
}

export async function apiGetProductByProduct(params: ReportFilterRequest) {
  return fetchReport<ProductBreakdownData>("products", "by-product", params)
}

export async function apiGetProductStock(params: ReportFilterRequest) {
  return fetchReport<ProductStockData>("products", "stock", params)
}

export async function apiGetProductVelocity(params: ReportFilterRequest) {
  return fetchReport<ProductVelocityData>("products", "velocity", params)
}

export async function apiGetProductRefund(params: ReportFilterRequest) {
  return fetchReport<ProductRefundData>("products", "refund", params)
}

export async function apiGetReportAggregate<T = Record<string, unknown>>(
  domain: ReportDomain,
  slug: string,
  params: ReportFilterRequest
) {
  return ApiService.fetchDataWithAxios<ReportAggregateResponse<T>>({
    url: `/report/${domain}/${slug}`,
    method: "get",
    params,
  })
}

export async function apiGetReportList<T>(
  domain: ReportDomain,
  slug: string,
  params: ReportFilterRequest & Record<string, unknown>
) {
  return ApiService.fetchDataWithAxios<ReportListResponse<T>>({
    url: `/report/${domain}/${slug}`,
    method: "get",
    params,
  })
}
