export default function CurrentCourse() {
  const currentCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      instructor: "John Smith",
      lessons: 10,
      completedLessons: 7,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg"
    },
    {
      id: 2,
      title: "Firebase Integration Basics",
      instructor: "Anna Lee",
      lessons: 7,
      completedLessons: 3,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/9kRgVxULbag/maxresdefault.jpg"
    },
    {
      id: 3,
      title: "TailwindCSS + UI Design Essentials",
      instructor: "Kevin Powell",
      lessons: 10,
      completedLessons: 10,
      status: "Completed",
      thumbnail: "https://i.ytimg.com/vi/UBOj6rqRUME/maxresdefault.jpg"
    },
    {
      id: 4,
      title: "Next.js Full Course 2025",
      instructor: "Ben Awad",
      lessons: 12,
      completedLessons: 4,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/TmTmdU8V6_s/maxresdefault.jpg"
    },
    {
      id: 5,
      title: "TypeScript for React Developers",
      instructor: "Jack Herrington",
      lessons: 9,
      completedLessons: 6,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/zQnBQ4tB3ZA/maxresdefault.jpg"
    },
    {
      id: 6,
      title: "Building REST APIs with Node.js & Express",
      instructor: "Traversy Media",
      lessons: 8,
      completedLessons: 8,
      status: "Completed",
      thumbnail: "https://i.ytimg.com/vi/L72fhGm1tfE/maxresdefault.jpg"
    },
    {
      id: 7,
      title: "Mastering Git & GitHub",
      instructor: "The Net Ninja",
      lessons: 6,
      completedLessons: 2,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/RGOj5yH7evk/maxresdefault.jpg"
    },
    {
      id: 8,
      title: "Advanced CSS Animations",
      instructor: "Dev Ed",
      lessons: 10,
      completedLessons: 5,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/YYxO5z_9aZs/maxresdefault.jpg"
    },
    {
      id: 9,
      title: "Full Firebase Authentication Course",
      instructor: "Fireship",
      lessons: 11,
      completedLessons: 9,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/PKwu15ldZ7k/maxresdefault.jpg"
    },
    {
      id: 10,
      title: "Modern JavaScript ES6+ Concepts",
      instructor: "Programming with Mosh",
      lessons: 14,
      completedLessons: 14,
      status: "Completed",
      thumbnail: "https://i.ytimg.com/vi/W6NZfCO5SIk/maxresdefault.jpg"
    }
  ];

  const upcomingCourses = [
    {
      id: 11,
      title: "Advanced Next.js & Server Components",
      instructor: "Vercel Academy",
      lessons: 9,
      thumbnail: "https://i.ytimg.com/vi/8aGhZQkoFbQ/maxresdefault.jpg"
    },
    {
      id: 12,
      title: "UI/UX Principles for Developers",
      instructor: "DesignCourse",
      lessons: 8,
      thumbnail: "https://i.ytimg.com/vi/3t8yG39vwOs/maxresdefault.jpg"
    },
    {
      id: 13,
      title: "Deploying Apps with Docker & AWS",
      instructor: "TechWorld with Nana",
      lessons: 12,
      thumbnail: "https://i.ytimg.com/vi/9zUHg7xjIqQ/maxresdefault.jpg"
    }
  ];

  return (
    <section className="flex-1 flex flex-col gap-8">
      {/* === Upcoming Courses === */}
      <div>
        <h2 className="text-2xl font-bold mb-2.5">Upcoming Courses</h2>
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3">
          {upcomingCourses.map(course => (
            <div
              key={course.id}
              className="bg-surface rounded-md shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <img
                className="w-full relative aspect-video object-cover"
                src={course.thumbnail}
                alt={`${course.title} thumbnail`}
              />

              <article className="px-4 pt-3 pb-4 space-y-2">
                <h3 className="text-lg font-semibold truncate">{course.title}</h3>
                <p className="font-semibold text-gray-600">{course.instructor}</p>
                <p className="text-sm text-gray-500">{course.lessons} lessons</p>
                <button className="mt-2 w-full bg-primary text-white font-medium py-1.5 rounded-md">
                  Pre-register
                </button>
              </article>
            </div>
          ))}
        </div>
      </div>
      {/* === Enrolled Courses === */}
      <div>
        <h2 className="text-2xl font-bold mb-2.5">Recent Enrolled Courses</h2>
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-5">
          {currentCourses.map(course => (
            <div key={course.id} className="bg-surface rounded-md shadow-md overflow-hidden hover:shadow-lg transition">
              <img
                className="w-full aspect-video object-cover"
                src={course.thumbnail}
                alt={`${course.title} thumbnail`}
              />

              <article className="px-4 pt-3 pb-4 space-y-1">
                <h3 className="text-lg font-semibold truncate">{course.title}</h3>
                <p className="font-semibold text-gray-600">{course.instructor}</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-green-500"
                      style={{ width: `${(course.completedLessons / course.lessons) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm ">
                    {course.completedLessons}
                    <span className="text-gray-500">/{course.lessons} lessons</span>
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
