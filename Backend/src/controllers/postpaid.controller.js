import * as postpaidService from "../services/postpaid.service.js";

const getInvoices = async (req, res, next) => {
  try {
    const result = await postpaidService.listInvoices(
      req.user.companyId,
      req.query.page,
      req.query.limit,
    );
    return res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceDetails = async (req, res, next) => {
  try {
    const invoice = await postpaidService.getInvoiceDetails(
      req.user.companyId,
      req.params.invoiceId,
    );
    return res.status(200).json({
      success: true,
      message: "Invoice details fetched successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export { getInvoices, getInvoiceDetails };
