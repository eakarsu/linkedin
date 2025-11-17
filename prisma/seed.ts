import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Fake data arrays
const names = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Williams',
  'James Anderson', 'Maria Garcia', 'Robert Taylor', 'Jennifer Martinez', 'William Brown',
  'Linda Davis', 'Richard Wilson', 'Patricia Moore', 'Thomas Jackson', 'Barbara Thomas',
  'Christopher White', 'Nancy Harris', 'Daniel Martin', 'Lisa Thompson', 'Matthew Garcia',
  'Karen Robinson', 'Anthony Clark', 'Betty Lewis', 'Mark Lee', 'Sandra Walker',
  'Donald Hall', 'Ashley Allen', 'Steven Young', 'Kimberly King', 'Andrew Wright'
];

const titles = [
  'Senior Software Engineer', 'Product Manager', 'UX/UI Designer', 'Data Scientist',
  'Full Stack Developer', 'Marketing Manager', 'Business Analyst', 'Sales Director',
  'DevOps Engineer', 'Frontend Developer', 'Backend Developer', 'Machine Learning Engineer',
  'Content Strategist', 'HR Manager', 'Financial Analyst', 'Project Manager',
  'Cloud Architect', 'Cybersecurity Specialist', 'Quality Assurance Engineer', 'CTO',
  'CEO', 'Startup Founder', 'Mobile Developer', 'Consultant', 'Technical Writer',
  'Graphic Designer', 'Account Manager', 'Operations Manager', 'Data Analyst', 'Product Designer'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
  'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Portland, OR', 'Atlanta, GA',
  'Miami, FL', 'Phoenix, AZ', 'Dallas, TX', 'San Diego, CA', 'Washington, DC',
  'Toronto, Canada', 'London, UK', 'Berlin, Germany', 'Paris, France', 'Tokyo, Japan',
  'Singapore', 'Sydney, Australia', 'Amsterdam, Netherlands', 'Barcelona, Spain', 'Dublin, Ireland'
];

const companies = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla',
  'Salesforce', 'Adobe', 'Oracle', 'IBM', 'Intel', 'Cisco', 'Uber', 'Airbnb',
  'Stripe', 'Spotify', 'Twitter', 'LinkedIn', 'Slack', 'Zoom', 'Dropbox',
  'GitHub', 'Atlassian', 'Shopify', 'Square', 'PayPal', 'Snap', 'Pinterest', 'Reddit'
];

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
  'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Redux',
  'Angular', 'Vue.js', 'Next.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
  'Machine Learning', 'Data Science', 'Cloud Computing', 'Agile', 'Scrum',
  'Project Management', 'UI/UX Design', 'Figma', 'Product Strategy'
];

const bios = [
  'Passionate about building scalable web applications and leading high-performing teams. 10+ years of experience in software development.',
  'Product leader with a track record of launching successful products. Focused on user experience and data-driven decision making.',
  'Creative designer who loves solving complex problems through elegant design solutions. Strong advocate for accessibility.',
  'Data enthusiast leveraging machine learning to drive business insights. Published researcher in AI and deep learning.',
  'Full-stack developer specializing in React and Node.js. Open source contributor and tech community builder.',
  'Marketing professional with expertise in digital strategy and brand development. Love connecting with customers.',
  'Business analyst with strong analytical skills. Expert in turning data into actionable business strategies.',
  'Sales leader passionate about building relationships and driving revenue growth. Former startup founder.',
  'DevOps engineer obsessed with automation and cloud infrastructure. Certified AWS Solutions Architect.',
  'Frontend specialist creating beautiful, performant user interfaces. Accessibility champion.',
];

