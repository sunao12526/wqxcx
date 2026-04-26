export interface PageList<T> {
  data: T[]
  total: number
}

export interface AuthProfile {
  sub: string
  username: string
  roles: string[]
  permissions: string[]
  authProvider?: string
  phoneNumber?: string | null
  nickname?: string | null
  avatarUrl?: string | null
}

export interface HomeBanner {
  id: string
  name: string
  imageUrl: string
  productId?: string | null
  product?: {
    id: string
    name: string
  } | null
}

export interface ProductAttribute {
  id: string
  type: 'CATEGORY' | 'KIND' | 'FIT' | 'MATERIAL' | 'STYLE' | 'COLOR' | 'SIZE'
  name: string
  slug: string
  sortOrder: number
  isActive?: boolean
}

export interface ProductColorImage {
  colorId: string
  imageUrl: string
  imageAlt?: string | null
  sortOrder: number
  color?: ProductAttribute
}

export interface ProductCard {
  id: string
  name: string
  price: number
  minOrderQty: number
  categoryId: string
  category?: ProductAttribute
  colorImages: ProductColorImage[]
  createdAt: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
  imageAlt?: string | null
  sortOrder: number
  products?: ProductCard[]
}

export interface ProductItem extends ProductCard {
  kindId: string
  fitId: string
  materialId: string
  styleId: string
  detail: string
  detailFormat: string
  sizeIds: string[]
  sizes?: ProductAttribute[]
  kind?: ProductAttribute
  fit?: ProductAttribute
  material?: ProductAttribute
  style?: ProductAttribute
  updatedAt: string
}

export type OrderStatus = 'PENDING' | 'FOLLOWED_UP' | 'CLOSED'

export interface OrderSummary {
  id: string
  orderNo: string
  status: OrderStatus
  contactName: string
  contactPhone: string
  wechatNo?: string | null
  remark?: string | null
  totalQuantity: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface OrderDetail extends OrderSummary {
  items: Array<{
    id: string
    productId: string
    productNameSnapshot: string
    categoryNameSnapshot: string
    colorId: string
    colorNameSnapshot: string
    sizeId: string
    sizeNameSnapshot: string
    quantity: number
    unitPriceSnapshot: number
    subtotalAmount: number
    createdAt: string
  }>
}

export interface CreateOrderPayload {
  contactName: string
  contactPhone: string
  wechatNo?: string | null
  remark?: string | null
  items: Array<{
    productId: string
    colorId: string
    sizeId: string
    quantity: number
  }>
}
