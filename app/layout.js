import "./globals.css";

export const metadata = {
  title: "German Tutor",
  description: "Learn German with your AI tutor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
