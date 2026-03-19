import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassHeader from "../../components/GlassHeader";
import { HEADER_OFFSET_BELOW_GLASS } from "../../constants/layout";
import { useCart } from "../../context/CartContext";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
import {
  createCheckout,
  createCheckoutUpdated,
  fetchAllDiscounts,
  fetchAllProductsCollection,
} from "../../api/shopifyApi";
import { Image } from "expo-image";
import { getCustomerInfo } from "../../utils/storage";
import { useGiveaway } from "../../context/GiveawayContext";
import CartConfirmationModal from "../../components/CartConfirmationModal";

const TICKET_ICON_URI =
  "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/admit_one_ticket.png?v=1683922022";
const DEBUG_CART_DISCOUNTS = __DEV__;

function getVipMultiplier(tags) {
  if (!Array.isArray(tags)) return 1;
  if (tags.includes("VIP Platinum")) return 10;
  if (tags.includes("VIP Gold")) return 5;
  if (tags.includes("VIP Silver")) return 2;
  if (tags.includes("Inactive Subscriber")) return 1;
  return 1;
}

const isAutomaticDiscountApplicableToCart = (
  discount,
  cartLines,
  collectionProductIdsByHandle = {},
  collectionVariantIdsByHandle = {}
) => {
  if (!discount || !Array.isArray(cartLines) || cartLines.length === 0) return false;

  const cartProductIds = new Set(
    cartLines
      .map((line) => line?.node?.merchandise?.product?.id)
      .filter(Boolean)
  );
  const cartVariantIds = new Set(
    cartLines.map((line) => line?.node?.merchandise?.id).filter(Boolean)
  );
  const discountType = String(discount?.discountType || "");
  const isBxgy = discountType === "DiscountAutomaticBxgy";

  // For BxGy deals (like FREEJETTAG), treat as applied only when
  // the "get" product is actually in cart (not just when cart qualifies to unlock it).
  if (isBxgy) {
    const eligibleFreeProductIds = [
      ...(discount?.eligibleFreeItems?.productIds || []),
      ...(discount?.customerGets?.items?.products?.nodes?.map((p) => p?.id) || []),
    ].filter(Boolean);

    if (eligibleFreeProductIds.length > 0) {
      return eligibleFreeProductIds.some((id) => cartProductIds.has(id));
    }

    const eligibleFreeCollectionHandles = [
      ...(discount?.eligibleFreeItems?.collections || []),
      ...(discount?.customerGets?.items?.collections?.nodes || []),
    ]
      .map((c) => c?.handle)
      .filter(Boolean);

    if (eligibleFreeCollectionHandles.length > 0) {
      if (eligibleFreeCollectionHandles.includes("all-product")) {
        return cartLines.length > 0;
      }
      return eligibleFreeCollectionHandles.some((handle) => {
        const productIds = collectionProductIdsByHandle[handle];
        const variantIds = collectionVariantIdsByHandle[handle];
        const byProduct =
          productIds && productIds.size > 0
            ? [...cartProductIds].some((id) => productIds.has(id))
            : false;
        const byVariant =
          variantIds && variantIds.size > 0
            ? [...cartVariantIds].some((id) => variantIds.has(id))
            : false;
        return byProduct || byVariant;
      });
    }
  }

  const qualifyingIds = [
    ...(discount?.qualifyingPurchaseItems?.productIds || []),
    ...(discount?.customerBuys?.items?.products?.nodes?.map((p) => p?.id) || []),
  ].filter(Boolean);

  if (qualifyingIds.length > 0) {
    return qualifyingIds.some((id) => cartProductIds.has(id));
  }

  const qualifyingCollections = [
    ...(discount?.qualifyingPurchaseItems?.collections || []),
    ...(discount?.customerBuys?.items?.collections?.nodes || []),
  ]
    .map((c) => c?.handle)
    .filter(Boolean);

  // "all-product" means any cart item qualifies.
  if (qualifyingCollections.includes("all-product")) {
    return cartLines.length > 0;
  }

  // If discount has no explicit qualifiers, treat as applicable.
  if (
    qualifyingIds.length === 0 &&
    qualifyingCollections.length === 0 &&
    !discount?.customerBuys &&
    !discount?.minimumRequirement
  ) {
    return true;
  }

  return false;
};

const parseFreeQuantityFromDiscount = (discount) => {
  const explicitQty =
    discount?.customerGets?.value?.quantity ??
    discount?.raw?.customerGets?.value?.quantity ??
    null;
  if (Number.isFinite(explicitQty) && explicitQty > 0) return explicitQty;

  const summary = String(discount?.summary || "");
  const match = summary.match(/get\s+(\d+)\s+item/i);
  if (match) return Number(match[1]) || 1;
  return 1;
};

