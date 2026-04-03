import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { adminQueryKeys, publicQueryKeys } from "@/hooks/queryKeys";
import { useAdminCategoriesQuery, useAdminProductByIdQuery } from "@/hooks/useAdminQueries";
import { adminApi } from "@/services/adminApi";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { parseSpecificationsText, stringifySpecifications } from "@/utils/helpers";
import { usePageMeta } from "@/hooks/usePageMeta";

const initialForm = {
  name: "",
  slug: "",
  sku: "",
  shortDescription: "",
  description: "",
  price: "",
  material: "",
  color: "",
  dimensions: "",
  specificationText: "",
  stock: "0",
  categoryId: "",
  featured: false,
  bestSeller: false,
  isNew: true,
  imageText: "",
};

export const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  usePageMeta(
    isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm",
    "Form quản lý sản phẩm nội thất.",
  );

  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const { data: categories = [], isLoading: isCategoriesLoading, error: categoriesError } =
    useAdminCategoriesQuery();
  const { data: product, isLoading: isProductLoading, error: productError } =
    useAdminProductByIdQuery(id);
  const uploadMutation = useMutation({
    mutationFn: adminApi.uploadImages,
    onSuccess: (uploaded) => {
      const nextText = [form.imageText.trim(), ...uploaded.map((item) => item.url)]
        .filter(Boolean)
        .join("\n");
      setForm((current) => ({ ...current, imageText: nextText }));
      toast.success("Upload ảnh thành công");
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Không thể upload ảnh");
    },
  });
  const saveProductMutation = useMutation({
    mutationFn: (payload: unknown) => {
      if (isEditing && id) {
        return adminApi.updateProduct(id, payload);
      }

      return adminApi.createProduct(payload);
    },
    onSuccess: async () => {
      toast.success(isEditing ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.productsRoot() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.productRoot() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.productsRoot() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.productRoot() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.home() }),
      ]);
      navigate("/admin/products");
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Không thể lưu sản phẩm");
    },
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        price: String(product.price),
        material: product.material,
        color: product.color,
        dimensions: product.dimensions,
        specificationText: stringifySpecifications(product.specifications),
        stock: String(product.stock),
        categoryId: product.categoryId,
        featured: product.featured,
        bestSeller: product.bestSeller,
        isNew: product.isNew,
        imageText: product.images.map((image) => image.url).join("\n"),
      });
    }
  }, [product]);

  useEffect(() => {
    const currentError = categoriesError ?? productError;

    if (currentError) {
      toast.error(currentError instanceof Error ? currentError.message : "Không thể tải dữ liệu sản phẩm");
    }
  }, [categoriesError, productError]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    await uploadMutation.mutateAsync(files);
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const specifications = parseSpecificationsText(form.specificationText);
    const imageUrls = form.imageText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!form.name || !form.sku || !form.categoryId) {
      toast.error("Vui lòng nhập đầy đủ tên, SKU và danh mục");
      return;
    }

    if (
      !form.material.trim() ||
      !form.color.trim() ||
      !form.dimensions.trim() ||
      Number(form.price) <= 0 ||
      Number(form.stock) < 0
    ) {
      toast.error("Giá, tồn kho và thông tin vật liệu phải hợp lệ");
      return;
    }

    if (form.shortDescription.trim().length < 20 || form.description.trim().length < 50) {
      toast.error("Mô tả ngắn hoặc mô tả chi tiết chưa đủ độ dài");
      return;
    }

    if (Object.keys(specifications).length === 0) {
      toast.error("Thông số kỹ thuật phải có ít nhất một dòng theo định dạng Tiêu đề: Giá trị");
      return;
    }

    if (imageUrls.length === 0) {
      toast.error("Cần ít nhất một ảnh cho sản phẩm");
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      sku: form.sku,
      shortDescription: form.shortDescription,
      description: form.description,
      price: Number(form.price),
      material: form.material,
      color: form.color,
      dimensions: form.dimensions,
      specifications,
      stock: Number(form.stock),
      featured: form.featured,
      bestSeller: form.bestSeller,
      isNew: form.isNew,
      categoryId: form.categoryId,
      images: imageUrls.map((url, index) => ({
        url,
        altText: form.name,
        sortOrder: index,
      })),
    };

    await saveProductMutation.mutateAsync(payload);
  };

  if (isCategoriesLoading || (isEditing && isProductLoading)) {
    return <LoadingSpinner label="Đang tải form sản phẩm..." />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        description="Cập nhật mô tả, thông số, cờ hiển thị và thư viện hình ảnh để nội dung sản phẩm trên website luôn đầy đủ."
        actions={
          <Link className="luxury-button-outline" to="/admin/products">
            Quay lại danh sách
          </Link>
        }
      />

      <form className="surface-card p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="field"
            placeholder="Tên sản phẩm"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="field"
            placeholder="Slug (tùy chọn)"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
          <input
            className="field"
            placeholder="SKU"
            value={form.sku}
            onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
          />
          <select
            className="field"
            value={form.categoryId}
            onChange={(event) =>
              setForm((current) => ({ ...current, categoryId: event.target.value }))
            }
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            className="field"
            placeholder="Giá bán"
            type="number"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
          <input
            className="field"
            placeholder="Tồn kho"
            type="number"
            value={form.stock}
            onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
          />
          <input
            className="field"
            placeholder="Chất liệu"
            value={form.material}
            onChange={(event) =>
              setForm((current) => ({ ...current, material: event.target.value }))
            }
          />
          <input
            className="field"
            placeholder="Màu sắc"
            value={form.color}
            onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
          />
          <input
            className="field md:col-span-2"
            placeholder="Kích thước"
            value={form.dimensions}
            onChange={(event) =>
              setForm((current) => ({ ...current, dimensions: event.target.value }))
            }
          />
        </div>

        <textarea
          className="field mt-4 min-h-[120px]"
          placeholder="Mô tả ngắn"
          value={form.shortDescription}
          onChange={(event) =>
            setForm((current) => ({ ...current, shortDescription: event.target.value }))
          }
        />

        <textarea
          className="field mt-4 min-h-[180px]"
          placeholder="Mô tả chi tiết"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />

        <textarea
          className="field mt-4 min-h-[180px]"
          placeholder={"Thông số kỹ thuật, mỗi dòng theo định dạng:\nKhung chính: Gỗ sồi\nBề mặt: Vải boucle"}
          value={form.specificationText}
          onChange={(event) =>
            setForm((current) => ({ ...current, specificationText: event.target.value }))
          }
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-3 rounded-[14px] border border-[#e5dbce] bg-[#f8f5ef] px-4 py-3.5 text-sm font-semibold text-espresso">
            <input
              checked={form.featured}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({ ...current, featured: event.target.checked }))
              }
            />
            Nổi bật
          </label>
          <label className="flex items-center gap-3 rounded-[14px] border border-[#e5dbce] bg-[#f8f5ef] px-4 py-3.5 text-sm font-semibold text-espresso">
            <input
              checked={form.bestSeller}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({ ...current, bestSeller: event.target.checked }))
              }
            />
            Bán chạy
          </label>
          <label className="flex items-center gap-3 rounded-[14px] border border-[#e5dbce] bg-[#f8f5ef] px-4 py-3.5 text-sm font-semibold text-espresso">
            <input
              checked={form.isNew}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({ ...current, isNew: event.target.checked }))
              }
            />
            Hàng mới
          </label>
        </div>

        <div className="mt-6 rounded-[18px] border border-dashed border-[#d9cbb8] bg-[#fbf8f2] p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-espresso">Ảnh sản phẩm</h3>
              <p className="text-sm text-stone">
                Dán URL ảnh theo từng dòng hoặc upload trực tiếp lên Supabase Storage.
              </p>
            </div>
            <label className="luxury-button-outline cursor-pointer">
              {uploadMutation.isPending ? "Đang upload..." : "Upload ảnh"}
              <input className="hidden" multiple type="file" onChange={handleUpload} />
            </label>
          </div>

          <textarea
            className="field mt-4 min-h-[160px]"
            placeholder={
              "Mỗi dòng là một URL ảnh:\nhttps://...\nhttps://your-project.supabase.co/storage/v1/object/public/product-images/..."
            }
            value={form.imageText}
            onChange={(event) => setForm((current) => ({ ...current, imageText: event.target.value }))}
          />
        </div>

        <button className="luxury-button mt-6" disabled={saveProductMutation.isPending} type="submit">
          {saveProductMutation.isPending ? "Đang lưu..." : isEditing ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
        </button>
      </form>
    </div>
  );
};
