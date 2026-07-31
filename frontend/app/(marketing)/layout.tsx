import { PublicLayout } from "@/components/layout/public-layout";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import AntigravityCursor from "@/components/ui/antigravity-cursor";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <AntigravityCursor />
      <div className="relative z-10">
        <PublicLayout>{children}</PublicLayout>
      </div>
    </SmoothScrollProvider>
  );
}
