import * as walletService from "../services/wallet.service.js";

const creditWallet = async (req, res, next) => {
  try {
    const result = await walletService.creditPrepaidWallet(req.body);

    return res.status(201).json({
      success: true,
      message: "Wallet credited successfully",
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

export { creditWallet, getBalance, getTransactions };
