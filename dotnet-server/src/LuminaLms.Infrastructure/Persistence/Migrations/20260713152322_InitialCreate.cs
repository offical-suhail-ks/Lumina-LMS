using System;
using LuminaLms.Domain.Enums;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LuminaLms.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:achievement_type_enum", "course_completion,assignment,quiz,attendance,participation,custom")
                .Annotation("Npgsql:Enum:announcement_audience_enum", "all,students,faculty,parents")
                .Annotation("Npgsql:Enum:application_status_enum", "pending,fee_setup_pending,fee_setup_completed,under_review,accepted,rejected")
                .Annotation("Npgsql:Enum:attendance_status_enum", "present,absent,late,excused")
                .Annotation("Npgsql:Enum:batch_timing_enum", "morning,afternoon,regular")
                .Annotation("Npgsql:Enum:certificate_type_enum", "course_completion,achievement,participation")
                .Annotation("Npgsql:Enum:employee_type_enum", "faculty,staff,admin")
                .Annotation("Npgsql:Enum:forum_role_enum", "admin,faculty,student,parent")
                .Annotation("Npgsql:Enum:message_role_enum", "admin,faculty,student,parent,accounting")
                .Annotation("Npgsql:Enum:notification_type_enum", "info,success,warning,error,assignment,grade,announcement,message")
                .Annotation("Npgsql:Enum:payment_frequency_enum", "monthly,biweekly,weekly")
                .Annotation("Npgsql:Enum:payment_plan_type", "full,installment,scholarship,waived")
                .Annotation("Npgsql:Enum:payment_status_enum", "pending,completed,failed,refunded")
                .Annotation("Npgsql:Enum:priority_enum", "low,medium,high,urgent")
                .Annotation("Npgsql:Enum:question_type_enum", "multiple_choice,true_false,short_answer,essay")
                .Annotation("Npgsql:Enum:quiz_status_enum", "in_progress,submitted,graded")
                .Annotation("Npgsql:Enum:quiz_type_enum", "quiz,exam,assignment")
                .Annotation("Npgsql:Enum:salary_payment_method_enum", "bank_transfer,check,cash,other")
                .Annotation("Npgsql:Enum:salary_payment_status_enum", "pending,processed,failed,cancelled")
                .Annotation("Npgsql:Enum:salary_status_enum", "active,inactive,suspended")
                .Annotation("Npgsql:Enum:schedule_type_enum", "daily,weekend,mwf,tts")
                .Annotation("Npgsql:Enum:student_status", "active,inactive,suspended")
                .Annotation("Npgsql:Enum:task_status_enum", "pending,in_progress,completed,cancelled")
                .Annotation("Npgsql:Enum:task_type_enum", "fee_setup,fee_update,payment_verification,refund,other")
                .Annotation("Npgsql:Enum:user_role", "admin,faculty,student,parent,accounting")
                .Annotation("Npgsql:Enum:user_type_enum", "user,student")
                .Annotation("Npgsql:Enum:video_type_enum", "youtube,vimeo,upload,embed");

            migrationBuilder.CreateTable(
                name: "achievements",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    icon_url = table.Column<string>(type: "text", nullable: true),
                    points = table.Column<int>(type: "integer", nullable: false),
                    achievement_type = table.Column<AchievementType>(type: "achievement_type_enum", nullable: false),
                    criteria = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_achievements", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "activity_logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    user_type = table.Column<OwnerType>(type: "user_type_enum", nullable: false),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_type = table.Column<string>(type: "text", nullable: true),
                    entity_id = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_activity_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "analytics_events",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    event_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: true),
                    user_type = table.Column<OwnerType>(type: "user_type_enum", nullable: true),
                    entity_type = table.Column<string>(type: "text", nullable: true),
                    entity_id = table.Column<string>(type: "text", nullable: true),
                    metadata = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_analytics_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "certificates",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    course_id = table.Column<string>(type: "text", nullable: true),
                    certificate_type = table.Column<CertificateType>(type: "certificate_type_enum", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    issued_date = table.Column<DateOnly>(type: "date", nullable: false),
                    certificate_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    verification_code = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    issued_by = table.Column<string>(type: "text", nullable: false),
                    pdf_path = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_certificates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chat_groups",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_groups", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "course_videos",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    course_id = table.Column<string>(type: "text", nullable: false),
                    module_id = table.Column<string>(type: "text", nullable: true),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    video_url = table.Column<string>(type: "text", nullable: true),
                    video_type = table.Column<VideoType>(type: "video_type_enum", nullable: true),
                    duration = table.Column<int>(type: "integer", nullable: true),
                    thumbnail_url = table.Column<string>(type: "text", nullable: true),
                    order_index = table.Column<int>(type: "integer", nullable: false),
                    is_preview = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_videos", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "courses",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    instructor = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    department = table.Column<string>(type: "text", nullable: true),
                    start_date = table.Column<DateOnly>(type: "date", nullable: true),
                    end_date = table.Column<DateOnly>(type: "date", nullable: true),
                    total_years = table.Column<int>(type: "integer", nullable: true),
                    capacity = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "feature_flags",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    feature_key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    feature_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    role_restrictions = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feature_flags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "forum_categories",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    course_id = table.Column<string>(type: "text", nullable: true),
                    order_index = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_forum_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    sender_id = table.Column<string>(type: "text", nullable: false),
                    sender_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    sender_role = table.Column<MessageRole>(type: "message_role_enum", nullable: false),
                    recipient_id = table.Column<string>(type: "text", nullable: true),
                    recipient_role = table.Column<MessageRole>(type: "message_role_enum", nullable: true),
                    subject = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    read_by_sender = table.Column<bool>(type: "boolean", nullable: false),
                    read_by_recipient = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_by_sender = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_by_recipient = table.Column<bool>(type: "boolean", nullable: false),
                    is_announcement = table.Column<bool>(type: "boolean", nullable: false),
                    announcement_audience = table.Column<AnnouncementAudience>(type: "announcement_audience_enum", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_messages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    user_type = table.Column<OwnerType>(type: "user_type_enum", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<NotificationType>(type: "notification_type_enum", nullable: false),
                    link = table.Column<string>(type: "text", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "password_reset_tokens",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    user_type = table.Column<OwnerType>(type: "user_type_enum", nullable: false),
                    token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    used = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_password_reset_tokens", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "private_chat_threads",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    participant1id = table.Column<string>(type: "text", nullable: false),
                    participant2id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_private_chat_threads", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "quizzes",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    course_id = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    quiz_type = table.Column<QuizType>(type: "quiz_type_enum", nullable: false),
                    time_limit = table.Column<int>(type: "integer", nullable: true),
                    total_points = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    passing_score = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    allow_retake = table.Column<bool>(type: "boolean", nullable: false),
                    max_attempts = table.Column<int>(type: "integer", nullable: false),
                    shuffle_questions = table.Column<bool>(type: "boolean", nullable: false),
                    show_results = table.Column<bool>(type: "boolean", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quizzes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role = table.Column<UserRole>(type: "user_role", nullable: false),
                    department = table.Column<string>(type: "text", nullable: true),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "video_progress",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    video_id = table.Column<string>(type: "text", nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    progress_percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    watched_duration = table.Column<int>(type: "integer", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false),
                    last_watched_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_video_progress", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chat_group_members",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    group_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_group_members", x => x.id);
                    table.ForeignKey(
                        name: "fk_chat_group_members_chat_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "chat_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "chat_group_messages",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    group_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    author = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_group_messages", x => x.id);
                    table.ForeignKey(
                        name: "fk_chat_group_messages_chat_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "chat_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assignments",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    course_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assignments", x => x.id);
                    table.ForeignKey(
                        name: "fk_assignments_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_modules",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    course_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    duration_hours = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    order_index = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_modules", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_modules_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_tags",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    tag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_tags", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_tags_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "students",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    first_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    last_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "text", nullable: true),
                    date_of_birth = table.Column<DateOnly>(type: "date", nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    city = table.Column<string>(type: "text", nullable: true),
                    state = table.Column<string>(type: "text", nullable: true),
                    country = table.Column<string>(type: "text", nullable: true),
                    postal_code = table.Column<string>(type: "text", nullable: true),
                    course_id = table.Column<string>(type: "character varying(255)", nullable: true),
                    year = table.Column<string>(type: "text", nullable: true),
                    cohort = table.Column<string>(type: "text", nullable: true),
                    batch_timing = table.Column<BatchTiming>(type: "batch_timing_enum", nullable: true),
                    class_schedule = table.Column<ScheduleType>(type: "schedule_type_enum", nullable: true),
                    status = table.Column<StudentStatus>(type: "student_status", nullable: false),
                    application_status = table.Column<ApplicationStatus>(type: "application_status_enum", nullable: false),
                    course_fee = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    payment_plan = table.Column<PaymentPlanType>(type: "payment_plan_type", nullable: true),
                    payment_plan_details = table.Column<string>(type: "text", nullable: true),
                    fee_due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    send_reminder = table.Column<bool>(type: "boolean", nullable: false),
                    offer_letter_sent = table.Column<bool>(type: "boolean", nullable: false),
                    offer_letter_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    guardian_name = table.Column<string>(type: "text", nullable: true),
                    guardian_email = table.Column<string>(type: "text", nullable: true),
                    guardian_phone = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_students_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "forum_threads",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    category_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    course_id = table.Column<string>(type: "text", nullable: true),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    author_id = table.Column<string>(type: "text", nullable: false),
                    author_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    author_role = table.Column<ForumRole>(type: "forum_role_enum", nullable: false),
                    is_pinned = table.Column<bool>(type: "boolean", nullable: false),
                    is_locked = table.Column<bool>(type: "boolean", nullable: false),
                    views = table.Column<int>(type: "integer", nullable: false),
                    reply_count = table.Column<int>(type: "integer", nullable: false),
                    last_reply_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_forum_threads", x => x.id);
                    table.ForeignKey(
                        name: "fk_forum_threads_forum_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "forum_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "private_chat_messages",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    thread_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    author = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_private_chat_messages", x => x.id);
                    table.ForeignKey(
                        name: "fk_private_chat_messages_private_chat_threads_thread_id",
                        column: x => x.thread_id,
                        principalTable: "private_chat_threads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quiz_attempts",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    quiz_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    attempt_number = table.Column<int>(type: "integer", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    time_taken = table.Column<int>(type: "integer", nullable: true),
                    score = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    passed = table.Column<bool>(type: "boolean", nullable: true),
                    status = table.Column<QuizAttemptStatus>(type: "quiz_status_enum", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quiz_attempts", x => x.id);
                    table.ForeignKey(
                        name: "fk_quiz_attempts_quizzes_quiz_id",
                        column: x => x.quiz_id,
                        principalTable: "quizzes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quiz_questions",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    quiz_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    question_text = table.Column<string>(type: "text", nullable: false),
                    question_type = table.Column<QuestionType>(type: "question_type_enum", nullable: false),
                    points = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    order_index = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quiz_questions", x => x.id);
                    table.ForeignKey(
                        name: "fk_quiz_questions_quizzes_quiz_id",
                        column: x => x.quiz_id,
                        principalTable: "quizzes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "salaries",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    employee_id = table.Column<string>(type: "text", nullable: false),
                    employee_type = table.Column<EmployeeType>(type: "employee_type_enum", nullable: false),
                    base_salary = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    allowances = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    deductions = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    net_salary = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    payment_frequency = table.Column<PaymentFrequency>(type: "payment_frequency_enum", nullable: false),
                    bank_account = table.Column<string>(type: "text", nullable: true),
                    bank_name = table.Column<string>(type: "text", nullable: true),
                    tax_id = table.Column<string>(type: "text", nullable: true),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<SalaryStatus>(type: "salary_status_enum", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_by = table.Column<string>(type: "character varying(255)", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_salaries", x => x.id);
                    table.ForeignKey(
                        name: "fk_salaries_users_created_by",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "calendar_events",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    event_date = table.Column<DateOnly>(type: "date", nullable: false),
                    event_time = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    assignment_id = table.Column<string>(type: "character varying(255)", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_calendar_events", x => x.id);
                    table.ForeignKey(
                        name: "fk_calendar_events_assignments_assignment_id",
                        column: x => x.assignment_id,
                        principalTable: "assignments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "module_materials",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    module_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_name = table.Column<string>(type: "text", nullable: true),
                    file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    file_size = table.Column<long>(type: "bigint", nullable: true),
                    file_type = table.Column<string>(type: "text", nullable: true),
                    uploaded_by = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_module_materials", x => x.id);
                    table.ForeignKey(
                        name: "fk_module_materials_course_modules_module_id",
                        column: x => x.module_id,
                        principalTable: "course_modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "accounting_tasks",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    student_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    task_type = table.Column<AccountingTaskType>(type: "task_type_enum", nullable: false),
                    status = table.Column<AccountingTaskStatus>(type: "task_status_enum", nullable: false),
                    priority = table.Column<Priority>(type: "priority_enum", nullable: false),
                    assigned_to = table.Column<string>(type: "character varying(255)", nullable: true),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    student_data = table.Column<string>(type: "jsonb", nullable: true),
                    fee_details = table.Column<string>(type: "jsonb", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    admin_remarks = table.Column<string>(type: "text", nullable: true),
                    accounting_remarks = table.Column<string>(type: "text", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_by = table.Column<string>(type: "text", nullable: true),
                    reviewed_by = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_accounting_tasks", x => x.id);
                    table.ForeignKey(
                        name: "fk_accounting_tasks_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_accounting_tasks_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "assignment_submissions",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    assignment_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    student_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    artifact_name = table.Column<string>(type: "text", nullable: true),
                    grade = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    feedback = table.Column<string>(type: "text", nullable: true),
                    graded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    graded_by = table.Column<string>(type: "text", nullable: true),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assignment_submissions", x => x.id);
                    table.ForeignKey(
                        name: "fk_assignment_submissions_assignments_assignment_id",
                        column: x => x.assignment_id,
                        principalTable: "assignments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_assignment_submissions_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "attendance",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    student_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    faculty_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    attendance_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<AttendanceStatus>(type: "attendance_status_enum", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    marked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attendance", x => x.id);
                    table.ForeignKey(
                        name: "fk_attendance_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_attendance_users_faculty_id",
                        column: x => x.faculty_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "class_schedules",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    student_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    schedule_type = table.Column<ScheduleType>(type: "schedule_type_enum", nullable: false),
                    batch_timing = table.Column<BatchTiming>(type: "batch_timing_enum", nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_class_schedules", x => x.id);
                    table.ForeignKey(
                        name: "fk_class_schedules_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_enrollments",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    student_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    enrolled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_enrollments", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_enrollments_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_course_enrollments_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    student_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    installment_number = table.Column<int>(type: "integer", nullable: true),
                    total_installments = table.Column<int>(type: "integer", nullable: true),
                    payment_method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    payment_status = table.Column<PaymentStatus>(type: "payment_status_enum", nullable: false),
                    transaction_id = table.Column<string>(type: "text", nullable: true),
                    payment_gateway = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payments", x => x.id);
                    table.ForeignKey(
                        name: "fk_payments_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_achievements",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    student_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    achievement_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    earned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_achievements", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_achievements_achievements_achievement_id",
                        column: x => x.achievement_id,
                        principalTable: "achievements",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_achievements_students_student_id",
                        column: x => x.student_id,
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "forum_replies",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    thread_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    author_id = table.Column<string>(type: "text", nullable: false),
                    author_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    author_role = table.Column<ForumRole>(type: "forum_role_enum", nullable: false),
                    is_solution = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_forum_replies", x => x.id);
                    table.ForeignKey(
                        name: "fk_forum_replies_forum_threads_thread_id",
                        column: x => x.thread_id,
                        principalTable: "forum_threads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quiz_answers",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    attempt_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    question_id = table.Column<string>(type: "text", nullable: false),
                    answer_text = table.Column<string>(type: "text", nullable: true),
                    selected_options = table.Column<string>(type: "text", nullable: true),
                    points_earned = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: true),
                    graded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    graded_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quiz_answers", x => x.id);
                    table.ForeignKey(
                        name: "fk_quiz_answers_quiz_attempts_attempt_id",
                        column: x => x.attempt_id,
                        principalTable: "quiz_attempts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quiz_question_options",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    question_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    option_text = table.Column<string>(type: "text", nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false),
                    order_index = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quiz_question_options", x => x.id);
                    table.ForeignKey(
                        name: "fk_quiz_question_options_quiz_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "quiz_questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "salary_payments",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    salary_id = table.Column<string>(type: "character varying(255)", nullable: false),
                    payment_date = table.Column<DateOnly>(type: "date", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    payment_method = table.Column<SalaryPaymentMethod>(type: "salary_payment_method_enum", nullable: false),
                    transaction_reference = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<SalaryPaymentStatus>(type: "salary_payment_status_enum", nullable: false),
                    processed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    processed_by = table.Column<string>(type: "character varying(255)", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_salary_payments", x => x.id);
                    table.ForeignKey(
                        name: "fk_salary_payments_salaries_salary_id",
                        column: x => x.salary_id,
                        principalTable: "salaries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_salary_payments_users_processed_by",
                        column: x => x.processed_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_accounting_tasks_assigned_to",
                table: "accounting_tasks",
                column: "assigned_to");

            migrationBuilder.CreateIndex(
                name: "ix_accounting_tasks_created_at",
                table: "accounting_tasks",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_accounting_tasks_status",
                table: "accounting_tasks",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_accounting_tasks_student_id",
                table: "accounting_tasks",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_accounting_tasks_task_type",
                table: "accounting_tasks",
                column: "task_type");

            migrationBuilder.CreateIndex(
                name: "ix_activity_logs_action",
                table: "activity_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "ix_activity_logs_created_at",
                table: "activity_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_activity_logs_entity_type_entity_id",
                table: "activity_logs",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "ix_activity_logs_user_id_user_type",
                table: "activity_logs",
                columns: new[] { "user_id", "user_type" });

            migrationBuilder.CreateIndex(
                name: "ix_analytics_events_created_at",
                table: "analytics_events",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_analytics_events_event_type",
                table: "analytics_events",
                column: "event_type");

            migrationBuilder.CreateIndex(
                name: "ix_analytics_events_user_id_user_type",
                table: "analytics_events",
                columns: new[] { "user_id", "user_type" });

            migrationBuilder.CreateIndex(
                name: "ix_assignment_submissions_assignment_id",
                table: "assignment_submissions",
                column: "assignment_id");

            migrationBuilder.CreateIndex(
                name: "ix_assignment_submissions_grade",
                table: "assignment_submissions",
                column: "grade");

            migrationBuilder.CreateIndex(
                name: "ix_assignment_submissions_student_id",
                table: "assignment_submissions",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_assignment_submissions_submitted_at",
                table: "assignment_submissions",
                column: "submitted_at");

            migrationBuilder.CreateIndex(
                name: "ix_assignments_course_id",
                table: "assignments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_assignments_due_date",
                table: "assignments",
                column: "due_date");

            migrationBuilder.CreateIndex(
                name: "ix_attendance_attendance_date",
                table: "attendance",
                column: "attendance_date");

            migrationBuilder.CreateIndex(
                name: "ix_attendance_faculty_id",
                table: "attendance",
                column: "faculty_id");

            migrationBuilder.CreateIndex(
                name: "ix_attendance_status",
                table: "attendance",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_attendance_student_id_attendance_date",
                table: "attendance",
                columns: new[] { "student_id", "attendance_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_assignment_id",
                table: "calendar_events",
                column: "assignment_id");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_event_date",
                table: "calendar_events",
                column: "event_date");

            migrationBuilder.CreateIndex(
                name: "ix_certificates_certificate_number",
                table: "certificates",
                column: "certificate_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_certificates_course_id",
                table: "certificates",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_certificates_student_id",
                table: "certificates",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_certificates_verification_code",
                table: "certificates",
                column: "verification_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_chat_group_members_group_id_user_id",
                table: "chat_group_members",
                columns: new[] { "group_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_chat_group_messages_created_at",
                table: "chat_group_messages",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_chat_group_messages_group_id",
                table: "chat_group_messages",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "ix_class_schedules_is_active",
                table: "class_schedules",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_class_schedules_schedule_type",
                table: "class_schedules",
                column: "schedule_type");

            migrationBuilder.CreateIndex(
                name: "ix_class_schedules_student_id",
                table: "class_schedules",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_course_id_student_id",
                table: "course_enrollments",
                columns: new[] { "course_id", "student_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_student_id",
                table: "course_enrollments",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_modules_course_id",
                table: "course_modules",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_modules_order_index",
                table: "course_modules",
                column: "order_index");

            migrationBuilder.CreateIndex(
                name: "ix_course_tags_course_id_tag",
                table: "course_tags",
                columns: new[] { "course_id", "tag" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_course_tags_tag",
                table: "course_tags",
                column: "tag");

            migrationBuilder.CreateIndex(
                name: "ix_course_videos_course_id",
                table: "course_videos",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_videos_module_id",
                table: "course_videos",
                column: "module_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_department",
                table: "courses",
                column: "department");

            migrationBuilder.CreateIndex(
                name: "ix_courses_instructor",
                table: "courses",
                column: "instructor");

            migrationBuilder.CreateIndex(
                name: "ix_feature_flags_feature_key",
                table: "feature_flags",
                column: "feature_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_feature_flags_is_enabled",
                table: "feature_flags",
                column: "is_enabled");

            migrationBuilder.CreateIndex(
                name: "ix_forum_categories_course_id",
                table: "forum_categories",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_forum_replies_author_id",
                table: "forum_replies",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "ix_forum_replies_created_at",
                table: "forum_replies",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_forum_replies_thread_id",
                table: "forum_replies",
                column: "thread_id");

            migrationBuilder.CreateIndex(
                name: "ix_forum_threads_author_id",
                table: "forum_threads",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "ix_forum_threads_category_id",
                table: "forum_threads",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_forum_threads_course_id",
                table: "forum_threads",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_forum_threads_created_at",
                table: "forum_threads",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_forum_threads_is_pinned",
                table: "forum_threads",
                column: "is_pinned");

            migrationBuilder.CreateIndex(
                name: "ix_messages_created_at",
                table: "messages",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_messages_is_announcement_announcement_audience",
                table: "messages",
                columns: new[] { "is_announcement", "announcement_audience" });

            migrationBuilder.CreateIndex(
                name: "ix_messages_read_by_recipient",
                table: "messages",
                column: "read_by_recipient");

            migrationBuilder.CreateIndex(
                name: "ix_messages_recipient_id",
                table: "messages",
                column: "recipient_id");

            migrationBuilder.CreateIndex(
                name: "ix_messages_sender_id",
                table: "messages",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "ix_module_materials_module_id",
                table: "module_materials",
                column: "module_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_created_at",
                table: "notifications",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_is_read",
                table: "notifications",
                column: "is_read");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id_user_type",
                table: "notifications",
                columns: new[] { "user_id", "user_type" });

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_expires_at",
                table: "password_reset_tokens",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_token",
                table: "password_reset_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_user_id_user_type",
                table: "password_reset_tokens",
                columns: new[] { "user_id", "user_type" });

            migrationBuilder.CreateIndex(
                name: "ix_payments_created_at",
                table: "payments",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_payments_payment_status",
                table: "payments",
                column: "payment_status");

            migrationBuilder.CreateIndex(
                name: "ix_payments_student_id",
                table: "payments",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_private_chat_messages_created_at",
                table: "private_chat_messages",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_private_chat_messages_thread_id",
                table: "private_chat_messages",
                column: "thread_id");

            migrationBuilder.CreateIndex(
                name: "ix_private_chat_threads_participant1id",
                table: "private_chat_threads",
                column: "participant1id");

            migrationBuilder.CreateIndex(
                name: "ix_private_chat_threads_participant1id_participant2id",
                table: "private_chat_threads",
                columns: new[] { "participant1id", "participant2id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_private_chat_threads_participant2id",
                table: "private_chat_threads",
                column: "participant2id");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_answers_attempt_id",
                table: "quiz_answers",
                column: "attempt_id");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_answers_attempt_id_question_id",
                table: "quiz_answers",
                columns: new[] { "attempt_id", "question_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_quiz_answers_question_id",
                table: "quiz_answers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_attempts_quiz_id",
                table: "quiz_attempts",
                column: "quiz_id");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_attempts_status",
                table: "quiz_attempts",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_attempts_student_id",
                table: "quiz_attempts",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_question_options_question_id",
                table: "quiz_question_options",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_questions_order_index",
                table: "quiz_questions",
                column: "order_index");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_questions_quiz_id",
                table: "quiz_questions",
                column: "quiz_id");

            migrationBuilder.CreateIndex(
                name: "ix_quizzes_course_id",
                table: "quizzes",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_quizzes_created_by",
                table: "quizzes",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_quizzes_start_date_end_date",
                table: "quizzes",
                columns: new[] { "start_date", "end_date" });

            migrationBuilder.CreateIndex(
                name: "ix_salaries_created_by",
                table: "salaries",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_salaries_employee_id",
                table: "salaries",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_salaries_employee_type",
                table: "salaries",
                column: "employee_type");

            migrationBuilder.CreateIndex(
                name: "ix_salaries_status",
                table: "salaries",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_salary_payments_payment_date",
                table: "salary_payments",
                column: "payment_date");

            migrationBuilder.CreateIndex(
                name: "ix_salary_payments_processed_by",
                table: "salary_payments",
                column: "processed_by");

            migrationBuilder.CreateIndex(
                name: "ix_salary_payments_salary_id",
                table: "salary_payments",
                column: "salary_id");

            migrationBuilder.CreateIndex(
                name: "ix_salary_payments_status",
                table: "salary_payments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_student_achievements_achievement_id",
                table: "student_achievements",
                column: "achievement_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_achievements_student_id",
                table: "student_achievements",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_achievements_student_id_achievement_id",
                table: "student_achievements",
                columns: new[] { "student_id", "achievement_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_students_application_status",
                table: "students",
                column: "application_status");

            migrationBuilder.CreateIndex(
                name: "ix_students_course_id",
                table: "students",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_students_email",
                table: "students",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_students_status",
                table: "students",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_students_username",
                table: "students",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_role",
                table: "users",
                column: "role");

            migrationBuilder.CreateIndex(
                name: "ix_users_username",
                table: "users",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_video_progress_student_id",
                table: "video_progress",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_video_progress_video_id_student_id",
                table: "video_progress",
                columns: new[] { "video_id", "student_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "accounting_tasks");

            migrationBuilder.DropTable(
                name: "activity_logs");

            migrationBuilder.DropTable(
                name: "analytics_events");

            migrationBuilder.DropTable(
                name: "assignment_submissions");

            migrationBuilder.DropTable(
                name: "attendance");

            migrationBuilder.DropTable(
                name: "calendar_events");

            migrationBuilder.DropTable(
                name: "certificates");

            migrationBuilder.DropTable(
                name: "chat_group_members");

            migrationBuilder.DropTable(
                name: "chat_group_messages");

            migrationBuilder.DropTable(
                name: "class_schedules");

            migrationBuilder.DropTable(
                name: "course_enrollments");

            migrationBuilder.DropTable(
                name: "course_tags");

            migrationBuilder.DropTable(
                name: "course_videos");

            migrationBuilder.DropTable(
                name: "feature_flags");

            migrationBuilder.DropTable(
                name: "forum_replies");

            migrationBuilder.DropTable(
                name: "messages");

            migrationBuilder.DropTable(
                name: "module_materials");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "password_reset_tokens");

            migrationBuilder.DropTable(
                name: "payments");

            migrationBuilder.DropTable(
                name: "private_chat_messages");

            migrationBuilder.DropTable(
                name: "quiz_answers");

            migrationBuilder.DropTable(
                name: "quiz_question_options");

            migrationBuilder.DropTable(
                name: "salary_payments");

            migrationBuilder.DropTable(
                name: "student_achievements");

            migrationBuilder.DropTable(
                name: "video_progress");

            migrationBuilder.DropTable(
                name: "assignments");

            migrationBuilder.DropTable(
                name: "chat_groups");

            migrationBuilder.DropTable(
                name: "forum_threads");

            migrationBuilder.DropTable(
                name: "course_modules");

            migrationBuilder.DropTable(
                name: "private_chat_threads");

            migrationBuilder.DropTable(
                name: "quiz_attempts");

            migrationBuilder.DropTable(
                name: "quiz_questions");

            migrationBuilder.DropTable(
                name: "salaries");

            migrationBuilder.DropTable(
                name: "achievements");

            migrationBuilder.DropTable(
                name: "students");

            migrationBuilder.DropTable(
                name: "forum_categories");

            migrationBuilder.DropTable(
                name: "quizzes");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "courses");
        }
    }
}
