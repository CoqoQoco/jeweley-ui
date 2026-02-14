/**
 * Job Type Constants
 * Mirror from jewelry.Model.Constant.MyJobType.cs
 */

export const JOB_TYPE = {
  PLAN_STOCK_COST: 10
}

/**
 * Get job type name in Thai
 * @param {number} typeCode - Job type code
 * @returns {string} Job type name in Thai
 */
export function getJobTypeName(typeCode) {
  switch (typeCode) {
    case 10:
      return 'แผนตีราคาสินค้า'
    default:
      return 'ไม่ระบุประเภทงาน'
  }
}

/**
 * Get job type name in English
 * @param {number} typeCode - Job type code
 * @returns {string} Job type name in English
 */
export function getJobTypeNameEn(typeCode) {
  switch (typeCode) {
    case 10:
      return 'Plan Stock Cost'
    default:
      return 'Unknown'
  }
}

/**
 * Get all job types as array
 * @returns {Array} Array of job types
 */
export function getAllJobTypes() {
  return [{ id: JOB_TYPE.PLAN_STOCK_COST, name: 'แผนตีราคาสินค้า', nameEn: 'Plan Stock Cost' }]
}
