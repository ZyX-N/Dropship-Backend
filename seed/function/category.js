import Category from "../../src/model/Category.js";

export const createCategory = async (data) => {
    try {
        for (const category of data) {
            if (!(await Category.findOne({ title: category.title, isDeleted: false }))) {
                await Category.create({ title: category.title, slug: category.slug });
            } else {
                console.log(`Category name ${category.title} already exists! Skipped!`);
            }
        }
        console.log(`Category created successfully!`);
    } catch (error) {
        console.log(error);
        return null;
    }
};