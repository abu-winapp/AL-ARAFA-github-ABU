/**
 * Al-Arafa Restaurant - TypeScript Type Definitions
 * Generated from backend API models
 */

// ===========================
// User & Authentication Types
// ===========================

export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  fullName?: string;
  preferredName?: string;
  profileImageUrl?: string;
  loyaltyPoints: number;
  pointsBalance?: number; // Backend field name
  userType: "customer" | "admin";
  status: "active" | "inactive" | "blocked";
  createdAt: string;
  updatedAt: string;
  // Additional backend fields
  emailVerified?: boolean;
  passwordHash?: string | null;
  role?: string | null;
  totalOrders?: number;
  totalSpent?: number;
  lastLoginAt?: string;
  assignedLocationIds?: string[] | null;
  admin?: boolean;
  customer?: boolean;
  superAdmin?: boolean;
  locationSpecificAdmin?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ===========================
// Menu Types
// ===========================

export interface MenuItem {
  // Core fields
  id: string;
  categoryId: string;
  categoryName: string; // Included from API (joined)
  name: string;
  description: string;
  shortDescription: string;

  // Pricing
  price: number;
  compareAtPrice: number | null; // "was/now" pricing

  // Media
  imageUrl: string | null;

  // Classification
  menuType: "regular" | "catering";
  isVegetarian: boolean;
  isSpicy: boolean;
  spiceLevel: number; // 0-4

  // Logistics
  preparationTimeMins: number;
  minQuantity: number;
  maxQuantity: number;
  servesPeople: string; // e.g., "1-2", "8-10"

  // Customization (not used yet)
  customizations: any | null;

  // Composite/Bundle items
  isComposite?: boolean;

  // Catering package configuration
  isCateringPackage?: boolean;

  // Availability
  isAvailable: boolean;
  availableFrom: string | null; // time-based availability
  availableUntil: string | null;

  // Ordering
  sortOrder: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Legacy fields (for backward compatibility - being phased out)
  category?: Category;
  available?: boolean;
  popular?: boolean;
  customizationsAvailable?: boolean;
  customizationOptions?: CustomizationOption[];
  preparationTime?: number;
  allergens?: string[];
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  menuType: "regular" | "catering";
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  itemCount: number; // included from API

  // Legacy fields (for backward compatibility - being phased out)
  displayOrder?: number;
  active?: boolean;
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: "radio" | "checkbox" | "select";
  required: boolean;
  choices: CustomizationChoice[];
}

export interface CustomizationChoice {
  id: string;
  name: string;
  priceModifier: number;
  available: boolean;
}

export interface LocationMenuOverride {
  id: string;
  locationId: string;
  menuItemId: string;
  overridePrice?: number;
  available: boolean;
}

export interface MenuItemSuggestion {
  id: string;
  menuItemId: string;
  suggestedItemId: string;
  suggestedItem?: MenuItem; // Populated by backend (optional - may not always be included)
  sortOrder: number;
  createdAt: string;
}

