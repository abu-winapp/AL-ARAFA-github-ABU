const CHECKOUT_KEY = "checkoutAllowed";
const PROCESSING_KEY = "processingAllowed";

export function allowCheckout() {
  sessionStorage.setItem(CHECKOUT_KEY, "true");
}

export function canOpenCheckout() {
  return sessionStorage.getItem(CHECKOUT_KEY) === "true";
}

export function clearCheckout() {
  sessionStorage.removeItem(CHECKOUT_KEY);
}

export function allowProcessing() {
  sessionStorage.setItem(PROCESSING_KEY, "true");
}

export function canOpenProcessing() {
  return sessionStorage.getItem(PROCESSING_KEY) === "true";
}

export function clearProcessing() {
  sessionStorage.removeItem(PROCESSING_KEY);
}