# EERD Schema cho Hệ thống eLearning

## 1. ENTITIES (Thực thể)

### USER (Người dùng)
- **user_id** (PK)
- email (UNIQUE, NOT NULL)
- password_hash (NOT NULL)
- full_name
- phone
- avatar_url
- role (ENUM: 'student', 'lecturer', 'admin')
- is_active (BOOLEAN)
- created_at
- updated_at

### STUDENT (Sinh viên) - Kế thừa từ USER
- **student_id** (PK, FK → USER)
- student_code (UNIQUE)
- major
- enrollment_year
- class_name

### LECTURER (Giảng viên) - Kế thừa từ USER
- **lecturer_id** (PK, FK → USER)
- lecturer_code (UNIQUE)
- department
- title (ENUM: 'TA', 'Lecturer', 'Senior Lecturer', 'Associate Professor', 'Professor')
- bio

### PASSWORD_RESET_TOKEN (Token reset mật khẩu)
- **token_id** (PK)
- user_id (FK → USER)
- token (UNIQUE, NOT NULL)
- expires_at (NOT NULL)
- is_used (BOOLEAN)
- created_at

### COURSE (Môn học)
- **course_id** (PK)
- course_code (UNIQUE)
- course_name (NOT NULL)
- description
- credits
- lecturer_id (FK → LECTURER)
- max_students
- created_at
- updated_at

### COURSE_SCHEDULE (Lịch học của môn học)
- **schedule_id** (PK)
- course_id (FK → COURSE)
- semester (e.g., 'Fall 2024', 'Spring 2025')
- academic_year
- day_of_week (ENUM: 'Monday', 'Tuesday', ...)
- start_time
- end_time
- room
- start_date
- end_date
- total_weeks (default: 20)

### ENROLLMENT (Đăng ký môn học)
- **enrollment_id** (PK)
- student_id (FK → STUDENT)
- schedule_id (FK → COURSE_SCHEDULE)
- enrollment_date
- status (ENUM: 'enrolled', 'dropped', 'completed')

### LECTURE_MATERIAL (Tài liệu bài giảng)
- **material_id** (PK)
- course_id (FK → COURSE)
- lecturer_id (FK → LECTURER)
- title (NOT NULL)
- description
- file_type (ENUM: 'pdf', 'doc', 'ppt', 'video', 'other')
- file_url (NOT NULL)
- file_size
- week_number (1-20)
- is_public (BOOLEAN)
- uploaded_at
- updated_at

### ASSIGNMENT (Bài tập)
- **assignment_id** (PK)
- course_id (FK → COURSE)
- lecturer_id (FK → LECTURER)
- title (NOT NULL)
- description
- file_url
- due_date
- max_score
- week_number (1-20)
- created_at
- updated_at

### ASSIGNMENT_SUBMISSION (Nộp bài tập)
- **submission_id** (PK)
- assignment_id (FK → ASSIGNMENT)
- student_id (FK → STUDENT)
- file_url
- submission_text
- submitted_at
- score
- feedback
- graded_at
- graded_by (FK → LECTURER)

### CHAT_MESSAGE (Tin nhắn chat)
- **message_id** (PK)
- sender_id (FK → USER)
- receiver_id (FK → USER)
- message_content (NOT NULL)
- is_read (BOOLEAN)
- sent_at
- read_at

### EMAIL_NOTIFICATION (Thông báo email)
- **notification_id** (PK)
- user_id (FK → USER)
- subject
- body
- email_type (ENUM: 'chat', 'assignment', 'announcement', 'password_reset')
- is_sent (BOOLEAN)
- sent_at
- created_at

### CALENDAR_EVENT (Sự kiện lịch)
- **event_id** (PK)
- course_id (FK → COURSE, nullable)
- creator_id (FK → USER)
- title (NOT NULL)
- description
- event_type (ENUM: 'class', 'exam', 'assignment_due', 'meeting', 'other')
- start_datetime
- end_datetime
- location
- is_recurring (BOOLEAN)
- created_at
- updated_at

---

## 2. RELATIONSHIPS (Quan hệ)

### 1. USER - STUDENT/LECTURER (Generalization - Kế thừa)
- Quan hệ kế thừa (IS-A)
- USER là superclass
- STUDENT và LECTURER là subclass

### 2. LECTURER - COURSE (1:N)
- Một giảng viên có thể giảng dạy nhiều môn học
- Một môn học được giảng dạy bởi một giảng viên

### 3. COURSE - COURSE_SCHEDULE (1:N)
- Một môn học có thể có nhiều lịch học (các kỳ/học kỳ khác nhau)
- Một lịch học thuộc về một môn học

### 4. STUDENT - ENROLLMENT - COURSE_SCHEDULE (M:N)
- Một sinh viên có thể đăng ký nhiều lịch học
- Một lịch học có thể có nhiều sinh viên
- ENROLLMENT là bảng trung gian

