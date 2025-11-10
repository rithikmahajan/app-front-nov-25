# Size Selection & Cart Flow - Visual Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCT DETAIL SCREEN                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Product Image & Details                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Add to Cart     │  │    Buy Now       │                   │
│  │  (White/Black)   │  │  (Black/White)   │                   │
│  └────────┬─────────┘  └────────┬─────────┘                   │
│           │                     │                               │
└───────────┼─────────────────────┼───────────────────────────────┘
            │                     │
            ▼                     ▼
┌───────────────────────────────────────────────────────────────┐
│                  SIZE SELECTION MODAL                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ┌─────────────┐  ┌─────────────┐                       │  │
│  │  │ Size Chart  │  │How to Measure│                       │  │
│  │  └─────────────┘  └─────────────┘                       │  │
│  │                                                           │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                │  │
│  │  │  S   │  │  M   │  │  L   │  │  XL  │                │  │
│  │  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘                │  │
│  │     │         │         │         │                      │  │
│  │     └─────────┴─────────┴─────────┘                      │  │
│  │              User Clicks Size                            │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  ADD TO CART     │          │     BUY NOW      │
│      FLOW        │          │      FLOW        │
└──────┬───────────┘          └────────┬─────────┘
       │                               │
       ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│ 1. Add to Bag    │          │ 1. Add to Bag    │
│    via API       │          │    via API       │
└──────┬───────────┘          └────────┬─────────┘
       │                               │
       ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│ 2. Show Success  │          │ 2. Close Modal   │
│    Popup Alert   │          │    Smoothly      │
└──────┬───────────┘          └────────┬─────────┘
       │                               │
       ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│ 3. User Clicks   │          │ 3. Navigate to   │
│    "OK" Button   │          │    Bag Screen    │
└──────┬───────────┘          └────────┬─────────┘
       │                               │
       ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│ 4. Close Modal   │          │ 4. Show Cart     │
│                  │          │    with Item     │
└──────────────────┘          └──────────────────┘
```

## User Experience Timeline

### Add to Cart Flow (5 seconds)
```
0.0s: User taps "Add to Cart"
0.3s: Modal slides up
0.5s: User sees size chart
2.0s: User taps size "M"
2.1s: Loading state (brief)
2.5s: API returns success
2.6s: Popup appears "Added to Cart"
4.0s: User reads message
4.5s: User taps "OK"
5.0s: Modal closes
```

### Buy Now Flow (3 seconds)
```
0.0s: User taps "Buy Now"
0.3s: Modal slides up
0.5s: User sees size chart
1.5s: User taps size "L"
1.6s: Loading state (brief)
2.0s: API returns success
2.1s: Modal starts closing
2.4s: Modal fully closed
2.5s: Navigation starts
3.0s: Bag screen appears
```

## Backend API Calls

```
┌─────────────────────────────────────────────────┐
│              handleSizeSelect(size)              │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│        Find SKU for selected size                │
│        (product.sizes.find(s => s.size))         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          addToBag(product, size, sku)            │
│          [From BagContext]                       │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         Validate Product & Size                  │
│         POST /api/cart/validate                  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         Add/Update Cart Item                     │
│         POST /api/cart/add                       │
│         PUT /api/cart/update (if exists)         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         Return Success/Error                     │
│         {success: true, data: {...}}             │
└─────────────────────────────────────────────────┘
```

## State Management

```
Component State:
├── selectedSize: string
├── isAddingToCart: boolean
├── modalActionType: 'addToCart' | 'buyNow'
└── selectedProductForSize: Product | null

Context State (BagContext):
├── bagItems: CartItem[]
├── loading: boolean
└── addToBag: (product, size, sku) => Promise<void>

API State:
├── cart/items: CartItem[]
├── cart/total: number
└── cart/count: number
```

## Error Handling

```
Try {
  Select Size
    ↓
  Validate Product
    ↓
  Add to Cart API
    ↓
  Update Local State
    ↓
  Show Success
}
Catch {
  Network Error → Show "Network error" alert
  Product Invalid → Show "Product not available" alert
  API Error → Show "Failed to add item" alert
  Unknown Error → Show "Something went wrong" alert
}
Finally {
  Reset loading state
  Enable user interaction
}
```

---

**Legend:**
- □ = Screen/Modal
- → = User Action
- ↓ = System Flow
- ┌─┐ = Process Step
