/**
 * @openapi
 * /api/sessions/upcoming:
 *   get:
 *     tags: [Sessions]
 *     summary: Get upcoming sessions (Public)
 *     description: Get all upcoming scheduled sessions
 *     responses:
 *       200:
 *         description: List of upcoming sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *
 * /api/sessions/today:
 *   get:
 *     tags: [Sessions]
 *     summary: Get today's sessions (Public)
 *     description: Get all sessions scheduled for today
 *     responses:
 *       200:
 *         description: List of today's sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *
 * /api/sessions:
 *   get:
 *     tags: [Sessions]
 *     summary: Get all sessions
 *     description: Get all schedule sessions (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, ongoing, completed, cancelled]
 *     responses:
 *       200:
 *         description: List of sessions
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Sessions]
 *     summary: Create a new session
 *     description: Create a new schedule session (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - sessionNumber
 *               - date
 *               - startTime
 *               - endTime
 *               - topic
 *             properties:
 *               classId:
 *                 type: string
 *                 example: 65f1a2b3c4d5e6f7g8h9i0j1
 *               sessionNumber:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-01"
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "11:00"
 *               topic:
 *                 type: string
 *                 example: Introduction to React Hooks
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled]
 *                 default: scheduled
 *                 example: scheduled
 *               notes:
 *                 type: string
 *                 example: "Bring laptop"
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher/Admin role required
 *
 * /api/sessions/generate:
 *   post:
 *     tags: [Sessions]
 *     summary: Generate multiple sessions
 *     description: Auto-generate multiple sessions for a class (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - startDate
 *               - endDate
 *               - numberOfSessions
 *             properties:
 *               classId:
 *                 type: string
 *                 example: 65f1a2b3c4d5e6f7g8h9i0j1
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-31"
 *               numberOfSessions:
 *                 type: integer
 *                 minimum: 1
 *                 example: 24
 *     responses:
 *       201:
 *         description: Sessions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Session'
 *                     totalSessions:
 *                       type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /api/sessions/class/{classId}:
 *   get:
 *     tags: [Sessions]
 *     summary: Get sessions by class ID
 *     description: Get all sessions for a specific class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: List of sessions for the class
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 *
 * /api/sessions/stats/{classId}:
 *   get:
 *     tags: [Sessions]
 *     summary: Get session statistics by class
 *     description: Get statistics about sessions for a specific class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Session statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                     completedSessions:
 *                       type: integer
 *                     upcomingSessions:
 *                       type: integer
 *                     cancelledSessions:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 *
 * /api/sessions/{id}:
 *   get:
 *     tags: [Sessions]
 *     summary: Get session by ID
 *     description: Get session details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *   put:
 *     tags: [Sessions]
 *     summary: Update session
 *     description: Update session details (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-05"
 *               startTime:
 *                 type: string
 *                 example: "10:00"
 *               endTime:
 *                 type: string
 *                 example: "12:00"
 *               topic:
 *                 type: string
 *                 example: "Updated topic"
 *               notes:
 *                 type: string
 *                 example: "Updated notes"
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 *   delete:
 *     tags: [Sessions]
 *     summary: Delete session
 *     description: Delete a session (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 *
 * /api/sessions/{id}/status:
 *   patch:
 *     tags: [Sessions]
 *     summary: Update session status
 *     description: Update session status (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Session status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 */

export {};