const postContents = [
  'Excited to announce that I\'ve joined {company} as a {title}! Looking forward to this new chapter in my career. 🚀',
  'Just published a new article on React performance optimization. Check it out and let me know your thoughts! 📝',
  'Grateful for my amazing team at {company}. We just shipped our biggest feature yet! 🎉',
  'Had an incredible time speaking at TechConf 2024. Thanks to everyone who attended my session on cloud architecture!',
  'Celebrating 5 years at {company} today! Time flies when you\'re doing what you love. ❤️',
  'Looking for talented developers to join our team at {company}. We\'re hiring! DM me for details.',
  'Just completed AWS Solutions Architect certification! Always learning, always growing. 📚',
  'Reflecting on the importance of work-life balance. Remember to take care of yourself! 🧘',
  'Our latest product launch exceeded all expectations! Proud of what we\'ve built together as a team.',
  'Attended an amazing workshop on machine learning today. The future of AI is incredibly exciting! 🤖',
  'Sharing my journey from junior developer to tech lead. Happy to mentor anyone starting their career!',
  'Remote work has changed everything. Here are my top 5 productivity tips for distributed teams...',
  'Just hit 10K followers! Thank you all for your support and engagement. Let\'s keep learning together!',
  'Cybersecurity is more important than ever. Here\'s what every developer should know...',
  'Excited to share that our startup just closed Series A funding! Onwards and upwards! 🚀'
];

const commentTexts = [
  'Congratulations! Well deserved!',
  'This is awesome! Thanks for sharing.',
  'Great insights! I learned a lot from this.',
  'Inspiring post! Keep up the great work.',
  'I completely agree with your perspective.',
  'Would love to connect and discuss this further!',
  'This resonates with me so much. Thanks for posting!',
  'Amazing achievement! You\'re an inspiration.',
  'Looking forward to seeing more content like this!',
  'This is exactly what I needed to read today. Thank you!',
  'Brilliant points! I\'ve shared this with my team.',
  'Your experience aligns perfectly with what we\'re building.',
  'Such valuable advice. Appreciate you sharing!',
  'Can\'t wait to try this approach on my project!',
  'This changed my perspective completely. Thanks!'
];

const jobTitles = [
  'Senior Software Engineer - Full Stack',
  'Product Manager - Consumer Products',
  'UX Designer - Mobile Apps',
  'Data Scientist - Machine Learning',
  'Frontend Developer - React',
  'Backend Engineer - Node.js',
  'DevOps Engineer - Cloud Infrastructure',
  'Marketing Manager - Digital Marketing',
  'Sales Director - Enterprise',
  'Business Analyst - Analytics',
  'Mobile Developer - iOS',
  'Security Engineer - Cybersecurity',
  'Technical Lead - Engineering',
  'Product Designer - Design Systems',
  'Content Strategist - B2B Marketing'
];

const jobDescriptions = [
  'We are looking for an experienced professional to join our growing team. You will work on challenging problems and have the opportunity to make a significant impact.',
  'Join our innovative team and help build products that millions of users love. We value creativity, collaboration, and continuous learning.',
  'This is a unique opportunity to work with cutting-edge technology and a world-class team. We offer competitive compensation and excellent benefits.',
  'We are seeking a talented individual who is passionate about technology and wants to make a difference. Remote work available.',
  'Be part of a fast-paced startup environment where your contributions directly impact the company\'s success. Equity and benefits included.'
];

