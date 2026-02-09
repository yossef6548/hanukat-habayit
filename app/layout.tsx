
import "./globals.css";
import WifiInfoButton from "@/components/WifiInfoButton";

export const metadata = {
  title: "חנוכת הבית - חלוקת קריאה",
  description: "בחירת קטעים לקריאה משותפת בזמן אמת",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
          <div className="relative mx-auto w-full max-w-md px-4 py-4 text-center">
            <WifiInfoButton />
            <div className="text-2xl font-extrabold">חנוכת הבית</div>
            <div className="text-neutral-300">יוסף & הודיה</div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-md px-4 pb-4 pt-24">{children}</div>
      </body>
    </html>
  );
}
