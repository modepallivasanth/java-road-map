const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const tabsHtml = `
  <div class="category-tabs-container">
    <div class="category-tabs">
      <button class="category-tab active" data-target="all">All Topics</button>
      <button class="category-tab" data-target="core">Core Java & Fundamentals</button>
      <button class="category-tab" data-target="concurrency">Concurrency & JVM</button>
      <button class="category-tab" data-target="spring">Spring Ecosystem</button>
      <button class="category-tab" data-target="architecture">Architecture & System Design</button>
      <button class="category-tab" data-target="databases">Databases, DevOps & Testing</button>
      <button class="category-tab" data-target="interview">Interview Questions</button>
    </div>
  </div>
`;

// Insert tabs after header
content = content.replace('  </header>', '  </header>\n\n' + tabsHtml);

// Define categories
const categories = {
  'core': ['core-java', 'oop', 'collections', 'generics', 'exceptions', 'modern-java'],
  'concurrency': ['concurrency', 'loom', 'jvm'],
  'spring': ['spring-core', 'spring-boot', 'spring-data', 'spring-security', 'spring-web'],
  'architecture': ['patterns', 'dsa', 'api-design', 'graphql-grpc', 'microservices', 'messaging', 'system-design', 'resilience'],
  'databases': ['databases', 'caching', 'testing', 'devops', 'cloud'],
  'interview': ['interview', 'interview-question-bank']
};

const idToCategory = {};
for (const [category, ids] of Object.entries(categories)) {
  for (const id of ids) {
    idToCategory[id] = category;
  }
}

// Replace sections
content = content.replace(/<section class="topic-section" id="([^"]+)">/g, (match, id) => {
  const cat = idToCategory[id] || 'all';
  return `<section class="topic-section" id="${id}" data-category="${cat}">`;
});

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Successfully updated index.html');
