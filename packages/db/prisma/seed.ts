import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // create a Creator user
  const creator = await prisma.user.create({
    data: {
      email: 'priyobrotokar@gmail.com',
      name: 'Priyobroto Kar',
      role: 'CREATOR',
      profilePicture: 'public/1758606487608-odo1qx66qq.png',
      bio: "My name is Priyobroto Kar, and I'm a full-stack developer, educator, and content creator dedicated to helping developers level up their careers. With over 275,000 subscribers on YouTube, 30,000+ followers on LinkedIn, and 20,000+ on X (formerly Twitter), I've built a strong tech community by teaching real-world coding skills through project-based learning.",
      links: ['https://x.com/priyobrotokar', 'https://priyobroto.xyz/'],
      phone: '8272906566',
      accountStatus: 'ACTIVE',
      isOnboardingFinished: true,
    },
  });

  // create a active subscription for that user
  const subscription = await prisma.subscription.create({
    data: {
      plan: 'STARTER',
      status: 'ACTIVE',
      subscriptionId: 'e0e507d6-a930-4383-a8d6-9e26b6156ada',
      currentPeriodStart: new Date('2025-09-24T18:30:00.000Z'),
      currentPeriodEnd: new Date('2050-12-30T21:04:59.000Z'),
      userId: creator.id,
    },
  });

  // create a category
  const category = await prisma.category.create({
    data: {
      name: 'Web Development',
    },
  });

  // create a course under that user
  const course = await prisma.course.create({
    data: {
      name: 'Sigma Web Development Course 2025',
      slug: 'sigma-web-development-course-2025',
      description: 'This is a test description',
      tags: ['web dev'],
      thumbnails: ['public/1758605674460-8vs3hefxg4n.png'],
      logo: 'public/1758605674338-g55ch809fu.png',
      type: 'COHORT',
      level: 'BEGINNER',
      categoryId: category.id,
      creatorId: creator.id,
      pricing: {
        create: {
          paymentPlan: 'ONETIME',
          price: new Prisma.Decimal(5999),
          discountType: 'PERCENTAGE',
          discountValue: 33,
          discountEnabled: true,
        },
      },
    },
  });

  // create 3 lessons under that course
  const lessons = await prisma.module.create({
    data: {
      name: 'New Module',
      order: 0,
      lessonCount: 3,
      status: 'DRAFT',
      courseId: course.id,
      Document: {
        create: {
          name: 'Course Introduction - Roadmap',
          content: '<p>This is the course roadmap</p>',
          duration: 0,
        },
      },
      Video: {
        createMany: {
          data: [
            {
              name: 'Meet your Instructor - Priyobroto',
              source: 'hls/cm9hdeldc00017s06ktdxe3io.mp4/index.m3u8',
              duration: 114,
              status: 'COMPLETED',
            },
            {
              name: 'Let’s talk about AI hype',
              source: 'hls/cm9hes9bk00057s06346uzoi7.mp4/index.m3u8',
              duration: 95,
              status: 'COMPLETED',
            },
          ],
        },
      },
    },
  });

  // create a merchant under that user
  const merchant = await prisma.merchant.create({
    data: {
      name: '100xDevs',
      logo: 'https://pbs.twimg.com/profile_images/1877817218244775936/zYaaUHgY_400x400.jpg',
      status: 'ACTIVE',
      slug: '100xdevs',
      merchantId: 'cmfw49ldk00017sggpyiker9q_1758610924416',
      creatorId: creator.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
