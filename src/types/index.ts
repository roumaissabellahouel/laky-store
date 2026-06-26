export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compareAt?: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  category: Category;
  images: ProductImage[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  slug: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage?: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  firstName: string;
  lastName: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  RETURNED: "Retournée",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
};
