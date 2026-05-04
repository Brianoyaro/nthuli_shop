const couponService = require('../services/couponService');

class CouponController {
  /**
   * Get all active coupons (public)
   * GET /api/coupons/active
   */
  async getActiveCoupons(req, res, next) {
    try {
      const coupons = await couponService.getActiveCoupons();

      res.json({
        message: 'Active coupons retrieved successfully',
        coupons,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate coupon (public)
   * POST /api/coupons/validate
   * Body: { code, orderAmount? }
   */
  async validateCoupon(req, res, next) {
    try {
      const { code, orderAmount } = req.body;

      if (!code) {
        return res.status(400).json({ message: 'code is required' });
      }

      const coupon = await couponService.validateCoupon(code, orderAmount);

      res.json({
        message: 'Coupon is valid',
        coupon,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Create coupon (admin only)
   * POST /api/admin/coupons
   * Body: { code, discountType, discountValue, maxUses?, validFrom, validUntil }
   */
  async createCoupon(req, res, next) {
    try {
      const couponData = req.body;

      const coupon = await couponService.createCoupon(couponData);

      res.status(201).json({
        message: 'Coupon created successfully',
        coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all coupons (admin)
   * GET /api/admin/coupons?limit=10&offset=0
   */
  async getAllCoupons(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const result = await couponService.getAllCoupons(limit, offset);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get coupon by ID (admin)
   * GET /api/admin/coupons/:couponId
   */
  async getCoupon(req, res, next) {
    try {
      const { couponId } = req.params;

      const coupon = await couponService.getCouponById(couponId);

      res.json(coupon);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update coupon (admin only)
   * PATCH /api/admin/coupons/:couponId
   * Body: { discountValue?, maxUses?, validFrom?, validUntil?, isActive? }
   */
  async updateCoupon(req, res, next) {
    try {
      const { couponId } = req.params;
      const updateData = req.body;

      const coupon = await couponService.updateCoupon(couponId, updateData);

      res.json({
        message: 'Coupon updated successfully',
        coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete coupon (admin only)
   * DELETE /api/admin/coupons/:couponId
   */
  async deleteCoupon(req, res, next) {
    try {
      const { couponId } = req.params;

      const result = await couponService.deleteCoupon(couponId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CouponController();
