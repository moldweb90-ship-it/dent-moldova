#!/usr/bin/env node

import https from 'https';
import http from 'http';

const BASE_URL = 'https://mdent.md';
const PROBLEM_URLS = [
  '/city/balti/credit',
  '/city/balti/parking',
  '/city/balti/sos',
  '/city/balti/weekend-work',
  '/city/balti/work24h',
  '/city/bel-tsy/credit/',
  '/city/bel-tsy/weekend-work',
  '/city/bender',
  '/city/bender/credit',
  '/city/bender/sos',
  '/city/bender/weekend-work/',
  '/city/bender/work24h',
  '/city/bendery/weekend-work',
  '/city/cahul',
  '/city/cahul/credit',
  '/city/cahul/parking',
  '/city/cahul/pediatric-dentistry',
  '/city/cahul/weekend-work',
  '/city/ceadir-lunga/credit',
  '/city/ceadir-lunga/parking',
  '/city/ceadir-lunga/pediatric-dentistry',
  '/city/ceadir-lunga/sos',
  '/city/ceadir-lunga/weekend-work',
  '/city/ceadir-lunga/work24h',
  '/city/chisinau/botanica',
  '/city/chisinau/botanica/credit',
  '/city/chisinau/botanica/parking',
  '/city/chisinau/botanica/pediatric-dentistry',
  '/city/chisinau/botanica/sos',
  '/city/chisinau/botanica/weekend-work',
  '/city/chisinau/botanica/work24h',
  '/city/chisinau/buiucani',
  '/city/chisinau/buiucani/credit',
  '/city/chisinau/buiucani/weekend-work',
  '/city/chisinau/buiucani/work24h',
  '/city/chisinau/centru/credit',
  '/city/chisinau/centru/parking',
  '/city/chisinau/centru/pediatric-dentistry',
  '/city/chisinau/centru/sos',
  '/city/chisinau/centru/work24h',
  '/city/chisinau/ciocana',
  '/city/chisinau/ciocana/credit',
  '/city/chisinau/ciocana/parking',
  '/city/chisinau/ciocana/pediatric-dentistry',
  '/city/chisinau/ciocana/sos',
  '/city/chisinau/ciocana/weekend-work',
  '/city/chisinau/ciocana/work24h',
  '/city/chisinau/ciocana/work24h/',
  '/city/chisinau/durlesti',
  '/city/chisinau/durlesti/credit'
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractMetaTags(html) {
  const metaTags = {};
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    metaTags.title = titleMatch[1];
  }
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (descMatch) {
    metaTags.description = descMatch[1];
  }
  
  // Extract canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  if (canonicalMatch) {
    metaTags.canonical = canonicalMatch[1];
  }
  
  // Extract robots
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  if (robotsMatch) {
    metaTags.robots = robotsMatch[1];
  }
  
  // Extract hreflang
  const hreflangMatches = html.match(/<link[^>]*hreflang=["']([^"']*)["'][^>]*href=["']([^"']*)["']/gi);
  if (hreflangMatches) {
    metaTags.hreflang = hreflangMatches.map(match => {
      const [, lang, href] = match.match(/hreflang=["']([^"']*)["'][^>]*href=["']([^"']*)["']/i);
      return { lang, href };
    });
  }
  
  return metaTags;
}

async function checkSEO() {
  console.log('🔍 Проверка SEO проблемных страниц...\n');
  
  const results = [];
  
  for (const path of PROBLEM_URLS.slice(0, 10)) { // Проверяем первые 10 для примера
    const url = BASE_URL + path;
    
    try {
      console.log(`📄 Проверяю: ${url}`);
      
      const response = await fetchPage(url);
      
      if (response.statusCode === 200) {
        const metaTags = extractMetaTags(response.body);
        
        const result = {
          url,
          status: 'OK',
          title: metaTags.title || 'НЕТ TITLE',
          description: metaTags.description || 'НЕТ DESCRIPTION',
          canonical: metaTags.canonical || 'НЕТ CANONICAL',
          robots: metaTags.robots || 'НЕТ ROBOTS',
          hreflang: metaTags.hreflang || []
        };
        
        results.push(result);
        
        console.log(`  ✅ Статус: ${response.statusCode}`);
        console.log(`  📝 Title: ${result.title.substring(0, 60)}...`);
        console.log(`  🔗 Canonical: ${result.canonical}`);
        console.log(`  🤖 Robots: ${result.robots}`);
        console.log(`  🌐 Hreflang: ${result.hreflang.length} тегов`);
        console.log('');
        
      } else {
        console.log(`  ❌ Ошибка: HTTP ${response.statusCode}\n`);
        results.push({
          url,
          status: 'ERROR',
          error: `HTTP ${response.statusCode}`
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Ошибка: ${error.message}\n`);
      results.push({
        url,
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  // Сводка
  console.log('\n📊 СВОДКА ПРОВЕРКИ:');
  console.log('==================');
  
  const okCount = results.filter(r => r.status === 'OK').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ Успешно: ${okCount}`);
  console.log(`❌ Ошибки: ${errorCount}`);
  
  // Проблемы с canonical
  const noCanonical = results.filter(r => r.status === 'OK' && r.canonical === 'НЕТ CANONICAL');
  if (noCanonical.length > 0) {
    console.log(`\n⚠️  Страницы БЕЗ canonical тегов: ${noCanonical.length}`);
    noCanonical.forEach(r => console.log(`   - ${r.url}`));
  }
  
  // Проблемы с title
  const noTitle = results.filter(r => r.status === 'OK' && r.title === 'НЕТ TITLE');
  if (noTitle.length > 0) {
    console.log(`\n⚠️  Страницы БЕЗ title: ${noTitle.length}`);
    noTitle.forEach(r => console.log(`   - ${r.url}`));
  }
  
  // Проблемы с description
  const noDescription = results.filter(r => r.status === 'OK' && r.description === 'НЕТ DESCRIPTION');
  if (noDescription.length > 0) {
    console.log(`\n⚠️  Страницы БЕЗ description: ${noDescription.length}`);
    noDescription.forEach(r => console.log(`   - ${r.url}`));
  }
  
  console.log('\n🎯 РЕКОМЕНДАЦИИ:');
  console.log('================');
  console.log('1. Убедитесь, что все страницы имеют canonical теги с абсолютными URL');
  console.log('2. Проверьте, что canonical URL указывают на правильные страницы');
  console.log('3. Добавьте hreflang теги для многоязычности');
  console.log('4. Убедитесь, что robots теги разрешают индексацию');
  console.log('5. Проверьте, что контент на страницах уникален и релевантен');
}

// Запуск проверки
checkSEO().catch(console.error);
