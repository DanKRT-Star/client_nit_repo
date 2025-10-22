import { useState } from "react";
import { PiUsersThreeFill } from "react-icons/pi";
import { MdPlayLesson } from "react-icons/md";
import { IoEnter } from "react-icons/io5";

export default function CurrentCourse() {
  return (
    <section className="p-4 lg:flex-1 lg:flex lg:gap-8">
      <div className="space-y-8 flex-1">
        <UpcomingCourse />
        <div className="block lg:hidden">
          <InstructorList />
        </div>
        <EnrolledCourses />
        <AvailableCourses />
      </div>
      <div className="hidden lg:block">
        <InstructorList />
      </div>
    </section>
  );
}

/* === Upcoming Courses === */
function UpcomingCourse() {
  const upcomingCourses = [
    {
      id: 11,
      title: "Advanced Next.js & Server Components",
      instructor: "Vercel Academy",
      lessons: 9,
      thumbnail: "https://i.ytimg.com/vi/8aGhZQkoFbQ/maxresdefault.jpg",
    },
    {
      id: 12,
      title: "UI/UX Principles for Developers",
      instructor: "DesignCourse",
      lessons: 8,
      thumbnail: "https://i.ytimg.com/vi/3t8yG39vwOs/maxresdefault.jpg",
    },
    {
      id: 13,
      title: "Deploying Apps with Docker & AWS",
      instructor: "TechWorld with Nana",
      lessons: 12,
      thumbnail: "https://i.ytimg.com/vi/9zUHg7xjIqQ/maxresdefault.jpg",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2.5">Upcoming Courses</h2>
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3">
        {upcomingCourses.map((course) => (
          <div
            key={course.id}
            className="bg-background rounded-md shadow-sm overflow-hidden hover:shadow-md"
          >
            <img
              loading="lazy"
              className="w-full relative aspect-video object-cover"
              src={course.thumbnail}
              alt={`${course.title} thumbnail`}
            />

            <article className="px-4 pt-3 pb-4 space-y-2">
              <h3 className="text-lg font-semibold truncate">{course.title}</h3>
              <p className="font-semibold text-secondary">{course.instructor}</p>
              <p className="text-sm text-secondary">{course.lessons} lessons</p>
              <button
                type="button"
                className="mt-2 w-full bg-primary text-primary font-medium py-1.5 rounded-md"
              >
                Pre-register
              </button>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

/* === Enrolled Courses === */
function EnrolledCourses() {
  const enrolledCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      instructor: "John Smith",
      lessons: 10,
      completedLessons: 7,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg",
    },
    {
      id: 2,
      title: "Firebase Integration Basics",
      instructor: "Anna Lee",
      lessons: 7,
      completedLessons: 3,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/9kRgVxULbag/maxresdefault.jpg",
    },
    {
      id: 3,
      title: "TailwindCSS + UI Design Essentials",
      instructor: "Kevin Powell",
      lessons: 10,
      completedLessons: 10,
      status: "Completed",
      thumbnail: "https://i.ytimg.com/vi/UBOj6rqRUME/maxresdefault.jpg",
    },
    {
      id: 4,
      title: "Next.js Full Course 2025",
      instructor: "Ben Awad",
      lessons: 12,
      completedLessons: 4,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/TmTmdU8V6_s/maxresdefault.jpg",
    },
    {
      id: 5,
      title: "TypeScript for React Developers",
      instructor: "Jack Herrington",
      lessons: 9,
      completedLessons: 6,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/zQnBQ4tB3ZA/maxresdefault.jpg",
    },
    {
      id: 6,
      title: "Building REST APIs with Node.js & Express",
      instructor: "Traversy Media",
      lessons: 8,
      completedLessons: 8,
      status: "Completed",
      thumbnail: "https://i.ytimg.com/vi/L72fhGm1tfE/maxresdefault.jpg",
    },
    {
      id: 7,
      title: "Mastering Git & GitHub",
      instructor: "The Net Ninja",
      lessons: 6,
      completedLessons: 2,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/RGOj5yH7evk/maxresdefault.jpg",
    },
    {
      id: 8,
      title: "Advanced CSS Animations",
      instructor: "Dev Ed",
      lessons: 10,
      completedLessons: 5,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/YYxO5z_9aZs/maxresdefault.jpg",
    },
    {
      id: 9,
      title: "Full Firebase Authentication Course",
      instructor: "Fireship",
      lessons: 11,
      completedLessons: 9,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/PKwu15ldZ7k/maxresdefault.jpg",
    },
    {
      id: 10,
      title: "Modern JavaScript ES6+ Concepts",
      instructor: "Programming with Mosh",
      lessons: 14,
      completedLessons: 14,
      status: "Completed",
      thumbnail: "https://i.ytimg.com/vi/W6NZfCO5SIk/maxresdefault.jpg",
    },
  ];

  const [showAll, setShowAll] = useState(false);
  const displayedCourses = showAll ? enrolledCourses : enrolledCourses.slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-2xl font-bold">Recent Enrolled Courses</h2>
        <button
          type="button"
          aria-expanded={showAll}
          aria-controls="enrolled-courses-list"
          onClick={() => setShowAll(!showAll)}
          className="hover:underline"
        >
          {showAll ? "See Less" : "See All"}
        </button>
      </div>

      <div
        id="enrolled-courses-list"
        className="flex flex-col gap-5 lg:grid lg:grid-cols-2"
      >
        {displayedCourses.map((course) => {
          const progress =
            course.lessons > 0
              ? Math.min(100, Math.max(0, (course.completedLessons / course.lessons) * 100))
              : 0;

          return (
            <div
              key={course.id}
              className="bg-background flex rounded-md shadow-md overflow-hidden hover:shadow-lg"
            >
              <img
                loading="lazy"
                className="h-28 object-cover aspect-square"
                src={course.thumbnail}
                alt={`${course.title} thumbnail`}
              />

              <article className="flex-1 px-4 pt-3 pb-4 space-y-1">
                <h3 className="font-semibold">{course.title}</h3>
                <p className="font-semibold text-secondary text-sm">
                  {course.instructor}
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 bg-surface h-3 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm">
                    {course.completedLessons}
                    <span className="text-secondary">/{course.lessons} lessons</span>
                  </p>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* === Available Courses === */
function AvailableCourses() {
  const availableCourses = [
    {
      id: 21,
      title: "Fullstack Development with MERN",
      instructor: "Codevolution",
      lessons: 15,
      maxStudents: 50,
      currentStudents: 32,
      thumbnail: "https://i.ytimg.com/vi/7CqJlxBYj-M/maxresdefault.jpg",
    },
    {
      id: 22,
      title: "Building Scalable APIs with NestJS",
      instructor: "Academind",
      lessons: 10,
      maxStudents: 40,
      currentStudents: 27,
      thumbnail: "https://i.ytimg.com/vi/GHTA143_b-s/maxresdefault.jpg",
    },
    {
      id: 23,
      title: "Machine Learning Basics for Developers",
      instructor: "freeCodeCamp",
      lessons: 12,
      maxStudents: 60,
      currentStudents: 54,
      thumbnail: "https://i.ytimg.com/vi/GwIo3gDZCVQ/maxresdefault.jpg",
    },
    {
      id: 24,
      title: "UI Animation with Framer Motion",
      instructor: "Framer Academy",
      lessons: 7,
      maxStudents: 30,
      currentStudents: 18,
      thumbnail: "https://i.ytimg.com/vi/Zi7wH6MrzEo/maxresdefault.jpg",
    },
    {
      id: 25,
      title: "Data Visualization with D3.js",
      instructor: "Curran Kelleher",
      lessons: 9,
      maxStudents: 40,
      currentStudents: 25,
      thumbnail: "https://i.ytimg.com/vi/TOJ9yjvlapY/maxresdefault.jpg",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2.5">Available Courses</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {availableCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-md bg-background overflow-hidden shadow-md hover:shadow-xl"
          >
            <img
              loading="lazy"
              src={course.thumbnail}
              alt={course.title}
              className="w-full aspect-video object-cover"
            />
            <article className="px-4 py-3 space-y-1">
              <h3 className="font-semibold truncate">{course.title}</h3>
              <p className="text-secondary">{course.instructor}</p>

              <div className="flex items-center justify-between">
                <p className="flex items-center">
                  <MdPlayLesson className="w-6 h-6 mr-1" />
                  {course.lessons}
                </p>

                <p className="flex items-center">
                  <PiUsersThreeFill className="w-6 h-6 mr-1" />
                  {course.currentStudents}/{course.maxStudents}
                </p>

                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-primary text-primary flex items-center"
                >
                  Enroll
                  <IoEnter className="w-6 h-6 ml-1" />
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstructorList() {
  const instructors = [
    {
      id: 1,
      name: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      expertise: ["React", "JavaScript"],
      rating: 4.8,
    },
    {
      id: 2,
      name: "Anna Lee",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
      expertise: ["Firebase", "Node.js"],
      rating: 4.6,
    },
    {
      id: 3,
      name: "Kevin Powell",
      avatar: "https://randomuser.me/api/portraits/men/60.jpg",
      expertise: ["CSS", "UI Design"],
      rating: 4.9,
    },
    {
      id: 4,
      name: "Ben Awad",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      expertise: ["Next.js", "GraphQL"],
      rating: 4.7,
    },
    {
      id: 5,
      name: "Jack Herrington",
      avatar: "https://randomuser.me/api/portraits/men/68.jpg",
      expertise: ["TypeScript", "React"],
      rating: 4.9,
    },
  ];

  return (
    <aside className="lg:h-full text-xs lg:text-sm">
      <h2 className="font-semibold text-xl mb-2.5">Instructors</h2>
      <ul className="flex gap-2 overflow-auto lg:block bg-background shadow-lg rounded-md">
        {instructors.map((ins) => (
          <li key={ins.id} className="w-1/2 items-center hover:bg-component flex-shrink-0 flex gap-2 px-2 py-1 lg:px-4 lg:py-2 lg:w-full">
            <img
              loading="lazy"
              src={ins.avatar}
              alt={ins.name}
              className="h-14 aspect-square rounded-full"
            />
            <article className="instructor-info flex flex-col lg:justify-between">
              <h4 className="instructor-name">{ins.name}</h4>
              <p className="instructor-expertise">
                {ins.expertise.join(", ")}
              </p>
              <span className="instructor-rating">⭐ {ins.rating}</span>
            </article>
          </li>
        ))}
      </ul>
    </aside>
  );
}