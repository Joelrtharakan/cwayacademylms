import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing database records
  await prisma.blogPost.deleteMany({});
  await prisma.siteSettings.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.certificateTemplate.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.forumReply.deleteMany({});
  await prisma.forumPost.deleteMany({});
  await prisma.forum.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Password Hashing
  const adminHash = await bcrypt.hash("Admin123!", 12);
  const instructorHash = await bcrypt.hash("Instructor123!", 12);
  const studentHash = await bcrypt.hash("Student123!", 12);

  // 2. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "CWAY Admin",
      email: "admin@cwayacademy.com",
      passwordHash: adminHash,
      role: "ADMIN",
      isVerified: true,
    },
  });

  // 3. Create Instructors
  const reeju = await prisma.user.create({
    data: {
      name: "Dr. Reeju Tharakan",
      email: "dr.reeju@cwayacademy.com",
      passwordHash: instructorHash,
      role: "INSTRUCTOR",
      isVerified: true,
      bio: "With a Ph.D. in Christian Studies and a Master of Theology in History of Christianity and 24 years of experience in theological education. Lead Pastor of Immanuel AG Church in Dubai and President-Trustee of CWAY Missions.",
      church: "Immanuel AG Church, Dubai",
      location: "Dubai, UAE",
    },
  });

  const robin = await prisma.user.create({
    data: {
      name: "Pr. Robin Ninan",
      email: "pr.robin@cwayacademy.com",
      passwordHash: instructorHash,
      role: "INSTRUCTOR",
      isVerified: true,
      bio: "Holding a Master of Divinity and extensive experience in leadership, management, and media. Secretary-Trustee of CWAY Missions Religious Trust, Bangalore.",
      church: "CWAY Missions",
      location: "Bangalore, India",
    },
  });

  // 4. Create Categories
  const categoriesData = [
    { name: "Biblical Studies", slug: "biblical-studies", icon: "book-open" },
    { name: "Theology", slug: "theology", icon: "flame" },
    { name: "Ministry & Leadership", slug: "ministry-leadership", icon: "users" },
    { name: "Church History", slug: "church-history", icon: "building-church" },
    { name: "Spiritual Formation", slug: "spiritual-formation", icon: "heart" },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: cat,
    });
    categoryMap[cat.name] = created;
  }

  // 5. Create 9 Core Courses (all free, published, instructor: Dr. Reeju)
  const coreCourses = [
    {
      title: "Spiritual Formation",
      slug: "spiritual-formation",
      moduleNumber: 1,
      categoryName: "Spiritual Formation",
      scriptureRef: "2 Corinthians 3:18",
      subtitle: "Integrated study of the Christian life and personal character development by the Holy Spirit",
      level: "BEGINNER",
    },
    {
      title: "Old Testament",
      slug: "old-testament",
      moduleNumber: 2,
      categoryName: "Biblical Studies",
      scriptureRef: "2 Timothy 3:16",
      subtitle: "Overview of the content and theology of the Old Testament books, examining key themes and ministry relevance",
      level: "BEGINNER",
    },
    {
      title: "New Testament",
      slug: "new-testament",
      moduleNumber: 3,
      categoryName: "Biblical Studies",
      scriptureRef: "John 1:1",
      subtitle: "Overview within historical, literary, cultural, and theological contexts, tracing each book's Christological development",
      level: "BEGINNER",
    },
    {
      title: "Interpreting the Bible",
      slug: "interpreting-the-bible",
      moduleNumber: 4,
      categoryName: "Biblical Studies",
      scriptureRef: "2 Timothy 2:15",
      subtitle: "Equipping you with tools to study Scripture with insight, accuracy, and understanding",
      level: "INTERMEDIATE",
    },
    {
      title: "Theology & Doctrines 1",
      slug: "theology-doctrines-1",
      moduleNumber: 5,
      categoryName: "Theology",
      scriptureRef: "Hebrews 11:1",
      subtitle: "God, Humanity, Christ, and Salvation — developing a Biblically grounded theology for life and ministry",
      level: "INTERMEDIATE",
    },
    {
      title: "Theology & Doctrines 2",
      slug: "theology-doctrines-2",
      moduleNumber: 6,
      categoryName: "Theology",
      scriptureRef: "Acts 1:8",
      subtitle: "Church, Holy Spirit, and Mission — exploring major areas of Christian theology to defend and teach the faith",
      level: "INTERMEDIATE",
    },
    {
      title: "Five-Fold Ministry",
      slug: "five-fold-ministry",
      moduleNumber: 7,
      categoryName: "Ministry & Leadership",
      scriptureRef: "Ephesians 4:11-12",
      subtitle: "Training in church leadership, revealing functions of apostles, prophets, evangelists, pastors, and teachers",
      level: "INTERMEDIATE",
    },
    {
      title: "Our Roots: Church History",
      slug: "church-history",
      moduleNumber: 8,
      categoryName: "Church History",
      scriptureRef: "Matthew 16:18",
      subtitle: "Development of Christianity from inception to present, including global expansion and India's heritage",
      level: "BEGINNER",
    },
    {
      title: "Spiritual Leadership",
      slug: "spiritual-leadership",
      moduleNumber: 9,
      categoryName: "Ministry & Leadership",
      scriptureRef: "Mark 10:43-44",
      subtitle: "Practical understanding of leadership principles, blending natural and spiritual qualities to shape your calling",
      level: "ADVANCED",
    },
  ];

  const courseMap: Record<number, any> = {};
  for (const course of coreCourses) {
    const created = await prisma.course.create({
      data: {
        title: course.title,
        slug: course.slug,
        subtitle: course.subtitle,
        description: `This complete theological module guides leaders into deep insights regarding ${course.title}.`,
        price: 0,
        currency: "INR",
        status: "PUBLISHED",
        level: course.level,
        language: "ENGLISH",
        moduleNumber: course.moduleNumber,
        weeksDuration: 6,
        totalLectures: 3,
        totalDuration: 5400, // 90 mins in seconds
        scriptureRef: course.scriptureRef,
        isFeatured: course.moduleNumber === 1,
        isFree: true,
        instructorId: reeju.id,
        categoryId: categoryMap[course.categoryName].id,
      },
    });
    courseMap[course.moduleNumber] = created;

    // Create 1 Section titled "Course Content"
    const section = await prisma.section.create({
      data: {
        courseId: created.id,
        title: "Course Content",
        order: 1,
      },
    });

    // Create 3 placeholder TEXT lessons
    for (let l = 1; l <= 3; l++) {
      await prisma.lesson.create({
        data: {
          sectionId: section.id,
          title: `Lesson ${l}: Foundations of ${course.title}`,
          type: "TEXT",
          content: `<p>Welcome to Lesson ${l}. This core curriculum establishes foundational concepts for biblical leadership.</p><blockquote class="scripture-quote">${course.scriptureRef || "Proverbs 16:3"}</blockquote>`,
          duration: 1800, // 30 mins in seconds
          order: l,
          isFree: true,
          isPreview: l === 1,
        },
      });
    }

    // Create a Forum record linked to the course
    await prisma.forum.create({
      data: {
        courseId: created.id,
      },
    });

    // Create 3 Reviews with ratings 4-5
    const reviewComments = [
      "Life-changing material! Extremely clear and scripturally focused.",
      "Theological training at its finest. Highly recommended for leaders.",
      "A rich resource for frontline ministry work. Challenging yet accessible.",
    ];
    for (let r = 1; r <= 3; r++) {
      // Temporary reviewer info or assign to dummy user
      const studentEmail = `reviewer${r}@cway.dev`;
      let reviewer = await prisma.user.findUnique({ where: { email: studentEmail } });
      if (!reviewer) {
        reviewer = await prisma.user.create({
          data: {
            name: `Reviewer ${r}`,
            email: studentEmail,
            passwordHash: studentHash,
            role: "STUDENT",
            isVerified: true,
          },
        });
      }
      await prisma.review.create({
        data: {
          courseId: created.id,
          studentId: reviewer.id,
          rating: r % 2 === 0 ? 4 : 5,
          comment: reviewComments[r - 1],
          isApproved: true,
        },
      });
    }
  }

  // 6. Create 10 Student Accounts
  const studentNames = ["Rahul Sharma", "Priya Nair", "Samuel David", "Mary Thomas", "Amit Patel", "Shalini Kumari", "Ebenezer Paul", "Rupali Das", "John Wesley", "Mercy Mathew"];
  const studentChurches = ["Grace Bible Church", "Bethel Fellowship", "Emmanuel Assembly", "Zion Chapel", "Calvary Tabernacle", "Hebron Assembly", "Trinity Covenant", "Redeemer Assembly", "Faith Mission", "Hope Fellowship"];
  const studentLocations = ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Maharashtra", "Jharkhand", "Assam", "West Bengal", "Uttar Pradesh", "Telangana"];
  const studentLanguages = ["ENGLISH", "TAMIL", "TELUGU", "MALAYALAM", "KANNADA", "HINDI", "ENGLISH", "ENGLISH", "ENGLISH", "ENGLISH"];

  const students = [];
  for (let i = 0; i < 10; i++) {
    const student = await prisma.user.create({
      data: {
        name: studentNames[i],
        email: `student${i + 1}@test.com`,
        passwordHash: studentHash,
        role: "STUDENT",
        isVerified: true,
        church: studentChurches[i],
        location: studentLocations[i],
        preferredLanguage: studentLanguages[i],
      },
    });
    students.push(student);
  }

  // Enrollments & Progress seeding
  const enrollmentsMap = [
    // Students 1-3: courses 1-3, progress 80%, 90%, 100%
    { studentIndex: 0, courseModule: 1, progress: 80.0 },
    { studentIndex: 1, courseModule: 2, progress: 90.0 },
    { studentIndex: 2, courseModule: 3, progress: 100.0 },
    // Students 4-6: courses 4-6, progress 30%, 50%, 70%
    { studentIndex: 3, courseModule: 4, progress: 30.0 },
    { studentIndex: 4, courseModule: 5, progress: 50.0 },
    { studentIndex: 5, courseModule: 6, progress: 70.0 },
    // Students 7-8: courses 7-9, progress 10%, 20%
    { studentIndex: 6, courseModule: 7, progress: 10.0 },
    { studentIndex: 7, courseModule: 8, progress: 20.0 },
    // Students 9-10: course 1 only, progress 5%
    { studentIndex: 8, courseModule: 1, progress: 5.0 },
    { studentIndex: 9, courseModule: 1, progress: 5.0 },
  ];

  for (const item of enrollmentsMap) {
    const student = students[item.studentIndex];
    const course = courseMap[item.courseModule];
    
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        progress: item.progress,
        status: item.progress === 100 ? "COMPLETED" : "ACTIVE",
        enrolledAt: new Date(),
        completedAt: item.progress === 100 ? new Date() : null,
      },
    });

    // Populate some lesson progress
    const lessons = await prisma.lesson.findMany({
      where: { section: { courseId: course.id } },
      orderBy: { order: "asc" },
    });

    const completedLessonsCount = Math.round((item.progress / 100) * lessons.length);
    for (let l = 0; l < lessons.length; l++) {
      await prisma.lessonProgress.create({
        data: {
          enrollmentId: enrollment.id,
          lessonId: lessons[l].id,
          completedAt: l < completedLessonsCount ? new Date() : null,
          watchedSeconds: l < completedLessonsCount ? lessons[l].duration : 10,
        },
      });
    }

    // Generate Certificate for 100% completed courses
    if (item.progress === 100.0) {
      await prisma.certificate.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          issuedAt: new Date(),
        },
      });
    }
  }

  // 7. Site Settings
  await prisma.siteSettings.create({
    data: {
      siteName: "CWAY Academy",
      tagline: "Coach. Challenge. Commission.",
      contactEmail: "support@cwayacademy.com",
      contactWhatsApp: "+919663831220",
      primaryColor: "#C9973A",
    },
  });

  // 8. Blog Posts
  const blogPostsData = [
    {
      title: "Arulappan: A Pioneer of Indigenous Leadership Training in India",
      slug: "arulappan-pioneer-indigenous-leadership",
      readingTime: 6,
      excerpt: "John Christian Arulappan was a Tamil evangelist who led one of the earliest Pentecostal revivals in South India.",
      content: "<p>John Christian Arulappan represents a powerful movement in early indigenous missions. His dedication to raises local leaders without relying on Western patterns paved the way for modern training ministries in rural India.</p>",
      authorId: reeju.id,
      isPublished: true,
    },
    {
      title: '"They Will Not Go, I Must" — The Legacy of Mary Chapman',
      slug: "legacy-of-mary-chapman",
      readingTime: 7,
      excerpt: "Mary Weems Chapman, a 60-year-old veteran missionary, became the first Assemblies of God missionary to India.",
      content: "<p>Mary Chapman arrived in India at an age when most people prepare to retire. Her courage to establish ministries and serve rural populations stands as a monuments of faith and leadership.</p>",
      authorId: reeju.id,
      isPublished: true,
    },
    {
      title: "Obedience to the Will of God — The Garrs",
      slug: "obedience-will-of-god-the-garrs",
      readingTime: 8,
      excerpt: "Alfred and Lillian Garr were model missionaries who obeyed God's will to bring the Pentecostal message to India in 1906.",
      content: "<p>The story of the Garrs is one of absolute obedience. Leaving their comforts behind, they traveled to Calcutta and established early assemblies, demonstrating dynamic spiritual leadership.</p>",
      authorId: reeju.id,
      isPublished: true,
    },
  ];

  for (const post of blogPostsData) {
    await prisma.blogPost.create({
      data: post,
    });
  }

  console.log("\nSeeding finished successfully!");
  console.log("-----------------------------------------");
  console.log("✓ Admin:       admin@cwayacademy.com / Admin123!");
  console.log("✓ Instructor:  dr.reeju@cwayacademy.com / Instructor123!");
  console.log("✓ Instructor:  pr.robin@cwayacademy.com / Instructor123!");
  console.log("✓ Student:     student1@test.com / Student123!");
  console.log("✓ 9 courses seeded");
  console.log("✓ 10 students seeded");
  console.log("-----------------------------------------\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
