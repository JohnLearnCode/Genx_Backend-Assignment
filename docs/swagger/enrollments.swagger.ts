/**
 * @openapi
 * /api/enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get all enrollments
 *     description: Get list of all enrollments (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, enrolled, completed, dropped, rejected]
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *
 *   post:
 *     tags: [Enrollments]
 *     summary: Enroll in class
 *     description: Student self-enroll in a class
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
 *             properties:
 *               classId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enrollment request created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Already enrolled
 *
 * /api/enrollments/my-enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get my enrollments
 *     description: Get student's own enrollments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *
 * /api/enrollments/{id}/approve:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Approve enrollment
 *     description: Approve pending enrollment (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment approved successfully
 *       400:
 *         description: Class is full
 *
 * /api/enrollments/{id}/reject:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Reject enrollment
 *     description: Reject pending enrollment (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Enrollment rejected successfully
 *
 * /api/enrollments/{id}/drop:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Drop enrollment
 *     description: Drop enrolled class (Student can drop their own)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment dropped successfully
 */
