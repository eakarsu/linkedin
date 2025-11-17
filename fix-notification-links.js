const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing connection request notification links...\n');

  // Update all connection type notifications that have /profile/ links to use /network
  const result = await prisma.notification.updateMany({
    where: {
      type: 'connection',
      content: {
        contains: 'sent you a connection request',
      },
    },
    data: {
      link: '/network',
    },
  });

  console.log(`✅ Updated ${result.count} notifications to link to /network\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
