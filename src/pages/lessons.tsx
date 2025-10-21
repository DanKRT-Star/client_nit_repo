import { useState } from 'react';
import { useParams } from 'react-router-dom';

interface Announcement {
  id: number;
  title: string;
  content: string;
  lecturer: string;
  date: string;
  isImportant: boolean;
}

interface Material {
  id: number;
  title: string;
  description: string;
  fileType: 'pdf' | 'doc' | 'ppt' | 'other';
  fileUrl: string;
  fileSize: string;
  weekNumber: number;
  uploadedAt: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  weekNumber: number;
  status: 'not_submitted' | 'submitted' | 'graded';
  score?: number;
}

interface CourseContent {
  weekNumber: number;
  title: string;
  topics: string[];
  readings?: string[];
}

export default function Lessons() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState<'announcements' | 'materials' | 'assignments' | 'content'>('announcements');

  // Mock data - sau này bạn sẽ fetch từ API
  const courseInfo = {
    id: 1,
    title: "React Fundamentals",
    instructor: "John Smith",
    instructorAvatar: "https://i.pravatar.cc/150?img=1",
    semester: "Spring 2025",
    credits: 3,
    totalWeeks: 15,
    completedWeeks: 7,
    description: "Học các khái niệm cơ bản về React, từ components, props, state đến hooks và lifecycle."
  };

  const announcements: Announcement[] = [
    {
      id: 1,
      title: "Thông báo về bài kiểm tra giữa kỳ",
      content: "Bài kiểm tra giữa kỳ sẽ được tổ chức vào tuần 8. Nội dung bao gồm các chương 1-4. Sinh viên cần chuẩn bị kỹ lưỡng.",
      lecturer: "John Smith",
      date: "2024-10-15",
      isImportant: true
    },
    {
      id: 2,
      title: "Cập nhật tài liệu tuần 7",
      content: "Tài liệu về React Hooks đã được cập nhật. Các bạn vui lòng tải về và xem trước buổi học.",
      lecturer: "John Smith",
      date: "2024-10-12",
      isImportant: false
    },
    {
      id: 3,
      title: "Lịch nghỉ lễ",
      content: "Lớp học sẽ nghỉ vào ngày 20/10 do lễ Phụ nữ Việt Nam. Buổi học sẽ được bù vào thứ 7 tuần sau.",
      lecturer: "John Smith",
      date: "2024-10-10",
      isImportant: true
    }
  ];

  const materials: Material[] = [
    {
      id: 1,
      title: "Bài giảng: Introduction to React",
      description: "Tổng quan về React, JSX, và Components",
      fileType: 'pdf',
      fileUrl: "#",
      fileSize: "2.5 MB",
      weekNumber: 1,
      uploadedAt: "2024-09-01"
    },
    {
      id: 2,
      title: "Slides: State và Props",
      description: "Cách quản lý state và truyền props giữa các components",
      fileType: 'ppt',
      fileUrl: "#",
      fileSize: "1.8 MB",
      weekNumber: 3,
      uploadedAt: "2024-09-15"
    },
    {
      id: 3,
      title: "Code examples: React Hooks",
      description: "Ví dụ về useState, useEffect, useContext",
      fileType: 'other',
      fileUrl: "#",
      fileSize: "450 KB",
      weekNumber: 5,
      uploadedAt: "2024-10-01"
    }
  ];

  const assignments: Assignment[] = [
    {
      id: 1,
      title: "Bài tập 1: Tạo Todo App với React",
      description: "Xây dựng ứng dụng Todo đơn giản với chức năng thêm, xóa, sửa task",
      dueDate: "2024-09-20",
      maxScore: 10,
      weekNumber: 2,
      status: 'graded',
      score: 8.5
    },
    {
      id: 2,
      title: "Bài tập 2: Weather App với API",
      description: "Tạo ứng dụng thời tiết sử dụng API và React Hooks",
      dueDate: "2024-10-10",
      maxScore: 15,
      weekNumber: 5,
      status: 'submitted'
    },
    {
      id: 3,
      title: "Bài tập 3: Shopping Cart",
      description: "Xây dựng giỏ hàng với Context API và useReducer",
      dueDate: "2024-10-30",
      maxScore: 20,
      weekNumber: 8,
      status: 'not_submitted'
    }
  ];

  const courseContent: CourseContent[] = [
    {
      weekNumber: 1,
      title: "Giới thiệu về React",
      topics: ["Tổng quan về React", "JSX syntax", "Component cơ bản", "Virtual DOM"],
      readings: ["React Documentation - Getting Started"]
    },
    {
      weekNumber: 2,
      title: "Components và Props",
      topics: ["Function Components", "Class Components", "Props", "PropTypes"],
    },
    {
      weekNumber: 3,
      title: "State và Lifecycle",
      topics: ["State management", "setState()", "Component lifecycle", "Lifecycle methods"],
    },
    {
      weekNumber: 4,
      title: "Event Handling",
      topics: ["Handling events", "Passing arguments", "Conditional rendering"],
    },
    {
      weekNumber: 5,
      title: "React Hooks - Phần 1",
      topics: ["useState", "useEffect", "Rules of Hooks"],
      readings: ["React Hooks Documentation"]
    }
  ];

  const getFileIcon = (fileType: string) => {
    const icons = {
      pdf: '📄',
      doc: '📝',
      ppt: '📊',
      other: '📁'
    };
    return icons[fileType as keyof typeof icons] || '📁';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      not_submitted: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      submitted: 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white',
      graded: 'bg-gray-800 dark:bg-gray-300 text-white dark:text-gray-900'
    };
    const labels = {
      not_submitted: 'Chưa nộp',
      submitted: 'Đã nộp',
      graded: 'Đã chấm'
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Course Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{courseInfo.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <img 
                    src={courseInfo.instructorAvatar} 
                    alt={courseInfo.instructor}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">{courseInfo.instructor}</span>
                </div>
                <span>•</span>
                <span>{courseInfo.semester}</span>
                <span>•</span>
                <span>{courseInfo.credits} tín chỉ</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl">{courseInfo.description}</p>
            </div>
            
            {/* Progress */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[200px] border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tiến độ khóa học</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{courseInfo.completedWeeks}</span>
                <span className="text-gray-500 dark:text-gray-400">/ {courseInfo.totalWeeks} tuần</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gray-800 dark:bg-gray-300 h-2 rounded-full transition-all"
                  style={{ width: `${(courseInfo.completedWeeks / courseInfo.totalWeeks) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8">
            {[
              { id: 'announcements', label: '📢 Thông báo', count: announcements.length },
              { id: 'materials', label: '📚 Tài liệu', count: materials.length },
              { id: 'assignments', label: '📝 Bài tập', count: assignments.length },
              { id: 'content', label: '📖 Nội dung khóa học', count: courseContent.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Thông báo từ giảng viên</h2>
            {announcements.map(announcement => (
              <div 
                key={announcement.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${
                  announcement.isImportant ? 'border-l-4 border-l-gray-900 dark:border-l-white' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {announcement.isImportant && (
                      <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded text-xs font-semibold">
                        QUAN TRỌNG
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{announcement.date}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{announcement.content}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{announcement.lecturer}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tài liệu học tập</h2>
            <div className="grid gap-4">
              {materials.map(material => (
                <div key={material.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{getFileIcon(material.fileType)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{material.title}</h3>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg text-xs font-medium">
                          Tuần {material.weekNumber}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{material.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{material.fileSize}</span>
                        <span>•</span>
                        <span>Đăng tải: {material.uploadedAt}</span>
                      </div>
                    </div>
                    <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium">
                      Tải xuống
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Bài tập thực hành</h2>
            <div className="grid gap-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{assignment.description}</p>
                      <div className="flex items-center gap-6 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Hạn nộp:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{assignment.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Điểm tối đa:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{assignment.maxScore}</span>
                        </div>
                        {assignment.score !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Điểm đạt được:</span>
                            <span className="font-bold text-gray-900 dark:text-white">{assignment.score}/{assignment.maxScore}</span>
                          </div>
                        )}
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg text-xs font-medium">
                          Tuần {assignment.weekNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {assignment.status === 'not_submitted' && (
                        <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium">
                          Nộp bài
                        </button>
                      )}
                      <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nội dung khóa học</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {courseContent.map((week, index) => (
                <div 
                  key={week.weekNumber} 
                  className={`p-6 ${index !== courseContent.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      {week.weekNumber}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{week.title}</h3>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Chủ đề:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          {week.topics.map((topic, i) => (
                            <li key={i}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                      {week.readings && week.readings.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tài liệu tham khảo:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                            {week.readings.map((reading, i) => (
                              <li key={i} className="underline">{reading}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}