### 5. COURSE - LECTURE_MATERIAL (1:N)
- Một môn học có nhiều tài liệu bài giảng
- Một tài liệu thuộc về một môn học

### 6. LECTURER - LECTURE_MATERIAL (1:N)
- Một giảng viên có thể đăng nhiều tài liệu
- Một tài liệu được đăng bởi một giảng viên

### 7. COURSE - ASSIGNMENT (1:N)
- Một môn học có nhiều bài tập
- Một bài tập thuộc về một môn học

### 8. STUDENT - ASSIGNMENT_SUBMISSION - ASSIGNMENT (M:N)
- Một sinh viên có thể nộp nhiều bài tập
- Một bài tập có thể có nhiều submission từ các sinh viên
- ASSIGNMENT_SUBMISSION là bảng trung gian

### 9. LECTURER - ASSIGNMENT_SUBMISSION (1:N)
- Một giảng viên có thể chấm nhiều bài nộp
- Một bài nộp được chấm bởi một giảng viên

### 10. USER - CHAT_MESSAGE (M:N - Self-referencing)
- Một user có thể gửi tin nhắn cho nhiều user khác
- Một user có thể nhận tin nhắn từ nhiều user khác
- sender_id và receiver_id đều tham chiếu đến USER

### 11. USER - EMAIL_NOTIFICATION (1:N)
- Một user có thể nhận nhiều email thông báo
- Một email thông báo được gửi đến một user

### 12. USER - PASSWORD_RESET_TOKEN (1:N)
- Một user có thể có nhiều token reset password (theo thời gian)
- Một token thuộc về một user

### 13. COURSE - CALENDAR_EVENT (1:N)
- Một môn học có thể có nhiều sự kiện lịch
- Một sự kiện có thể thuộc về một môn học (hoặc không)

### 14. USER - CALENDAR_EVENT (1:N)
- Một user có thể tạo nhiều sự kiện lịch
- Một sự kiện được tạo bởi một user

---

## 3. BUSINESS RULES (Quy tắc nghiệp vụ)

1. **Enrollment Rules:**
   - Sinh viên chỉ có thể đăng ký lịch học khi số lượng sinh viên chưa đạt max_students
   - Sinh viên không được đăng ký các lịch học trùng thời gian

2. **Course Schedule:**
   - Mỗi môn học có thể có nhiều lịch học trong các kỳ khác nhau
   - Mặc định mỗi lịch học kéo dài 20 tuần

3. **Assignment Submission:**
   - Sinh viên chỉ có thể nộp bài tập cho các môn họ đã đăng ký
   - Bài tập có thể nộp trễ nhưng có thể bị phạt điểm

4. **Chat & Email:**
   - Khi có tin nhắn chat mới, hệ thống tự động gửi email thông báo

5. **Lecture Materials:**
   - Chỉ giảng viên của môn học mới có thể đăng tài liệu
   - Tài liệu có thể gắn với tuần học cụ thể (1-20)

6. **Calendar:**
   - Giảng viên tạo lịch học cho môn => tự động tạo calendar events
   - Sinh viên đăng ký môn => tự động add calendar events vào lịch cá nhân

---

## 4. INDEXES (Chỉ mục đề xuất)

```sql
-- User indexes
CREATE INDEX idx_user_email ON USER(email);
CREATE INDEX idx_user_role ON USER(role);

-- Course indexes
CREATE INDEX idx_course_lecturer ON COURSE(lecturer_id);
CREATE INDEX idx_course_code ON COURSE(course_code);

-- Schedule indexes
CREATE INDEX idx_schedule_course ON COURSE_SCHEDULE(course_id);
CREATE INDEX idx_schedule_semester ON COURSE_SCHEDULE(semester);

-- Enrollment indexes
CREATE INDEX idx_enrollment_student ON ENROLLMENT(student_id);
CREATE INDEX idx_enrollment_schedule ON ENROLLMENT(schedule_id);
CREATE INDEX idx_enrollment_status ON ENROLLMENT(status);

-- Assignment indexes
CREATE INDEX idx_assignment_course ON ASSIGNMENT(course_id);
CREATE INDEX idx_assignment_due_date ON ASSIGNMENT(due_date);

-- Submission indexes
CREATE INDEX idx_submission_assignment ON ASSIGNMENT_SUBMISSION(assignment_id);
CREATE INDEX idx_submission_student ON ASSIGNMENT_SUBMISSION(student_id);

-- Chat indexes
CREATE INDEX idx_chat_sender ON CHAT_MESSAGE(sender_id);
CREATE INDEX idx_chat_receiver ON CHAT_MESSAGE(receiver_id);
CREATE INDEX idx_chat_sent_at ON CHAT_MESSAGE(sent_at);

-- Material indexes
CREATE INDEX idx_material_course ON LECTURE_MATERIAL(course_id);
CREATE INDEX idx_material_week ON LECTURE_MATERIAL(week_number);
```

