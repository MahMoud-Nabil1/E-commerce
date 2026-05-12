import type { OrderDTO } from "@/services/api/types";

export function validateCategoryForm(name: string): { isValid: boolean; nameError: string | null } {
  if (name.trim().length < 5) {
    return { isValid: false, nameError: "Category name must be at least 5 characters" };
  }
  return { isValid: true, nameError: null };
}

type ProductForm = {
  productName: string;
  description: string;
  quantity: string;
  price: string;
  discount: string;
};

export function validateProductForm(form: ProductForm): {
  isValid: boolean;
  errors: Partial<{
    productName: string;
    description: string;
    quantity: string;
    price: string;
    discount: string;
  }>;
} {
  const errors: Partial<Record<string, string>> = {};

  if (form.productName.trim().length < 3) {
    errors.productName = "Product name must be at least 3 characters";
  }

  if (form.description.trim().length < 6) {
    errors.description = "Description must be at least 6 characters";
  }

  const qty = Number(form.quantity);
  if (isNaN(qty) || qty < 0) {
    errors.quantity = "Quantity must be a non-negative number";
  }

  const price = Number(form.price);
  if (isNaN(price) || price < 0) {
    errors.price = "Price must be a non-negative number";
  }

  const discount = Number(form.discount);
  if (isNaN(discount) || discount < 0 || discount > 100) {
    errors.discount = "Discount must be between 0 and 100";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isImageTooLarge(sizeBytes: number): boolean {
  return sizeBytes > 10 * 1024 * 1024;
}

export function removeById<T extends { [key: string]: unknown }>(list: T[], idKey: keyof T, id: number): T[] {
  return list.filter((item) => item[idKey] !== id);
}

export function updateOrderStatus(orders: OrderDTO[], orderId: number, newStatus: string): OrderDTO[] {
  return orders.map((order) =>
    order.orderId === orderId ? { ...order, orderStatus: newStatus } : order
  );
}
