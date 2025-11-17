// Test search functionality
const posts = [
  { id: '1', content: 'Excited to share', author: { name: 'Sarah Johnson' } },
  { id: '2', content: 'React performance', author: { name: 'Sarah Johnson' } },
  { id: '3', content: 'My journey', author: { name: 'Michael Chen' } }
];

const searchQuery = 'sarah';

const filteredPosts = posts.filter((post) => {
  if (!searchQuery.trim()) return true;
  const query = searchQuery.toLowerCase();
  return (
    post.content.toLowerCase().includes(query) ||
    post.author.name.toLowerCase().includes(query)
  );
});

console.log('Search query:', searchQuery);
console.log('Filtered posts:', filteredPosts);
console.log('Number of results:', filteredPosts.length);
