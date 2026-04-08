import {
  Bot,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  PhoneCall,
  Search,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "@/services/publicApi";
import { ChatbotHistoryTurn, ContactInfo, Product } from "@/types/api";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from "@/utils/constants";
import { formatCurrency, resolveImageUrl, resolveZaloUrl } from "@/utils/helpers";

type ChatbotAssistantProps = {
  contactInfo?: ContactInfo | null;
  triggerClassName?: string;
};

type ChatAction = {
  label: string;
  prompt?: string;
  to?: string;
  href?: string;
  variant?: "primary" | "secondary";
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  actions?: ChatAction[];
  products?: Product[];
};

const MAX_CHAT_HISTORY = 10;

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const hasKeyword = (value: string, keywords: string[]) => keywords.some((keyword) => value.includes(keyword));

const buildPrimaryActions = (contactInfo?: ContactInfo | null): ChatAction[] => {
  const zaloUrl = resolveZaloUrl(contactInfo?.zalo, contactInfo?.phone);

  return [
    { label: "Gợi ý sofa", prompt: "Gợi ý cho tôi sofa phòng khách", variant: "primary" },
    { label: "Giờ làm việc", prompt: "Giờ làm việc như thế nào?", variant: "secondary" },
    { label: "Phí giao hàng", prompt: "Phí giao hàng bao nhiêu?", variant: "secondary" },
    ...(zaloUrl
      ? [{ label: "Tư vấn qua Zalo", href: zaloUrl, variant: "secondary" as const }]
      : []),
  ];
};

const buildWelcomeMessage = (contactInfo?: ContactInfo | null): ChatMessage => ({
  id: createId(),
  role: "assistant",
  text:
    "Xin chào, mình là trợ lý tự động của Nội Thất Việt Hưng. Mình có thể gợi ý sản phẩm, trả lời nhanh về giao hàng, giờ làm việc và thông tin liên hệ.",
  actions: buildPrimaryActions(contactInfo),
});

const buildFallbackMessage = (contactInfo?: ContactInfo | null): ChatMessage => ({
  id: createId(),
  role: "assistant",
  text:
    "Mình chưa hiểu chính xác yêu cầu đó. Bạn có thể hỏi theo kiểu: “gợi ý sofa phòng khách”, “giờ làm việc”, “phí giao hàng” hoặc “liên hệ showroom”.",
  actions: buildPrimaryActions(contactInfo),
});

const buildErrorMessage = (contactInfo?: ContactInfo | null): ChatMessage => ({
  id: createId(),
  role: "assistant",
  text:
    "Mình đang gặp sự cố khi tra cứu dữ liệu. Bạn thử lại sau ít phút hoặc bấm tư vấn qua Zalo để đội ngũ hỗ trợ nhanh hơn.",
  actions: buildPrimaryActions(contactInfo),
});

const buildCategoryReply = async (contactInfo?: ContactInfo | null): Promise<ChatMessage> => {
  const categories = await publicApi.getCategories();
  const categoryPreview = categories.slice(0, 4);

  if (categories.length === 0) {
    return {
      id: createId(),
      role: "assistant",
      text: "Hiện mình chưa lấy được danh sách danh mục. Bạn có thể vào trang sản phẩm để xem toàn bộ bộ sưu tập.",
      actions: [{ label: "Xem sản phẩm", to: "/products", variant: "primary" }],
    };
  }

  return {
    id: createId(),
    role: "assistant",
    text: `Hiện cửa hàng có ${categories.length} nhóm nổi bật như ${categoryPreview
      .map((item) => item.name)
      .join(", ")}. Bạn muốn mình gợi ý sâu hơn theo nhóm nào?`,
    actions: [
      ...categoryPreview.map((item, index) => ({
        label: item.name,
        to: `/products?category=${item.slug}`,
        variant: index === 0 ? ("primary" as const) : ("secondary" as const),
      })),
      { label: "Xem tất cả", to: "/products", variant: "secondary" },
    ],
  };
};

const buildProductReply = async (input: string, contactInfo?: ContactInfo | null): Promise<ChatMessage> => {
  const normalized = normalizeText(input);
  const categories = await publicApi.getCategories().catch(() => []);
  const matchedCategory = categories.find((item) => normalizeText(item.name).split(" ").every((word) => normalized.includes(word)));

  let products = (await publicApi.getProducts({ search: input, limit: 3, sort: "featured" }).catch(() => null))?.items ?? [];
  let browseLink = "/products";
  let intro = "Mình vừa tìm nhanh một vài sản phẩm có thể phù hợp:";

  if (products.length === 0 && matchedCategory) {
    products = (await publicApi.getProducts({ category: matchedCategory.slug, limit: 3, sort: "featured" }).catch(
      () => null,
    ))?.items ?? [];
    browseLink = `/products?category=${matchedCategory.slug}`;
    intro = `Mình chưa thấy kết quả trùng hoàn toàn theo câu hỏi, nhưng có thể bạn đang quan tâm danh mục ${matchedCategory.name}:`;
  }

  if (products.length > 0) {
    return {
      id: createId(),
      role: "assistant",
      text: intro,
      products,
      actions: [
        { label: "Xem thêm sản phẩm", to: browseLink, variant: "primary" },
        ...buildPrimaryActions(contactInfo).slice(1, 3),
      ],
    };
  }

  return {
    id: createId(),
    role: "assistant",
    text:
      "Mình chưa tìm thấy mẫu khớp hoàn toàn. Bạn có thể mô tả cụ thể hơn về loại sản phẩm, chất liệu, màu sắc hoặc ngân sách để mình gợi ý sát hơn.",
    actions: [
      { label: "Xem toàn bộ sản phẩm", to: "/products", variant: "primary" },
      { label: "Danh mục nổi bật", prompt: "Hiện cửa hàng có những danh mục nào?", variant: "secondary" },
      ...buildPrimaryActions(contactInfo).slice(1, 2),
    ],
  };
};

const buildAssistantReply = async (input: string, contactInfo?: ContactInfo | null): Promise<ChatMessage> => {
  const normalized = normalizeText(input);
  const zaloUrl = resolveZaloUrl(contactInfo?.zalo, contactInfo?.phone);

  if (hasKeyword(normalized, ["xin chao", "chao", "hello", "hi", "alo"])) {
    return buildWelcomeMessage(contactInfo);
  }

  if (hasKeyword(normalized, ["gio lam", "gio mo cua", "lam viec", "mo cua"])) {
    return {
      id: createId(),
      role: "assistant",
      text: `Showroom hiện làm việc ${contactInfo?.workingHours || "theo giờ hành chính"}. Nếu bạn muốn hẹn lịch trước, mình có thể dẫn bạn sang kênh liên hệ nhanh.`,
      actions: buildPrimaryActions(contactInfo),
    };
  }

  if (hasKeyword(normalized, ["so dien thoai", "hotline", "lien he", "goi dien", "zalo", "email", "dia chi"])) {
    const contactLines = [
      contactInfo?.phone ? `Hotline: ${contactInfo.phone}` : "",
      contactInfo?.email ? `Email: ${contactInfo.email}` : "",
      contactInfo?.address ? `Địa chỉ: ${contactInfo.address}` : "",
    ].filter(Boolean);

    return {
      id: createId(),
      role: "assistant",
      text:
        contactLines.join("\n") ||
        "Bạn có thể để lại thông tin tại trang liên hệ hoặc nhắn Zalo để showroom phản hồi nhanh hơn.",
      actions: [
        ...(zaloUrl ? [{ label: "Mở Zalo", href: zaloUrl, variant: "primary" as const }] : []),
        { label: "Trang liên hệ", to: "/contact", variant: "secondary" },
      ],
    };
  }

  if (hasKeyword(normalized, ["giao hang", "ship", "van chuyen", "phi giao", "phi ship"])) {
    return {
      id: createId(),
      role: "assistant",
      text: `Phí giao hàng tiêu chuẩn hiện là ${formatCurrency(
        STANDARD_SHIPPING_FEE,
      )}. Đơn từ ${formatCurrency(FREE_SHIPPING_THRESHOLD)} sẽ được miễn phí giao hàng.`,
      actions: [
        { label: "Xem sản phẩm", to: "/products", variant: "primary" },
        { label: "Tư vấn thêm", prompt: "Cho tôi thông tin liên hệ showroom", variant: "secondary" },
      ],
    };
  }

  if (hasKeyword(normalized, ["bao hanh", "hau mai", "bao tri"])) {
    return {
      id: createId(),
      role: "assistant",
      text:
        "Nội thất Việt Hưng có chính sách bảo hành minh bạch theo từng dòng sản phẩm. Bạn có thể xem thông số, chất liệu và hỏi thêm đội ngũ tư vấn để nhận chính sách áp dụng cho mẫu cụ thể.",
      actions: [
        { label: "Gợi ý sản phẩm", prompt: "Gợi ý cho tôi vài mẫu nổi bật", variant: "primary" },
        { label: "Liên hệ showroom", prompt: "Cho tôi thông tin liên hệ showroom", variant: "secondary" },
      ],
    };
  }

  if (hasKeyword(normalized, ["danh muc", "nhom san pham", "co gi", "loai san pham"])) {
    return buildCategoryReply(contactInfo);
  }

  if (hasKeyword(normalized, ["bai viet", "tin tuc", "blog", "cam hung"])) {
    return {
      id: createId(),
      role: "assistant",
      text:
        "Mục bài viết đang tổng hợp cảm hứng thiết kế, xu hướng nội thất và mẹo bố trí không gian. Bạn có thể mở ngay để xem các bài mới nhất.",
      actions: [{ label: "Xem bài viết", to: "/posts", variant: "primary" }],
    };
  }

  if (
    hasKeyword(normalized, [
      "sofa",
      "ban",
      "ghe",
      "giuong",
      "tu",
      "ke",
      "den",
      "noi that",
      "san pham",
      "goi y",
      "tim",
      "mau",
      "bao gia",
    ])
  ) {
    return buildProductReply(input, contactInfo);
  }

  return buildFallbackMessage(contactInfo);
};

const buildChatHistory = (messages: ChatMessage[]): ChatbotHistoryTurn[] =>
  messages
    .map((message) => ({
      role: message.role,
      text: message.text.trim(),
    }))
    .filter((message) => message.text.length > 0)
    .slice(-MAX_CHAT_HISTORY);

const buildAiAssistantReply = async (
  input: string,
  messages: ChatMessage[],
  contactInfo?: ContactInfo | null,
): Promise<ChatMessage> => {
  const data = await publicApi.createChatbotReply({
    message: input,
    history: buildChatHistory(messages),
  });

  const actions =
    data.products.length > 0
      ? [
          { label: "Xem thêm sản phẩm", to: "/products", variant: "primary" as const },
          ...buildPrimaryActions(contactInfo).slice(1, 3),
        ]
      : buildPrimaryActions(contactInfo);

  return {
    id: createId(),
    role: "assistant",
    text: data.text,
    products: data.products,
    actions,
  };
};

const ActionButton = ({
  action,
  onPrompt,
}: {
  action: ChatAction;
  onPrompt: (prompt: string) => void;
}) => {
  const className =
    action.variant === "primary"
      ? "inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#262626]"
      : "inline-flex items-center gap-2 rounded-full border border-[#dfd4c6] bg-white px-4 py-2 text-xs font-semibold text-espresso transition hover:border-[#c7b59a] hover:bg-[#fbfaf7]";

  if (action.to) {
    return (
      <Link className={className} to={action.to}>
        {action.label}
      </Link>
    );
  }

  if (action.href) {
    return (
      <a className={className} href={action.href} rel="noreferrer" target="_blank">
        {action.label}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <button className={className} onClick={() => onPrompt(action.prompt ?? action.label)} type="button">
      {action.label}
    </button>
  );
};

export const ChatbotAssistant = ({ contactInfo, triggerClassName }: ChatbotAssistantProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage(contactInfo)]);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasFloatingContact = Boolean(resolveZaloUrl(contactInfo?.zalo, contactInfo?.phone));

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: open ? "smooth" : "auto" });
  }, [messages, isTyping, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [open]);

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0]?.role !== "assistant") {
        return current;
      }

      return [buildWelcomeMessage(contactInfo)];
    });
  }, [contactInfo]);

  const handlePrompt = async (rawValue: string) => {
    const value = rawValue.trim();

    if (!value || isTyping) {
      return;
    }

    setMessages((current) => [...current, { id: createId(), role: "user", text: value }]);
    setInput("");
    setIsTyping(true);

    try {
      const reply = await buildAiAssistantReply(value, messages, contactInfo).catch(() =>
        buildAssistantReply(value, contactInfo),
      );
      await new Promise((resolve) => window.setTimeout(resolve, 420));
      setMessages((current) => [...current, reply]);
    } catch {
      setMessages((current) => [...current, buildErrorMessage(contactInfo)]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handlePrompt(input);
  };

  const triggerWrapperClassName =
    triggerClassName ??
    `fixed right-4 z-[65] sm:right-6 ${hasFloatingContact ? "bottom-24 sm:bottom-28" : "bottom-5 sm:bottom-6"}`;

  return (
    <>
      <div className={triggerWrapperClassName}>
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Chat tu van nhanh"
          className={`group relative inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#e1cfb7] bg-[linear-gradient(155deg,#1f1812_0%,#3e2e21_60%,#7b5630_100%)] text-[#f4d09b] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_30px_rgba(17,17,17,0.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_36px_rgba(17,17,17,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b98d] focus-visible:ring-offset-2 ${
            open ? "ring-1 ring-[#f0c98a]/45" : ""
          }`}
          onClick={() => setOpen((current) => !current)}
          title="Chat tư vấn nhanh"
          type="button"
        >
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/12 bg-[linear-gradient(145deg,#f4ddaf_0%,#d9ae69_48%,#9d6d35_100%)] text-[#17130e] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <Bot className="h-4.5 w-4.5" />
          </span>
          <span className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#fff6e7]/18 text-[#f7ddb0]">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
          <span className="sr-only">Chat tư vấn nhanh</span>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-x-0 bottom-0 z-[90] flex justify-end px-3 pb-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:px-0 sm:pb-0">
          <div className="w-full max-w-[430px] overflow-hidden rounded-[28px] border border-[#e6dccc] bg-[#fbfaf7] shadow-[0_32px_80px_rgba(17,17,17,0.22)]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#151515_0%,#2a241d_55%,#8e6431_100%)] px-5 pb-5 pt-5 text-white">
              <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute left-10 top-0 h-20 w-20 rounded-full bg-[#f0c98a]/15 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
                    <Sparkles className="h-3.5 w-3.5" />
                    Online 24/7
                  </div>
                  <h3 className="mt-3 text-[26px] font-bold tracking-[-0.04em] text-white">Trợ lý Nội Thất Việt Hưng</h3>
                  <p className="mt-2 max-w-[280px] text-sm leading-6 text-white/78">
                    Hỏi nhanh về sản phẩm, giao hàng, thông tin showroom hoặc nhờ gợi ý theo nhu cầu.
                  </p>
                </div>

                <button
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white transition hover:bg-white/16"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex max-h-[72vh] min-h-[560px] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[92%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`rounded-[22px] px-4 py-3 text-sm leading-7 shadow-soft ${
                          message.role === "user"
                            ? "bg-[#111111] text-white"
                            : "border border-[#eadfcd] bg-white text-espresso"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>

                      {message.products?.length ? (
                        <div className="mt-3 grid gap-3">
                          {message.products.map((product) => (
                            <Link
                              key={product.id}
                              className="grid grid-cols-[88px,1fr] gap-3 rounded-[18px] border border-[#eadfcd] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#d8c6ae]"
                              to={`/products/${product.slug}`}
                            >
                              <img
                                alt={product.name}
                                className="h-24 w-full rounded-[14px] object-cover"
                                src={resolveImageUrl(product.images[0]?.url)}
                              />
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-semibold leading-6 text-espresso">
                                  {product.name}
                                </p>
                                <p className="mt-1 text-sm font-bold text-[#9b6a2b]">
                                  {formatCurrency(product.price)}
                                </p>
                                <p className="mt-2 line-clamp-2 text-xs leading-6 text-stone">
                                  {product.shortDescription}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : null}

                      {message.actions?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action) => (
                            <ActionButton key={`${message.id}-${action.label}`} action={action} onPrompt={handlePrompt} />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {isTyping ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-3 rounded-[20px] border border-[#eadfcd] bg-white px-4 py-3 text-sm text-stone shadow-soft">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f5efe7] text-[#8b6430]">
                        <Search className="h-4 w-4 animate-pulse" />
                      </div>
                      <span>Đang tìm câu trả lời phù hợp...</span>
                    </div>
                  </div>
                ) : null}

                <div ref={messageEndRef} />
              </div>

              <div className="border-t border-[#eee4d7] bg-white px-4 py-4 sm:px-5">
                <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-stone">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f1e7] px-3 py-1 font-semibold text-[#8c6432]">
                    <Clock3 className="h-3.5 w-3.5" />
                    Trả lời tự động
                  </span>
                  {contactInfo?.phone ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f6f6] px-3 py-1 font-semibold">
                      <PhoneCall className="h-3.5 w-3.5" />
                      {contactInfo.phone}
                    </span>
                  ) : null}
                  {contactInfo?.address ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f6f6] px-3 py-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5" />
                      Xem showroom
                    </span>
                  ) : null}
                </div>

                <div className="rounded-[22px] border border-[#e8ddcf] bg-[#fbfaf7] p-2">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      className="min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-espresso outline-none placeholder:text-stone/70"
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ví dụ: Gợi ý cho tôi sofa phòng khách"
                      rows={2}
                      value={input}
                    />
                    <button
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white transition hover:bg-[#242424] disabled:cursor-not-allowed disabled:bg-[#c7b9a6]"
                      disabled={isTyping || input.trim().length === 0}
                      onClick={() => void handlePrompt(input)}
                      type="button"
                    >
                      {isTyping ? <MessageCircle className="h-5 w-5 animate-pulse" /> : <SendHorizontal className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
