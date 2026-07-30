import { PublicLayout } from "@/components/layout/public-layout";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <PublicLayout>{children}</PublicLayout>
    </SmoothScrollProvider>
  );
}
