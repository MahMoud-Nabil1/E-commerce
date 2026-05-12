/**
 * Category products screen.
 * Reuses ProductsScreen — passes categoryId + categoryName as params.
 * The products screen reads them via useLocalSearchParams.
 */
import { useLocalSearchParams } from "expo-router";
import ProductsScreen from "../products";

export default function CategoryScreen() {
  // params are forwarded automatically via expo-router's useLocalSearchParams
  // inside ProductsScreen — nothing extra needed here.
  return <ProductsScreen />;
}
