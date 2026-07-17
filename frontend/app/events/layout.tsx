import { PublicLayout } from "@/components/layout/public-layout";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
