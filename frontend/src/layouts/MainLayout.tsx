import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatbotAssistant } from "@/components/ChatbotAssistant";
import { useContactInfoQuery } from "@/hooks/usePublicQueries";

export const MainLayout = () => {
  const { data: contactInfo = null } = useContactInfoQuery();

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <Header contactInfo={contactInfo} />
      <main>
        <Outlet />
      </main>
      <Footer contactInfo={contactInfo} />
      <div className="fixed bottom-5 right-4 z-[65] sm:bottom-6 sm:right-6">
        <div className="rounded-[26px] border border-[#ebe3d8] bg-[linear-gradient(135deg,#fffdfa_0%,#f6f1ea_100%)] p-2 shadow-[0_20px_50px_rgba(37,27,16,0.14)]">
          <div className="flex items-center">
            <ChatbotAssistant contactInfo={contactInfo} triggerClassName="shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