const getEstimatedAutomaticDiscountAmount = (
  appliedDiscounts,
  cartLines,
  quantitiesByLineId,
  collectionProductIdsByHandle = {},
  collectionVariantIdsByHandle = {}
) => {
  if (!Array.isArray(appliedDiscounts) || !Array.isArray(cartLines)) return 0;

  let totalDiscount = 0;

  appliedDiscounts.forEach((discount) => {
    const discountType = String(discount?.discountType || "");
    if (discountType !== "DiscountAutomaticBxgy") return;

    const eligibleProductIds = [
      ...(discount?.eligibleFreeItems?.productIds || []),
      ...(discount?.customerGets?.items?.products?.nodes?.map((p) => p?.id) || []),
    ].filter(Boolean);

    const eligibleCollectionHandles = [
      ...(discount?.eligibleFreeItems?.collections || []),
      ...(discount?.customerGets?.items?.collections?.nodes || []),
    ]
      .map((c) => c?.handle)
      .filter(Boolean);

    const candidateUnitPrices = [];

    cartLines.forEach((line) => {
      const productId = line?.node?.merchandise?.product?.id;
      const variantId = line?.node?.merchandise?.id;
      const lineId = line?.node?.id;
      const quantity = quantitiesByLineId?.[lineId] ?? line?.node?.quantity ?? 0;
      const unitPrice = parseFloat(line?.node?.merchandise?.price?.amount) || 0;

      if (!quantity || unitPrice <= 0) return;

      let isEligible = false;
      if (eligibleProductIds.length > 0 && productId) {
        isEligible = eligibleProductIds.includes(productId);
      } else if (eligibleCollectionHandles.length > 0) {
        if (eligibleCollectionHandles.includes("all-product")) {
          isEligible = true;
        } else {
          isEligible = eligibleCollectionHandles.some((handle) => {
            const productIdsInCollection = collectionProductIdsByHandle[handle];
            const variantIdsInCollection = collectionVariantIdsByHandle[handle];
            const byProduct = productId
              ? productIdsInCollection?.has(productId)
              : false;
            const byVariant = variantId
              ? variantIdsInCollection?.has(variantId)
              : false;
            return !!(byProduct || byVariant);
          });
        }
      }

      if (!isEligible) return;

      for (let i = 0; i < quantity; i += 1) {
        candidateUnitPrices.push(unitPrice);
      }
    });

    if (candidateUnitPrices.length === 0) return;

    candidateUnitPrices.sort((a, b) => a - b);
    const freeQty = parseFreeQuantityFromDiscount(discount);
    const discountForRule = candidateUnitPrices
      .slice(0, freeQty)
      .reduce((sum, price) => sum + price, 0);

    totalDiscount += discountForRule;
  });

  return totalDiscount;
};

const getAutomaticDiscountBreakdown = (
  appliedDiscounts,
  cartLines,
  quantitiesByLineId,
  collectionProductIdsByHandle = {},
  collectionVariantIdsByHandle = {}
) => {
  const lineDiscountById = {};
  if (!Array.isArray(appliedDiscounts) || !Array.isArray(cartLines)) {
    return { lineDiscountById, totalDiscount: 0 };
  }

  let totalDiscount = 0;

  appliedDiscounts.forEach((discount) => {
    const discountType = String(discount?.discountType || "");
    if (discountType !== "DiscountAutomaticBxgy") return;

    const eligibleProductIds = [
      ...(discount?.eligibleFreeItems?.productIds || []),
      ...(discount?.customerGets?.items?.products?.nodes?.map((p) => p?.id) || []),
    ].filter(Boolean);

    const eligibleCollectionHandles = [
      ...(discount?.eligibleFreeItems?.collections || []),
      ...(discount?.customerGets?.items?.collections?.nodes || []),
    ]
      .map((c) => c?.handle)
      .filter(Boolean);

    const candidateUnits = [];

    cartLines.forEach((line) => {
      const productId = line?.node?.merchandise?.product?.id;
      const variantId = line?.node?.merchandise?.id;
      const lineId = line?.node?.id;
      const quantity = quantitiesByLineId?.[lineId] ?? line?.node?.quantity ?? 0;
      const unitPrice = parseFloat(line?.node?.merchandise?.price?.amount) || 0;

      if (!lineId || !quantity || unitPrice <= 0) return;

      let isEligible = false;
      if (eligibleProductIds.length > 0 && productId) {
        isEligible = eligibleProductIds.includes(productId);
      } else if (eligibleCollectionHandles.length > 0) {
        if (eligibleCollectionHandles.includes("all-product")) {
          isEligible = true;
        } else {
          isEligible = eligibleCollectionHandles.some((handle) => {
            const productIdsInCollection = collectionProductIdsByHandle[handle];
            const variantIdsInCollection = collectionVariantIdsByHandle[handle];
            const byProduct = productId
              ? productIdsInCollection?.has(productId)
              : false;
            const byVariant = variantId
              ? variantIdsInCollection?.has(variantId)
              : false;
            return !!(byProduct || byVariant);
          });
        }
      }

      if (!isEligible) return;

      for (let i = 0; i < quantity; i += 1) {
        candidateUnits.push({ lineId, unitPrice });
      }
    });

    if (candidateUnits.length === 0) return;

    candidateUnits.sort((a, b) => a.unitPrice - b.unitPrice);
    const freeQty = parseFreeQuantityFromDiscount(discount);
    const freeUnits = candidateUnits.slice(0, freeQty);

    freeUnits.forEach(({ lineId, unitPrice }) => {
      lineDiscountById[lineId] = (lineDiscountById[lineId] || 0) + unitPrice;
      totalDiscount += unitPrice;
    });
  });

  return { lineDiscountById, totalDiscount };
};