export interface CompositeComponent {
  id: string;
  compositeItemId: string;
  componentItemId: string;
  menuItem?: MenuItem; // Populated component details
  quantity: number; // Supports decimals (1.5, 2.5)
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompositeComponentsResponse {
  components: CompositeComponent[];
  componentsTotal?: number; // Sum of (quantity × price)
  bundlePrice?: number; // Composite item's price
  savings?: number; // componentsTotal - bundlePrice
  savingsPercentage?: number; // (savings / componentsTotal) × 100
}

// ===========================
// Cart Types
// ===========================

export interface Cart {
  id: string;
  userId: string;
  locationId?: string;
  locationName?: string;
  fulfillmentType?: "delivery" | "pickup";
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee?: number;
  platformFee?: number;
  gstAmount?: number;
  total?: number;
  selectedDeliveryQuote?: DeliveryQuoteOption;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  itemName: string;
  itemDescription?: string;
  imageUrl?: string;
  isAvailable: boolean;
  menuType: "regular" | "catering";
  quantity: number;
  unitPrice: number;
  customizations?: CartItemCustomization[] | null;
  specialInstructions?: string | null;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
  // Legacy field for backward compatibility
  menuItem?: MenuItem;
  // Legacy field for backward compatibility
  subtotal?: number;
}

export interface CartItemCustomization {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceName: string;
  priceModifier: number;
}

// Backend expects snake_case for customizations when saving to database
export interface CartItemCustomizationBackend {
  option_id: string;
  option_name: string;
  choice_id: string;
  choice_name: string;
  price_modifier: number;
}

export interface AddToCartRequest {
  menuItemId: string;
  quantity: number;
  locationId: string;
  customizations?: CartItemCustomization[];
  specialInstructions?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
  customizations?: CartItemCustomization[];
  specialInstructions?: string;
}

export interface AddToCartResponse {
  suggestedItems: MenuItem[];
  cart: Cart;
}

// ===========================
// Order Types
// ===========================

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  locationId: string;
  location?: Location;
  orderType: "instant" | "catering" | "scheduled" | "regular"; // Updated to match backend, keeping 'regular' for backward compatibility
  fulfillmentType: "delivery" | "pickup";
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  gstAmount: number;
  discountAmount: number;
  promoCode?: string;
  pointsRedeemed: number;
  pointsValue: number;
  total: number;
  deliveryAddress?: UserAddress;
  deliveryInstructions?: string;
  leaveAtDoor: boolean;
  estimatedPreparationTime?: number;
  estimatedDeliveryTime?: string;
  scheduledFor?: string;
  scheduledTimeRange?: string;
  customerNotes?: string;
  kitchenNotes?: string;
  payment?: Payment;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  // Additional backend fields
  locationName?: string;
  pointsDiscount?: number;
  pointsEarned?: number;
  contactName?: string;
  contactPhone?: string;

  // Boolean helper flags (from backend)
  cancelled?: boolean;
  completed?: boolean;
  delivery?: boolean;
  pickup?: boolean;
  instantOrder?: boolean;
  cateringOrder?: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "picked_up"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: MenuItem;
  itemName?: string;
  itemDescription?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  customizations?: CartItemCustomization[];
  specialInstructions?: string;
  subtotal: number;
}

export interface CreateOrderRequest {
  orderType: "instant" | "catering" | "scheduled";
  fulfillmentType: "delivery" | "pickup";
  locationId: string; // Required - pickup location or preparation location
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  items: CreateOrderItem[];
  subtotal: number;
  total: number;
  // Delivery-specific fields (only for delivery orders)
  deliveryAddressId?: string;
  deliveryProvider?: string;
  deliveryFee?: number;
  deliveryQuotationId?: string;
  specialInstructions?: string;
  leaveAtDoorstep?: boolean;
  // Catering scheduling fields
  scheduledDate?: string; // ISO date string (YYYY-MM-DD)
  scheduledTime?: string; // Start time (HH:mm)
  scheduledEndTime?: string; // End time (HH:mm)
  // Optional fields
  customerNotes?: string;
  promoCode?: string;
  pointsRedeemed?: number;
    serviceCharge?: number | string;
  //order_delivery date and time decleration
  order_delivery_date?: string;
  order_delivery_time?: string;
  scheduledDatetime?: string; // ISO datetime string (YYYY-MM-DDTHH:mm:ssZ)
}

export interface CreateOrderItem {
  menuItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customizations?: CartItemCustomization[];
  specialInstructions?: string;
}

// ===========================
// Payment Types
// ===========================

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: "SGD";
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  hitpayPaymentId?: string;
  hitpayReferenceId?: string;
  paymentUrl?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  webhookData?: any;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod =
  | "card"
  | "paynow"
  | "grabpay"
  | "shopeepay"
  | "atome"
  | "apple_pay"
  | "google_pay"
  | "cash";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface PaymentMethodOption {
  type: PaymentMethod;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  fee?: number;
  feePercentage?: number;
}

