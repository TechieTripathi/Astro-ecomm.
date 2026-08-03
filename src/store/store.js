import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "./wishlistSlice";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";
import compareReducer from "./compareSlice";
import themeReducer from "./themeSlice";
import editableStyleReducer from "./editableStyleSlice";
import referralReducer from "./referralSlice";
import festivalReducer from "./festivalSlice";
import categoriesReducer from "./categoriesSlice";
import ordersReducer from "./ordersSlice";
import productsReducer from "./productsSlice";
import recentlyViewedReducer from "./recentlyViewedSlice";
import bannerReducer from "./bannerSlice";
import policyReducer from "./policySlice";
import reviewReducer from "./reviewSlice";
import { loadingMiddleware } from "./loadingMiddleware";
import { errorNotificationMiddleware } from "./errorNotificationMiddleware";
import cartUiReducer from "./cartUiSlice";
import couponReducer from "./couponSlice";
import footerReducer from "./footerSlice";
import aboutPageReducer from "./aboutPageSlice";

const channel = typeof BroadcastChannel === "undefined"
  ? null
  : new BroadcastChannel("app_state_sync");

const syncedActionTypes = new Set([
  "auth/logoutUser",
  "cart/clearCartSession",
  "wishlist/clearWishlist",
  "theme/setBgColor",
  "theme/resetBgColor",
]);

const isSafeSyncedAction = (action) => {
  if (!action || typeof action !== "object" || !syncedActionTypes.has(action.type)) {
    return false;
  }

  if (action.type === "theme/setBgColor") {
    return typeof action.payload === "string" && /^#[\da-f]{6}$/i.test(action.payload);
  }

  return action.payload === undefined;
};

const syncMiddleware = () => (next) => (action) => {
  // If the action came from another tab, process it normally without rebroadcasting
  if (action.meta?.fromChannel) {
    return next(action);
  }

  // Process the action locally first
  const result = next(action);

  // Broadcast local actions to other tabs (ignore internal Redux actions)
  if (channel && isSafeSyncedAction(action)) {
    channel.postMessage({ type: action.type, payload: action.payload });
  }

  return result;
};

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    cart: cartReducer,
    auth: authReducer,
    compare: compareReducer,
    theme: themeReducer,
    editableStyle: editableStyleReducer,
    referral: referralReducer,
    festival: festivalReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    products: productsReducer,
    recentlyViewed: recentlyViewedReducer,
    banner: bannerReducer,
    policies: policyReducer,
    reviews: reviewReducer,
    cartUi: cartUiReducer,
    coupon: couponReducer,
    footer: footerReducer,
    aboutPage: aboutPageReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(
      loadingMiddleware,
      errorNotificationMiddleware,
      syncMiddleware,
    ),
});

// Listen for actions from other tabs and dispatch them locally
if (channel) channel.onmessage = (event) => {
  const action = event.data;
  if (isSafeSyncedAction(action)) {
    store.dispatch({
      type: action.type,
      payload: action.payload,
      meta: { fromChannel: true },
    });
  }
};
