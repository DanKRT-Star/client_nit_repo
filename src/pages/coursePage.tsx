import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiErrorCircle, BiSearch } from 'react-icons/bi';
import { MdPlayLesson } from 'react-icons/md';
import { PiUsersThreeFill } from 'react-icons/pi';
import { FaClock } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { GrSchedules } from "react-icons/gr";
import { useMyEnrollments } from '../hooks/useCourseQuery';
import { useCourseStore } from '../stores/courseStore';
import { useAuthStore } from '../stores/authStore';
import { courseApi, type Course } from '../api/courseApi';

export default function CurrentCourse() {
  return (
    <section className="p-4 lg:flex-1 lg:flex lg:gap-8">
      <div className="space-y-8 flex-1">
        <UpcomingCourse />
        <div className="block lg:hidden">
          <InstructorList />
        </div>
        <EnrolledCourses />
        <AllCourses />
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
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const { isLoading, error, refetch } = useMyEnrollments('ENROLLED');
  const enrollments = useCourseStore((s) => s.enrollments);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-2.5">Recent Enrolled Courses</h2>
        <div className="text-center py-8">
          <AiOutlineLoading3Quarters className="animate-spin inline-block text-3xl mb-2" />
          <p className="text-gray-500">Loading enrolled courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-2.5">Recent Enrolled Courses</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <BiErrorCircle className="inline-block text-red-500 text-4xl mb-2" />
          <p className="text-red-600 mb-3">{typeof error === 'string' ? error : 'Failed to load enrolled courses'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-2.5">Recent Enrolled Courses</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-300 text-5xl mb-3">📚</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No enrolled courses yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start learning by enrolling in courses from the available courses section below.
          </p>
        </div>
      </div>
    );
  }

  const displayedEnrollments = showAll ? enrollments : enrollments.slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-2xl font-bold">Recent Enrolled Courses</h2>
        {enrollments.length > 4 && (
          <button
            type="button"
            aria-expanded={showAll}
            aria-controls="enrolled-courses-list"
            onClick={() => setShowAll(!showAll)}
            className="hover:underline"
          >
            {showAll ? "See Less" : "See All"}
          </button>
        )}
      </div>

      <div
        id="enrolled-courses-list"
        className="flex flex-col gap-5 lg:grid lg:grid-cols-2"
      >
        {displayedEnrollments.map((enrollment) => {
          const course = enrollment.schedule.course;
          const schedule = enrollment.schedule;

          return (
            <div
              key={enrollment.id}
              className="bg-background flex gap-5 rounded-md shadow-md overflow-hidden hover:shadow-lg cursor-pointer"
              onClick={() => navigate(`/student/courses/${course.courseCode}`)}
            >
              <img
                loading="lazy"
                className="h-28 object-cover aspect-square"
                src={course.thumbnailUrl || `https://picsum.photos/seed/${course.courseCode}/200/200`}
                alt={`${course.courseName} thumbnail`}
              />

              <article className="flex-1 flex flex-col justify-evenly">
                <h3 className="font-semibold line-clamp-1">{course.courseName}</h3>
                
                <p className="font-semibold text-secondary text-sm">{course.lecturer.user.fullName}</p>

                <div className="flex items-center gap-5 text-xs">
                  <span className='flex items-center gap-1'><FaCalendarAlt className='w-4 h-4'/> {schedule.dayOfWeek}</span>
                  <span className='flex items-center gap-1'><FaClock className='w-4 h-4'/> {schedule.startTime} - {schedule.endTime}</span>
                </div>

                <p className="text-secondary text-xs">Room: {schedule.room}</p>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* === Available Courses with Infinite Scroll === */
function AllCourses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const pageLimit = 3;
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const isStudent = user?.role === 'student';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch function sử dụng courseApi
  const fetchCourses = async ({ pageParam = 1 }) => {
    const response = await courseApi.getCourses({
      search: debouncedSearch,
      page: pageParam,
      limit: pageLimit,
    });

    // Parse response theo format của API
    let courses: Course[] = [];
    
    if (response.data?.data) {
      if (Array.isArray(response.data.data)) {
        courses = response.data.data;
      } else if (response.data.data.items && Array.isArray(response.data.data.items)) {
        courses = response.data.data.items;
      }
    } else if (Array.isArray(response.data)) {
      courses = response.data;
    }

    return {
      courses,
      nextPage: courses.length === pageLimit ? pageParam + 1 : undefined,
    };
  };

  // useInfiniteQuery
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['courses-infinite', debouncedSearch],
    queryFn: fetchCourses,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten all courses
  const allCourses = data?.pages.flatMap((page) => page.courses) ?? [];

  // Handlers
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/student/courses/${encodeURIComponent(id)}`);
  };

  return (
    <section className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">All Courses</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xl" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Loading State (Initial) */}
      {isLoading && (
        <div className="text-center py-16">
          <AiOutlineLoading3Quarters className="animate-spin inline-block text-4xl mb-4" />
          <p className="text-gray-500 text-lg">Loading courses...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <BiErrorCircle className="inline-block text-red-500 text-5xl mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Failed to load courses
          </h3>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && allCourses.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-300 text-7xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? `No results for "${searchQuery}". Try a different search term.`
              : 'There are no courses available at the moment.'}
          </p>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Course Grid */}
      {!isLoading && !isError && allCourses.length > 0 && (
        <>
          {/* Warning for non-students */}
          {!isStudent && isAuthenticated && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                ℹ️ Only students can enroll in courses
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => {
              const totalEnrolled = course.schedules?.reduce(
                (sum: number, schedule: any) => sum + (schedule._count?.enrollments ?? 0), 
                0
              ) ?? 0;
              
              const isFull = totalEnrolled >= course.maxStudents;
              
              const scheduleCount = Array.isArray(course.schedules) 
                ? course.schedules.length 
                : (course._count?.schedules ?? 0);

              return (
                <div
                  key={course.courseCode}
                  className="bg-background border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div 
                    className="relative aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer"
                    onClick={() => handleViewDetails(course.id)}
                  >
                    <img
                      src={course.thumbnailUrl || `https://picsum.photos/seed/${course.courseCode}/640/360`}
                      alt={course.courseName}
                      className="absolute w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full bg-blue-600 text-white shadow-lg">
                      {course.courseCode}
                    </span>

                    {isFull && (
                      <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full bg-red-500 text-white shadow-lg">
                        FULL
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-4 px-5 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 
                        className="font-bold text-lg line-clamp-2 mb-2 cursor-pointer"
                        title={course.courseName}
                        onClick={() => handleViewDetails(course.id)}
                      >
                        {course.courseName}
                      </h3>
                      
                      {course.lecturer?.user?.fullName && (
                        <p className="text-xs text-secondary mb-2 flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                          {course.lecturer.user.fullName}
                          {course.lecturer.title && ` • ${course.lecturer.title}`}
                        </p>
                      )}
                      
                      <p 
                        className="text-sm text-secondary line-clamp-2 mb-4"
                        title={course.description || undefined}
                      >
                        {course.description || "No description available."}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="space-y-3 py-5 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <MdPlayLesson className="w-5 h-5 mr-1.5" />
                          <span className="font-medium">{course.credits}</span>
                          <span className="ml-1">tín chỉ</span>
                        </div>

                        <div className='flex items-center justify-between text-sm'>
                          <GrSchedules className="w-5 h-5 mr-1.5" />
                          <span className="font-medium">{scheduleCount}</span>
                          <span className="ml-1">lịch học</span>
                        </div>

                        <div 
                          className={`flex items-center ${isFull ? 'text-red-600' : ''}`}
                          title="Current/Maximum students"
                        >
                          <PiUsersThreeFill className="w-5 h-5 mr-1.5" />
                          <span className="font-medium">{course.maxStudents}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(course.id)}
                          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary font-medium text-sm hover:opacity-90 transition-opacity"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading More Indicator */}
          {isFetchingNextPage && (
            <div className="text-center py-8">
              <AiOutlineLoading3Quarters className="animate-spin inline-block text-3xl mb-2" />
              <p className="text-gray-500">Loading more courses...</p>
            </div>
          )}

          {/* Intersection Observer Target */}
          <div ref={observerTarget} className="h-4" />

          {/* End of List */}
          {!hasNextPage && allCourses.length > 0 && (
            <div className="text-center py-6 text-gray-500 text-sm border-t">
              <p>🎓 You've reached the end of the course list</p>
            </div>
          )}
        </>
      )}
    </section>
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