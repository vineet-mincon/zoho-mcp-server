import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { learnClient, handleApiError, formatSuccess } from "../services/zohoClient.js";

export function registerLearnTools(server: McpServer): void {

  // ─── List Courses ─────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_list_courses",
    {
      title: "List / Search Courses",
      description: `Search and list courses from Zoho Learn.

Args:
  - search (string, optional): Filter courses by name/keyword
  - status (string, optional): published, draft, archived
  - page (number, optional): Page number, default 1

Returns: List of courses with course_id, title, description, status, enrollment_count`,
      inputSchema: z.object({
        search: z.string().optional(),
        status: z.enum(["published", "draft", "archived"]).optional(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ search, status }) => {
      try {
        const params: Record<string, unknown> = { view: "author" };
        if (search) params.search = search;
        if (status) params.status = status;

        const res = await learnClient.get("/course", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_list_courses"); }
    }
  );

  // ─── Get Course ───────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_get_course",
    {
      title: "Get Course Details",
      description: `Get full details of a specific course in Zoho Learn.

Args:
  - course_id (string): The Zoho Learn course ID

Returns: Complete course with modules, chapters, enrollment settings, and metadata`,
      inputSchema: z.object({
        course_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_get_course"); }
    }
  );

  // ─── Create Course ────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_create_course",
    {
      title: "Create Course",
      description: `Create a new course in Zoho Learn.

Args:
  - title (string): Course title
  - description (string, optional): Course description
  - cover_image_url (string, optional): URL of the course cover image
  - category_id (string, optional): Course category ID
  - duration (number, optional): Estimated duration in minutes
  - tags (array, optional): List of tag strings

Returns: Created course with course_id`,
      inputSchema: z.object({
        title: z.string(),
        description: z.string().optional(),
        cover_image_url: z.string().optional(),
        category_id: z.string().optional(),
        duration: z.number().int().positive().optional().describe("Estimated duration in minutes"),
        tags: z.array(z.string()).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (params) => {
      try {
        const res = await learnClient.post("/course", params);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_create_course"); }
    }
  );

  // ─── Update Course ────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_update_course",
    {
      title: "Update Course",
      description: `Update an existing course in Zoho Learn. Only provide fields to change.

Args:
  - course_id (string): The course ID to update
  - title (string, optional): New course title
  - description (string, optional): New description
  - category_id (string, optional): New category ID
  - duration (number, optional): Estimated duration in minutes
  - tags (array, optional): Replacement list of tags

Returns: Updated course`,
      inputSchema: z.object({
        course_id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        category_id: z.string().optional(),
        duration: z.number().int().positive().optional(),
        tags: z.array(z.string()).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id, ...body }) => {
      try {
        const res = await learnClient.put(`/course/${course_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_update_course"); }
    }
  );

  // ─── Publish / Unpublish Course ───────────────────────────────────────────

  server.registerTool(
    "zoho_learn_publish_course",
    {
      title: "Publish or Unpublish Course",
      description: `Change the published status of a course in Zoho Learn.

Args:
  - course_id (string): The course ID
  - action (string): "publish" to make the course live, "unpublish" to revert to draft

Returns: Updated course status`,
      inputSchema: z.object({
        course_id: z.string(),
        action: z.enum(["publish", "unpublish"]),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id, action }) => {
      try {
        const res = await learnClient.post(`/course/${course_id}/${action}`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_publish_course"); }
    }
  );

  // ─── List Enrollments ─────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_list_enrollments",
    {
      title: "List Course Enrollments",
      description: `List learners enrolled in a specific course.

Args:
  - course_id (string): The course ID
  - status (string, optional): active, completed, not_started
  - page (number, optional): Page number, default 1

Returns: List of enrollments with user info, progress percentage, and completion date`,
      inputSchema: z.object({
        course_id: z.string(),
        status: z.enum(["active", "completed", "not_started"]).optional(),
        page: z.number().int().min(1).default(1),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id, status, page }) => {
      try {
        const params: Record<string, unknown> = { page, per_page: 25 };
        if (status) params.status = status;

        const res = await learnClient.get(`/course/${course_id}/enrollments`, { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_list_enrollments"); }
    }
  );

  // ─── Enroll User ──────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_enroll_user",
    {
      title: "Enroll User in Course",
      description: `Enroll one or more users in a Zoho Learn course.

Args:
  - course_id (string): The course ID
  - user_emails (array): List of user email addresses to enroll
  - due_date (string, optional): Completion due date YYYY-MM-DD

Returns: Enrollment result with success/failure per user`,
      inputSchema: z.object({
        course_id: z.string(),
        user_emails: z.array(z.string().email()).min(1),
        due_date: z.string().optional().describe("Completion due date YYYY-MM-DD"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ course_id, user_emails, due_date }) => {
      try {
        const body: Record<string, unknown> = { user_emails };
        if (due_date) body.due_date = due_date;

        const res = await learnClient.post(`/course/${course_id}/enrollments`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_enroll_user"); }
    }
  );

  // ─── Get User Progress ────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_get_user_progress",
    {
      title: "Get User Progress in Course",
      description: `Get a specific learner's progress in a course.

Args:
  - course_id (string): The course ID
  - user_email (string): The learner's email address

Returns: Progress details including completion percentage, time spent, module-level completion, and quiz scores`,
      inputSchema: z.object({
        course_id: z.string(),
        user_email: z.string().email(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id, user_email }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}/progress`, {
          params: { user_email },
        });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_get_user_progress"); }
    }
  );

  // ─── List Categories ──────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_list_categories",
    {
      title: "List Course Categories",
      description: `List all course categories available in Zoho Learn.

Returns: List of categories with category_id, name, and course count`,
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async () => {
      try {
        const res = await learnClient.get("/categories");
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_list_categories"); }
    }
  );

  // ─── List Learners ────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_list_learners",
    {
      title: "List Learners",
      description: `List all learners (users) in the Zoho Learn portal.

Args:
  - search (string, optional): Filter by name or email
  - page (number, optional): Page number, default 1

Returns: List of learners with user_id, name, email, enrolled course count, and last active date`,
      inputSchema: z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ search, page }) => {
      try {
        const params: Record<string, unknown> = { page, per_page: 25 };
        if (search) params.search = search;

        const res = await learnClient.get("/learners", { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_list_learners"); }
    }
  );

  // ─── Create Quiz ──────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_create_quiz",
    {
      title: "Create Quiz",
      description: `Create a new quiz/assessment inside a Zoho Learn course. In Zoho Learn, a quiz is a chapter with type QUIZ. The returned chapter_id is what you pass to zoho_learn_add_quiz_question and zoho_learn_list_quiz_questions.

Args:
  - course_id (string): The course ID to add the quiz to
  - title (string): Quiz title
  - description (string, optional): Quiz description
  - module_id (string, optional): Module/section to place the quiz in
  - pass_percentage (number, optional): Minimum score percentage to pass (0-100)
  - max_attempts (number, optional): Maximum number of attempts allowed
  - time_limit (number, optional): Time limit in minutes

Returns: Created quiz chapter with chapter_id`,
      inputSchema: z.object({
        course_id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        module_id: z.string().optional(),
        pass_percentage: z.number().min(0).max(100).optional(),
        max_attempts: z.number().int().positive().optional(),
        time_limit: z.number().int().positive().optional().describe("Time limit in minutes"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ course_id, title, description, module_id, pass_percentage, max_attempts, time_limit }) => {
      try {
        const body: Record<string, unknown> = { title };
        if (description) body.description = description;
        if (module_id) body.module_id = module_id;
        if (pass_percentage !== undefined) body.pass_percentage = pass_percentage;
        if (max_attempts) body.max_attempts = max_attempts;
        if (time_limit) body.time_limit = time_limit;

        const res = await learnClient.post(`/course/${course_id}/lesson`, { ...body, type: "QUIZ" });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_create_quiz"); }
    }
  );

  // ─── Add Quiz Question ────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_add_quiz_question",
    {
      title: "Add Quiz Question",
      description: `Add a question to a quiz in a Zoho Learn course. In Zoho Learn, a quiz is a chapter — pass the chapter_id of the quiz chapter here.

Args:
  - course_id (string): The course ID
  - chapter_id (string): The chapter ID of the quiz (returned by zoho_learn_create_quiz or zoho_learn_list_lessons)
  - question (string): The question text
  - question_type (string): single_choice, multiple_choice, true_false, fill_in_the_blank
  - options (array, optional): Answer options, each with text and is_correct flag. Required for choice-based questions.
  - explanation (string, optional): Explanation shown after answering
  - marks (number, optional): Points awarded for correct answer

Returns: Created question with question_id`,
      inputSchema: z.object({
        course_id: z.string(),
        chapter_id: z.string(),
        question: z.string(),
        question_type: z.enum(["single_choice", "multiple_choice", "true_false", "fill_in_the_blank"]),
        options: z.array(z.object({
          text: z.string(),
          is_correct: z.boolean(),
        })).optional(),
        explanation: z.string().optional(),
        marks: z.number().positive().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ course_id, chapter_id, question, question_type, options, explanation, marks }) => {
      try {
        const body: Record<string, unknown> = { question, question_type };
        if (options) body.options = options;
        if (explanation) body.explanation = explanation;
        if (marks) body.marks = marks;

        const res = await learnClient.post(`/course/${course_id}/chapter/${chapter_id}/question`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_add_quiz_question"); }
    }
  );

  // ─── List Quiz Questions ──────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_list_quiz_questions",
    {
      title: "List Quiz Questions",
      description: `List all questions in a quiz within a Zoho Learn course. In Zoho Learn, a quiz is a chapter — pass the chapter_id of the quiz chapter here.

Args:
  - course_id (string): The course ID
  - chapter_id (string): The chapter ID of the quiz (returned by zoho_learn_list_lessons)

Returns: List of questions with question_id, text, type, options, and marks`,
      inputSchema: z.object({
        course_id: z.string(),
        chapter_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id, chapter_id }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}/chapter/${chapter_id}/question`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_list_quiz_questions"); }
    }
  );

  // ─── List Lessons ─────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_list_lessons",
    {
      title: "List Lessons in a Course",
      description: `List all lessons in a Zoho Learn course with their IDs and metadata.

Args:
  - course_id (string): The course ID

Returns: List of lessons with lesson_id, title, type, module, and order`,
      inputSchema: z.object({
        course_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}/chapter`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_list_lessons"); }
    }
  );

  // ─── Create Lesson ────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_create_lesson",
    {
      title: "Create Text Lesson",
      description: `Create a new lesson inside a Zoho Learn course.

Args:
  - course_id (string): The course ID to add the lesson to
  - name (string): Lesson title
  - type (string, optional): TEXT (default), DOCUMENT, VIDEO, IMAGE, BLOCK, ASSIGNMENT

Returns: Created lesson with lesson id`,
      inputSchema: z.object({
        course_id: z.string(),
        name: z.string(),
        type: z.enum(["TEXT", "DOCUMENT", "VIDEO", "IMAGE", "BLOCK", "ASSIGNMENT"]).default("TEXT"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ course_id, name, type }) => {
      try {
        const body: Record<string, unknown> = { name, type };

        const res = await learnClient.post(`/course/${course_id}/lesson`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_create_lesson"); }
    }
  );

  // ─── Update Lesson ────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_update_lesson",
    {
      title: "Update Lesson Content",
      description: `Edit the content or title of an existing lesson in a Zoho Learn course.

Args:
  - course_id (string): The course ID
  - lesson_id (string): The lesson ID to update
  - title (string, optional): New lesson title
  - content (string, optional): New HTML or plain text content

Returns: Updated lesson`,
      inputSchema: z.object({
        course_id: z.string(),
        lesson_id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id, lesson_id, title, content }) => {
      try {
        const body: Record<string, unknown> = {};
        if (title) body.title = title;
        if (content) body.content = content;

        const res = await learnClient.put(`/course/${course_id}/chapter/${lesson_id}`, body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_update_lesson"); }
    }
  );

  // ─── Get Course Report ────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_get_course_report",
    {
      title: "Get Course Completion Report",
      description: `Get completion rates, scores, and time spent for a course.

Args:
  - course_id (string): The course ID

Returns: Completion rate, average score, average time spent, pass/fail counts`,
      inputSchema: z.object({
        course_id: z.string(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id }) => {
      try {
        const res = await learnClient.get(`/course/${course_id}/report`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_get_course_report"); }
    }
  );

  // ─── List All Progress ────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_list_all_progress",
    {
      title: "List All Learner Progress in a Course",
      description: `Get progress of all enrolled learners across a course — not just one user.

Args:
  - course_id (string): The course ID
  - status (string, optional): completed, in_progress, not_started

Returns: List of learners with completion percentage, score, time spent, and completion date`,
      inputSchema: z.object({
        course_id: z.string(),
        status: z.enum(["completed", "in_progress", "not_started"]).optional(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id, status }) => {
      try {
        const params: Record<string, unknown> = {};
        if (status) params.status = status;

        const res = await learnClient.get(`/course/${course_id}/progress`, { params });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_list_all_progress"); }
    }
  );

  // ─── Remove Enrollment ────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_remove_enrollment",
    {
      title: "Remove Enrollment",
      description: `Unenroll a user from a Zoho Learn course.

Args:
  - course_id (string): The course ID
  - user_email (string): Email of the learner to unenroll

Returns: Confirmation of removal`,
      inputSchema: z.object({
        course_id: z.string(),
        user_email: z.string().email(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ course_id, user_email }) => {
      try {
        const res = await learnClient.delete(`/course/${course_id}/enrollments`, {
          data: { user_email },
        });
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_remove_enrollment"); }
    }
  );

  // ─── Create Category ──────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_create_category",
    {
      title: "Create Course Category",
      description: `Create a new category to organize courses in Zoho Learn.

Args:
  - name (string): Category name
  - description (string, optional): Category description

Returns: Created category with category_id`,
      inputSchema: z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ name, description }) => {
      try {
        const body: Record<string, unknown> = { name };
        if (description) body.description = description;

        const res = await learnClient.post("/category", body);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_create_category"); }
    }
  );

  // ─── Delete Course ────────────────────────────────────────────────────────

  server.registerTool(
    "zoho_learn_delete_course",
    {
      title: "Delete Course",
      description: `Permanently delete a course from Zoho Learn. This action cannot be undone.

Args:
  - course_id (string): The course ID to delete

Returns: Confirmation of deletion`,
      inputSchema: z.object({
        course_id: z.string(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async ({ course_id }) => {
      try {
        const res = await learnClient.delete(`/course/${course_id}`);
        return { content: [{ type: "text", text: formatSuccess(res.data) }] };
      } catch (e) { handleApiError(e, "zoho_learn_delete_course"); }
    }
  );
}
