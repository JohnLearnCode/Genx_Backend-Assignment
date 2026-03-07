/**
 * @openapi
 * /api/classes/available:
 *   get:
 *     tags: [Classes]
 *     summary: Get available classes (Public)
 *     description: Get all classes that have available slots and are active
 *     responses:
 *       200:
 *         description: List of available classes
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
 *                     $ref: '#/components/schemas/Class'
 *
 * /api/classes:
 *   get:
 *     tags: [Classes]
 *     summary: Get all classes
 *     description: Get all classes (requires authentication)
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
 *     responses:
 *       200:
 *         description: List of classes
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Classes]
 *     summary: Create a new class
 *     description: Create a new class (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - teacherId
 *               - meetLink
 *               - capacity
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: 65f1a2b3c4d5e6f7g8h9i0j1
 *               teacherId:
 *                 type: string
 *                 example: 65f1a2b3c4d5e6f7g8h9i0j2
 *               supportStaffId:
 *                 type: string
 *                 example: 65f1a2b3c4d5e6f7g8h9i0j3
 *               meetLink:
 *                 type: string
 *                 format: uri
 *                 example: https://meet.google.com/abc-defg-hij
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 500
 *                 example: 30
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       description: 0=Sunday, 1=Monday, ..., 6=Saturday
 *                       example: 1
 *                     startTime:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       example: "11:00"
 *     responses:
 *       201:
 *         description: Class created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher/Admin role required
 *
 * /api/classes/my-classes:
 *   get:
 *     tags: [Classes]
 *     summary: Get my classes
 *     description: Get classes taught by the logged-in teacher (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teacher's classes
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher/Admin role required
 *
 * /api/classes/course/{courseId}:
 *   get:
 *     tags: [Classes]
 *     summary: Get classes by course ID
 *     description: Get all classes for a specific course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: List of classes for the course
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *
 * /api/classes/teacher/{teacherId}:
 *   get:
 *     tags: [Classes]
 *     summary: Get classes by teacher ID
 *     description: Get all classes taught by a specific teacher
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: List of teacher's classes
 *       401:
 *         description: Unauthorized
 *
 * /api/classes/support-staff/{supportStaffId}:
 *   get:
 *     tags: [Classes]
 *     summary: Get classes by support staff ID
 *     description: Get all classes where user is support staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supportStaffId
 *         required: true
 *         schema:
 *           type: string
 *         description: Support Staff ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: List of classes
 *       401:
 *         description: Unauthorized
 *
 * /api/classes/{id}:
 *   get:
 *     tags: [Classes]
 *     summary: Get class by ID
 *     description: Get class details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Class details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 *   put:
 *     tags: [Classes]
 *     summary: Update class
 *     description: Update class details (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meetLink:
 *                 type: string
 *                 format: uri
 *                 example: https://meet.google.com/new-link
 *               capacity:
 *                 type: integer
 *                 example: 35
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       example: 1
 *                     startTime:
 *                       type: string
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       example: "11:00"
 *     responses:
 *       200:
 *         description: Class updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 *   delete:
 *     tags: [Classes]
 *     summary: Delete class
 *     description: Delete a class (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 *
 * /api/classes/{id}/toggle-status:
 *   patch:
 *     tags: [Classes]
 *     summary: Toggle class status
 *     description: Activate/deactivate a class (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Class status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 *
 * /api/classes/{id}/assign-support-staff:
 *   patch:
 *     tags: [Classes]
 *     summary: Assign support staff to class
 *     description: Assign a support staff to the class (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supportStaffId
 *             properties:
 *               supportStaffId:
 *                 type: string
 *                 example: 65f1a2b3c4d5e6f7g8h9i0j2
 *     responses:
 *       200:
 *         description: Support staff assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class or staff not found
 *
 * /api/classes/{id}/remove-support-staff:
 *   patch:
 *     tags: [Classes]
 *     summary: Remove support staff from class
 *     description: Remove support staff assignment from class (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Support staff removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class not found
 */

export {};