const getDiscountTargetCollection = (discount) => {
  const qualifyingCollectionHandles = [
    ...(discount?.qualifyingPurchaseItems?.collections || []),
    ...(discount?.customerBuys?.items?.collections?.nodes || []),
  ]
    .map((c) => c?.handle)
    .filter(Boolean)
    .filter((h) => h !== "all-product");

  if (qualifyingCollectionHandles.length > 0) {
    return {
      handle: qualifyingCollectionHandles[0],
      title: "Eligible Products",
    };
  }

  const eligibleCollectionHandles = (discount?.eligibleFreeItems?.collections || [])
    .map((c) => c?.handle)
    .filter(Boolean)
    .filter((h) => h !== "all-product");

  if (eligibleCollectionHandles.length > 0) {
    return {
      handle: eligibleCollectionHandles[0],
      title: "Eligible Products",
    };
  }

  const eligibleProductHandles = (discount?.eligibleFreeItems?.products || [])
    .map((p) => p?.handle)
    .filter(Boolean);

  const isJetTagOffer =
    eligibleProductHandles.length > 0 &&
    eligibleProductHandles.every((h) => h.startsWith("jet-tag-"));

  if (isJetTagOffer) {
    // Use a known existing collection handle for jet tag discovery.
    return { handle: "accessories", title: "Jet Tags" };
  }

  return { handle: "all-product", title: "Shop All" };
};

