import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="description" content="ZamaVote - Blockchain üzerinde gizli oylama sistemi. Fully Homomorphic Encryption ile güvenli ve şeffaf oylamalar." />
        <meta property="og:title" content="ZamaVote - Gizli Blockchain Oylama" />
        <meta property="og:description" content="FHE teknolojisi ile tam gizlilik sağlayan blockchain oylama sistemi" />
        <meta property="og:image" content="/logo.svg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@suatayaz_" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}