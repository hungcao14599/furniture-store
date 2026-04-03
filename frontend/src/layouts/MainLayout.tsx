import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactActions } from "@/components/FloatingContactActions";
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
      <FloatingContactActions contactInfo={contactInfo} />
    </div>
  );
};
