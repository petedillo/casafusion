import './globals.css';

export const metadata = {
  title: 'CasaFusión - Household Services Management',
  description: 'Manage your household services with CasaFusión',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
} 