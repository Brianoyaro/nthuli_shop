const { Coupon } = require('../models');
const { DISCOUNT_TYPE } = require('../models/enums');

class CouponService {
  /**
   * Validate coupon code
   */
  async validateCoupon(code, orderAmount = null) {
    try {
      const coupon = await Coupon.findOne({
        where: { code: code.toUpperCase() },
      });

      if (!coupon) {
        throw new Error('Invalid coupon code');
      }

      if (!coupon.isActive) {
        throw new Error('Coupon is inactive');
      }

      const now = new Date();
      if (coupon.validFrom > now) {
        throw new Error('Coupon is not yet valid');
      }

      if (coupon.validUntil < now) {
        throw new Error('Coupon has expired');
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        throw new Error('Coupon usage limit reached');
      }

      // Calculate discount if amount provided
      let discountAmount = 0;
      if (orderAmount) {
        if (coupon.discountType === DISCOUNT_TYPE.PERCENTAGE) {
          discountAmount = orderAmount * (parseFloat(coupon.discountValue) / 100);
        } else if (coupon.discountType === DISCOUNT_TYPE.FIXED) {
          discountAmount = Math.min(parseFloat(coupon.discountValue), orderAmount);
        }
      }

      return {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        isValid: true,
      };
    } catch (error) {
      throw new Error(`Coupon validation failed: ${error.message}`);
    }
  }

  /**
   * Get all active coupons
   */
  async getActiveCoupons() {
    try {
      const now = new Date();
      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          validFrom: { $lte: now },
          validUntil: { $gte: now },
        },
        attributes: ['id', 'code', 'discountType', 'discountValue', 'maxUses', 'usedCount'],
        order: [['validUntil', 'ASC']],
      });

      return coupons.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue),
        remainingUses: coupon.maxUses ? coupon.maxUses - coupon.usedCount : null,
        expiresAt: coupon.validUntil,
      }));
    } catch (error) {
      throw new Error(`Failed to get active coupons: ${error.message}`);
    }
  }

  /**
   * Create coupon (admin only)
   */
  async createCoupon(couponData) {
    try {
      const {
        code,
        discountType,
        discountValue,
        maxUses,
        validFrom,
        validUntil,
      } = couponData;

      if (!code || !discountType || discountValue === undefined) {
        throw new Error('Missing required fields: code, discountType, discountValue');
      }

      if (![DISCOUNT_TYPE.PERCENTAGE, DISCOUNT_TYPE.FIXED].includes(discountType)) {
        throw new Error('Invalid discount type');
      }

      if (parseFloat(discountValue) <= 0) {
        throw new Error('Discount value must be greater than 0');
      }

      if (discountType === DISCOUNT_TYPE.PERCENTAGE && parseFloat(discountValue) > 100) {
        throw new Error('Percentage discount cannot exceed 100');
      }

      const validFromDate = new Date(validFrom);
      const validUntilDate = new Date(validUntil);

      if (validFromDate >= validUntilDate) {
        throw new Error('Valid from date must be before valid until date');
      }

      const coupon = await Coupon.create({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxUses: maxUses || null,
        validFrom: validFromDate,
        validUntil: validUntilDate,
        isActive: true,
      });

      return coupon;
    } catch (error) {
      throw new Error(`Failed to create coupon: ${error.message}`);
    }
  }

  /**
   * Update coupon (admin only)
   */
  async updateCoupon(couponId, updateData) {
    try {
      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const allowedFields = [
        'discountValue',
        'maxUses',
        'validFrom',
        'validUntil',
        'isActive',
      ];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          if (key === 'validFrom' || key === 'validUntil') {
            coupon[key] = new Date(value);
          } else {
            coupon[key] = value;
          }
        }
      }

      // Validate dates
      if (coupon.validFrom >= coupon.validUntil) {
        throw new Error('Valid from date must be before valid until date');
      }

      await coupon.save();
      return coupon;
    } catch (error) {
      throw new Error(`Failed to update coupon: ${error.message}`);
    }
  }

  /**
   * Delete coupon (admin only)
   */
  async deleteCoupon(couponId) {
    try {
      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      await coupon.destroy();
      return { message: 'Coupon deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete coupon: ${error.message}`);
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(couponId) {
    try {
      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      return coupon;
    } catch (error) {
      throw new Error(`Failed to get coupon: ${error.message}`);
    }
  }

  /**
   * Get all coupons with pagination (admin)
   */
  async getAllCoupons(limit = 10, offset = 0) {
    try {
      const { count, rows } = await Coupon.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        total: count,
        coupons: rows,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get all coupons: ${error.message}`);
    }
  }
}

module.exports = new CouponService();
