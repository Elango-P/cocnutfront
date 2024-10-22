import { api_url } from "../../config";

const appApi = (path) => {
  return `${api_url}/${path}`;
};

// API call routes
export const endpoints = () => ({
  // User API Routes
  userRoleAPI: appApi("v1/userRole"),
  userPermissionAPI: appApi("v1/user/permission"),
  userRolePermissionAPI: appApi("v1/user/role/permission"),
  userActivityAPI: appApi("v1/userActivity"),
  userAvatarUpdate: appApi("v1/user/updateAvatar"),
  activityTypeApi: appApi("v1/activityType"),

  // Admin API Routes
  companyAPI: appApi("v1/company"),
  productMediaAPI: appApi("v1/store/product/media"),
  portalAPI: appApi("v1/portal"),
  settingAPI: appApi("v1/setting"),

  // Store API Routes
  productAPI: appApi("v1/product"),
  customerAPI: appApi("v1/customer"),
  accountAPI: appApi("v1/account"),
  billAPI: appApi("v1/accounts/bill"),
  brandAPI: appApi("v1/product/brand"),
  categoryAPI: appApi("v1/product/category"),
  locationAPI: appApi("v1/location"),
  storeProductAPI: appApi("v1/storeProduct"),
  itemAPI: appApi("accounts/bill/v1"),
  orderAPI: appApi("v1/order"),
  orderProductAPI: appApi("v1/orderProduct"),
  storeDasboardAPI: appApi("v1/dashboardRoute"),
  inventoryTransferAPI: appApi("v1/transfer"),
  tagApi: appApi("v1/tagApi"),
  countryAPI: appApi("v1/country"),
  attendanceTypeAPI: appApi("v1/attendanceType"),

  // Account API Routes
  purchaseAPI: appApi("accounts/purchase/v1"),

  stockEntry: appApi("v1/stockEntry"),

  stockProductEntry: appApi("v1/stockProductEntry"),

  activityAPI: appApi("activity/v1"),

  transferProduct: appApi("v1/transfer/Product"),

  attendanceAPI: appApi("attendance/v1"),

  MessageAPI: appApi("v1/message"),

  UserAPI: appApi("user/v1"),

  ShiftAPI: appApi("v1/shift"),

  sprintAPI: appApi("v1/sprint"),

  PermissionAPI: appApi("v1/user/role/permission"),

  MediaAPI: appApi("v1/media"),

  SaleSettlementAPI: appApi("v1/saleSettlement"),

  PurchaseAPI: appApi("v1/purchase"),

  PurchaseProductAPI: appApi("v1/purchaseProduct"),

  TransferTypeApi: appApi("v1/transferType"),

  StatusAPI: appApi("v1/status"),

  addressAPI: appApi("v1/address"),

  ActivityAPI: appApi("activity/v1"),

  ActivityTypeApi: appApi("v1/activityType"),

  TicketApi: appApi("v1/ticket"),

  FineBonusApi: appApi("v1/fineBonus"),

  UserDeviceInfoApi: appApi("v1/userDeviceInfo"),

  TransferTypeReasonAPI: appApi("v1/transferTypeReason"),

  HistoryApi: appApi("v1/history"),

  VisitorApi: appApi("v1/visitor"),

  ProductPrice: appApi("v1/productPrice"),

  CandidateProfile: appApi("candidate/v1"),

  Jobs: appApi("jobs/v1"),

  ReplenishmentAPI: appApi("v1/replenishment"),

  UserLocationApi: appApi("v1/userLocation"),

  PaymentApi: appApi("v1/payment"),

  PaymentAccountApi: appApi("v1/paymentAccount"),

  OrderReportAPI: appApi("v1/orderReport"),

  orderSummaryReportAPI: appApi("v1/orderSummaryReport"),

  OrderProductReportAPI: appApi("v1/orderProduct"),

  SettingAPI: appApi("v1/setting"),

  SyncApi: appApi("v1/sync"),

  ForceSync: appApi("v1/forceSync"),

  projectAPI: appApi("v1/project"),

  orderSalesSettlementAPI: appApi("v1/orderSalesSettlementDiscrepancyReport"),

  locationWiseAttendanceAPI: appApi("v1/attendanceReport"),

  projectTicketTypeAPI: appApi("v1/projectTicketType"),

  replenishReportAPI: appApi("v1/replenishReport"),

  stockEntryReportApi: appApi("v1/stockEntryReport"),

  purchaseRecommendationReportAPI: appApi("v1/purchaseRecommendationReport"),

  mobileDashboardApi: appApi("v1/mobileDashboard"),

  accountAgreementAPI: appApi("v1/accountAgreement"),

  accountProductAPI: appApi("v1/accountProduct"),

  accountLoyalty: appApi("v1/accountLoyalty"),

  ratingAPI: appApi("v1/rating"),

  CustomField: appApi("v1/customField"),

  CustomFieldValue: appApi("v1/customFieldValue"),

  Comment: appApi("v1/comment"),

  orderTotal: appApi("v1/orderTotal"),

  LeadApi: appApi("v1/lead"),

  WhatsappAPI: appApi("v1/whatsapp"),

  salaryAPI: appApi("v1/salary"),

  OtpAPI: appApi("v1/otp"),

  ReplenishmentAllocationAPI: appApi("v1/replenishmentAllocation"),

  PublicRoute: appApi("v1/public"),
  customerRoute: appApi("v1/customer"),
  publicPageBlockAPI: appApi("v1/public/pageBlock"),

  customerOrderAPI: appApi("v1/customer/order/create"),
  replenishmentAllocationAPI: appApi("v1/replenishmentAllocation"),

  invoiceAPI: appApi("v1/invoice"),
  invoiceProductAPI: appApi("v1/invoiceProduct"),
  accountTypeAPI: appApi("v1/accountType"),
  contactAPI: appApi("v1/contact"),
  orderTypeAPI: appApi("v1/orderType"),
});