const messageContents = [
  'Hi! I came across your profile and was impressed by your experience. Would love to connect!',
  'Thanks for accepting my connection request! Looking forward to staying in touch.',
  'I saw your recent post about {topic} - great insights! Would love to discuss further.',
  'Are you available for a quick call this week? I have an opportunity that might interest you.',
  'Congrats on your new role! Wishing you all the best in your new position.',
  'I\'m working on a similar project. Would you be open to sharing some advice?',
  'Your article on {topic} was fantastic. Do you have any recommendations for further reading?',
  'We\'re hiring for a position that matches your background perfectly. Interested in learning more?',
  'Great connecting with you at the conference! Let\'s continue the conversation.',
  'I noticed we both worked at {company}. Small world! How did you like it there?'
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.story.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];

  for (let i = 0; i < 30; i++) {
    const name = names[i];
    const email = name.toLowerCase().replace(' ', '.') + '@example.com';

    const skillsList: Array<{ name: string; endorsements: number }> = [];
    for (let j = 0; j < 5 + Math.floor(Math.random() * 6); j++) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      if (!skillsList.find(s => s.name === skill)) {
        skillsList.push({ name: skill, endorsements: Math.floor(Math.random() * 50) });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        title: titles[i % titles.length],
        location: locations[i % locations.length],
        avatar: `https://i.pravatar.cc/300?img=${i + 1}`,
        coverImage: `https://picsum.photos/seed/${i}/1584/396`,
        bio: bios[i % bios.length].replace('{company}', companies[i % companies.length]).replace('{title}', titles[i % titles.length]),
        skills: skillsList,
        languages: [
          { name: 'English', proficiency: 'Native' },
          { name: ['Spanish', 'French', 'German', 'Mandarin', 'Japanese'][i % 5], proficiency: ['Professional', 'Limited', 'Elementary'][Math.floor(Math.random() * 3)] }
        ],
        experience: [
          {
            title: titles[i % titles.length],
            company: companies[i % companies.length],
            location: locations[i % locations.length],
            startDate: '2020-01',
            endDate: '',
            current: true,
            description: 'Leading development of key features and mentoring junior developers.'
          },
          {
            title: titles[(i + 5) % titles.length],
            company: companies[(i + 10) % companies.length],
            location: locations[(i + 5) % locations.length],
            startDate: '2017-06',
            endDate: '2019-12',
            current: false,
            description: 'Developed and maintained multiple client-facing applications.'
          }
        ],
        education: [
          {
            school: ['Stanford University', 'MIT', 'UC Berkeley', 'Harvard', 'Carnegie Mellon'][i % 5],
            degree: 'Bachelor\'s',
            field: 'Computer Science',
            startDate: '2013',
            endDate: '2017',
            description: 'Focus on software engineering and algorithms.'
          }
        ],
        profileCompleteness: 75 + Math.floor(Math.random() * 25)
      },
    });

    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);

  // Create connections
  console.log('🤝 Creating connections...');
  let connectionCount = 0;
  for (let i = 0; i < users.length; i++) {
    const numConnections = 10 + Math.floor(Math.random() * 15);
    for (let j = 0; j < numConnections; j++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      if (randomUserIndex !== i) {
        try {
          await prisma.connection.create({
            data: {
              userId: users[i].id,
              connectedId: users[randomUserIndex].id,
              status: Math.random() > 0.2 ? 'accepted' : 'pending',
            },
          });
          connectionCount++;
        } catch (error) {
          // Skip duplicate connections
        }
      }
    }
  }

  console.log(`✅ Created ${connectionCount} connections`);

  // Create posts
  console.log('📝 Creating posts...');
  const posts = [];
  for (let i = 0; i < users.length; i++) {
    const numPosts = 2 + Math.floor(Math.random() * 5);
    for (let j = 0; j < numPosts; j++) {
      const content = postContents[Math.floor(Math.random() * postContents.length)]
        .replace('{company}', companies[i % companies.length])
        .replace('{title}', titles[i % titles.length]);

      const includeImage = Math.random() > 0.6;

      const post = await prisma.post.create({
        data: {
          content,
          image: includeImage ? `https://picsum.photos/seed/post${i}${j}/800/600` : null,
          authorId: users[i].id,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        },
      });

      posts.push(post);
    }
  }

  console.log(`✅ Created ${posts.length} posts`);

  // Create articles
  console.log('📰 Creating articles...');
  const articles = [];
  for (let i = 0; i < 20; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    const article = await prisma.article.create({
      data: {
        title: `Insights on ${skills[i % skills.length]}: A Comprehensive Guide`,
        content: `This is a comprehensive guide about ${skills[i % skills.length]}. In this article, I share my experiences and best practices that I've learned over the years. Whether you're just starting out or looking to deepen your knowledge, this article will provide valuable insights.\n\nKey topics covered:\n1. Fundamentals and core concepts\n2. Best practices and patterns\n3. Common pitfalls to avoid\n4. Advanced techniques\n5. Future trends and developments\n\nI hope you find this helpful!`,
        excerpt: `A comprehensive guide about ${skills[i % skills.length]} covering fundamentals, best practices, and advanced techniques.`,
        image: `https://picsum.photos/seed/article${i}/1200/630`,
        authorId: author.id,
        views: Math.floor(Math.random() * 5000),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
      },
    });

    articles.push(article);
  }

  console.log(`✅ Created ${articles.length} articles`);

  // Create comments
  console.log('💬 Creating comments...');
  let commentCount = 0;
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 8);
    for (let i = 0; i < numComments; i++) {
      const commenter = users[Math.floor(Math.random() * users.length)];
      await prisma.comment.create({
        data: {
          text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          postId: post.id,
          authorId: commenter.id,
          createdAt: new Date(post.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        },
      });
      commentCount++;
    }
  }

  console.log(`✅ Created ${commentCount} comments`);

  // Create likes for posts
  console.log('❤️ Creating likes for posts...');
  let postLikeCount = 0;
  for (const post of posts) {
    const numLikes = Math.floor(Math.random() * 30);
    for (let i = 0; i < numLikes; i++) {
      const liker = users[Math.floor(Math.random() * users.length)];
      try {
        await prisma.like.create({
          data: {
            userId: liker.id,
            postId: post.id,
            type: ['like', 'celebrate', 'support', 'love', 'insightful'][Math.floor(Math.random() * 5)],
          },
        });
        postLikeCount++;
      } catch (error) {
        // Skip duplicate likes
      }
    }
  }

  console.log(`✅ Created ${postLikeCount} post likes`);

  // Create likes for articles
  console.log('❤️ Creating likes for articles...');
  let articleLikeCount = 0;
  for (const article of articles) {
    const numLikes = Math.floor(Math.random() * 50);
    for (let i = 0; i < numLikes; i++) {
      const liker = users[Math.floor(Math.random() * users.length)];
      try {
        await prisma.like.create({
          data: {
            userId: liker.id,
            articleId: article.id,
            type: ['like', 'celebrate', 'support', 'love', 'insightful'][Math.floor(Math.random() * 5)],
          },
        });
        articleLikeCount++;
      } catch (error) {
        // Skip duplicate likes
      }
    }
  }

  console.log(`✅ Created ${articleLikeCount} article likes`);

  // Create jobs
  console.log('💼 Creating jobs...');
  const jobs = [];
  for (let i = 0; i < 50; i++) {
    const poster = users[Math.floor(Math.random() * users.length)];
    const job = await prisma.job.create({
      data: {
        title: jobTitles[i % jobTitles.length],
        company: companies[i % companies.length],
        location: locations[i % locations.length],
        type: ['Full-time', 'Part-time', 'Contract', 'Internship'][Math.floor(Math.random() * 4)],
        experienceLevel: ['Entry level', 'Mid-Senior level', 'Director', 'Executive'][Math.floor(Math.random() * 4)],
        salary: ['$80k - $120k', '$120k - $180k', '$180k - $250k', 'Competitive'][Math.floor(Math.random() * 4)],
        description: jobDescriptions[Math.floor(Math.random() * jobDescriptions.length)],
        requirements: `• ${3 + Math.floor(Math.random() * 3)}+ years of experience\n• Strong knowledge of ${skills[i % skills.length]}\n• Excellent communication skills\n• Bachelor's degree in related field`,
        benefits: '• Competitive salary and equity\n• Health, dental, and vision insurance\n• 401(k) matching\n• Unlimited PTO\n• Remote work options',
        posterId: poster.id,
        createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
      },
    });

    jobs.push(job);
  }

  console.log(`✅ Created ${jobs.length} jobs`);

  // Create job applications
  console.log('📋 Creating job applications...');
  let applicationCount = 0;
  for (const job of jobs) {
    const numApplications = Math.floor(Math.random() * 10);
    for (let i = 0; i < numApplications; i++) {
      const applicant = users[Math.floor(Math.random() * users.length)];
      if (applicant.id !== job.posterId) {
        try {
          await prisma.jobApplication.create({
            data: {
              jobId: job.id,
              applicantId: applicant.id,
              coverLetter: `Dear Hiring Manager,\n\nI am very excited to apply for the ${job.title} position at ${job.company}. With my background in ${skills[i % skills.length]}, I believe I would be a great fit for this role.\n\nI look forward to discussing this opportunity further.\n\nBest regards,\n${applicant.name}`,
              status: ['pending', 'reviewed', 'interview', 'rejected', 'accepted'][Math.floor(Math.random() * 5)],
            },
          });
          applicationCount++;
        } catch (error) {
          // Skip duplicate applications
        }
      }
    }
  }

  console.log(`✅ Created ${applicationCount} job applications`);

  // Create messages
  console.log('💌 Creating messages...');
  let messageCount = 0;
  for (let i = 0; i < users.length; i++) {
    const numMessages = 5 + Math.floor(Math.random() * 10);
    for (let j = 0; j < numMessages; j++) {
      const otherUser = users[Math.floor(Math.random() * users.length)];
      if (otherUser.id !== users[i].id) {
        await prisma.message.create({
          data: {
            senderId: users[i].id,
            receiverId: otherUser.id,
            content: messageContents[Math.floor(Math.random() * messageContents.length)]
              .replace('{topic}', skills[j % skills.length])
              .replace('{company}', companies[j % companies.length]),
            read: Math.random() > 0.3,
            createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
          },
        });
        messageCount++;
      }
    }
  }

  console.log(`✅ Created ${messageCount} messages`);

  // Create notifications
  console.log('🔔 Creating notifications...');
  let notificationCount = 0;
  for (const user of users) {
    const numNotifications = 5 + Math.floor(Math.random() * 15);
    for (let i = 0; i < numNotifications; i++) {
      const otherUser = users[Math.floor(Math.random() * users.length)];
      const types = ['like', 'comment', 'connection', 'message', 'job'];
      const type = types[Math.floor(Math.random() * types.length)];

      let content = '';
      switch (type) {
        case 'like':
          content = `${otherUser.name} liked your post`;
          break;
        case 'comment':
          content = `${otherUser.name} commented on your post`;
          break;
        case 'connection':
          content = `${otherUser.name} wants to connect with you`;
          break;
        case 'message':
          content = `New message from ${otherUser.name}`;
          break;
        case 'job':
          content = `New job posting: ${jobTitles[i % jobTitles.length]} at ${companies[i % companies.length]}`;
          break;
      }

      await prisma.notification.create({
        data: {
          userId: user.id,
          type,
          content,
          read: Math.random() > 0.4,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
      notificationCount++;
    }
  }

  console.log(`✅ Created ${notificationCount} notifications`);

  // Create stories
  console.log('📸 Creating stories...');
  let storyCount = 0;
  for (let i = 0; i < 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const includeImage = Math.random() > 0.3;

    await prisma.story.create({
      data: {
        userId: user.id,
        image: includeImage ? `https://picsum.photos/seed/story${i}/1080/1920` : null,
        text: includeImage ? null : ['Exciting news coming soon! 🚀', 'Great day at the office! 💼', 'Working on something amazing! ✨'][i % 3],
        views: Math.floor(Math.random() * 200),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
        createdAt: new Date(Date.now() - Math.random() * 20 * 60 * 60 * 1000), // Created within last 20 hours
      },
    });
    storyCount++;
  }

  console.log(`✅ Created ${storyCount} stories`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • Users: ${users.length}`);
  console.log(`   • Connections: ${connectionCount}`);
  console.log(`   • Posts: ${posts.length}`);
  console.log(`   • Articles: ${articles.length}`);
  console.log(`   • Comments: ${commentCount}`);
  console.log(`   • Post Likes: ${postLikeCount}`);
  console.log(`   • Article Likes: ${articleLikeCount}`);
  console.log(`   • Jobs: ${jobs.length}`);
  console.log(`   • Job Applications: ${applicationCount}`);
  console.log(`   • Messages: ${messageCount}`);
  console.log(`   • Notifications: ${notificationCount}`);
  console.log(`   • Stories: ${storyCount}`);
  console.log('\n💡 You can login with any email (e.g., sarah.johnson@example.com) and password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