---

## 5. ER DIAGRAM (Mô tả dạng text)

```
┌──────────────┐
│     USER     │
├──────────────┤
│ user_id (PK) │
│ email        │
│ password     │
│ role         │
└──────┬───────┘
       │ (Generalization)
       ├─────────────┬─────────────┐
       │             │             │
┌──────▼───────┐ ┌──▼────────┐   │
│   STUDENT    │ │  LECTURER  │   │
├──────────────┤ ├───────────┤   │
│ student_id   │ │lecturer_id│   │
│ student_code │ │department │   │
└──────┬───────┘ └─────┬─────┘   │
       │               │          │
       │               │ (1:N)    │
       │         ┌─────▼──────┐  │
       │         │   COURSE   │  │
       │         ├────────────┤  │
       │         │ course_id  │  │
       │         │ course_code│  │
       │         └─────┬──────┘  │
       │               │ (1:N)   │
       │         ┌─────▼──────────┐
       │         │COURSE_SCHEDULE │
       │         ├────────────────┤
       │         │ schedule_id    │
       │         │ day_of_week    │
       │         │ start_time     │
       │         └─────┬──────────┘
       │ (M:N)         │
       └───────────────┤
                 ┌─────▼──────────┐
                 │  ENROLLMENT    │
                 ├────────────────┤
                 │ enrollment_id  │
                 │ student_id (FK)│
                 │ schedule_id(FK)│
                 └────────────────┘

┌──────────────┐       ┌─────────────────┐
│  ASSIGNMENT  │◄──────│LECTURE_MATERIAL │
├──────────────┤(1:N)  ├─────────────────┤
│assignment_id │       │ material_id     │
│ course_id(FK)│       │ course_id (FK)  │
│ due_date     │       │ file_url        │
└──────┬───────┘       └─────────────────┘
       │ (1:N)
┌──────▼───────────────┐
│ASSIGNMENT_SUBMISSION │
├──────────────────────┤
│ submission_id        │
│ assignment_id (FK)   │
│ student_id (FK)      │
│ score                │
└──────────────────────┘

┌──────────────┐
│CHAT_MESSAGE  │
├──────────────┤
│ message_id   │
│ sender_id(FK)│──┐
│receiver_id(FK)│◄─┼─── Cả 2 đều tham chiếu đến USER
└──────────────┘  │

┌────────────────┐
│CALENDAR_EVENT  │
├────────────────┤
│ event_id       │
│ course_id (FK) │
│ creator_id (FK)│
│ start_datetime │
└────────────────┘
```

---

## 6. SAMPLE QUERIES (Truy vấn mẫu)

### Lấy tất cả môn học của một sinh viên
```sql
SELECT c.*, cs.day_of_week, cs.start_time, cs.end_time
FROM ENROLLMENT e
JOIN COURSE_SCHEDULE cs ON e.schedule_id = cs.schedule_id
JOIN COURSE c ON cs.course_id = c.course_id
WHERE e.student_id = ? AND e.status = 'enrolled';
```

### Lấy danh sách sinh viên đăng ký một môn học cụ thể
```sql
SELECT s.*, u.full_name, u.email
FROM ENROLLMENT e
JOIN STUDENT s ON e.student_id = s.student_id
JOIN USER u ON s.student_id = u.user_id
WHERE e.schedule_id = ? AND e.status = 'enrolled';
```

### Lấy tất cả bài tập chưa nộp của sinh viên
```sql
SELECT a.*
FROM ASSIGNMENT a
JOIN COURSE c ON a.course_id = c.course_id
JOIN COURSE_SCHEDULE cs ON c.course_id = cs.course_id
JOIN ENROLLMENT e ON cs.schedule_id = e.schedule_id
WHERE e.student_id = ?
AND NOT EXISTS (
    SELECT 1 FROM ASSIGNMENT_SUBMISSION asub
    WHERE asub.assignment_id = a.assignment_id
    AND asub.student_id = ?
)
AND a.due_date > NOW();
```

### Lấy lịch học theo tuần của sinh viên
```sql
SELECT c.course_name, cs.day_of_week, cs.start_time, cs.end_time, cs.room, l.full_name as lecturer
FROM ENROLLMENT e
JOIN COURSE_SCHEDULE cs ON e.schedule_id = cs.schedule_id
JOIN COURSE c ON cs.course_id = c.course_id
JOIN LECTURER lec ON c.lecturer_id = lec.lecturer_id
JOIN USER l ON lec.lecturer_id = l.user_id
WHERE e.student_id = ? AND e.status = 'enrolled'
ORDER BY FIELD(cs.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), cs.start_time;
```