export interface InitiatePaymentRequest {
  orderId: string;
  paymentMethod?: PaymentMethod;
  savedCardId?: string;
  returnUrl?: string;
  redirectUrl?: string;
}

export interface InitiatePaymentResponse {
  paymentId?: string;
  paymentUrl?: string;
  status?: PaymentStatus;
  requiresAction?: boolean;
  hitpayPaymentId?: string;
  hitpayReferenceId?: string;
  amount?: number;
  currency?: "SGD";
  selectedMethod?: string | null;
  payment?: {
    id: string;
    orderId: string;
    userId: string;
    hitpayPaymentId?: string;
    hitpayReference?: string | null;
    amount: number;
    currency?: string | null;
    paymentMethod?: PaymentMethod | null;
    status: PaymentStatus;
    paymentUrl?: string | null;
    webhookData?: string;
    gatewayResponse?: string;
    gatewayPaymentId?: string;
    refundReason?: string | null;
    paidAt?: string | null;
    refundedAt?: string | null;
    refundAmount?: number | null;
    createdAt: string;
    updatedAt?: string | null;
    orderNumber?: string | null;
  };
}

export interface SavedCard {
  id: string;
  userId: string;
  cardBrand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  nickname?: string;
  hitpayCardToken: string;
  createdAt: string;
}

// ===========================
// Delivery Types
// ===========================

