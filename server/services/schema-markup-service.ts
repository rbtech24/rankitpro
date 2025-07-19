/**
 * Schema.org Markup Generator Service
 * Generates structured data markup for local business SEO
 */

export interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  serviceTypes?: string[];
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface ServiceVisit {
  id: number;
  jobType: string;
  customerName?: string;
  address?: string;
  completedAt: Date;
  photos?: string[];
  description?: string;
  technician?: string;
  rating?: number;
}

export interface ReviewData {
  rating: number;
  reviewText: string;
  customerName: string;
  serviceType: string;
  reviewDate: Date;
  businessName: string;
}

export class SchemaMarkupService {
  
  /**
   * Generate LocalBusiness schema markup
   */
  generateLocalBusinessSchema(business: BusinessInfo): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": business.name,
      "description": business.description || error instanceof Error ? error.message : String(error),
      "url": business.website,
      "telephone": business.phone,
      "address": business.address ? {
        "@type": "PostalAddress",
        "streetAddress": business.address
      } : undefined,
      "geo": business.latitude && business.longitude ? {
        "@type": "GeoCoordinates",
        "latitude": business.latitude,
        "longitude": business.longitude
      } : undefined,
      "serviceType": business.serviceTypes,
      "areaServed": {
        "@type": "State",
        "name": "Local Area"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services",
        "itemListElement": business.serviceTypes?.map((service, index) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service
          }
        })) || []
      }
    };

    // Remove undefined fields
    const cleanSchema = JSON.parse(JSON.stringify(schema, (key, value) => 
      value === undefined ? undefined : value
    ));

    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Generate Service schema markup for individual visits
   */
  generateServiceSchema(visit: ServiceVisit, business: BusinessInfo): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": visit.jobType,
      "description": visit.description || error instanceof Error ? error.message : String(error),
      "provider": {
        "@type": "LocalBusiness",
        "name": business.name,
        "telephone": business.phone,
        "url": business.website
      },
      "serviceType": visit.jobType,
      "areaServed": visit.address ? {
        "@type": "PostalAddress",
        "streetAddress": visit.address
      } : undefined,
      "dateModified": visit.completedAt.toISOString(),
      "image": visit.photos?.map(photo => ({
        "@type": "ImageObject",
        "url": photo,
        "caption": error instanceof Error ? error.message : String(error)
      })),
      "performer": visit.technician ? {
        "@type": "Person",
        "name": visit.technician,
        "worksFor": {
          "@type": "LocalBusiness",
          "name": business.name
        }
      } : undefined
    };

    const cleanSchema = JSON.parse(JSON.stringify(schema, (key, value) => 
      value === undefined ? undefined : value
    ));

    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Generate Review schema markup
   */
  generateReviewSchema(review: ReviewData): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "author": {
        "@type": "Person",
        "name": review.customerName
      },
      "reviewBody": review.reviewText,
      "datePublished": review.reviewDate.toISOString(),
      "itemReviewed": {
        "@type": "LocalBusiness",
        "name": review.businessName,
        "serviceType": review.serviceType
      }
    };

    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Generate AggregateRating schema for multiple reviews
   */
  generateAggregateRatingSchema(reviews: ReviewData[], business: BusinessInfo): string {
    if (reviews.length === 0) return '';

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": business.name,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": Math.round(averageRating * 10) / 10,
        "reviewCount": reviews.length,
        "bestRating": 5,
        "worstRating": 1
      },
      "review": reviews.map(review => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": 5
        },
        "author": {
          "@type": "Person",
          "name": review.customerName
        },
        "reviewBody": review.reviewText,
        "datePublished": review.reviewDate.toISOString()
      }))
    };

    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Generate BlogPosting schema for service case studies
   */
  generateBlogPostingSchema(post: {
    title: string;
    placeholder: string;
    publishDate: Date;
    author: string;
    businessName: string;
    serviceType: string;
    images?: string[];
  }): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "articleBody": post.placeholder,
      "datePublished": post.publishDate.toISOString(),
      "dateModified": post.publishDate.toISOString(),
      "author": {
        "@type": "Organization",
        "name": post.businessName
      },
      "publisher": {
        "@type": "Organization",
        "name": post.businessName
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "#webpage"
      },
      "image": post.images?.map(image => ({
        "@type": "ImageObject",
        "url": image,
        "caption": error instanceof Error ? error.message : String(error)
      })),
      "keywords": [post.serviceType, "professional service", "case study"],
      "articleSection": "Service Case Studies",
      "about": {
        "@type": "Service",
        "name": post.serviceType,
        "serviceType": post.serviceType
      }
    };

    const cleanSchema = JSON.parse(JSON.stringify(schema, (key, value) => 
      value === undefined ? undefined : value
    ));

    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Generate VideoObject schema for video testimonials
   */
  generateVideoSchema(video: {
    name: string;
    description: string;
    thumbnailUrl?: string;
    uploadDate: Date;
    duration?: string;
    businessName: string;
  }): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": video.name,
      "description": video.description,
      "thumbnailUrl": video.thumbnailUrl,
      "uploadDate": video.uploadDate.toISOString(),
      "duration": video.duration || "PT2M",
      "publisher": {
        "@type": "Organization",
        "name": video.businessName
      },
      "placeholderUrl": "#video-placeholder",
      "embedUrl": "#video-embed"
    };

    const cleanSchema = JSON.parse(JSON.stringify(schema, (key, value) => 
      value === undefined ? undefined : value
    ));

    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Generate FAQ schema for common service questions
   */
  generateFAQSchema(faqs: Array<{question: string; answer: string}>): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Generate comprehensive schema markup for a complete service page
   */
  generateCompletePageSchema(data: {
    business: BusinessInfo;
    visit?: ServiceVisit;
    reviews?: ReviewData[];
    blogPost?: any;
    video?: any;
    faqs?: Array<{question: string; answer: string}>;
  }): string {
    const schemas: string[] = [];

    // Always include business schema
    schemas.push(this.generateLocalBusinessSchema(data.business));

    // Add service schema if visit data is provided
    if (data.visit) {
      schemas.push(this.generateServiceSchema(data.visit, data.business));
    }

    // Add review schemas
    if (data.reviews && data.reviews.length > 0) {
      // Individual reviews
      data.reviews.forEach(review => {
        schemas.push(this.generateReviewSchema(review));
      });
      
      // Aggregate rating
      schemas.push(this.generateAggregateRatingSchema(data.reviews, data.business));
    }

    // Add blog post schema
    if (data.blogPost) {
      schemas.push(this.generateBlogPostingSchema(data.blogPost));
    }

    // Add video schema
    if (data.video) {
      schemas.push(this.generateVideoSchema(data.video));
    }

    // Add FAQ schema
    if (data.faqs && data.faqs.length > 0) {
      schemas.push(this.generateFAQSchema(data.faqs));
    }

    return schemas.join('\n\n');
  }
}

export const schemaMarkupService = new SchemaMarkupService();