const CartScreen = ({ navigation }) => {
  const dlog = (...args) => {
    if (DEBUG_CART_DISCOUNTS) console.log(...args);
  };
  const dwarn = (...args) => {
    if (DEBUG_CART_DISCOUNTS) console.warn(...args);
  };
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { cart, getCartDetails, updateCartDetails, deleteItemFromCart } =
    useCart(); // Ensure updateCartDetails is implemented
  const { multiplier: giveawayMultiplier } = useGiveaway();
  const [quantities, setQuantities] = useState({}); // State to track quantities by item ID
  const [totalPrice, setTotalPrice] = useState(0); // State to track total price
  const isInitialized = useRef(false); // To track initialization
  const [removingItemId, setRemovingItemId] = useState(null);
  const [customerTags, setCustomerTags] = useState(null);
  const [activeAutomaticDiscounts, setActiveAutomaticDiscounts] = useState([]);
  const [appliedAutomaticDiscounts, setAppliedAutomaticDiscounts] = useState([]);
  const [showCartConfirmModal, setShowCartConfirmModal] = useState(false);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [discountCollectionsLoading, setDiscountCollectionsLoading] = useState(false);
  const [collectionProductIdsByHandle, setCollectionProductIdsByHandle] = useState(
    {}
  );
  const [collectionVariantIdsByHandle, setCollectionVariantIdsByHandle] = useState(
    {}
  );

  useEffect(() => {
    // Fetch cart details only once
    if (!isInitialized.current) {
      getCartDetails();
      isInitialized.current = true;
    }

    // Initialize quantities and calculate total price only if cart has items
    if (
      cart?.lines?.edges?.length > 0 &&
      Object.keys(quantities).length === 0
    ) {
      const initialQuantities = cart.lines.edges.reduce((acc, item) => {
        acc[item.node.id] = item.node.quantity;
        return acc;
      }, {});
      setQuantities(initialQuantities);
      calculateTotalPrice(initialQuantities);
    }
  }, [cart, getCartDetails]);

  useEffect(() => {
    getCustomerInfo().then((info) => {
      if (info?.tags) setCustomerTags(info.tags);
    });
  }, []);

  useEffect(() => {
    const loadDiscounts = async () => {
      setDiscountsLoading(true);
      try {
        const data = await fetchAllDiscounts();
        setActiveAutomaticDiscounts(data?.activeAutomaticDiscounts || []);
        dlog(
          "[CartDiscounts] active automatic discounts:",
          (data?.activeAutomaticDiscounts || []).map((d) => ({
            id: d.id,
            title: d.title,
            type: d.discountType,
            getsCollections:
              d?.customerGets?.items?.collections?.nodes?.map((c) => c?.handle) || [],
            eligibleCollections:
              d?.eligibleFreeItems?.collections?.map((c) => c?.handle) || [],
            qualifyingCollections:
              d?.qualifyingPurchaseItems?.collections?.map((c) => c?.handle) || [],
          }))
        );
      } catch (error) {
        dwarn(
          "[CartDiscounts] failed to fetch active automatic discounts:",
          error?.message || error
        );
        setActiveAutomaticDiscounts([]);
      } finally {
        setDiscountsLoading(false);
      }
    };

    loadDiscounts();
  }, []);

  useEffect(() => {
    const loadDiscountCollections = async () => {
      setDiscountCollectionsLoading(true);
      if (!activeAutomaticDiscounts.length) {
        setCollectionProductIdsByHandle({});
        setCollectionVariantIdsByHandle({});
        setDiscountCollectionsLoading(false);
        return;
      }

      const handles = Array.from(
        new Set(
          activeAutomaticDiscounts
            .flatMap((discount) => [
              ...(discount?.eligibleFreeItems?.collections || []).map((c) => c?.handle),
              ...(discount?.customerGets?.items?.collections?.nodes || []).map(
                (c) => c?.handle
              ),
            ])
            .filter((handle) => handle && handle !== "all-product")
        )
      );

      if (!handles.length) {
        setCollectionProductIdsByHandle({});
        setCollectionVariantIdsByHandle({});
        setDiscountCollectionsLoading(false);
        return;
      }

      const entries = await Promise.all(
        handles.map(async (handle) => {
          try {
            const data = await fetchAllProductsCollection(handle);
            const ids = new Set(
              (data?.products?.edges || [])
                .map((edge) => edge?.node?.id)
                .filter(Boolean)
            );
            const variantIds = new Set(
              (data?.products?.edges || []).flatMap(
                (edge) =>
                  edge?.node?.variants?.edges?.map((v) => v?.node?.id).filter(Boolean) || []
              )
            );
            dlog(
              `[CartDiscounts] loaded collection "${handle}" with ${ids.size} products and ${variantIds.size} variants`
            );
            return [handle, ids, variantIds];
          } catch (error) {
            dwarn(
              `[CartDiscounts] failed loading discount collection "${handle}":`,
              error?.message || error
            );
            return [handle, new Set(), new Set()];
          }
        })
      );

      setCollectionProductIdsByHandle(
        Object.fromEntries(entries.map(([handle, ids]) => [handle, ids]))
      );
      setCollectionVariantIdsByHandle(
        Object.fromEntries(entries.map(([handle, _ids, variantIds]) => [handle, variantIds]))
      );
      setDiscountCollectionsLoading(false);
    };

    loadDiscountCollections();
  }, [activeAutomaticDiscounts]);

  const calculateTotalPrice = (updatedQuantities) => {
    if (!cart?.lines?.edges || cart.lines.edges.length === 0) {
      setTotalPrice(0); // Set total price to 0 when cart is empty
      return;
    }

    const newTotalPrice = cart.lines.edges.reduce((total, item) => {
      const itemId = item.node.id;
      const quantity = updatedQuantities[itemId] || 0; // Set to 0 if removed
      const price = parseFloat(item.node.merchandise.price.amount) || 0;
      return total + price * quantity;
    }, 0);

    setTotalPrice(newTotalPrice);
  };

  const syncCartWithServer = async (customQuantities = null) => {
    try {
      const quantitiesToUse = customQuantities || quantities;

      const updatedLines = Object.entries(quantitiesToUse).map(
        ([lineId, quantity]) => ({
          id: lineId.split("?")[0], // clean up the ID
          quantity,
        })
      );

      if (!cart?.id || updatedLines.length === 0) {
        throw new Error("Missing cartId or updatedLines");
      }

      await updateCartDetails(updatedLines);
      await getCartDetails();
    } catch (error) {
      // console.error("Failed to update cart on the server:", error);
      throw error; // ✅ THIS LINE IS ESSENTIAL
    }
  };

  const handleIncrement = async (itemId) => {
    try {
      setQuantities((prevQuantities) => {
        const updatedQuantities = {
          ...prevQuantities,
          [itemId]: prevQuantities[itemId] + 1,
        };

        calculateTotalPrice(updatedQuantities); // Recalculate total price
        syncCartWithServer(updatedQuantities); // Sync with server
        return updatedQuantities;
      });

      // Directly update the cart with the new quantity
      await updateCartDetails([
        { id: itemId, quantity: quantities[itemId] + 1 },
      ]);
      await getCartDetails(); // Refresh cart details
    } catch (error) {
      Alert.alert("Out of Stock", "There is no more stock for this item.");
      setQuantities((prevQuantities) => {
        const updatedQuantities = {
          ...prevQuantities,
          [itemId]: prevQuantities[itemId] - 1,
        };

        calculateTotalPrice(updatedQuantities); // Recalculate total price
        syncCartWithServer(updatedQuantities); // Sync with server
        return updatedQuantities;
      });

      // Directly update the cart with the new quantity
      await updateCartDetails([
        { id: itemId, quantity: quantities[itemId] - 1 },
      ]);
      await getCartDetails();
    }
  };

  const handleDecrement = async (itemId) => {
    try {
      setQuantities((prevQuantities) => {
        const updatedQuantities = {
          ...prevQuantities,
          [itemId]: prevQuantities[itemId] > 1 ? prevQuantities[itemId] - 1 : 1,
        };

        calculateTotalPrice(updatedQuantities); // Recalculate total price
        syncCartWithServer(updatedQuantities); // Sync with server
        return updatedQuantities;
      });

      // Directly update the cart with the new quantity
      await updateCartDetails([
        {
          id: itemId,
          quantity: quantities[itemId] - 1 > 0 ? quantities[itemId] - 1 : 1,
        },
      ]);
      await getCartDetails(); // Refresh cart details
    } catch (error) {
      // console.error("Failed to decrement item quantity:", error);
    }
  };

  const handleNavigateToCheckoutUpdated = async () => {
    if (!cart || !cart.id) {
      alert("Your cart is empty!");
      return;
    }

    try {
      await getCartDetails(); // Ensure cart details are updated before checkout

      if (!cart.checkoutUrl) {
        console.error("Checkout URL is missing from the cart response.");
        alert("Failed to retrieve the checkout URL. Please try again.");
        return;
      }

      navigation.navigate("WebViewScreen", { checkoutUrl: cart.checkoutUrl });
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleCheckoutPress = () => {
    const shouldPromptForDiscount =
      !discountResolutionPending &&
      cart?.lines?.edges?.length > 0 &&
      appliedAutomaticDiscounts.length === 0 &&
      !!primaryUnappliedDiscount;

    if (shouldPromptForDiscount) {
      setShowCartConfirmModal(true);
      return;
    }

    handleNavigateToCheckoutUpdated();
  };

  const getDisplaySizeFromShopifyVariant = (shopifySize) => {
    switch (shopifySize) {
      case "Default Title":
        return null;
      case "Adult Small":
        return "Small";
      case "Adult Medium":
        return "Medium";
      case "Adult Large":
        return "Large";
      case "Adult XLarge":
        return "XLarge";
      case "Adult 2XLarge":
        return "2XLarge";
      case "Adult 3XLarge":
        return "3XLarge";
      default:
        return shopifySize;
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      try {
        const hasUpdates = Object.entries(quantities).some(([lineId, qty]) => {
          const cartLine = cart?.lines?.edges.find(
            (line) => line.node.id === lineId
          );
          return cartLine && cartLine.node.quantity !== qty;
        });

        if (hasUpdates) {
          dlog("[Cart] syncing cart on navigation back...");
          await syncCartWithServer();
        }
      } catch (error) {
        console.error("Error syncing cart before navigating back:", error);
      }
    });

    return unsubscribe;
  }, [navigation, quantities, cart]);

  // Helper function to calculate total number of items
  const getTotalItems = () => {
    return Object.values(quantities).reduce((total, qty) => total + qty, 0);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setRemovingItemId(itemId); // show loader

      await deleteItemFromCart(itemId);

      const updatedQuantities = { ...quantities };
      delete updatedQuantities[itemId];
      setQuantities(updatedQuantities);

      await getCartDetails();
      calculateTotalPrice(updatedQuantities);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    } finally {
      setRemovingItemId(null); // hide loader
    }
  };

  const calculateItemPrice = (price, quantity) => {
    const parsedPrice = parseFloat(price) || 0; // Safely parse price
    return parsedPrice * quantity; // Calculate total price for the item
  };

  const vipMult = getVipMultiplier(customerTags ?? []);

  const automaticDiscountBreakdown = useMemo(() => {
    const lines = cart?.lines?.edges || [];
    return getAutomaticDiscountBreakdown(
      appliedAutomaticDiscounts,
      lines,
      quantities,
      collectionProductIdsByHandle,
      collectionVariantIdsByHandle
    );
  }, [
    appliedAutomaticDiscounts,
    cart?.lines?.edges,
    quantities,
    collectionProductIdsByHandle,
    collectionVariantIdsByHandle,
  ]);

  const estimatedAutomaticDiscountAmount = automaticDiscountBreakdown.totalDiscount || 0;
  const hasCartItems = (cart?.lines?.edges?.length || 0) > 0;
  const discountResolutionPending =
    hasCartItems && (discountsLoading || discountCollectionsLoading);

  const estimatedTotalAfterDiscount = Math.max(
    0,
    totalPrice - estimatedAutomaticDiscountAmount
  );

  const totalEntries = useMemo(() => {
    if (giveawayMultiplier <= 0 || !cart?.lines?.edges?.length) return 0;
    return cart.lines.edges.reduce((sum, item) => {
      const itemId = item.node.id;
      const price = parseFloat(item?.node?.merchandise?.price?.amount) || 0;
      const quantity = quantities[itemId] ?? item.node.quantity ?? 0;
      const lineTotal = price * quantity;
      const discountedLineTotal = Math.max(
        0,
        lineTotal - (automaticDiscountBreakdown.lineDiscountById[itemId] || 0)
      );
      return sum + Math.floor(discountedLineTotal * giveawayMultiplier * vipMult);
    }, 0);
  }, [
    cart?.lines?.edges,
    quantities,
    giveawayMultiplier,
    vipMult,
    automaticDiscountBreakdown,
  ]);

  useEffect(() => {
    if (!DEBUG_CART_DISCOUNTS) return;
    dlog(
      "[CartDiscounts] totals:",
      JSON.stringify(
        {
          totalPrice,
          estimatedAutomaticDiscountAmount,
          estimatedTotalAfterDiscount,
        },
        null,
        2
      )
    );
  }, [totalPrice, estimatedAutomaticDiscountAmount, estimatedTotalAfterDiscount]);

  useEffect(() => {
    const lines = cart?.lines?.edges || [];
    if (!lines.length || !activeAutomaticDiscounts.length) {
      setAppliedAutomaticDiscounts([]);
      return;
    }

    dlog(
      "[CartDiscounts] cart lines:",
      lines.map((line) => ({
        lineId: line?.node?.id,
        variantId: line?.node?.merchandise?.id,
        productId: line?.node?.merchandise?.product?.id,
        handle: line?.node?.merchandise?.product?.handle,
        qty: quantities[line?.node?.id] ?? line?.node?.quantity ?? 0,
        price: line?.node?.merchandise?.price?.amount,
      }))
    );

    const applicable = activeAutomaticDiscounts.filter((discount) =>
      isAutomaticDiscountApplicableToCart(
        discount,
        lines,
        collectionProductIdsByHandle,
        collectionVariantIdsByHandle
      )
    );
    setAppliedAutomaticDiscounts(applicable);

    dlog(
      "[CartDiscounts] applied discounts:",
      applicable.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.discountType,
      }))
    );
    dlog(
      "[CartDiscounts] collection cache sizes:",
      {
        productIds: Object.fromEntries(
          Object.entries(collectionProductIdsByHandle).map(([h, ids]) => [h, ids?.size || 0])
        ),
        variantIds: Object.fromEntries(
          Object.entries(collectionVariantIdsByHandle).map(([h, ids]) => [h, ids?.size || 0])
        ),
      }
    );
  }, [
    cart?.lines?.edges,
    activeAutomaticDiscounts,
    collectionProductIdsByHandle,
    collectionVariantIdsByHandle,
  ]);

  const unappliedAutomaticDiscounts = useMemo(() => {
    if (!activeAutomaticDiscounts.length) return [];
    const appliedIds = new Set(appliedAutomaticDiscounts.map((d) => d.id));
    return activeAutomaticDiscounts.filter((d) => !appliedIds.has(d.id));
  }, [activeAutomaticDiscounts, appliedAutomaticDiscounts]);

  const primaryUnappliedDiscount = unappliedAutomaticDiscounts[0] || null;

  // Render each cart item
  const renderItem = ({ item }) => {
    const product = item?.node?.merchandise;
    const price = product?.price?.amount || "0.00";
    const compareAtPrice = product?.compareAtPrice?.amount || null;
    const itemId = item.node.id;
    const quantity = quantities[itemId] || item.node.quantity; // Use state or fallback to initial quantity

    const totalItemPrice = calculateItemPrice(price, quantity); // Calculate total price for this item
    const totalComparePrice = calculateItemPrice(compareAtPrice, quantity); // Calculate total price for this item
    const autoLineDiscount = automaticDiscountBreakdown.lineDiscountById[itemId] || 0;
    const discountedItemPrice = Math.max(0, totalItemPrice - autoLineDiscount);

    const priceNum = parseFloat(price) || 0;
    const showGiveaway =
      giveawayMultiplier > 0 && !Number.isNaN(priceNum) && priceNum >= 0;
    const lineEffectiveTotal = Math.max(0, totalItemPrice - autoLineDiscount);
    const entries = showGiveaway
      ? Math.floor(lineEffectiveTotal * giveawayMultiplier * vipMult)
      : 0;

    // Fetch product image safely
    const productImage =
      product?.product?.images?.edges?.[0]?.node?.src || "..assets/Legends.png";

    return (
      <View style={styles.cartItemContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            transition={300}
            source={{
              uri: productImage,
            }}
            style={styles.productImage}
          />
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={{ gap: 7 }}>
            {showGiveaway && entries > 0 && (
              <View style={styles.entriesBadge}>
                <Image
                  source={{ uri: TICKET_ICON_URI }}
                  style={styles.entriesTicketIcon}
                />
                <Text allowFontScaling={false} style={styles.entriesText}>
                  {entries} ENTRIES
                </Text>
              </View>
            )}
            <Text allowFontScaling={false} style={styles.productTitle}>{product?.product?.title}</Text>

            {/* Price Section */}
            <View style={styles.priceContainer}>
              {autoLineDiscount > 0 ? (
                <>
                  <Text allowFontScaling={false} style={styles.currentPrice}>
                    ${discountedItemPrice.toFixed(2)}
                  </Text>
                  <Text allowFontScaling={false} style={styles.compareAtPrice}>
                    ${totalItemPrice.toFixed(2)}
                  </Text>
                </>
              ) : (
                <>
                  <Text allowFontScaling={false} style={styles.currentPrice}>
                    ${totalItemPrice.toFixed(2)}
                  </Text>
                  {Number(compareAtPrice) > Number(price) && (
                    <Text allowFontScaling={false} style={styles.compareAtPrice}>
                      ${totalComparePrice.toFixed(2)}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
          {/* <Text style={styles.productSize}>
            {product?.title || "Unknown Size"}
          </Text> */}
          <Text
            allowFontScaling={false}
            style={[
              styles.productSize,
              product?.title == "Default Title" && {
                fontSize: 0,
              },
            ]}
          >
            {getDisplaySizeFromShopifyVariant(product?.title)}
          </Text>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <View style={styles.selectorContainer}>
              {/* Minus Button */}
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleDecrement(itemId)}
                disabled={quantity === 1}
              >
                <Text allowFontScaling={false} style={styles.buttonText}>-</Text>
              </TouchableOpacity>

              {/* Quantity Value */}
              <Text allowFontScaling={false} style={styles.quantity}>{quantity}</Text>

              {/* Plus Button */}
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleIncrement(itemId)}
              >
                <Text allowFontScaling={false} style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              style={styles.removeButtonWrap}
              onPress={() => handleRemoveItem(itemId)}
              disabled={removingItemId === itemId}
            >
              {removingItemId === itemId ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text allowFontScaling={false} style={styles.removeButton}>Remove</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GlassHeader variant="dark" scrollY={scrollY} />
      {/* Top Cart Indicator */}
      <View style={[styles.topContainer, { paddingTop: insets.top + HEADER_OFFSET_BELOW_GLASS + 12 }]}>
        <Text allowFontScaling={false} style={styles.cartIndicator}>My Bag ({getTotalItems()})</Text>
      </View>

      {/* Cart Items */}
      {cart?.lines?.edges?.length > 0 ? (
        <AnimatedFlatList
          data={cart.lines.edges}
          keyExtractor={(item) => item.node.id}
          renderItem={renderItem}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 2 }}
        />
      ) : (
        <View style={styles.emptyCartContainer}>
          <Text allowFontScaling={false} style={styles.emptyCartText}>Your cart is empty.</Text>
        </View>
      )}

      <View
        style={[
          styles.lowerCheckoutContainer,
          { paddingBottom: (insets?.bottom ?? 0) + 60 },
        ]}
      >
        {/* Total Section */}
        <View style={styles.costContainer}>
          <Text allowFontScaling={false} style={styles.total}>Estimated Total:</Text>
          <Text allowFontScaling={false} style={styles.cartTotal}>
            $
            {cart?.lines?.edges?.length > 0
              ? (discountResolutionPending ? totalPrice : estimatedTotalAfterDiscount).toFixed(2)
              : "0.00"}
          </Text>
        </View>

        {discountResolutionPending && (
          <View style={styles.discountLoadingRow}>
            <ActivityIndicator size="small" color="#777" />
            <Text allowFontScaling={false} style={styles.discountLoadingText}>
              Calculating discounts and entries...
            </Text>
          </View>
        )}

        {!discountResolutionPending && estimatedAutomaticDiscountAmount > 0 && (
          <View style={styles.costContainer}>
            <Text allowFontScaling={false} style={styles.totalEntriesLabel}>
              Estimated Discount:
            </Text>
            <Text allowFontScaling={false} style={styles.estimatedDiscountValue}>
              -${estimatedAutomaticDiscountAmount.toFixed(2)}
            </Text>
          </View>
        )}

        {!discountResolutionPending && totalEntries > 0 && (
          <View style={styles.costContainer}>
            <Text allowFontScaling={false} style={styles.totalEntriesLabel}>Estimated Entries:</Text>
            <View style={styles.totalEntriesValueRow}>
              <Image
                source={{ uri: TICKET_ICON_URI }}
                style={styles.totalEntriesIcon}
              />
              <Text allowFontScaling={false} style={styles.totalEntriesValue}>
                {totalEntries}
              </Text>
            </View>
          </View>
        )}

        {!discountResolutionPending && appliedAutomaticDiscounts.length > 0 && (
          <View style={styles.autoDiscountContainer}>
            <Text allowFontScaling={false} style={styles.autoDiscountTitle}>
              Automatic Discounts Applied
            </Text>
            {appliedAutomaticDiscounts.map((discount) => (
              <View key={discount.id} style={styles.autoDiscountRow}>
                <Text allowFontScaling={false} style={styles.autoDiscountName}>
                  {discount.title || "Automatic discount"}
                </Text>
                <Text allowFontScaling={false} style={styles.autoDiscountStatus}>
                  Applied
                </Text>
              </View>
            ))}
          </View>
        )}

        {!discountResolutionPending && appliedAutomaticDiscounts.length === 0 && primaryUnappliedDiscount && (
          <View style={styles.autoDiscountReminderContainer}>
            <Text allowFontScaling={false} style={styles.autoDiscountTitle}>
              Don&apos;t forget your automatic deal
            </Text>
            <Text allowFontScaling={false} style={styles.autoDiscountReminderText}>
              {primaryUnappliedDiscount.title || "Automatic discount"} is active. Add an eligible item to unlock it.
            </Text>
            <TouchableOpacity
              style={styles.autoDiscountCtaButton}
              onPress={() => {
                const target = getDiscountTargetCollection(primaryUnappliedDiscount);
                navigation.navigate("Collection", {
                  handle: target.handle,
                  title: target.title,
                });
              }}
            >
              <Text allowFontScaling={false} style={styles.autoDiscountCtaText}>
                Shop Eligible Items
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Checkout Button */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { opacity: cart?.lines?.edges?.length > 0 ? 1 : 0.5 },
          ]}
          onPress={handleCheckoutPress}
          disabled={cart?.lines?.edges?.length === 0} // Disable button when cart is empty
        >
          <Text allowFontScaling={false} style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      <CartConfirmationModal
        visible={showCartConfirmModal}
        title="Don't forget your free item"
        primaryLabel="Get Item"
        secondaryLabel="No Thanks"
        onPrimaryPress={() => {
          setShowCartConfirmModal(false);
          if (!primaryUnappliedDiscount) return;
          const target = getDiscountTargetCollection(primaryUnappliedDiscount);
          navigation.navigate("Collection", {
            handle: target.handle,
            title: target.title,
          });
        }}
        onSecondaryPress={() => {
          setShowCartConfirmModal(false);
          handleNavigateToCheckoutUpdated();
        }}
        onRequestClose={() => setShowCartConfirmModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  topContainer: {
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomColor: "#E7E7E7",
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  cartIndicator: {
    fontFamily: "Futura-Bold",
    fontSize: 15,
  },
  cartItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  imageContainer: {
    width: 84,
    height: 84,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "92%",
    height: "92%",
    contentFit: "contain",
  },
  detailsContainer: {
    flex: 1,
    paddingTop: 2,
  },
  productTitle: {
    fontFamily: "Futura-Bold",
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  productSize: {
    fontFamily: "Futura-Medium",
    fontSize: 14,
    color: "#A09E9E",
    marginTop: 6,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  currentPrice: {
    fontFamily: "Futura-Bold",
    fontSize: 16,
    color: "#C8102F",
    marginRight: 10,
  },
  compareAtPrice: {
    fontFamily: "Futura-Medium",
    fontSize: 16,
    color: "#A09E9E",
    textDecorationLine: "line-through",
  },
  entriesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 2,
    gap: 4
  },
  entriesTicketIcon: {
    width: 18,
    height: 18,
  },
  entriesText: {
    fontFamily: "Futura-Bold",
    fontSize: 11.5,
    color: "#000",
  },
  total: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    marginTop: 14,
  },
  cartTotal: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    marginTop: 14,
  },
  checkoutButton: {
    backgroundColor: "#C8102F",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
    marginHorizontal: 16,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Futura-Bold",
  },
  quantityContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
    marginTop: 2,
  },
  selectorContainer: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 1000,
    borderColor: "#D8D8D8",
    paddingHorizontal: 8,
    width: 122,
    marginTop: 10,
    backgroundColor: "#FFF",
  },
  quantityButton: {
    padding: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "Futura-Bold",
    color: "#000",
  },
  quantity: {
    fontSize: 14,
    fontFamily: "Futura-Bold",
    marginHorizontal: 15,
  },
  removeButtonWrap: {
    marginTop: 6,
  },
  removeButton: {
    textDecorationLine: "underline",
    fontFamily: "Futura-Regular",
    fontSize: 13,
    color: "#4D4D4D",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 16,
    color: "gray",
    fontFamily: "Futura-Regular",
  },
  lowerCheckoutContainer: {
    borderTopColor: "#E6E6E6",
    borderTopWidth: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  costContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },
  totalEntriesLabel: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    marginTop: 8,
  },
  totalEntriesValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  totalEntriesValue: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
  },
  totalEntriesIcon: {
    width: 22,
    height: 22,
  },
  discountLoadingRow: {
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discountLoadingText: {
    fontFamily: "Futura-Medium",
    fontSize: 12.5,
    color: "#666",
  },
  estimatedDiscountValue: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    color: "#1E8E3E",
    marginTop: 8,
  },
  autoDiscountContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    gap: 6,
  },
  autoDiscountTitle: {
    fontFamily: "Futura-Bold",
    fontSize: 14,
    color: "#111",
    marginBottom: 2,
  },
  autoDiscountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  autoDiscountName: {
    flex: 1,
    fontFamily: "Futura-Medium",
    fontSize: 13,
    color: "#222",
  },
  autoDiscountStatus: {
    fontFamily: "Futura-Bold",
    fontSize: 12,
    color: "#1E8E3E",
  },
  autoDiscountReminderContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFF8EE",
    gap: 8,
  },
  autoDiscountReminderText: {
    fontFamily: "Futura-Medium",
    fontSize: 13,
    color: "#222",
    lineHeight: 18,
  },
  autoDiscountCtaButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  autoDiscountCtaText: {
    fontFamily: "Futura-Bold",
    fontSize: 12,
    color: "#FFF",
  },
});

export default CartScreen;
