/**
 * @openapi
 * /api/service-requests:
 *   get:
 *     tags: [Service Requests]
 *     summary: Get all service requests
 *     description: Get all service requests (Teacher/Admin only)
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
 *           enum: [pending, in_progress, resolved, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: List of service requests
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
 *                     $ref: '#/components/schemas/ServiceRequest'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher/Admin role required
 *   post:
 *     tags: [Service Requests]
 *     summary: Create a service request
 *     description: Create a new service request (Any authenticated user)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Need help with enrollment
 *               description:
 *                 type: string
 *                 example: I'm having trouble enrolling in the React course
 *               category:
 *                 type: string
 *                 enum: [enrollment, technical, payment, general, other]
 *                 example: enrollment
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 example: medium
 *     responses:
 *       201:
 *         description: Service request created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /api/service-requests/pending:
 *   get:
 *     tags: [Service Requests]
 *     summary: Get pending service requests
 *     description: Get all pending service requests (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending service requests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /api/service-requests/my-requests:
 *   get:
 *     tags: [Service Requests]
 *     summary: Get my service requests
 *     description: Get service requests created by the logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's service requests
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
 *                     $ref: '#/components/schemas/ServiceRequest'
 *       401:
 *         description: Unauthorized
 *
 * /api/service-requests/assigned:
 *   get:
 *     tags: [Service Requests]
 *     summary: Get assigned service requests
 *     description: Get service requests assigned to the logged-in staff (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned service requests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /api/service-requests/stats:
 *   get:
 *     tags: [Service Requests]
 *     summary: Get service request statistics
 *     description: Get statistics about service requests (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service request statistics
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
 *                     totalRequests:
 *                       type: integer
 *                     pendingRequests:
 *                       type: integer
 *                     inProgressRequests:
 *                       type: integer
 *                     resolvedRequests:
 *                       type: integer
 *                     cancelledRequests:
 *                       type: integer
 *                     byPriority:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: integer
 *                         medium:
 *                           type: integer
 *                         high:
 *                           type: integer
 *                         urgent:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /api/service-requests/{id}:
 *   get:
 *     tags: [Service Requests]
 *     summary: Get service request by ID
 *     description: Get service request details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Request ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Service request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ServiceRequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service request not found
 *   put:
 *     tags: [Service Requests]
 *     summary: Update service request
 *     description: Update service request details (Owner/Staff/Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Request ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *     responses:
 *       200:
 *         description: Service request updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service request not found
 *   delete:
 *     tags: [Service Requests]
 *     summary: Delete service request
 *     description: Delete a service request (Owner/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Request ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Service request deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service request not found
 *
 * /api/service-requests/{id}/assign-staff:
 *   patch:
 *     tags: [Service Requests]
 *     summary: Assign staff to service request
 *     description: Assign a staff member to handle the request (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Request ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedStaffId
 *             properties:
 *               assignedStaffId:
 *                 type: string
 *                 example: 65f1a2b3c4d5e6f7g8h9i0j2
 *     responses:
 *       200:
 *         description: Staff assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Service request or staff not found
 *
 * /api/service-requests/{id}/unassign-staff:
 *   patch:
 *     tags: [Service Requests]
 *     summary: Unassign staff from service request
 *     description: Remove staff assignment from the request (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Request ID
 *         example: 65f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Staff unassigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Service request not found
 *
 * /api/service-requests/{id}/status:
 *   patch:
 *     tags: [Service Requests]
 *     summary: Update service request status
 *     description: Update the status of a service request (Staff/Admin or customer for cancel)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Request ID
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
 *                 enum: [pending, in_progress, resolved, cancelled]
 *                 example: in_progress
 *               resolution:
 *                 type: string
 *                 description: Resolution notes (required when status is resolved)
 *                 example: "Issue has been resolved. Enrollment completed successfully."
 *     responses:
 *       200:
 *         description: Service request status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service request not found
 */

export {};
