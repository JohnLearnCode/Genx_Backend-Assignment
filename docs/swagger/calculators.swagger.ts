/**
 * @openapi
 * /api/schedule-generator/generate:
 *   post:
 *     tags: [Schedule Generator]
 *     summary: Generate schedule
 *     description: Auto-generate class schedule avoiding holidays
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - totalClasses
 *               - classWeekdays
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-01"
 *               totalClasses:
 *                 type: integer
 *                 minimum: 1
 *                 example: 16
 *               classWeekdays:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 6
 *                 example: [1, 3]
 *                 description: "0=Monday, 6=Sunday"
 *               holidays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *                 example: ["2026-04-30", "2026-05-01"]
 *               holidayRanges:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: date
 *                 example: [["2026-01-26", "2026-02-05"]]
 *     responses:
 *       200:
 *         description: Schedule generated successfully
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
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     fullSchedule:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: date
 *       400:
 *         description: Validation error
 *
 * /api/invoice-calculator/calculate:
 *   post:
 *     tags: [Invoice Calculator]
 *     summary: Calculate invoice
 *     description: Calculate tuition fees with promo codes and refunds
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseType
 *               - basePrice
 *               - months
 *               - canceledClasses
 *               - refundPerClass
 *             properties:
 *               courseType:
 *                 type: string
 *                 enum: [MONTHLY, FULL_COURSE]
 *                 example: MONTHLY
 *               basePrice:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000000
 *               months:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 example: 3
 *               promoCode:
 *                 type: string
 *                 enum: [SAVE10, FLAT50K, null]
 *                 nullable: true
 *                 example: SAVE10
 *               canceledClasses:
 *                 type: integer
 *                 minimum: 0
 *                 example: 2
 *               refundPerClass:
 *                 type: number
 *                 minimum: 0
 *                 example: 20000
 *     responses:
 *       200:
 *         description: Invoice calculated successfully
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
 *                     subtotal:
 *                       type: number
 *                       example: 3000000
 *                     discount:
 *                       type: number
 *                       example: 300000
 *                     refund:
 *                       type: number
 *                       example: 40000
 *                     total:
 *                       type: number
 *                       example: 2660000
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: VALIDATION_ERROR
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: months
 *                       reason:
 *                         type: string
 *                         example: must be between 1 and 3
 *                       value:
 *                         example: 5
 */
