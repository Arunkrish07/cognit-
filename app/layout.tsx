import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ContactModalProvider } from "@/components/ContactModalProvider";
import { ContactModal } from "@/components/ContactModal";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Preloader } from "@/components/Preloader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { site } from "@/data/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: "Cognit | Freelance Web & App Developer, AI & WhatsApp Automation",
  description:
    "Cognit builds websites, mobile apps, AI automation and WhatsApp automation for growing businesses in India. Book a free call.",
  alternates: { canonical: site.domain },
  openGraph: {
    title: "Cognit | Made to think. Built to work.",
    description:
      "Websites, apps and AI automation for growing businesses in India.",
    url: site.domain,
    siteName: "Cognit",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Cognit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognit | Made to think. Built to work.",
    description:
      "Websites, apps and AI automation for growing businesses in India.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F4F4",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Cognit",
  url: site.domain,
  email: site.email,
  telephone: `+${site.whatsappNumber}`,
  description:
    "Cognit builds websites, mobile apps, AI automation and WhatsApp automation for growing businesses in India. Book a free call.",
  areaServed: "India",
  sameAs: [
    site.social.instagram,
    site.social.youtube,
    site.social.linkedin,
    ...(site.social.github ? [site.social.github] : []),
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute("data-theme","light");`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${jakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ContactModalProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <ScrollProgress />
            <Preloader />
            <Navbar />
            <SmoothScroll>
              <main id="main">{children}</main>
            </SmoothScroll>
            <Footer />
            <WhatsAppFab />
            <ContactModal />
          </ContactModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
