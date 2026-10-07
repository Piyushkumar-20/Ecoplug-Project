import { createCompany } from "../models/companies.model.js";

const registerCompany = async ({ name }) => {
  const result = await createCompany(name);

  return result;
};

export { registerCompany };
