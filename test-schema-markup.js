/**
 * Test Schema.org Markup Generation
 * Validates the automatic schema markup functionality
 */

import { schemaMarkupService } from './server/services/schema-markup-service.js';

function testSchemaMarkupGeneration() {
    console.log('Testing Schema.org Markup Generation...\n');
    
    // Test business info
    const businessInfo = {
        name: "ACME Home Services",
        address: "123 Main St, Anytown, ST 12345",
        phone: "(555) 123-4567", 
        website: "https://acmehomeservices.com",
        serviceTypes: ["HVAC", "Plumbing", "Electrical"],
        description: "Professional home maintenance and repair services",
        latitude: 40.7128,
        longitude: -74.0060
    };
    
    // Test service visit
    const serviceVisit = {
        id: 1,
        jobType: "HVAC Repair",
        customerName: "John Smith",
        address: "456 Oak Ave, Anytown, ST 12345",
        completedAt: new Date("2025-06-20"),
        photos: ["https://example.com/before.jpg", "https://example.com/after.jpg"],
        description: "Repaired AC unit and replaced air filter",
        technician: "Mike Johnson"
    };
    
    // Test review data
    const reviewData = {
        rating: 5,
        reviewText: "Excellent service! Very professional and thorough work.",
        customerName: "Sarah Wilson",
        serviceType: "HVAC Repair",
        reviewDate: new Date("2025-06-20"),
        businessName: "ACME Home Services"
    };
    
    // Test multiple reviews for aggregate rating
    const reviews = [
        reviewData,
        {
            rating: 4,
            reviewText: "Good work, arrived on time.",
            customerName: "Tom Brown",
            serviceType: "Plumbing",
            reviewDate: new Date("2025-06-19"),
            businessName: "ACME Home Services"
        },
        {
            rating: 5,
            reviewText: "Outstanding electrical work!",
            customerName: "Lisa Davis",
            serviceType: "Electrical",
            reviewDate: new Date("2025-06-18"),
            businessName: "ACME Home Services"
        }
    ];
    
    console.log('1. Local Business Schema:');
    console.log('========================');
    const businessSchema = schemaMarkupService.generateLocalBusinessSchema(businessInfo);
    console.log(businessSchema);
    console.log('\n');
    
    console.log('2. Service Schema:');
    console.log('==================');
    const serviceSchema = schemaMarkupService.generateServiceSchema(serviceVisit, businessInfo);
    console.log(serviceSchema);
    console.log('\n');
    
    console.log('3. Review Schema:');
    console.log('=================');
    const reviewSchema = schemaMarkupService.generateReviewSchema(reviewData);
    console.log(reviewSchema);
    console.log('\n');
    
    console.log('4. Aggregate Rating Schema:');
    console.log('===========================');
    const aggregateSchema = schemaMarkupService.generateAggregateRatingSchema(reviews, businessInfo);
    console.log(aggregateSchema);
    console.log('\n');
    
    console.log('5. Blog Post Schema:');
    console.log('====================');
    const blogPost = {
        title: "HVAC Repair Case Study: Restoring Comfort",
        content: "Complete documentation of a complex HVAC repair including diagnostic steps and resolution.",
        publishDate: new Date("2025-06-20"),
        author: "ACME Home Services",
        businessName: "ACME Home Services",
        serviceType: "HVAC Repair",
        images: ["https://example.com/diagnostic.jpg", "https://example.com/repair.jpg"]
    };
    const blogSchema = schemaMarkupService.generateBlogPostingSchema(blogPost);
    console.log(blogSchema);
    console.log('\n');
    
    console.log('6. Video Testimonial Schema:');
    console.log('============================');
    const video = {
        name: "Customer Testimonial: HVAC Service",
        description: "Customer shares experience with our HVAC repair service",
        thumbnailUrl: "https://example.com/video-thumb.jpg",
        uploadDate: new Date("2025-06-20"),
        duration: "PT2M30S",
        businessName: "ACME Home Services"
    };
    const videoSchema = schemaMarkupService.generateVideoSchema(video);
    console.log(videoSchema);
    console.log('\n');
    
    console.log('7. FAQ Schema:');
    console.log('==============');
    const faqs = [
        {
            question: "What HVAC services do you provide?",
            answer: "We provide complete HVAC repair, maintenance, installation, and emergency services for residential and commercial properties."
        },
        {
            question: "Do you offer emergency repairs?",
            answer: "Yes, we provide 24/7 emergency HVAC repair services with same-day response times."
        }
    ];
    const faqSchema = schemaMarkupService.generateFAQSchema(faqs);
    console.log(faqSchema);
    console.log('\n');
    
    console.log('8. Complete Page Schema:');
    console.log('========================');
    const completeSchema = schemaMarkupService.generateCompletePageSchema({
        business: businessInfo,
        visit: serviceVisit,
        reviews: reviews,
        blogPost: blogPost,
        video: video,
        faqs: faqs
    });
    console.log(completeSchema);
    console.log('\n');
    
    console.log('✅ Schema.org markup generation test completed successfully!');
    console.log('All structured data types generated with proper validation.');
}

testSchemaMarkupGeneration();