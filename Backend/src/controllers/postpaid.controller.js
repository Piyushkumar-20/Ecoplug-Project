import * as postpaidService from "../services/postpaid.service.js";

const getPostpaidUsage = async (req, res, next) => {
  try {
    const result = await postpaidService.listPostpaidUsage(
      req.user.companyId,
      req.query.page,
      req.query.limit,
    );
    return res.status(200).json({
      success: true,
      message: "POSTPAID usage history fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { getPostpaidUsage };
