import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { PrismaClient, OrderStatus } from "@prisma/client";

config();

const prisma = new PrismaClient();

const categories = [
  {
    name: "Sofa",
    slug: "sofa",
    description: "Những mẫu sofa hiện đại với tỷ lệ cân đối, bề mặt cao cấp và tinh thần sống đương đại.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Bàn ăn",
    slug: "ban-an",
    description: "Bàn ăn gỗ, đá và kim loại dành cho không gian gia đình sang trọng và ấm cúng.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Ghế",
    slug: "ghe",
    description: "Ghế lounge, ghế accent và ghế dining cân bằng giữa công năng và thẩm mỹ.",
    image:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Giường ngủ",
    slug: "giuong-ngu",
    description: "Giường ngủ tối giản với chất liệu gỗ tự nhiên và bảng màu thư giãn.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Tủ quần áo",
    slug: "tu-quan-ao",
    description: "Tủ quần áo tối ưu lưu trữ, bền vững và phù hợp nhiều phong cách nội thất.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Kệ sách",
    slug: "ke-sach",
    description: "Kệ sách và hệ lưu trữ trưng bày giúp không gian phòng khách và phòng làm việc gọn gàng.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Đèn trang trí",
    slug: "den-trang-tri",
    description: "Đèn thả, đèn bàn và đèn sàn tạo nên chiều sâu ánh sáng cho không gian cao cấp.",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  },
];

