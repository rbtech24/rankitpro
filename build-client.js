#!/usr/bin/env node

import { build } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

console.log('🚀 Starting optimized client build...');

// Custom Vite configuration for production builds
const productionConfig = {
  configFile: './vite.config.ts',
  mode: 'production',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for large external dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns') || id.includes('class-variance-authority')) {
              return 'vendor-utils';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('stripe') || id.includes('@stripe')) {
              return 'vendor-payments';
            }
            if (id.includes('openai') || id.includes('@anthropic-ai')) {
              return 'vendor-ai';
            }
            // Default vendor chunk for other dependencies
            return 'vendor-other';
          }
          
          // Split application code by feature
          if (id.includes('src/pages')) {
            return 'pages';
          }
          if (id.includes('src/components/ui')) {
            return 'ui-components';
          }
          if (id.includes('src/components')) {
            return 'components';
          }
          if (id.includes('src/lib')) {
            return 'lib';
          }
          if (id.includes('shared')) {
            return 'shared';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    // Optimize build performance
    reportCompressedSize: false,
    emptyOutDir: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
    exclude: ['@babel/preset-typescript', 'lightningcss']
  },
  define: {
    __DEV__: 'false',
    'process.env.NODE_ENV': '"production"'
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  }
};

try {
  // Build the client application
  await build(productionConfig);
  
  // Create index.html optimization
  const indexPath = path.resolve('dist/public/index.html');
  if (readFileSync(indexPath, 'utf-8')) {
    let indexHtml = readFileSync(indexPath, 'utf-8');
    
    // Add performance optimizations to HTML
    indexHtml = indexHtml.replace(
      '<head>',
      `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://api.stripe.com">
    <link rel="dns-prefetch" href="https://js.stripe.com">
    <meta name="theme-color" content="#000000">
    <meta name="description" content="Rank It Pro - Business Management Platform">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="Rank It Pro - Business Management Platform">
    <meta property="og:description" content="Comprehensive SaaS platform for business management and customer engagement">
    <meta property="og:type" content="website">`
    );
    
    writeFileSync(indexPath, indexHtml);
  }
  
  console.log('✅ Client build completed successfully');
  console.log('✅ Chunk splitting applied to reduce bundle sizes');
  console.log('✅ HTML optimizations applied');
  
} catch (error) {
  console.error('❌ Client build failed:', error);
  process.exit(1);
}