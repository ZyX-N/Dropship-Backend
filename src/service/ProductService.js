import Product from "../model/Product.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted"

export const insertProduct_s = async (args = {}) => {
    let query = Product.create(args);
    return await query;
}

export const listProduct_s = async (args = {}, select = "", pagination = false, page = 1, count = 10) => {

    let pipeline = [
        { $match: { ...filter, ...args } },
        {
            $lookup: {
                from: 'categories',
                foreignField: '_id',
                localField: 'category',
                as: 'category',
                pipeline: [{ $match: { isDeleted: false } }, { $project: { isDeleted: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 } }]
            }
        },
        {
            $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                isDeleted: 0,
                createdBy: 0,
                updatedBy: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
            }
        }
    ]

    if (pagination) {
        pipeline.push({ $skip: (page - 1) * count },
            { $limit: count }
        );
    }

    let query = Product.aggregate(pipeline);
    
    return await query;
}

export const detailProduct_s = async (args = {}, select = "", populate = []) => {
    let query = Product.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}

// export const updateCategory_s = async (args = {}, data = {}) => {
//     let query = Category.updateOne({ ...filter, ...args }, { $set: data });
//     return await query;
// }

// export const deleteCategory_s = async (args = {}) => {
//     let query = Category.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
//     return await query;
// }