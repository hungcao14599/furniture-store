import { Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { HomePage } from "@/pages/public/HomePage";
import { ProductsPage } from "@/pages/public/ProductsPage";
import { ProductDetailPage } from "@/pages/public/ProductDetailPage";
import { CartPage } from "@/pages/public/CartPage";
import { CheckoutPage } from "@/pages/public/CheckoutPage";
import { CheckoutSuccessPage } from "@/pages/public/CheckoutSuccessPage";
import { PostsPage } from "@/pages/public/PostsPage";
import { PostDetailPage } from "@/pages/public/PostDetailPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { CategoriesPage } from "@/pages/admin/CategoriesPage";
import { ProductsManagementPage } from "@/pages/admin/ProductsManagementPage";
import { ProductFormPage } from "@/pages/admin/ProductFormPage";
import { PostsManagementPage } from "@/pages/admin/PostsManagementPage";
import { PostFormPage } from "@/pages/admin/PostFormPage";
import { OrdersPage } from "@/pages/admin/OrdersPage";
import { OrderDetailPage } from "@/pages/admin/OrderDetailPage";
import { ContactInfoPage } from "@/pages/admin/ContactInfoPage";
import { ContactMessagesPage } from "@/pages/admin/ContactMessagesPage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsManagementPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="posts" element={<PostsManagementPage />} />
          <Route path="posts/new" element={<PostFormPage />} />
          <Route path="posts/:id/edit" element={<PostFormPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="contact-info" element={<ContactInfoPage />} />
          <Route path="contact-messages" element={<ContactMessagesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
