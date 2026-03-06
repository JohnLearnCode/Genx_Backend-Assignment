/**
 * @openapi
 * /api/invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: Get all invoices
 *     description: Get list of all invoices (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, refunded, cancelled, overdue]
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *
 *   post:
 *     tags: [Invoices]
 *     summary: Create invoice
 *     description: Create a new invoice (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enrollmentId
 *               - courseType
 *               - subtotal
 *             properties:
 *               enrollmentId:
 *                 type: string
 *               courseType:
 *                 type: string
 *                 enum: [online, offline, hybrid]
 *               subtotal:
 *                 type: number
 *               discount:
 *                 type: number
 *               promoCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *
 * /api/invoices/my-invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: Get my invoices
 *     description: Get student's own invoices
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *
 * /api/invoices/{id}/pay:
 *   patch:
 *     tags: [Invoices]
 *     summary: Pay invoice
 *     description: Mark invoice as paid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice paid successfully
 *
 * /api/invoices/{id}/refund:
 *   patch:
 *     tags: [Invoices]
 *     summary: Refund invoice
 *     description: Process refund (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refundAmount
 *             properties:
 *               refundAmount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice refunded successfully
 */
