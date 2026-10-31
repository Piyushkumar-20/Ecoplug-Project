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

const recordInvoicePayment = async (req, res, next) => {
  try {
    const result = await postpaidService.recordInvoicePayment({
      companyId: req.user.companyId,
      invoiceId: req.params.invoiceId,
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod,
      transactionReference: req.body.transactionReference,
      paymentDate: req.body.paymentDate,
      notes: req.body.notes,
      recordedBy: req.user.userId,
    });

    return res.status(result.alreadyProcessed ? 200 : 201).json({
      success: true,
      message: result.alreadyProcessed
        ? "Invoice payment was already recorded"
        : "Invoice payment recorded successfully",
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

export { getInvoices, getInvoiceDetails, recordInvoicePayment };
