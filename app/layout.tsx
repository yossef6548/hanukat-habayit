
import "./globals.css";

export const metadata = {
  title: "חנוכת הבית - חלוקת קריאה",
  description: "בחירת קטעים לקריאה משותפת בזמן אמת",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto w-full max-w-md px-4 py-4">{children}</div>
      </body>
    </html>
  );
}
