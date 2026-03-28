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
        const params: Record<string, unknown> = {};
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
        const res = await learnClient.post("/courses", params);
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
        const res = await learnClient.put(`/courses/${course_id}`, body);
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
        const res = await learnClient.post(`/courses/${course_id}/${action}`);
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

        const res = await learnClient.post(`/courses/${course_id}/enrollments`, body);
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
}
