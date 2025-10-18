import './App.css'
import { Outlet, useLocation, Link } from 'react-router'
import Header from './header'
import Sidebar from './sidebar'

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className='font-opens flex flex-col h-full max-w-[1500px] mx-auto bg-background overflow-hidden'>
        
        <Header currentPage={location.pathname}/>

        <div className='flex-1 flex overflow-hidden'>
            <Sidebar currentPage={location.pathname}/>
            
            <div className="main p-10 flex-1 flex flex-col gap-5 overflow-y-auto">
                {isHome && (
                    <>
                      {/* Welcome Section */}
                      <section className='flex gap-2.5 rounded-lg'>
                          <article>
                            <h1 className="text-3xl font-bold">Welcome back <span className='text-primary'>User</span></h1>
                            <p className="text-base">Explore new courses and continue your learning journey!</p>
                          </article>
                      </section> 

                      <hr  className='border-primary border-2'/>

                      {/* Overview Section */}
                      <section>
                          <h2 className='text-2xl font-semibold mb-2.5'>Overview</h2>
                          <div className='w-full flex items-center justify-between gap-5'>
                            <div className='flex-1 rounded-md bg-surface shadow-lg py-2 px-4'>
                              <h3 className='text-xl font-semibold mb-3'>Total course enrolled</h3>
                              <p>45</p>
                            </div>

                            <div className='flex-1 rounded-md bg-surface shadow-lg py-2 px-4'>
                              <h3 className='text-xl font-semibold mb-3'>Completed</h3>
                              <p>100%</p>
                            </div>

                            <div className='flex-1 rounded-md bg-surface shadow-lg py-2 px-4'>
                              <h3 className='text-xl font-semibold mb-3'>Score</h3>
                              <p>100</p>
                            </div>
                          </div>
                      </section>

                      {/* Recent enrolled course  and today's task*/}
                      <div className='flex gap-5'>

                        {/* today's schedule */}
                        <TodaySchedule />
                        {/* Recent enrolled course */}
                        <CurrentCourse />
                      </div>
                    </>
                )}
                <Outlet />
            </div>
        </div>
    </div>
  )
}

function TodaySchedule() {
  const tasks = [
    {
      id: 1,
      startTime: "08:00",
      endTime: "09:30",
      content: "Attend online course: React Fundamentals"
    },
    {
      id: 2,
      startTime: "10:00",
      endTime: "11:00",
      content: "Team meeting with project group"
    },
    {
      id: 3,
      startTime: "13:30",
      endTime: "15:00",
      content: "Work on assignment: Firebase integration"
    },
    {
      id: 4,
      startTime: "16:00",
      endTime: "17:30",
      content: "Watch YouTube video about UX design"
    }
  ];

  return (
    <section className='w-fit h-full flex flex-col'>
      <Title 
        title="Today's schedule"
        path='calendar'
      />
      <div className='flex-1 flex flex-col justify-between'>
        {tasks.map(task => (
          <div className='flex items-center gap-2.5 w-full bg-surface shadow-2xl rounded-md pr-4'>
              <p className='bg-primary py-4 px-4 rounded-l-md font-semibold text-white'>
                {task.startTime}-{task.endTime}
              </p>
              <p>{task.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CurrentCourse() {
  const currentCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      instructor: "John Smith",
      lessons: 10,
      progress: 75,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg"
    },
    {
      id: 2,
      title: "Firebase Integration Basics",
      instructor: "Anna Lee",
      lessons: 7,
      progress: 40,
      status: "In progress",
      thumbnail: "https://i.ytimg.com/vi/9kRgVxULbag/maxresdefault.jpg"
    },
    {
      id: 3,
      title: "UI/UX Design for Beginners",
      instructor: "David Kim",
      lessons: 3,
      progress: 100,
      status: "Completed",
      thumbnail: "https://i.ytimg.com/vi/_HPbI1T4F-g/maxresdefault.jpg"
    }
  ];

  return (
    <section className='flex-1 flex flex-col'>
      <Title 
        title='Recent enrolled courses'
        path='courses'
      />
      <div className='flex gap-2.5'>
        {currentCourses.map(course => (
          <div key={course.id} className='bg-surface relative rounded-md shadow-xl flex-1'>
            <img className='h-1/2 w-full object-cover rounded-t-md' src={course.thumbnail} alt="thumnail" />

            <article className='pt-3 px-4'>
              <h3 className='font-semibold'>{course.title}</h3>
              <p>Lession: {course.lessons}</p>
              <p>Completed: {course.progress}%</p>
            </article>

            <button className='absolute text-white bg-primary hover:bg-primary-dark rounded-full px-2 aspect-square bottom-0 translate-y-1/2 right-2'>
                <svg  xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24" >
                  <path d="M6.51 18.87c.15.09.32.13.49.13s.36-.05.51-.14l10-6c.3-.18.49-.51.49-.86s-.18-.68-.49-.86l-10-6a.99.99 0 0 0-1.01-.01c-.31.18-.51.51-.51.87v12c0 .36.19.69.51.87Z"></path>
                </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function Title({title, path} : {title: string, path: string}) {
  return (
    <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold mb-2.5'>{title}</h2>
          <Link className='text-primary hover:text-primary-dark underline font-semibold text-lg' to={`/${path}`}>See more</Link>
    </div>
  )
}