export interface DeliveryBooking {
  id: string;
  orderId: string;
  provider: "lalamove" | "grab_express";
  providerOrderId?: string;
  status: DeliveryStatus;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  driverName?: string;
  driverPhone?: string;
  driverLatitude?: number;
  driverLongitude?: number;
  driverHeading?: number;
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  deliveryFee: number;
  trackingUrl?: string;
  webhookData?: any;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryStatus =
  | "pending"
  | "booked"
  | "driver_assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "failed";

export interface DeliveryQuoteRequest {
  pickupLatitude: number;
  pickupLongitude: number;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryAddress: string;
}

export interface DeliveryQuoteOption {
  provider: "lalamove" | "grab_express";
  providerName: string;
  providerLogo: string;
  quotationId: string;
  fee: number;
  currency: "SGD";
  distance: number;
  distanceUnit: string;
  estimatedMinutes: number;
  estimatedTime: string;
  expiresAt: string;
  available: boolean;
  unavailableReason: string | null;
  vehicleType: string;
}

export interface DeliveryQuotesResponse {
  options: DeliveryQuoteOption[];
  cheapestProvider?: "lalamove" | "grab_express";
  fastestProvider?: "lalamove" | "grab_express";
}

export interface GetDeliveryQuotesRequest {
  pickupLocationId: string;
  deliveryAddressId: string;
}

// ===========================
// Location & Address Types
// ===========================

export interface Location {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
  // Service availability (actual API field names)
  acceptsPickup: boolean;
  acceptsDelivery: boolean;
  // Additional service options
  grabExpressEnabled?: boolean;
  lalamoveEnabled?: boolean;
  // Computed fields
  open?: boolean;
  fullAddress?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Legacy/alternate field names for backward compatibility
  isDeliveryAvailable?: boolean;
  isPickupAvailable?: boolean;
  pickupAvailable?: boolean;
  deliveryAvailable?: boolean;
  operatingHours?: OperatingHours;
  status?: "active" | "inactive" | "temporarily_closed";
}

export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface UserAddress {
  id: string;
  userId: string;
  label?: string; // 'Home', 'Work', 'Other' (capitalized from backend)
  customLabel?: string;
  addressLine1: string;
  addressLine2?: string | null;
  unitNumber?: string | null;
  buildingName?: string | null;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string | null;
  fullAddress?: string;
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string;
  // Legacy fields for backward compatibility
  floorUnit?: string;
  streetAddress?: string;
  country?: string;
  phone?: string;
}

export interface SaveAddressRequest {
  label?: string; // 'Home', 'Work', 'Other'
  customLabel?: string;
  addressLine1: string;
  addressLine2?: string;
  unitNumber?: string;
  buildingName?: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

// ===========================
// Geocoding API Types
// ===========================

export interface GeocodingData {
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  postalCode?: string;
  buildingName?: string;
  roadName?: string;
  success: boolean;
  errorMessage?: string | null;
}

export interface GeocodingResponse {
  success: boolean;
  message?: string;
  data?: GeocodingData;
}

// ===========================
// Promo Code Types
// ===========================

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsageCount?: number;
  currentUsageCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ValidatePromoRequest {
  code: string;
  orderAmount: number;
}

export interface ValidatePromoResponse {
  valid: boolean;
  promoCode?: PromoCode;
  discountAmount?: number;
  message?: string;
}

// ===========================
// Notification Types
// ===========================

export interface Notification {
  id: string;
  userId: string;
  type:
    | "order_update"
    | "delivery_update"
    | "payment_update"
    | "promotional"
    | "general";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface PushTokenRequest {
  token: string;
  platform: "web" | "ios" | "android";
}

// ===========================
// Feedback & FAQ Types
// ===========================

export interface CustomerFeedback {
  id: string;
  userId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFeedbackRequest {
  orderId?: string;
  rating: number;
  comment?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// Loyalty & Points Types
// ===========================

export interface PointsTransaction {
  id: string;
  userId: string;
  orderId: string | null;
  transactionType: "earned" | "redeemed" | "adjusted";
  points: number;
  description: string;
  balanceAfter: number;
  adjustedBy: string | null;
  createdAt: string;
  orderNumber: string | null;
  adjustedByName: string | null;
}

export interface PointsBalance {
  totalEarned: number;
  currentBalance: number;
  totalRedeemed: number;
  userId: string;
  totalAdjusted: number;
}

export interface PointsHistoryResponse {
  transactions: PointsTransaction[];
  total: number;
  size: number;
  page: number;
}

// ===========================
// Settings Types
// ===========================

export interface GSTSettings {
  rate?: number;
  ratePercentage?: string;
  enabled?: boolean;

  // Legacy fields for backward compatibility
  gstPercentage?: number;
  gstEnabled?: boolean;
}

export interface LoyaltySettings {
  points_value: string;
  points_value_description: string;
  min_redemption: string;
  min_redemption_description: string;
  points_per_dollar: string;
  points_per_dollar_description: string;
}

export interface OrderSettings {
  min_order_delivery: string;
  min_order_delivery_description: string;
}

export interface CateringSettings {
  min_lead_hours: string;
  min_lead_hours_description: string;
}

export interface DeliverySettings {
  home_delivery: boolean;
  pick_from_store: boolean;
}


// updated settings structure for service charges
export interface ServiceChargeSettings {
  type: "percentage" | "fixed" | "flat";
  value: string;
}

export interface ChargesSettings {
  service_charge: ServiceChargeSettings;
}


        // "order_hours": {
        //     "server_time": "2026-07-29T13:15:05+08:00",
        //     "timezone": "Asia\/Singapore",
        //     "accepting_orders_now": true,
        //     "windows": [
        //         {
        //             "name": "Morning",
        //             "start": "10:30",
        //             "end": "13:30"
        //         },
        //         {
        //             "name": "Evening",
        //             "start": "15:30",
        //             "end": "22:30"
        //         }
        //     ]

// order-widow 

export interface OrderHoursConfig {
  serverTime: string;
  timezone: string;
  acceptingOrdersNow: boolean;
  windows: OrderTimeWindow[];
}

export interface OrderTimeWindow {
  name: string;
  start: string;
  end: string;
}

export interface AllSettings {
  loyalty?: LoyaltySettings;
  catering?: CateringSettings;
  tax?: {
    gstRate: number;
    gstEnabled: boolean;
  };
  order?: OrderSettings;
  delivery?: DeliverySettings;
  charges?: ChargesSettings;

  order_hours?: OrderHoursConfig;
}

// ===========================
// Lookup-based Settings Types (New API Structure)
// ===========================

export type SettingType =
  | "LOYALTY_CONFIG"
  | "ORDER_CONFIG"
  | "CATERING_CONFIG"
  | "TAX_CONFIG";

export interface LookupDetail {
  id: string;
  lookupMasterId: string;
  lookupCode: string;
  displayValue: string;
  description: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
  lookupType: SettingType;
}

export interface SettingGroup {
  type: SettingType;
  settings: LookupDetail[];
}

export interface UpdateSettingValueRequest {
  displayValue: string;
}

export interface UpdateSettingStatusRequest {
  isActive: boolean;
}

export interface SettingMetadata {
  type?: "string" | "integer" | "decimal" | "boolean";
  unit?: string;
  min?: number;
  max?: number;
}

// ===========================
// API Response Types
// ===========================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Backend pagination response structure (Spring Boot)
export interface BackendPaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// Backend orders pagination response (Spring Boot structure)
export interface BackendOrdersResponse {
  content: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ===========================
// Admin Customer Management Types
// ===========================

export interface UpdateCustomerStatusRequest {
  isActive: boolean;
}

export interface AdjustLoyaltyPointsRequest {
  points: number;
  reason: string;
}



// ===========================
// Catering Package Configuration Types
// ===========================

export interface CateringOptionGroup {
  id: string;
  packageId: string;
  groupName: string; // Internal ID (e.g., "gravy_selection")
  groupLabel: string; // Display name (e.g., "Choose Your Gravy")
  description?: string; // Help text
  minSelections: number; // Minimum required selections
  maxSelections: number; // Maximum allowed selections
  isRequired: boolean; // Customer must make selection
  sortOrder: number; // Display order
  createdAt: string;
  updatedAt: string;
}

export interface CateringOptionItem {
  id: string;
  optionGroupId: string;
  menuItemId: string;
  additionalPrice: number; // Upgrade cost (0 for base)
  isDefault: boolean; // Pre-selected
  sortOrder: number; // Display order
  createdAt: string;
  updatedAt: string;
  // Flattened item details from backend
  itemName?: string;
  itemDescription?: string;
  itemBasePrice?: number;
  itemImageUrl?: string;
  itemIsAvailable?: boolean;
  itemIsVegetarian?: boolean;
  itemCategoryName?: string;
  totalPrice?: number;
  // Legacy: Populated menuItem object (for backwards compatibility)
  menuItem?: MenuItem;
}

export interface CateringOptionGroupWithItems extends CateringOptionGroup {
  options: CateringOptionItem[]; // Backend uses "options", not "items"
  selectionType?: string; // Backend includes this
  selectionRuleText?: string; // Backend includes this
}

// Request payloads
export interface CreateOptionGroupRequest {
  groupName: string;
  groupLabel: string;
  description?: string;
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  sortOrder: number;
}

export interface UpdateOptionGroupRequest {
  groupName?: string;
  groupLabel?: string;
  description?: string;
  minSelections?: number;
  maxSelections?: number;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface AddOptionItemRequest {
  menuItemId: string;
  additionalPrice: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface UpdateOptionItemRequest {
  additionalPrice?: number;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface PartyHallRequest {
  // label?: string; // 'Home', 'Work', 'Other'
  contactName?: string;
  contactNumber: string;
  reserveDate?: string;
  reserveStartTime?: string;
  reserveEndTime?: string;
  remarks?: string;
  alternateContactPerson?: string;
  alternateContactNumber?: string;
  purpose?: string;
}

export interface PartyHallBookingResponse {
  success: boolean;
  message: string;
  data?: string | null | number; // Booking ID or confirmation number
}

// ===========================
// Notification Types
// ===========================

export * from "./notification.types";