const products = [
  {
    categorySlug: "sofa",
    name: "Sofa Milan Cloud 3 chỗ",
    slug: "sofa-milan-cloud-3-cho",
    sku: "SF-MILAN-001",
    price: 32900000,
    shortDescription:
      "Mẫu sofa 3 chỗ với phần đệm sâu, phom bo tròn mềm mại và chất vải boucle màu kem cho phòng khách sang trọng.",
    description:
      "Sofa Milan Cloud được thiết kế cho những không gian sống cần sự thư thái nhưng vẫn giữ tinh thần tinh gọn của nội thất cao cấp. Khung gỗ sồi đã qua xử lý chống cong vênh, hệ lò xo đàn hồi và lớp foam đa tầng giúp giữ phom bền bỉ trong thời gian dài. Tay vịn bo cong và tỷ lệ thấp tạo cảm giác rộng thoáng cho phòng khách căn hộ hoặc villa hiện đại.",
    material: "Gỗ sồi, vải boucle",
    color: "Kem cát",
    dimensions: "W240 x D98 x H76 cm",
    specifications: {
      "Khung chính": "Gỗ sồi kiln-dried",
      "Bề mặt": "Vải boucle chống bám bụi",
      "Đệm ngồi": "Foam mật độ cao kết hợp lông microfiber",
      "Chân đế": "Thép sơn tĩnh điện đen mờ",
    },
    stock: 8,
    featured: true,
    bestSeller: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    categorySlug: "ban-an",
    name: "Bàn ăn Verona Stone 6 ghế",
    slug: "ban-an-verona-stone-6-ghe",
    sku: "DT-VERONA-006",
    price: 28900000,
    shortDescription:
      "Bàn ăn mặt đá sintered tone be, chân thép sơn tĩnh điện và tỷ lệ thanh lịch dành cho phòng ăn hiện đại.",
    description:
      "Verona Stone là mẫu bàn ăn cân bằng giữa vẻ sang trọng của vật liệu đá và sự thanh thoát trong cấu trúc chân bàn. Bề mặt sintered stone chịu nhiệt, chống xước nhẹ và dễ vệ sinh, phù hợp cho nhu cầu sử dụng hằng ngày. Tỷ lệ 6 chỗ ngồi tạo nên cảm giác quây quần vừa đủ cho gia đình trẻ và các buổi tiếp khách thân mật.",
    material: "Đá sintered, thép sơn tĩnh điện",
    color: "Be sáng",
    dimensions: "W180 x D90 x H75 cm",
    specifications: {
      "Mặt bàn": "Đá sintered vân mây dày 12 mm",
      "Khung chân": "Thép hộp sơn đen nhám",
      "Sức chứa": "6 người lớn",
      "Phong cách": "Contemporary luxury",
    },
    stock: 5,
    featured: true,
    bestSeller: true,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    categorySlug: "ghe",
    name: "Ghế lounge Kyoto Linen",
    slug: "ghe-lounge-kyoto-linen",
    sku: "CH-KYOTO-002",
    price: 11900000,
    shortDescription:
      "Ghế lounge tựa lưng ngả nhẹ, khung gỗ walnut và nệm vải linen cao cấp cho góc đọc sách tinh tế.",
    description:
      "Kyoto Linen mang cảm hứng Nhật Bản đương đại với đường nét tiết chế, đề cao trải nghiệm ngồi dài lâu. Góc nghiêng tựa lưng vừa phải kết hợp tay vịn ôm giúp giảm mỏi vai gáy trong những phiên đọc sách hoặc thư giãn cuối ngày. Ghế phù hợp cho góc lounge, bedroom corner hoặc khu vực tiếp khách boutique.",
    material: "Gỗ walnut, vải linen",
    color: "Nâu óc chó / xám nhạt",
    dimensions: "W72 x D82 x H78 cm",
    specifications: {
      "Khung ghế": "Gỗ walnut veneer chống ẩm",
      "Mặt ngồi": "Foam đàn hồi bọc linen Ý",
      "Tải trọng": "120 kg",
      "Hoàn thiện": "Sơn mờ bảo vệ bề mặt",
    },
    stock: 11,
    featured: true,
    bestSeller: false,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    categorySlug: "giuong-ngu",
    name: "Giường ngủ Aurora Oak Queen",
    slug: "giuong-ngu-aurora-oak-queen",
    sku: "BD-AURORA-160",
    price: 26900000,
    shortDescription:
      "Giường ngủ khung gỗ sồi tự nhiên, đầu giường bọc nệm và tỷ lệ thấp mang lại cảm giác yên tĩnh, thư giãn.",
    description:
      "Aurora Oak Queen là lựa chọn lý tưởng cho phòng ngủ theo phong cách warm minimal. Thiết kế chân ẩn và đầu giường bản lớn tạo cảm giác nổi khối mềm mại, trong khi vật liệu gỗ sồi giúp tổng thể giữ được sự ấm áp bền bỉ. Sản phẩm được tối ưu để đi cùng đèn ngủ kim loại đen, tap đầu giường đá hoặc tủ quần áo veneer tự nhiên.",
    material: "Gỗ sồi, da microfiber",
    color: "Gỗ sáng / beige",
    dimensions: "W168 x D216 x H108 cm",
    specifications: {
      "Kích thước nệm phù hợp": "160 x 200 cm",
      "Đầu giường": "Bọc da microfiber chống bám bẩn",
      "Phản giường": "Nan gỗ chịu lực",
      "Bảo hành": "36 tháng",
    },
    stock: 6,
    featured: false,
    bestSeller: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    categorySlug: "tu-quan-ao",
    name: "Tủ quần áo Siena 4 cánh",
    slug: "tu-quan-ao-siena-4-canh",
    sku: "WR-SIENA-004",
    price: 34900000,
    shortDescription:
      "Tủ quần áo 4 cánh veneer walnut, chia khoang lưu trữ thông minh và tay nắm âm tinh giản.",
    description:
      "Siena 4 cánh được thiết kế cho phòng ngủ master với nhu cầu lưu trữ lớn nhưng vẫn cần tổng thể thanh thoát. Bên trong tủ phân chia giữa khoang treo dài, khoang gập đồ và ngăn kéo phụ kiện, giúp việc sắp xếp trở nên khoa học. Bề mặt veneer walnut cùng tay nắm âm chạy dọc mang lại vẻ tinh gọn và hiện đại.",
    material: "MDF chống ẩm phủ veneer walnut",
    color: "Nâu walnut",
    dimensions: "W220 x D60 x H240 cm",
    specifications: {
      "Khoang treo": "2 khoang treo dài, 1 khoang treo ngắn",
      "Ngăn kéo": "4 ngăn ray giảm chấn",
      "Bản lề": "Bản lề giảm chấn Hafele",
      "Phụ kiện": "Tùy chọn gương trong cánh tủ",
    },
    stock: 4,
    featured: false,
    bestSeller: false,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1100&q=80",
    ],
  },
  {
    categorySlug: "ke-sach",
    name: "Kệ sách Atlas Modular",
    slug: "ke-sach-atlas-modular",
    sku: "BK-ATLAS-003",
    price: 15900000,
    shortDescription:
      "Kệ sách module khung kim loại đen, đợt gỗ veneer và cấu trúc mở phù hợp phòng khách hoặc studio.",
    description:
      "Atlas Modular được tạo ra cho những không gian cần sự linh hoạt trong bài trí. Cấu trúc module mở giúp vừa trưng bày sách, vừa kết hợp decor object, khung tranh hoặc đèn bàn nhỏ để tạo điểm nhấn. Khung kim loại tĩnh điện màu đen tạo độ sắc nét thị giác, trong khi bề mặt gỗ walnut giữ lại cảm giác ấm áp đặc trưng của nội thất cao cấp.",
    material: "Kim loại sơn tĩnh điện, veneer walnut",
    color: "Đen mờ / walnut",
    dimensions: "W140 x D36 x H198 cm",
    specifications: {
      "Số tầng": "5 tầng mở",
      "Tải trọng mỗi đợt": "25 kg",
      "Khung": "Thép sơn tĩnh điện chống gỉ",
      "Lắp đặt": "Dạng module lắp ráp tại chỗ",
    },
    stock: 10,
    featured: true,
    bestSeller: true,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    categorySlug: "den-trang-tri",
    name: "Đèn sàn Halo Brass",
    slug: "den-san-halo-brass",
    sku: "LG-HALO-001",
    price: 6900000,
    shortDescription:
      "Đèn sàn thân kim loại mạ brass, chao vải linen và ánh sáng ấm cho không gian phòng khách tinh tế.",
    description:
      "Halo Brass là mẫu đèn sàn mang tinh thần khách sạn boutique với tỷ lệ mảnh và chi tiết hoàn thiện cao. Ánh sáng 3000K tạo bầu không khí ấm dịu, phù hợp cho các góc sofa, ghế lounge hoặc phòng ngủ. Sản phẩm dễ phối cùng palette trắng, be, nâu gỗ và các bề mặt đá tự nhiên.",
    material: "Thép mạ brass, vải linen",
    color: "Brass champagne",
    dimensions: "W48 x D48 x H158 cm",
    specifications: {
      "Nhiệt độ màu": "3000K warm white",
      "Chuẩn đui": "E27",
      "Công suất tối đa": "12W LED",
      "Công tắc": "Foot switch",
    },
    stock: 18,
    featured: true,
    bestSeller: false,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    categorySlug: "ghe",
    name: "Ghế ăn Porto Leather",
    slug: "ghe-an-porto-leather",
    sku: "CH-PORTO-005",
    price: 4900000,
    shortDescription:
      "Ghế ăn tựa cong nhẹ, bọc da microfiber và chân thép đen nhám dành cho bàn ăn contemporary.",
    description:
      "Porto Leather là mẫu ghế ăn đề cao sự gọn gàng trong không gian hiện đại. Form lưng ôm nhẹ, phần đệm ngồi êm và chiều cao tiêu chuẩn giúp ghế phù hợp cho cả bữa ăn hằng ngày lẫn tiếp khách. Chất liệu da microfiber dễ vệ sinh, thích hợp cho gia đình trẻ hoặc không gian căn hộ cao cấp.",
    material: "Da microfiber, thép sơn tĩnh điện",
    color: "Camel",
    dimensions: "W50 x D56 x H82 cm",
    specifications: {
      "Khung chân": "Thép đen nhám",
      "Chiều cao mặt ngồi": "46 cm",
      "Bọc nệm": "Da microfiber chống thấm nhẹ",
      "Ứng dụng": "Bàn ăn, bàn làm việc, cafe corner",
    },
    stock: 24,
    featured: false,
    bestSeller: true,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    categorySlug: "sofa",
    name: "Sofa góc Aspen L-shape",
    slug: "sofa-goc-aspen-l-shape",
    sku: "SF-ASPEN-002",
    price: 45900000,
    shortDescription:
      "Sofa góc chữ L kích thước lớn, đệm êm sâu và tone xám đá dành cho phòng khách villa hoặc penthouse.",
    description:
      "Aspen L-shape là giải pháp tối ưu cho những không gian phòng khách rộng, cần một điểm nhấn vừa bề thế vừa dễ tiếp cận. Tỷ lệ mặt ngồi sâu mang lại trải nghiệm thư giãn cao cấp, trong khi cấu trúc module cho phép thay đổi chiều chaise linh hoạt theo mặt bằng. Chất vải dệt cao cấp và tone xám đá giúp sản phẩm dễ dàng kết hợp với sàn gỗ, thảm len và bàn trà đá travertine.",
    material: "Khung gỗ, vải woven",
    color: "Xám đá",
    dimensions: "W320 x D178 x H80 cm",
    specifications: {
      "Cấu hình": "Module sofa 3 chỗ + chaise",
      "Đệm": "Foam đàn hồi cao và lông nhân tạo",
      "Vải bọc": "Vải woven châu Âu",
      "Bảo hành": "36 tháng khung và mút",
    },
    stock: 3,
    featured: true,
    bestSeller: false,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    categorySlug: "den-trang-tri",
    name: "Đèn thả Luna Cluster",
    slug: "den-tha-luna-cluster",
    sku: "LG-LUNA-004",
    price: 12800000,
    shortDescription:
      "Bộ đèn thả 5 bóng thủy tinh khói tạo lớp sáng mềm và chiều sâu ấn tượng cho bàn ăn hoặc sảnh đón.",
    description:
      "Luna Cluster được thiết kế cho những không gian cần một điểm nhấn ánh sáng điêu khắc. Cụm 5 bóng với cao độ thay đổi tạo nhịp thị giác giàu chiều sâu, đặc biệt phù hợp cho khu vực bàn ăn dài, cầu thang hoặc double-height foyer. Chụp thủy tinh khói kết hợp ánh sáng ấm giúp tổng thể vừa sang trọng vừa dịu mắt.",
    material: "Thủy tinh khói, kim loại sơn đen",
    color: "Khói / đen mờ",
    dimensions: "D90 x H150 cm",
    specifications: {
      "Số bóng": "5 bóng G9",
      "Điều chỉnh cao độ": "Có",
      "Phù hợp trần": "2.8 m trở lên",
      "Phong cách": "Modern statement",
    },
    stock: 9,
    featured: false,
    bestSeller: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    categorySlug: "ke-sach",
    name: "Kệ console Riviera",
    slug: "ke-console-riviera",
    sku: "BK-RIVIERA-007",
    price: 13900000,
    shortDescription:
      "Kệ console mặt đá travertine nhân tạo, khung sắt đen và khoang hở cho lối vào hoặc phòng khách.",
    description:
      "Riviera là mẫu console thanh lịch dành cho foyer, hành lang hoặc bức tường sau sofa. Thiết kế gồm mặt kệ chính và đợt hở phía dưới giúp vừa trưng bày decor vừa lưu trữ tạp chí, sách ảnh hoặc khay đồ dùng. Sự kết hợp giữa đá travertine nhân tạo và kim loại đen tạo nên cảm giác sang trọng nhưng không phô trương.",
    material: "Đá travertine nhân tạo, kim loại",
    color: "Kem travertine / đen",
    dimensions: "W140 x D36 x H82 cm",
    specifications: {
      "Mặt trên": "Đá nhân tạo chống thấm",
      "Khung": "Kim loại sơn tĩnh điện",
      "Ứng dụng": "Foyer, living room, hallway",
      "Điểm nhấn": "Đợt dưới dạng open shelf",
    },
    stock: 7,
    featured: true,
    bestSeller: false,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

const posts = [
  {
    title: "7 nguyên tắc phối màu cho phòng khách nội thất cao cấp",
    slug: "7-nguyen-tac-phoi-mau-phong-khach-cao-cap",
    excerpt:
      "Cách kết hợp trắng, be, nâu gỗ và đen nhấn để tạo một không gian phòng khách sang trọng nhưng vẫn ấm áp và sống được lâu dài.",
    coverImage:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80",
    authorName: "Lumina Maison Editorial",
    isPublished: true,
    publishedAt: new Date("2026-02-08T08:30:00.000Z"),
    content: `# 7 nguyên tắc phối màu cho phòng khách nội thất cao cấp

Một phòng khách sang trọng không nằm ở việc dùng quá nhiều vật liệu đắt tiền. Điều quan trọng hơn là **độ cân bằng thị giác**, nhịp sáng tối hợp lý và khả năng giữ vẻ đẹp bền lâu sau nhiều năm sử dụng.

## 1. Bắt đầu từ nền trung tính

Trắng ấm, be sáng, xám nhạt hoặc màu vôi là nền tốt để nội thất nổi khối mà không gây mỏi mắt. Khi nền đủ tĩnh, sofa, thảm và đèn trang trí sẽ có nhiều khoảng thở hơn.

## 2. Tỷ lệ 60-30-10 vẫn rất hiệu quả

- 60% cho màu nền tường, trần, sàn
- 30% cho đồ nội thất chính như sofa, bàn trà, thảm
- 10% cho điểm nhấn như kim loại đen, tranh hoặc decor object

## 3. Dùng gỗ để tạo cảm giác ấm

Gỗ walnut hoặc oak giúp cân bằng sự lạnh của đá, kính và kim loại. Đây là yếu tố rất quan trọng nếu bạn muốn không gian sang nhưng không khô cứng.

## 4. Chỉ dùng một màu đậm làm neo thị giác

Đen nhám, nâu espresso hoặc xanh rêu sâu có thể làm điểm neo cho tổng thể. Không nên có quá nhiều màu mạnh cùng lúc.

## 5. Chất liệu tạo màu tốt hơn sơn

Một tấm đá travertine, vải linen thô hay gỗ veneer đẹp thường mang lại chiều sâu thị giác tốt hơn các mảng màu nhân tạo.

## 6. Kiểm soát ánh sáng ban đêm

Ban ngày đẹp chưa đủ. Hãy kiểm tra cách màu sắc phản ứng dưới đèn 3000K vào buổi tối để không gian luôn giữ được sự dễ chịu.

## 7. Tạo khoảng trống có chủ đích

Không gian cao cấp luôn có vùng trống. Khoảng nghỉ này giúp mắt tập trung vào những điểm nhấn quan trọng hơn.`,
  },
  {
    title: "Cách chọn sofa cho căn hộ từ 70 đến 120m2",
    slug: "cach-chon-sofa-cho-can-ho-70-den-120m2",
    excerpt:
      "Một vài quy tắc thực tế về kích thước, chiều sâu đệm và màu sắc giúp chọn sofa phù hợp cho căn hộ hiện đại.",
    coverImage:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80",
    authorName: "Lumina Maison Editorial",
    isPublished: true,
    publishedAt: new Date("2026-01-28T09:00:00.000Z"),
    content: `# Cách chọn sofa cho căn hộ từ 70 đến 120m2

Sofa là món đồ quyết định nhịp sinh hoạt của phòng khách. Khi chọn sai kích thước hoặc độ sâu ngồi, toàn bộ không gian sẽ trở nên nặng nề và khó bố trí.

## Căn hộ 70-85m2

Ưu tiên sofa 2.2-2.5 m, tay vịn mảnh và chiều sâu khoảng 90-98 cm. Các tone kem, cát hoặc xám sáng sẽ giúp không gian thoáng hơn.

## Căn hộ 85-100m2

Bạn có thể chọn sofa 2.6-2.9 m hoặc dạng module nhỏ. Nếu muốn tạo cảm giác cao cấp hơn, hãy kết hợp thêm ghế lounge cùng chất liệu tương phản.

## Căn hộ 100-120m2

Sofa góc chữ L hoặc sofa module linh hoạt là lựa chọn tốt. Tuy nhiên, vẫn cần chừa ít nhất 80-90 cm lối đi để không gian không bị bí.

## Một số lưu ý quan trọng

- Chọn chiều cao lưng ghế vừa phải nếu trần thấp
- Nên thử độ đàn hồi của đệm ngồi thay vì chỉ xem ảnh
- Quan sát màu sofa dưới ánh sáng tự nhiên và ánh sáng đèn buổi tối`,
  },
  {
    title: "Xu hướng bàn ăn 2026: đá sáng màu, chân mảnh và ánh sáng layer",
    slug: "xu-huong-ban-an-2026",
    excerpt:
      "Không gian bàn ăn năm 2026 ưu tiên bề mặt sáng, tỷ lệ gọn và hệ đèn thả tạo lớp chiếu sáng mềm.",
    coverImage:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
    authorName: "Lumina Maison Editorial",
    isPublished: true,
    publishedAt: new Date("2026-02-18T10:15:00.000Z"),
    content: `# Xu hướng bàn ăn 2026

Không gian bàn ăn đang chuyển dần từ phong cách nặng, tối và nhiều chi tiết sang hướng **tối giản sang trọng**. Những bề mặt sáng, chân bàn mảnh và hệ đèn thả có chiều sâu ánh sáng đang trở thành xu hướng rõ nét.

## Chất liệu nổi bật

- Đá sintered màu kem hoặc trắng ấm
- Gỗ walnut xử lý bề mặt mờ
- Kim loại đen nhám hoặc champagne brass

## Tỷ lệ đang được ưa chuộng

Bàn dài 1.8-2.2 m cho 6-8 chỗ ngồi vẫn là kích thước linh hoạt nhất. Ghế đi cùng thường có form ôm nhẹ, bọc da microfiber hoặc vải dệt chống bám bẩn.

## Ánh sáng là lớp hoàn thiện cuối cùng

Một bộ đèn thả có cao độ thay đổi sẽ giúp khu vực bàn ăn có cảm giác boutique hơn nhiều so với chỉ dùng đèn downlight.`,
  },
  {
    title: "Tối ưu phòng ngủ master với tủ quần áo âm cảm giác nhẹ mắt",
    slug: "toi-uu-phong-ngu-master-voi-tu-quan-ao-am",
    excerpt:
      "Giải pháp bố trí tủ quần áo âm, chọn màu và phân chia khoang giúp phòng ngủ master gọn nhưng vẫn sang.",
    coverImage:
      "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1400&q=80",
    authorName: "Lumina Maison Editorial",
    isPublished: true,
    publishedAt: new Date("2026-03-02T07:45:00.000Z"),
    content: `# Tối ưu phòng ngủ master với tủ quần áo âm

Trong phòng ngủ master, hệ tủ quần áo là khối chiếm diện tích lớn nhất sau giường ngủ. Nếu thiết kế không khéo, căn phòng sẽ trở nên nặng nề.

## Chọn màu gần với màu tường

Tủ càng tiệp nền, không gian càng nhẹ mắt. Veneer walnut phù hợp phòng ngủ ấm, trong khi sơn be hoặc greige hợp với phong cách hiện đại tinh giản.

## Phân chia khoang thông minh

- Khoang treo dài cho váy, áo khoác
- Khoang treo ngắn kết hợp ngăn kéo
- Khoang phụ kiện riêng cho đồng hồ, trang sức, thắt lưng

## Đừng quên ánh sáng trong tủ

LED cảm biến là chi tiết nhỏ nhưng tạo trải nghiệm rất khác, đặc biệt trong các dự án nhà ở cao cấp.`,
  },
];

const contactInfo = {
  phone: "0901 234 567",
  email: "hello@luminamaison.com",
  address: "86 Nguyen Huu Canh, Ward 22, Binh Thanh District, Ho Chi Minh City",
  facebook: "https://facebook.com/luminamaison",
  zalo: "https://zalo.me/0901234567",
  instagram: "https://instagram.com/luminamaison",
  mapEmbedUrl: "https://www.google.com/maps?q=86%20Nguyen%20Huu%20Canh%20Binh%20Thanh&output=embed",
  workingHours: "08:30 - 20:00 | Thứ 2 - Chủ nhật",
  introText:
    "Lumina Maison tuyển chọn các thiết kế nội thất hiện đại cho căn hộ, villa và không gian hospitality cao cấp.",
};

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@luminamaison.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "Admin@123456";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.$transaction([
    prisma.contactMessage.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.post.deleteMany(),
    prisma.category.deleteMany(),
    prisma.contactInfo.deleteMany(),
    prisma.adminUser.deleteMany(),
  ]);

  await prisma.adminUser.create({
    data: {
      email: adminEmail,
      fullName: "Lumina Maison Admin",
      passwordHash,
    },
  });

  const createdCategories = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    createdCategories.set(category.slug, created.id);
  }

  const createdProducts = new Map<string, string>();
  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        material: product.material,
        color: product.color,
        dimensions: product.dimensions,
        specifications: product.specifications,
        stock: product.stock,
        featured: product.featured,
        bestSeller: product.bestSeller,
        isNew: product.isNew,
        categoryId: createdCategories.get(product.categorySlug)!,
        images: {
          create: product.images.map((url, index) => ({
            url,
            altText: product.name,
            sortOrder: index,
          })),
        },
      },
    });

    createdProducts.set(product.slug, created.id);
  }

  await prisma.post.createMany({
    data: posts,
  });

  await prisma.contactInfo.create({
    data: contactInfo,
  });

  await prisma.contactMessage.createMany({
    data: [
      {
        name: "Nguyen Hoang Linh",
        phone: "0912 888 321",
        email: "linh.nguyen@example.com",
        subject: "Tư vấn sofa cho căn hộ 90m2",
        message:
          "Mình cần tư vấn bộ sofa chữ L tone sáng cho căn hộ ở Thủ Thiêm, ưu tiên chất liệu dễ vệ sinh vì có trẻ nhỏ.",
        isHandled: false,
      },
      {
        name: "Tran Bao Chau",
        phone: "0934 777 221",
        email: "chau.tran@example.com",
        subject: "Báo giá bàn ăn và ghế dining",
        message:
          "Shop gửi giúp mình báo giá combo bàn ăn Verona Stone và 6 ghế Porto Leather, kèm thời gian giao hàng tại quận 7.",
        isHandled: true,
      },
    ],
  });

  await prisma.order.create({
    data: {
      code: "LM260301001",
      customerName: "Pham Anh Tuan",
      phone: "0909 123 999",
      email: "anh.tuan@example.com",
      address: "Sala Dai Quang Minh, Thu Duc, Ho Chi Minh City",
      note: "Liên hệ trước khi giao hàng vào buổi chiều.",
      status: OrderStatus.PROCESSING,
      subtotal: 37800000,
      shippingFee: 0,
      total: 37800000,
      items: {
        create: [
          {
            productId: createdProducts.get("sofa-milan-cloud-3-cho"),
            quantity: 1,
            unitPrice: 32900000,
            productNameSnapshot: "Sofa Milan Cloud 3 chỗ",
            productSlugSnapshot: "sofa-milan-cloud-3-cho",
            imageSnapshot:
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80",
          },
          {
            productId: createdProducts.get("den-san-halo-brass"),
            quantity: 1,
            unitPrice: 6900000,
            productNameSnapshot: "Đèn sàn Halo Brass",
            productSlugSnapshot: "den-san-halo-brass",
            imageSnapshot:
              "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      code: "LM260325002",
      customerName: "Le Minh Thu",
      phone: "0978 456 333",
      email: "minhthu@example.com",
      address: "Masteri Centre Point, Thu Duc, Ho Chi Minh City",
      note: "Yêu cầu lắp đặt hoàn thiện trong ngày.",
      status: OrderStatus.COMPLETED,
      subtotal: 38700000,
      shippingFee: 0,
      total: 38700000,
      items: {
        create: [
          {
            productId: createdProducts.get("ban-an-verona-stone-6-ghe"),
            quantity: 1,
            unitPrice: 28900000,
            productNameSnapshot: "Bàn ăn Verona Stone 6 ghế",
            productSlugSnapshot: "ban-an-verona-stone-6-ghe",
            imageSnapshot:
              "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
          },
          {
            productId: createdProducts.get("ghe-an-porto-leather"),
            quantity: 2,
            unitPrice: 4900000,
            productNameSnapshot: "Ghế ăn Porto Leather",
            productSlugSnapshot: "ghe-an-porto-leather",
            imageSnapshot:
              "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=1400&q=80",
          },
        ],
      },
    },
  });

  console.log("Seed completed successfully");
  console.log(`Admin account: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
