import Role from "../../src/model/Role.js";

export const createRoles = async (data) => {
  try {
    for (const role of data) {
      if (!(await Role.findOne({ title: role.title, isDeleted: false }))) {
        await Role.create({ title: role.title });
      } else {
        console.log(`Role name ${role.title} already exists! Skipped!`);
      }
    }
    console.log(`Roles created successfully!`);
  } catch (error) {
    console.log(error);
    return null;
  }
};