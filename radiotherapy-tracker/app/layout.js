export const metadata = {
  title: "RT Advance Tracker",
  description: "Radiotherapy Patient Advance Management System",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <style>{`* { margin: 0; padding: 0; box-sizing: border-box; }`}</style>
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
