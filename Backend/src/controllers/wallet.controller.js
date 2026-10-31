import * as walletService from "../services/wallet.service.js";

const creditWallet = async (req, res, next) => {
  try {
    const result = await walletService.creditPrepaidWallet(req.body);

    return res.status(result.alreadyProcessed ? 200 : 201).json({
      success: true,
      message: result.alreadyProcessed
        ? "Wallet credit was already processed"
        : "Wallet credited successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const debitWallet = async (req, res, next) => {
  try {
    const result = await walletService.debitPrepaidWallet(req.body);

    return res.status(result.alreadyProcessed ? 200 : 201).json({
      success: true,
      message: result.alreadyProcessed
        ? "Wallet debit was already processed"
        : "Wallet debited successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getBalance = async (req, res, next) => {
  try {
    const result = await walletService.getWalletBalance(req.user.companyId);

    return res.status(200).json({
      success: true,
      message: "Wallet balance fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const result = await walletService.listWalletTransactions(
      req.user.companyId,
      req.query.page,
      req.query.limit,
    );

    return res.status(200).json({
      success: true,
      message: "Wallet transactions fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { creditWallet, debitWallet, getBalance, getTransactions };
