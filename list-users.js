const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n📋 Available Users in Database:\n');
  console.log('All users have password: password123\n');
  console.log('═'.repeat(80));

  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      title: true,
      location: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  if (users.length === 0) {
    console.log('❌ No users found in database!');
    console.log('\nRun: npx prisma db seed');
  } else {
    users.forEach((user, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${user.name.padEnd(25)} | ${user.email.padEnd(35)}`);
      console.log(`    ${user.title || 'No title'} | ${user.location || 'No location'}`);
      console.log('─'.repeat(80));
    });

    console.log(`\n✅ Total users: ${users.length}`);
    console.log('\n💡 Login with any email above using password: password123');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
