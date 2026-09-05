import { Helmet } from "react-helmet-async";

interface ProductSEOProps {
  name: string;
  designer: string;
  description: string;
  rentalPrice: number;
  retailPrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  productId: string;
}

const SITE_URL = "https://rentrobe.com";

const ProductSEO = ({
  name,
  designer,
  description,
  rentalPrice,
  retailPrice,
  image,
  rating,
  reviewCount,
  available,
  productId,
}: ProductSEOProps) => {
  const title = `${name} by ${designer} — Rent on RentRobe`;
  const metaDescription = description.length > 155 ? description.slice(0, 152) + "..." : description;
  const productUrl = `${SITE_URL}/product/${productId}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image.startsWith("http") ? image : `${SITE_URL}${image}`,
    brand: {
      "@type": "Brand",
      name: designer,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: rentalPrice,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={productUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={productUrl} />
      <meta property="og:image" content={image.startsWith("http") ? image : `${SITE_URL}${image}`} />
      <meta property="og:site_name" content="RentRobe" />
      <meta property="product:price:amount" content={String(rentalPrice)} />
      <meta property="product:price:currency" content="INR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image.startsWith("http") ? image : `${SITE_URL}${image}`} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default ProductSEO;
